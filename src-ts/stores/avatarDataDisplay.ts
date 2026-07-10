/**
 * avatarDataDisplay Store – Pinia store for avatar data display
 *
 * - globalCsv.getItemName() / getSkillName() for localized names
 * - csvData.getSheetRow() for CSV data (ItemRequirement, CostumeStat, etc.)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlanetName } from '@/utilities/constants'
import type { CsvSheetName } from '../types/csvData'
import { AP_POTION_ID, AP_POTION_TRADABLE_OFFSET, CODE_GET_RESPONSE_KEYS, DEFAULT_LEVEL_REQ } from '@/utilities/constants'
import { useBlockPollingStore } from './blockPolling'
import { useConfigURLStore } from './configURL'
import { useAppSettingsStore } from './appSettings'
import { useGlobalCsvStore } from './globalCsv'
import { useCsvDataStore } from './csvData'
import { createLogger } from '../utilities/logger'
import {
  calculateAPCost,
  getLatestStageClearedId,
  combatPotion,
  statAndSkillOption,
  dedupConsumables,
  processMaterials,
  buildCodeGetList,
  processInventoryFromGraphQL,
  getActiveWorldBossId,
  getActiveEventDungeon,
  parseWorldBossSheet,
  parseEventScheduleSheet
} from '../utilities/avatarDataHelpers'
import { fetchQueryA, fetchQueryB, fetchGetDataGraphql } from '../utilities/avatarDataGraphQL'
import type {
  CharacterInfo,
  EnrichedEquipment,
  EnrichedCostume,
  RuneEntry,
  CombinationSlot,
  EquipmentItem,
  CostumeItem,
  StatsMap,
  GetDataGraphqlResponse,
  GetDataGraphqlProcessed,
  EquipmentSetResponse,
  RuneSlotEntry,
  PatrolRewardInfo,
  WorldBossInfo,
  WorldBossAvatarInfo,
  EventDungeonInfo
} from '../types/avatarData'

// ============================================================
// Store
// ============================================================

export const useAvatarDataDisplayStore = defineStore('avatarDataDisplay', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'avatarDataDisplay' })

  // ============================================================
  // Stores (other Pinia stores — follow arenaLookup pattern)
  // ============================================================
  const appSettings = useAppSettingsStore()
  const blockPolling = useBlockPollingStore()
  const configURL = useConfigURLStore()
  const globalCsv = useGlobalCsvStore()
  const csvData = useCsvDataStore()

  // ============================================================
  // Computed: Base values from other stores
  // ============================================================
  const selectedPlanet = computed<PlanetName>(() => appSettings.selectedPlanet)
  const blockNow = computed<number>(() => blockPolling.currentBlockIndex)

  // ============================================================
  // State
  // ============================================================
  const agentAddress = ref('')
  const avatarAddress = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Step 1 — GraphQL
  const rawGraphQL = ref<Record<string, unknown> | null>(null)
  const characterInfo = ref<CharacterInfo | null>(null)
  const equipmentsAll = ref<EnrichedEquipment[]>([])
  const costumesAll = ref<EnrichedCostume[]>([])
  const runesAll = ref<RuneEntry[]>([])
  const combinationSlots = ref<CombinationSlot[]>([])
  const equippedSlots = ref<Array<{ itemSubType: string; id: number }>>([])
  const unlockedWorldIds = ref<number[]>([])

  // Processed material/consumable data (from fetchStep1)
  const materialsAll = ref<Array<{ id: number; count: number }>>([])
  const consumablesAll = ref<Array<{ id: number; count: number; itemIdList: number[] }>>([])

  // Step 2 — REST API
  const rawRestApi = ref<GetDataGraphqlResponse | null>(null)
  const processedRestApi = ref<GetDataGraphqlProcessed | null>(null)

  // ============================================================
  // Computed
  // ============================================================
  const isReady = computed(() => !!characterInfo.value && !isLoading.value)

  // ============================================================
  // Helpers
  // ============================================================

  /**
   * Merge Query B material counts into existing materialsAll array.
   * Handles AP potion tradable/non-tradable split.
   * Batch update: rebuild full array once to avoid per-item reactivity triggers.
   */
  function mergeMaterialCounts(
    existing: Array<{ id: number; count: number }>,
    materialMap: Record<number, number>
  ): Array<{ id: number; count: number }> {
    const updated: Array<{ id: number; count: number }> = []
    let apTradableAdded = false
    for (const item of existing) {
      const newCount = materialMap[item.id] ?? item.count
      updated.push({ id: item.id, count: newCount })
      if (item.id === AP_POTION_ID && materialMap[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID] != null) {
        updated.push({ id: AP_POTION_TRADABLE_OFFSET + AP_POTION_ID, count: materialMap[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID] })
        apTradableAdded = true
      }
    }
    if (!apTradableAdded && materialMap[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID] != null) {
      updated.push({ id: AP_POTION_TRADABLE_OFFSET + AP_POTION_ID, count: materialMap[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID] })
    }
    return updated
  }

  // ============================================================
  // Helpers: Enrich data from CSV
  // ============================================================

  /**
   * Enrich equipments with name, CP, skills, levelReq from CSV data.
   * Port of: src/stores/fetchDataUser9C.js funcFillMoreInfo.equipment()
   */
  function fillEquipments(data: EquipmentItem[]): EnrichedEquipment[] {
    if (!data) return []
    return data.map((item, i) => {
      const name = globalCsv.getItemName(`ITEM_NAME_${item.id}`)
      const cp = combatPotion(item.statsMap, item.skills.length > 0)
      const skillSheet = csvData.getSheet('SkillSheet' as CsvSheetName)

      return {
        ...item,
        indexKey: i,
        title: name,
        name,
        cp,
        skills: item.skills.map((s) => ({
          ...s,
          name: globalCsv.getSkillName(`SKILL_NAME_${s.id}`),
          dataStat: skillSheet ? (skillSheet[s.id] ?? []) : []
        })),
        statArray: statAndSkillOption({
          stat: item.stat,
          skills: item.skills,
          statsMap: item.statsMap
        }),
        levelReq:
          ((csvData.getSheetRow('ItemRequirementSheet', item.id) as { level?: number })
            ?.level ?? DEFAULT_LEVEL_REQ)
      }
    })
  }

  /**
   * Enrich costumes with name, CP, statsMap from CSV data.
   * Port of: src/stores/fetchDataUser9C.js funcFillMoreInfo.costumes()
   */
  function fillCostumes(data: CostumeItem[]): EnrichedCostume[] {
    if (!data) return []
    const costumeStatSheet = csvData.getSheet('CostumeStatSheet')

    // Build a Map<costumeId, Map<statType, statValue>> for O(1) lookup per costume
    const costumeStatsMap = new Map<string, Map<string, number>>()
    if (costumeStatSheet) {
      for (const [, value] of Object.entries(costumeStatSheet)) {
        const row = value as { costume_id?: string; stat_type?: string; stat?: number }
        const costumeId = String(row.costume_id ?? '')
        const statType = row.stat_type ?? 'HP'
        const statValue = row.stat ?? 0
        if (!costumeStatsMap.has(costumeId)) {
          costumeStatsMap.set(costumeId, new Map())
        }
        costumeStatsMap.get(costumeId)!.set(statType, statValue)
      }
    }

    return data.map((item, i) => {
      const name = globalCsv.getItemName(`ITEM_NAME_${item.id}`)

      // Build statsMap from pre-computed Map
      const statsMap: Record<string, number> = { HP: 0, ATK: 0, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
      const itemStats = costumeStatsMap.get(String(item.id))
      if (itemStats) {
        for (const [statType, statValue] of itemStats) {
          statsMap[statType] = statValue
        }
      }

      const cp = combatPotion({
        hP: statsMap.HP,
        aTK: statsMap.ATK,
        dEF: statsMap.DEF,
        cRI: statsMap.CRI,
        hIT: statsMap.HIT,
        sPD: statsMap.SPD
      } as StatsMap, false)

      return {
        ...item,
        indexKey: i,
        title: name,
        name,
        statsMap,
        cp,
        statArray: statAndSkillOption({
          stat: { statType: 'hP', totalValue: 0 },
          skills: [],
          statsMap
        }),
        levelReq:
          ((csvData.getSheetRow('ItemRequirementSheet', item.id) as { level?: number })
            ?.level ?? DEFAULT_LEVEL_REQ)
      }
    })
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Main entry — Fetch all avatar data.
   */
  async function fetchAvatarData(agent: string, avatar: string): Promise<void> {
    isLoading.value = true
    error.value = null
    agentAddress.value = agent
    avatarAddress.value = avatar

    try {
      // Ensure CSV data is loaded (per-planet)
      if (!csvData.isLoaded) {
        logger.info('CSV data not loaded, fetching...')
        await csvData.fetchAllSheets(selectedPlanet.value)
      }

      // Ensure globalCsv data is loaded (ItemName, SkillName)
      if (!globalCsv.isLoaded) {
        logger.info('Global CSV not loaded, fetching...')
        await globalCsv.loadAll()
      }

      // Step 1: Fetch GraphQL data
      await fetchStep1(agent, avatar)

      // Step 2: Fetch REST API data (getDataGraphql)
      await fetchStep2(avatar)

      logger.info(`Avatar data loaded for ${avatar}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
      logger.error('Failed to fetch avatar data:', message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Step 1: Fetch GraphQL node data + process.
   */
  async function fetchStep1(agent: string, avatar: string): Promise<void> {
    // fetchQueryA returns graphqlQuery() result which is already `json.data` (unwrapped by mimirGraphql)
    // So `response` IS the `data` object: { stateQuery: { agent, avatar, ... } }
    const response = await fetchQueryA(agent, avatar)
    rawGraphQL.value = response

    // response IS data — access stateQuery directly
    const stateQuery = (response as Record<string, unknown>)?.['stateQuery'] as Record<string, unknown>

    // Agent balance
    const agentData = stateQuery?.['agent'] as { gold: string; crystal: string } | undefined
    const stakeStates = stateQuery?.['stakeStates'] as Array<{ deposit: string }> | undefined
    const stakeNCG = stakeStates?.[0]?.deposit ?? '0'

    // Avatar
    const avatarData = stateQuery?.['avatar'] as Record<string, unknown> | undefined
    if (!avatarData) throw new Error('No avatar data returned')

    // Stage cleared
    const stageMap = avatarData['stageMap'] as { pairs: Array<[number | string, number | string]> }
    const stageClearedId = getLatestStageClearedId(stageMap)

    // Character info
    characterInfo.value = {
      name: avatarData['name'] as string,
      level: avatarData['level'] as number,
      stageClearedId,
      actionPoint: avatarData['actionPoint'] as number,
      apCost: calculateAPCost(stakeNCG),
      gold: agentData?.gold ?? '0',
      crystal: agentData?.crystal ?? '0',
      stakeNCG,
      dailyRewardReceivedIndex: avatarData['dailyRewardReceivedIndex'] as number,
      unlockedWorldIds: (stateQuery?.['unlockedWorldIds'] as number[]) ?? [],
      cpData: null
    }

    // Inventory
    const inventory = avatarData['inventory'] as {
      equipped?: Array<{ itemSubType: string; id: number }>
      all?: EquipmentItem[]
      costumes?: CostumeItem[]
      materials?: Array<{ id: number }>
      consumables?: Array<{ id: number }>
    } | undefined

    if (inventory) {
      equippedSlots.value = inventory.equipped ?? []
      equipmentsAll.value = fillEquipments(inventory.all ?? [])
      costumesAll.value = fillCostumes(inventory.costumes ?? [])
      materialsAll.value = processMaterials(inventory.materials)
      consumablesAll.value = dedupConsumables(inventory.consumables)

      // Step 2 (mandatory): Fetch exact material counts from GraphQL node
      const materialIds = (inventory.materials ?? []).map((m) => m.id).filter((id) => id > 0)
      if (materialIds.length > 0) {
        try {
          const queryBResponse = await fetchQueryB(avatar, materialIds)
          // Response: { stateQuery: { avatar: { inventory: { i<id>: [{ count, tradableId }] } } } }
          const stateQueryB = (queryBResponse as Record<string, unknown>)?.['stateQuery'] as Record<string, unknown> | undefined
          const avatarB = stateQueryB?.['avatar'] as Record<string, unknown> | undefined
          const inventoryB = avatarB?.['inventory'] as Record<string, unknown> | undefined
          if (inventoryB) {
            const materialMap = processInventoryFromGraphQL(inventoryB)
            materialsAll.value = mergeMaterialCounts(materialsAll.value, materialMap)
          }
          logger.debug(`Query B fetched: ${materialIds.length} materials, response received`)
        } catch (e) {
          logger.warn('Query B failed (using Step 1 counts):', e)
        }
      }
    }

    // Runes
    runesAll.value = (avatarData['runes'] as RuneEntry[]) ?? []

    // Combination slots
    combinationSlots.value = (avatarData['combinationSlots'] as CombinationSlot[]) ?? []

    // Unlocked worlds
    unlockedWorldIds.value = (stateQuery?.['unlockedWorldIds'] as number[]) ?? []
  }

  /**
   * Step 2: Fetch REST API getDataGraphql + process into categorized data.
   *
   * Uses buildCodeGetList() to build the codeGet parameters:
   * - Static: itemSet (Adventure/Arena/Raid/InfiniteTower), runeSet (Adventure/Arena/Raid/InfiniteTower), patrolReward, adventureCp, claimedGiftIds
   * - Dynamic: worldBoss (if active), eventDungeon (if active) — from CSV data
   *
   * Response format: { data: { codeGetKey: [...] } } or { codeGetKey: [...] }
   */
  async function fetchStep2(avatar: string): Promise<void> {
    // Extract CSV rows (shared between buildCodeGetList and response key lookup)
    const worldBossSheet = csvData.getSheet('WorldBossListSheet')
    const eventScheduleSheet = csvData.getSheet('EventScheduleSheet')
    logger.debug(`fetchStep2: WorldBossListSheet=${worldBossSheet ? Object.keys(worldBossSheet).length + ' rows' : 'null'}, EventScheduleSheet=${eventScheduleSheet ? Object.keys(eventScheduleSheet).length + ' rows' : 'null'}`)

    const worldBossRows = parseWorldBossSheet(worldBossSheet)
    const eventScheduleRows = parseEventScheduleSheet(eventScheduleSheet)

    const block = blockNow.value
    logger.debug(`fetchStep2: blockNow=${block}, worldBoss=${worldBossRows.length}, eventSchedule=${eventScheduleRows.length}`)

    // Get active IDs for response key lookup
    const activeWorldBossId = getActiveWorldBossId(block, worldBossRows)
    const activeEventDungeon = getActiveEventDungeon(block, eventScheduleRows)
    logger.debug(`fetchStep2: activeWorldBossId=${activeWorldBossId}, activeEventDungeon=${activeEventDungeon?.dungeonId ?? 'null'}`)

    const codeGets = buildCodeGetList(worldBossRows, eventScheduleRows, block)
    logger.debug(`REST API codeGet list (${codeGets.length}): ${codeGets.join(', ')}`)

    // Fetch REST API
    const rawResponse = await fetchGetDataGraphql(avatar, codeGets)
    rawRestApi.value = rawResponse as GetDataGraphqlResponse

    // Handle both response formats:
    // - { data: { codeGetKey: [...] } } (server format)
    // - { codeGetKey: [...] } (direct format)
    const data = (rawResponse as Record<string, unknown>)?.['data'] as Record<string, unknown> | undefined
    const payload = data ?? (rawResponse as Record<string, unknown>)

    // Extract data using CODE_GET_RESPONSE_KEYS (server strips _type_ from codeGet params)
    const extractEquipSet = (key: string): EquipmentSetResponse | null => {
      const val = payload?.[key]
      if (val && typeof val === 'object' && !Array.isArray(val)) return val as EquipmentSetResponse
      return null
    }

    const extractRuneSet = (key: string): RuneSlotEntry[] => {
      const val = payload?.[key]
      return Array.isArray(val) ? (val as RuneSlotEntry[]) : []
    }

    const ek = CODE_GET_RESPONSE_KEYS.itemSet
    const rk = CODE_GET_RESPONSE_KEYS.runeSet

    processedRestApi.value = {
      equipmentSets: {
        adventure: extractEquipSet(ek.adventure),
        arena: extractEquipSet(ek.arena),
        raid: extractEquipSet(ek.raid),
        infiniteTower: extractEquipSet(ek.infiniteTower)
      },
      runeSets: {
        adventure: extractRuneSet(rk.adventure),
        arena: extractRuneSet(rk.arena),
        raid: extractRuneSet(rk.raid),
        infiniteTower: extractRuneSet(rk.infiniteTower)
      },
      worldBoss: {
        // Server strips _idRaid_ from response key: codeGet "other_lookupWorldBossInfoTotal_idRaid_X" → response "other_lookupWorldBossInfoTotal_X"
        total: activeWorldBossId !== null
          ? (payload?.[`other_lookupWorldBossInfoTotal_${activeWorldBossId}`] as WorldBossInfo | undefined) ?? null
          : null,
        avatar: activeWorldBossId !== null
          ? (payload?.[`lookupWorldBossInfoAvatar_${activeWorldBossId}`] as WorldBossAvatarInfo | undefined) ?? null
          : null
      },
      // Server strips _dungeonId_ from response key: codeGet "lookupEventDungeonInfo_dungeonId_X" → response "lookupEventDungeonInfo_X"
      eventDungeon: activeEventDungeon !== null
        ? (payload?.[`lookupEventDungeonInfo_${activeEventDungeon.dungeonId}0001`] as EventDungeonInfo | undefined) ?? null
        : null,
      patrolReward: extractPatrolReward(payload?.['other_lookupPatrolReward']),
      adventureCp: typeof payload?.['other_lookupAdventureCp'] === 'number' ? (payload['other_lookupAdventureCp'] as number) : null,
      claimedGiftIds: Array.isArray(payload?.['other_lookupClaimedGiftIds']) ? (payload['other_lookupClaimedGiftIds'] as number[]) : []
    }

    logger.info(`REST API data processed: ${codeGets.length} codeGets`)
  }

  /** Helper: extract patrol reward from raw REST API response */
  function extractPatrolReward(raw: unknown): PatrolRewardInfo | null {
    if (!raw || typeof raw !== 'object') return null
    const obj = raw as Record<string, unknown>
    // Check for error strings (Python pattern: "Error" in response)
    if (typeof obj['error'] === 'string' || typeof obj['message'] === 'string') {
      logger.warn('Patrol reward error from REST API:', String(obj['error'] ?? obj['message']))
      return null
    }
    const blockLastClaim = typeof obj['blockLastClaim'] === 'number' ? (obj['blockLastClaim'] as number) : 0
    const interval = typeof obj['interval'] === 'number' ? (obj['interval'] as number) : 0
    const diffBlock = blockNow.value - blockLastClaim
    return { blockLastClaim, interval, diffBlock, isCanClaim: diffBlock >= interval }
  }

  /**
   * Reset all state.
   */
  function reset(): void {
    agentAddress.value = ''
    avatarAddress.value = ''
    isLoading.value = false
    error.value = null
    rawGraphQL.value = null
    characterInfo.value = null
    equipmentsAll.value = []
    costumesAll.value = []
    runesAll.value = []
    combinationSlots.value = []
    equippedSlots.value = []
    unlockedWorldIds.value = []
    materialsAll.value = []
    consumablesAll.value = []
    rawRestApi.value = null
    processedRestApi.value = null
  }

  // ============================================================
  // Public API
  // ============================================================
  return {
    // State
    agentAddress,
    avatarAddress,
    isLoading,
    error,
    rawGraphQL,
    characterInfo,
    equipmentsAll,
    costumesAll,
    runesAll,
    combinationSlots,
    equippedSlots,
    unlockedWorldIds,
    materialsAll,
    consumablesAll,
    rawRestApi,
    processedRestApi,

    // Computed
    selectedPlanet,
    isReady,

    // Actions
    fetchAvatarData,
    fetchStep1,
    fetchStep2,
    reset
  }
})
