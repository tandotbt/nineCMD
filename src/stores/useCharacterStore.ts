import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  REST_API_CONFIG,
  RETRY_CONFIG,
  CHARACTER_LOGIC_CONSTANTS,
  CHARACTER_CODE_GETS,
} from '@/constants'
import { get9cmdApiUrl } from '@/api/rest'
import {
  calculateAPCost,
  getWorldInfo,
  getLatestStageId,
  calculateAPRefill,
  processMaterials,
  calculateTotalCP,
  resolveItemNames,
} from '@/logic/character'
import { CHARACTER_QUERIES } from '@/api/queries/character'
import type {
  AvatarData,
  RawAvatarDetail,
  AvatarDetailHeadless,
  RestApiResponse,
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

  const info = computed<AvatarData | null>(() => {
    const raw = currentAvatarDetail.value
    if (!raw) return null

    const headlessData = raw.headless.stateQuery
    const avatar = headlessData.avatar
    const mimirData = raw.mimir
    const restData = raw.rest
    const seasonPassData = raw.seasonPass
    const sheets = csvStore.allSheets

    const stagePairs = avatar?.stageMap?.pairs || []
    const latestStage = getLatestStageId(stagePairs)
    const worldInfo = getWorldInfo(
      latestStage,
      (sheets['WorldSheet']?.mappedData as unknown as Record<
        string,
        Record<string, string | number>
      >) || {},
      headlessData.unlockedWorldIds || [],
    )

    const gameConfig = sheets['GameConfigSheet']?.mappedData as
      | Record<string, Record<string, string | number>>
      | undefined
    const dailyRewardInterval =
      parseInt(String(gameConfig?.['daily_reward_interval']?.['value'] || '0')) ||
      CHARACTER_LOGIC_CONSTANTS.AP.DAILY_REFILL_INTERVAL

    const { timeRefill, timeRefillReal } = calculateAPRefill(
      mimirData?.dailyRewardReceivedBlockIndex ?? -1,
      blockStore.blockNow,
      dailyRewardInterval,
      blockStore.averageBlockTimeMs / 1000,
    )

    const equipments = (avatar?.inventory?.equipments || []).map((eq) => ({ ...eq }))
    const costumes = (avatar?.inventory?.costumes || []).map((cos) => ({ ...cos }))
    resolveItemNames(equipments, sheets, locale.value)
    resolveItemNames(costumes, sheets, locale.value)

    const runeSlots = (restData?.lookupRuneSetMuti_Adventure || []).map((slot) => {
      const runeData = slot.runeId
        ? (sheets['RuneSheet']?.mappedData?.[slot.runeId] as
            | Record<string, string | number>
            | undefined)
        : undefined
      return {
        ...slot,
        name: runeData ? String(runeData.Name || runeData._name || '') : 'Empty',
      }
    })

    const learnedRunes = (avatar?.runes || []).map((r) => {
      const runeData = sheets['RuneSheet']?.mappedData?.[r.runeId] as
        | Record<string, string | number>
        | undefined
      return {
        ...r,
        name: String(runeData?.Name || runeData?._name || 'Unknown Rune'),
      }
    })

    const stakeNCG = parseFloat(headlessData.stakeState?.deposit) || 0
    const restObj = restData as Record<string, unknown> | null

    return {
      address: avatar?.address || '',
      name: avatar?.name || 'N/A',
      level: avatar?.level || 0,
      exp: avatar?.exp || 0,
      ncg: parseFloat(headlessData.agent?.gold) || 0,
      crystal: parseFloat(headlessData.agent?.crystal) || 0,
      stage: latestStage,
      worldId: worldInfo.worldId,
      ap: mimirData?.actionPoint || 0,
      maxAp: CHARACTER_LOGIC_CONSTANTS.AP.MAX,
      cp: mimirData?.myAdventureCpRanking?.userDocument?.cp || calculateTotalCP(equipments),
      adventureCp: restData?.other_lookupAdventureCp || 0,
      portraitId: mimirData?.myAdventureCpRanking?.userDocument?.avatar?.portraitId || 10200000,
      rank: mimirData?.myAdventureCpRanking?.rank || 0,
      dailyRewardReceivedIndex: avatar?.dailyRewardReceivedIndex || 0,
      dailyRewardReceivedBlockIndex: mimirData?.dailyRewardReceivedBlockIndex || 0,
      timeRefill,
      timeRefillReal,
      dailyRewardInterval,
      apCost: calculateAPCost(stakeNCG),
      inventory: {
        equipments,
        costumes,
        materials: processMaterials(avatar || ({} as AvatarDetailHeadless), sheets, locale.value),
      },
      runeSlots,
      runes: learnedRunes,
      craftingSlots: avatar?.combinationSlots || [],
      stakeNCG,
      seasonPass: seasonPassData,
      isHasCraftOneTime: (mimirData?.isHasCraftOneTime?.items?.length ?? 0) > 0,
      claimedGifts: restData?.other_lookupClaimedGiftIds || [],
      eventDungeonInfo: (restObj?.[REST_API_CONFIG.CODE_GETS.EVENT_DUNGEON_INFO('any')] ||
        null) as Record<string, unknown> | null,
      worldBossInfoTotal: (restObj?.[REST_API_CONFIG.CODE_GETS.WORLD_BOSS_TOTAL('any')] ||
        null) as Record<string, unknown> | null,
      worldBossInfoAvatar: (restObj?.[REST_API_CONFIG.CODE_GETS.WORLD_BOSS_AVATAR('any')] ||
        null) as Record<string, unknown> | null,
      timestamp: raw.timestamp,
    }
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
      const ncg = parseFloat(agentData.gold) || 0
      const crystal = parseFloat(agentData.crystal) || 0

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
          const worldInfo = getWorldInfo(
            latestStage,
            (sheets['WorldSheet']?.mappedData as unknown as Record<
              string,
              Record<string, string | number>
            >) || {},
            unlockedWorlds,
          )

          processed.push({
            address: data.address,
            name: data.name,
            level: data.level,
            exp: data.exp,
            ncg,
            crystal,
            stage: latestStage,
            worldId: worldInfo.worldId,
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
              materials: processMaterials(data, sheets, locale.value),
            },
            runeSlots: [],
            runes: [],
            craftingSlots: data.combinationSlots || [],
            stakeNCG: stakeNCGValue,
            isHasCraftOneTime: false,
            claimedGifts: [],
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
      // Get material IDs from itemMap (v2 logic)
      const materialIds = (info.value?.inventory.materials || []).map((m) => m.id)

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
        withRetry(() => fetch9cmdApiData(targetAvatar, planetStore.currentPlanetName)),
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

  async function fetch9cmdApiData(avatarAddress: string, planet: string) {
    const url = get9cmdApiUrl(apiStore.api9CmdUrl, avatarAddress, planet, CHARACTER_CODE_GETS)
    console.log(`[CharacterStore] Fetching 9cmd data: ${url}`)
    const { data } = await useFetch<RestApiResponse>(url).json()
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
      history.forEach((h) => {
        const existing = latestMap.get(h.avatarAddress)
        if (!existing || h.timestamp > (existing.timestamp ?? 0)) {
          latestMap.set(h.avatarAddress, h.data as unknown as AvatarData)
        }
      })
      characters.value = Array.from(latestMap.values()).sort((a, b) => b.level - a.level)
    }
  }

  return {
    characters,
    loadFromHistory,
    currentAvatarDetail,
    previousAvatarDetail,
    info,
    isFetching,
    error,
    fetchAllAvatars,
    fetchAvatarDetail,
  }
})
