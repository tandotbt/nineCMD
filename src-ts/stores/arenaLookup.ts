/**
 * arenaLookup Store – Pinia store tra cứu nhanh Agent ↔ Avatar Address
 *
 * Chức năng:
 * - Auto fetch leaderboard arena (gần nhất đã kết thúc) từ arena.gql REST
 * - Manual lookup agent → lấy danh sách avatar thuộc agent (mimir GraphQL)
 * - Manual lookup avatar → lấy agent address tương ứng (mimir GraphQL)
 * - Cache leaderboard per-planet (không TTL, manual refresh)
 * - Search/filter trong leaderboard
 *
 * URL động qua useConfigURLStore (ưu tiên API, fallback PLANET_CONFIGS).
 * Block qua useBlockPollingStore (currentBlockIndex).
 * Planet qua useAppSettingsStore (single source of truth).
 *
 */

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { PlanetName } from '../utilities/constants'
import { useAppSettingsStore } from './appSettings'
import { useBlockPollingStore } from './blockPolling'
import { useConfigURLStore } from './configURL'
import {
  fetchSeasons,
  findMostRecentCompletedSeason,
  fetchLeaderboard,
  mapLeaderboardToAvatarOption
} from '../utilities/arenaGql'
import { getAgent, getAvatars, getAvatar } from '../utilities/mimirGraphql'
import { createLogger } from '../utilities/logger'
import type {
  AgentInfo,
  AvatarInfo,
  ArenaAvatarOption,
  CachedLeaderboard
} from '../types/arenaLookup'

const logger = createLogger({ module: 'arenaLookup' })

