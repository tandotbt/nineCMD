import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { usePlanetStore } from './usePlanetStore'
import { useApiStore } from './useApiStore'
import { useCsvDataStore } from './useCsvDataStore'
import { useBlockStore } from './useBlockStore'
import { useSettingsStore } from './useSettingsStore'
import { useI18n } from 'vue-i18n'
import { queryGraphql } from '@/api/graphql'
import { db } from '@/db'
import { useFetch } from '@vueuse/core'
import {
  RETRY_CONFIG,
  CHARACTER_LOGIC_CONSTANTS,
  CHARACTER_CODE_GETS,
  REST_API_CONFIG,
  GQL_QUERIES,
} from '@/constants'
import { get9cmdApiUrl } from '@/api/rest'
import { searchCharactersByRankingAdvanced } from '@/logic/ranking'
import {
  calculateAPCost,
  getLatestStageId,
  processMaterials,
  calculateTotalCP,
  resolveItemNames,
  refreshAvatarNames,
  aggregateAvatarData,
} from '@/logic/character'
import { resolveWorldBossInfo, resolveWorldInfo } from '@/logic/mapping'
import { CHARACTER_QUERIES } from '@/api/queries/character'
import type {
  AvatarData,
  RawAvatarDetail,
  AvatarDetailHeadless,
  RestApiResponse,
  CharacterSuggestion,
} from '@/types/character'

export * from '@/types/character'

export const useCharacterStore = defineStore('character', () => {
  const planetStore = usePlanetStore()
  const apiStore = useApiStore()
  const csvStore = useCsvDataStore()
  const blockStore = useBlockStore()
  const settingsStore = useSettingsStore()
  const { locale } = useI18n()

  const characters = ref<AvatarData[]>([])
  const currentAvatarDetail = ref<RawAvatarDetail | null>(null)
  const previousAvatarDetail = ref<RawAvatarDetail | null>(null)
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  function reset() {
    characters.value = []
    currentAvatarDetail.value = null
    previousAvatarDetail.value = null
    error.value = null
  }

  // Handle planet change automatically to avoid circular dependency in usePlanetStore
  watch(
    () => planetStore.currentPlanetName,
    () => {
      reset()
    },
  )

  const info = computed<AvatarData | null>(() => {
    const raw = currentAvatarDetail.value
    if (!raw) return null

    return aggregateAvatarData(
      raw,
      csvStore.allSheets,
      locale.value,
      blockStore.averageBlockTimeMs / 1000,
      blockStore.blockNow,
    )
  })

  async function withRetry<T>(
    operation: () => Promise<T>,
    options: { maxRetries?: number; delay?: number } = {},
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? RETRY_CONFIG.MAX_RETRIES
    const delay = options.delay ?? RETRY_CONFIG.DELAY_MS
    let lastError: unknown

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (err) {
        lastError = err
        if (attempt < maxRetries - 1) {
          const waitTime = delay * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt)
          console.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(waitTime)}ms...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }
    throw lastError
  }

  function proxyUrl(url: string, method: 'get' | 'post' = 'get'): string {
    const fullUrl = `${apiStore.api9CmdUrl}/${method.toLowerCase()}-proxy?url=${encodeURIComponent(url)}`
    console.log(`[CharacterStore] Proxying URL: ${url} via ${fullUrl}`)
    return fullUrl
  }

  async function findAgentByAvatarAddress(avatarAddress: string): Promise<string | null> {
    isFetching.value = true
    error.value = null
    try {
      // 1. Try via GraphQL (Standard RPC)
      const result = await withRetry(
        () =>
          queryGraphql<{ stateQuery: { avatar: { agentAddress: string } } }>(
            planetStore.graphqlUrl,
            GQL_QUERIES.CHARACTER.GET_AGENT_BY_AVATAR,
            { avatarAddress },
          ),
        { maxRetries: 2 }, // Fail fast to try fallback
      )
      if (result.stateQuery?.avatar?.agentAddress) {
        return result.stateQuery.avatar.agentAddress
      }
    } catch (err) {
      console.warn('[CharacterStore] RPC reverse lookup failed, trying fallback:', err)
    }

    // 2. Fallback to 9cscan REST API if GraphQL fails or returns null
    if (planetStore.scanUrl) {
      try {
        const url = `${planetStore.scanUrl}/account?avatar=${avatarAddress}`
        const { data } = await useFetch(url).json<{ address: string }[]>()
        if (data.value && data.value.length > 0 && data.value[0]) {
          return data.value[0].address || null
        }
      } catch (scanErr) {
        console.error('[CharacterStore] 9cscan fallback failed:', scanErr)
      }
    }

    isFetching.value = false
    return null
  }

  async function fetchAllAvatars(agentAddress: string) {
    isFetching.value = true
    error.value = null
    const rpcUrl = planetStore.graphqlUrl
    const sheets = csvStore.allSheets

    try {
      // Logic for initial fetch to get avatar list
      interface AgentAvatarsResponse {
        stateQuery: {
          agent: {
            gold: string
            crystal: string
            avatarStates: { address: string }[]
          }
        }
      }
      const agentResult = await withRetry(async () => {
        const result = await queryGraphql<AgentAvatarsResponse>(
          rpcUrl,
          CHARACTER_QUERIES.GET_AGENT_AVATARS,
          {
            agentAddress,
          },
        )
        if (!result.stateQuery?.agent?.avatarStates?.length) {
          throw new Error('No avatars found')
        }
        return result
      })

      const agentData = agentResult.stateQuery?.agent
      const avatarAddresses = agentData.avatarStates.map((s) => s.address)

      const BATCH_SIZE = 10
      const processed: AvatarData[] = []
      const timestamp = Date.now()

      for (let i = 0; i < avatarAddresses.length; i += BATCH_SIZE) {
        const chunk = avatarAddresses.slice(i, i + BATCH_SIZE)

        // For list fetching, we don't have material IDs yet, so we fetch basic info
        const queryBatch = CHARACTER_QUERIES.BUILD_BATCH_QUERY(agentAddress, chunk)
        const batchResult = await withRetry(() =>
          queryGraphql<{
            stateQuery: Record<string, AvatarDetailHeadless | { deposit: string } | number[]>
          }>(rpcUrl, queryBatch),
        )
        const stakeNCGValue =
          parseFloat(
            (batchResult.stateQuery?.stakeState as { deposit?: string })?.deposit || '0',
          ) || 0

        for (const key in batchResult.stateQuery) {
          if (['stakeState'].includes(key)) continue
          if (!key.startsWith('avatar_')) continue

          const data = batchResult.stateQuery[key] as AvatarDetailHeadless
          if (!data?.address) continue

          const cleanAddr = data.address.startsWith('0x') ? data.address.slice(2) : data.address
          const unlockedWorlds =
            (batchResult.stateQuery[`unlockedWorldIds_${cleanAddr}`] as number[]) || []

          const equipments = (data.inventory?.equipments || []).map((eq) => ({ ...eq }))
          resolveItemNames(equipments, sheets, locale.value)

          const latestStage = getLatestStageId(data.stageMap?.pairs || [])
          const worldInfo = resolveWorldInfo(latestStage, sheets, unlockedWorlds, locale.value)
          const materials = processMaterials(data, sheets, locale.value)
          const materialList: Record<number, number> = {}
          materials.forEach((m) => {
            materialList[m.id] = (materialList[m.id] || 0) + m.count
          })

          processed.push({
            address: data.address,
            name: data.name,
            level: data.level,
            exp: data.exp,
            ncg: 0,
            crystal: 0,
            stage: latestStage,
            worldId: worldInfo.worldId,
            worldName: worldInfo.name,
            ap: 0,
            maxAp: CHARACTER_LOGIC_CONSTANTS.AP.MAX,
            cp: calculateTotalCP(equipments),
            adventureCp: 0,
            portraitId: 10200000,
            rank: 0,
            dailyRewardReceivedIndex: data.dailyRewardReceivedIndex || 0,
            dailyRewardReceivedBlockIndex: 0,
            timeRefill: 0,
            timeRefillReal: 0,
            dailyRewardInterval: CHARACTER_LOGIC_CONSTANTS.AP.DAILY_REFILL_INTERVAL,
            apCost: calculateAPCost(stakeNCGValue),
            inventory: {
              equipments,
              costumes: [],
              materials,
            },
            runeSlots: [],
            runes: [],
            craftingSlots: data.combinationSlots || [],
            stakeNCG: stakeNCGValue,
            isHasCraftOneTime: false,
            isClaimPatrolRewardOneTime: false,
            claimedGifts: [],
            gifts: [],
            summons: [],
            eventDungeonInfo: {
              roundReset: 1,
              ticket: 0,
              ticketBuyed: 0,
              stageIdUnlocked: 0,
              currentTurn: 1,
              totalTurns: 1,
              currentRoundStartBlock: 0,
              currentRoundEndBlock: 0,
            },
            worldBossInfoTotal: null,
            worldBossInfoAvatar: null,
            materialList,
            timestamp,
          })
        }
      }

      characters.value = processed.sort((a, b) => b.level - a.level)
      await Promise.all(
        processed.map((char) =>
          db.character_history.add({
            agentAddress,
            avatarAddress: char.address,
            timestamp,
            planet: planetStore.currentPlanetName,
            data: JSON.parse(JSON.stringify(char)) as Record<string, unknown>,
          }),
        ),
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isFetching.value = false
    }
  }

  async function fetchAvatarDetail() {
    const targetAvatar = settingsStore.avatarAddress
    const targetAgent = settingsStore.agentAddress
    if (!targetAvatar || !targetAgent) return

    isFetching.value = true
    error.value = null
    const rpcUrl = planetStore.graphqlUrl
    const mimirUrl = planetStore.mimirUrl

    try {
      // Get material IDs from itemMap
      const materialIds = (info.value?.inventory.materials || []).map((m) => m.id)

      // Build dynamic codeGets for REST API enrichment
      const sheets = csvStore.allSheets
      const blockNow = blockStore.blockNow
      const codeGets = [...CHARACTER_CODE_GETS]

      // Add World Boss codes if ongoing
      const wbInfo = resolveWorldBossInfo(sheets, blockNow)
      if (wbInfo.hasOngoingEvent) {
        wbInfo.listIdOngoingWorldBoss.forEach((id) => {
          codeGets.push(REST_API_CONFIG.CODE_GETS.WORLD_BOSS_TOTAL(id))
          codeGets.push(REST_API_CONFIG.CODE_GETS.WORLD_BOSS_AVATAR(id))
        })
      }

      // Add Event Dungeon codes if ongoing
      const eventSheet = sheets[CHARACTER_LOGIC_CONSTANTS.SHEETS.EVENT_SCHEDULE]
      if (eventSheet) {
        Object.values(eventSheet.mappedData).forEach((event) => {
          const start = parseInt(String(event['start_block_index'] || '0'))
          const end = parseInt(String(event['dungeon_end_block_index'] || '0'))
          if (blockNow >= start && blockNow <= end) {
            const dungeonId = event['id']
            if (dungeonId) {
              codeGets.push(REST_API_CONFIG.CODE_GETS.EVENT_DUNGEON_INFO(String(dungeonId)))
            }
          }
        })
      }

      const [headlessRes, mimirData, restData, seasonPassData] = await Promise.all([
        withRetry(() =>
          queryGraphql<{
            stateQuery: Record<
              string,
              | AvatarDetailHeadless
              | { gold: string; crystal: string }
              | number[]
              | { deposit: string }
            >
          }>(
            rpcUrl,
            CHARACTER_QUERIES.GET_AVATAR_DETAIL_FULL(targetAvatar, targetAgent, materialIds),
          ),
        ),
        withRetry(() =>
          queryGraphql<unknown>(mimirUrl, CHARACTER_QUERIES.GET_AVATAR_MIMIR_FULL, {
            avatarAddress: targetAvatar,
            agentAddress: targetAgent,
          }),
        ),
        withRetry(() => fetch9cmdApiData(targetAvatar, planetStore.currentPlanetName, codeGets)),
        fetchSeasonPassData(targetAvatar, targetAgent),
      ])

      const timestamp = Date.now()

      // Extract avatar data from alias
      const cleanTargetAddr = targetAvatar.startsWith('0x') ? targetAvatar.slice(2) : targetAvatar
      const avatarKey = `avatar_${cleanTargetAddr}`
      const unlockedKey = `unlockedWorldIds_${cleanTargetAddr}`
      const headlessState = headlessRes.stateQuery

      currentAvatarDetail.value = {
        headless: {
          stateQuery: {
            agent: headlessState.agent as { gold: string; crystal: string },
            unlockedWorldIds: (headlessState[unlockedKey] as number[]) || [],
            avatar: headlessState[avatarKey] as AvatarDetailHeadless,
            stakeState: headlessState.stakeState as { deposit: string },
          },
        },
        mimir: mimirData as unknown as RawAvatarDetail['mimir'],
        rest: (restData as unknown as RawAvatarDetail['rest']) || null,
        seasonPass: (seasonPassData as unknown as RawAvatarDetail['seasonPass']) || null,
        timestamp,
      }

      if (info.value) {
        await db.character_history.add({
          agentAddress: targetAgent,
          avatarAddress: targetAvatar,
          timestamp,
          planet: planetStore.currentPlanetName,
          data: JSON.parse(JSON.stringify(info.value)) as Record<string, unknown>,
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isFetching.value = false
    }
  }

  async function fetch9cmdApiData(
    avatarAddress: string,
    planet: string,
    codeGets: string[] = CHARACTER_CODE_GETS,
  ) {
    const url = get9cmdApiUrl(apiStore.api9CmdUrl, avatarAddress, planet, codeGets)
    console.log(`[CharacterStore] Fetching 9cmd data: ${url}`)
    const { data, error: fetchErr } = await useFetch<RestApiResponse>(url).json()
    if (fetchErr.value) {
      console.error('[CharacterStore] 9cmd API fetch failed:', fetchErr.value)
      throw new Error(`9cmd API Error: ${fetchErr.value}`)
    }
    return data.value?.data
  }

  async function fetchSeasonPassData(avatarAddress: string, agentAddress: string) {
    const url = `${apiStore.seasonPassUrl}/api/user/status/all?avatar_addr=${avatarAddress}&agent_addr=${agentAddress}&planet_id=${planetStore.currentPlanetId}`
    const { data } = await useFetch<Record<string, unknown>>(proxyUrl(url)).json()
    return data.value
  }

  async function loadFromHistory() {
    if (!settingsStore.agentAddress) return
    const history = await db.character_history
      .where({ agentAddress: settingsStore.agentAddress })
      .toArray()
    if (history.length > 0) {
      const latestMap = new Map<string, AvatarData>()
      const sheets = csvStore.allSheets
      history.forEach((h) => {
        const existing = latestMap.get(h.avatarAddress)
        if (!existing || h.timestamp > (existing.timestamp ?? 0)) {
          const charData = h.data as unknown as AvatarData
          // Refresh names to match current locale
          refreshAvatarNames(charData, sheets, locale.value)
          latestMap.set(h.avatarAddress, charData)
        }
      })
      characters.value = Array.from(latestMap.values()).sort((a, b) => b.level - a.level)
    }
  }

  /**
   * Fetches arena seasons and rankings to support character lookup by name.
   */
  async function fetchAvatarsByRanking(name: string): Promise<CharacterSuggestion[]> {
    if (!name || name.length < 2) return []

    isFetching.value = true
    error.value = null
    try {
      const rankings = await searchCharactersByRankingAdvanced(
        apiStore.api9CmdUrl,
        planetStore.currentPlanetName,
        name,
        apiStore.nineChroniclesApiUrl,
      )

      return rankings.map(
        (r): CharacterSuggestion => ({
          address: r.AvatarAddress,
          name: r.Name,
          level: r.Level || r.AvatarLevel || 0,
          planet: planetStore.currentPlanetName,
          agentAddress: r.AgentAddress,
        }),
      )
    } catch (err) {
      console.error('[CharacterStore] Ranking search failed:', err)
      error.value = 'ranking_search_failed'
      return []
    } finally {
      isFetching.value = false
    }
  }

  async function fetchAvatarsByName(name: string): Promise<CharacterSuggestion[]> {
    return fetchAvatarsByRanking(name)
  }

  return {
    characters,
    loadFromHistory,
    currentAvatarDetail,
    previousAvatarDetail,
    info,
    isFetching,
    error,
    reset,
    findAgentByAvatarAddress,
    fetchAllAvatars,
    fetchAvatarDetail,
    fetchAvatarsByRanking,
    fetchAvatarsByName,
  }
})