export const useArenaLookupStore = defineStore('arenaLookup', () => {
  // ============================================================
  // Stores (other Pinia stores)
  // ============================================================
  const appSettings = useAppSettingsStore()
  const blockPolling = useBlockPollingStore()
  const configURL = useConfigURLStore()

  // ============================================================
  // Computed: URL cơ sở (lấy từ configURL store - dynamic + fallback)
  // ============================================================

  /** Planet hiện tại (single source of truth: appSettings) */
  const selectedPlanet = computed<PlanetName>(
    () => appSettings.selectedPlanet
  )

  /** URL arena.gql REST cho planet hiện tại (dynamic + fallback) */
  const urlArenaGql = computed<string>(() =>
    configURL.getArenaGql(selectedPlanet.value)
  )

  /** URL mimir GraphQL cho planet hiện tại (dynamic + fallback) */
  const urlMimirGql = computed<string>(() =>
    configURL.getMimirUrl(selectedPlanet.value)
  )

  /** Block hiện tại (từ blockPolling) */
  const blockNow = computed<number>(() => blockPolling.currentBlockIndex)

  /** Block ready (= blockNow > 0) */
  const isBlockReady = computed<boolean>(() => blockNow.value > 0)

  // ============================================================
  // Cache per-planet (cho leaderboard)
  // ============================================================
  const leaderboardCache = ref<Record<string, CachedLeaderboard | undefined>>({})

  function isLeaderboardCached(planet: string): boolean {
    return !!leaderboardCache.value[planet]
  }

  function getCachedLeaderboard(planet: string): CachedLeaderboard | null {
    return leaderboardCache.value[planet] ?? null
  }

  function setCachedLeaderboard(
    planet: string,
    data: Omit<CachedLeaderboard, 'fetchedAt'>
  ): void {
    leaderboardCache.value[planet] = { ...data, fetchedAt: Date.now() }
  }

  function clearLeaderboardCache(planet: string): void {
    delete leaderboardCache.value[planet]
  }

  // ============================================================
  // State cho leaderboard hiện tại
  // ============================================================
  const leaderboardList = ref<ArenaAvatarOption[]>([])
  const isFetchingLeaderboard = ref<boolean>(false)
  const errorLeaderboard = ref<Error | null>(null)
  const lastSeasonId = ref<number | null>(null)
  const isLeaderboardAutoFetched = ref<boolean>(false)

  // ============================================================
  // State cho manual lookup - agent
  // ============================================================
  const lookedUpAgent = ref<AgentInfo | null>(null)
  const lookedUpAvatars = ref<AvatarInfo[]>([])
  const isLookingUpAgent = ref<boolean>(false)
  const errorLookedUpAgent = ref<Error | null>(null)

  // ============================================================
  // State cho manual lookup - avatar
  // ============================================================
  const lookedUpAvatar = ref<AvatarInfo | null>(null)
  const isLookingUpAvatar = ref<boolean>(false)
  const errorLookedUpAvatar = ref<Error | null>(null)

  // ============================================================
  // Search trong leaderboard
  // ============================================================
  const searchQuery = ref<string>('')

  const leaderboardFiltered = computed<ArenaAvatarOption[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return leaderboardList.value
    return leaderboardList.value.filter(
      (item) =>
        (item.avatarname || '').toLowerCase().includes(q) ||
        (item.agentAddress || '').toLowerCase().includes(q) ||
        (item.avataraddress || '').toLowerCase().includes(q)
    )
  })

  // ============================================================
  // Format validation helper
  // ============================================================
  function isValidAddressFormat(addr: string | null | undefined): boolean {
    return typeof addr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  // ============================================================
  // Action: fetchLeaderboard
  // ============================================================
  async function fetchLeaderboardAction(): Promise<void> {
    if (!isBlockReady.value) {
      logger.warn('fetchLeaderboard skipped: blockNow not ready')
      return
    }
    if (!urlArenaGql.value) {
      logger.warn('fetchLeaderboard skipped: urlArenaGql empty')
      return
    }

    const planet = selectedPlanet.value

    // Cache hit → dùng cache
    if (isLeaderboardCached(planet)) {
      const cached = getCachedLeaderboard(planet)!
      leaderboardList.value = cached.list
      lastSeasonId.value = cached.seasonId
      logger.debug(`fetchLeaderboard cache hit for ${planet}`)
      return
    }

    isFetchingLeaderboard.value = true
    errorLeaderboard.value = null
    try {
      const seasonsRes = await fetchSeasons(urlArenaGql.value)
      const season = findMostRecentCompletedSeason(
        seasonsRes.seasons || [],
        blockNow.value
      )
      if (!season) {
        logger.debug('No completed season found')
        leaderboardList.value = []
        lastSeasonId.value = null
        setCachedLeaderboard(planet, { list: [], seasonId: null })
        return
      }

      const lbRes = await fetchLeaderboard(urlArenaGql.value, season.id)
      const list = (lbRes.leaderboard || []).map(mapLeaderboardToAvatarOption)
      leaderboardList.value = list
      lastSeasonId.value = season.id
      setCachedLeaderboard(planet, { list, seasonId: season.id })
      logger.info(
        `fetchLeaderboard OK: ${list.length} rows, seasonId=${season.id}`
      )
    } catch (err) {
      logger.error('fetchLeaderboard error:', err)
      errorLeaderboard.value = err as Error
      leaderboardList.value = []
      lastSeasonId.value = null
    } finally {
      isFetchingLeaderboard.value = false
    }
  }

  /** Refresh leaderboard (clear cache + fetch) */
  async function refreshLeaderboard(): Promise<void> {
    clearLeaderboardCache(selectedPlanet.value)
    return fetchLeaderboardAction()
  }

  // ============================================================
  // Action: lookupAgent
  // ============================================================
  async function lookupAgent(
    agentAddress: string
  ): Promise<AvatarInfo[] | null> {
    if (!isValidAddressFormat(agentAddress)) {
      errorLookedUpAgent.value = new Error(
        'Địa chỉ agent không đúng format (0x + 40 hex)'
      )
      return null
    }
    if (!urlMimirGql.value) {
      errorLookedUpAgent.value = new Error(
        `Planet "${selectedPlanet.value}" không có mimir endpoint`
      )
      return null
    }

    isLookingUpAgent.value = true
    errorLookedUpAgent.value = null
    try {
      const agent = await getAgent(urlMimirGql.value, agentAddress)
      if (!agent) {
        lookedUpAgent.value = null
        lookedUpAvatars.value = []
        errorLookedUpAgent.value = new Error('Agent không tồn tại')
        return null
      }
      lookedUpAgent.value = agent

      // Lưu ý: response thực tế trả về { key: index, value: address }
      // → lấy address qua a.value (KHÔNG phải a.key)
      const avatarAddrs = (agent.avatarAddresses || []).map((a) => a.value)
      if (avatarAddrs.length === 0) {
        lookedUpAvatars.value = []
        logger.info('lookupAgent OK: agent có 0 avatar')
        return lookedUpAvatars.value
      }

      const avatars = await getAvatars(urlMimirGql.value, avatarAddrs)
      lookedUpAvatars.value = avatars
      logger.info(
        `lookupAgent OK: ${avatars.length}/${avatarAddrs.length} avatars cho ${agentAddress}`
      )
      return avatars
    } catch (err) {
      logger.error('lookupAgent error:', err)
      errorLookedUpAgent.value = err as Error
      lookedUpAvatars.value = []
      return null
    } finally {
      isLookingUpAgent.value = false
    }
  }

  // ============================================================
  // Action: lookupAvatar (1 avatar)
  // ============================================================
  async function lookupAvatar(
    avatarAddress: string
  ): Promise<AvatarInfo | null> {
    if (!isValidAddressFormat(avatarAddress)) {
      errorLookedUpAvatar.value = new Error(
        'Địa chỉ avatar không đúng format (0x + 40 hex)'
      )
      return null
    }
    if (!urlMimirGql.value) {
      errorLookedUpAvatar.value = new Error(
        `Planet "${selectedPlanet.value}" không có mimir endpoint`
      )
      return null
    }

    isLookingUpAvatar.value = true
    errorLookedUpAvatar.value = null
    try {
      const avatar = await getAvatar(urlMimirGql.value, avatarAddress)
      if (!avatar) {
        lookedUpAvatar.value = null
        errorLookedUpAvatar.value = new Error('Avatar không tồn tại')
        return null
      }
      lookedUpAvatar.value = avatar
      logger.info(
        `lookupAvatar OK: agentAddress=${avatar.agentAddress}`
      )
      return avatar
    } catch (err) {
      logger.error('lookupAvatar error:', err)
      errorLookedUpAvatar.value = err as Error
      return null
    } finally {
      isLookingUpAvatar.value = false
    }
  }

  /** Reset tất cả manual lookup state */
  function resetManualLookup(): void {
    lookedUpAgent.value = null
    lookedUpAvatars.value = []
    errorLookedUpAgent.value = null
    lookedUpAvatar.value = null
    errorLookedUpAvatar.value = null
  }

  // ============================================================
  // Computed: ArenaAvatarOption[] cho <n-select>
  // ============================================================

  /** Options từ leaderboard (search/filter đã apply) */
  const leaderboardOptions = computed<ArenaAvatarOption[]>(() =>
    leaderboardFiltered.value.map((item) => ({
      ...item,
      source: 'leaderboard' as const
    }))
  )

  /** Options từ agent lookup (lookedUpAvatars) */
  const agentLookupOptions = computed<ArenaAvatarOption[]>(() =>
    lookedUpAvatars.value.map((a) => ({
      avataraddress: a.address,
      avatarname: a.name,
      agentAddress: a.agentAddress,
      level: a.level,
      characterId: a.characterId,
      source: 'agent-lookup' as const
    }))
  )

  // ============================================================
  // Watch: auto fetch leaderboard khi có block (1 lần)
  // ============================================================
  watch(
    isBlockReady,
    (ready) => {
      if (ready && !isLeaderboardAutoFetched.value) {
        isLeaderboardAutoFetched.value = true
        fetchLeaderboardAction()
      }
    },
    { immediate: true }
  )

  // ============================================================
  // Watch: reset khi đổi planet
  // ============================================================
  watch(selectedPlanet, (newPlanet, oldPlanet) => {
    if (newPlanet === oldPlanet) return
    searchQuery.value = ''
    isLeaderboardAutoFetched.value = false
    resetManualLookup()

    if (isLeaderboardCached(newPlanet)) {
      const cached = getCachedLeaderboard(newPlanet)!
      leaderboardList.value = cached.list
      lastSeasonId.value = cached.seasonId
    } else {
      leaderboardList.value = []
      lastSeasonId.value = null
    }
  })

  // ============================================================
  // Public API
  // ============================================================
  return {
    // URL (computed)
    urlArenaGql,
    urlMimirGql,
    selectedPlanet,

    // Block
    blockNow,
    isBlockReady,

    // Cache
    leaderboardCache,
    isLeaderboardCached,
    getCachedLeaderboard,
    clearLeaderboardCache,

    // Leaderboard
    leaderboardList,
    leaderboardFiltered,
    leaderboardOptions,
    isFetchingLeaderboard,
    errorLeaderboard,
    lastSeasonId,
    isLeaderboardAutoFetched,

    // Manual lookup - agent
    lookedUpAgent,
    lookedUpAvatars,
    isLookingUpAgent,
    errorLookedUpAgent,
    agentLookupOptions,

    // Manual lookup - avatar
    lookedUpAvatar,
    isLookingUpAvatar,
    errorLookedUpAvatar,

    // Search
    searchQuery,

    // Actions
    fetchLeaderboard: fetchLeaderboardAction,
    refreshLeaderboard,
    lookupAgent,
    lookupAvatar,
    resetManualLookup,

    // Helpers
    isValidAddressFormat
  }
})
