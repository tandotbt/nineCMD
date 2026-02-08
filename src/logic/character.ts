/**
 * @file logic/character.ts
 * @description Core business logic for character data processing.
 * Extracted and adapted from infoAccount.js for Nine CMD.
 */

import { CHARACTER_LOGIC_CONSTANTS, TRACKED_ITEM_IDS } from '@/constants'
import type {
  StatsMap,
  StatValue,
  AvatarDetailHeadless,
  Material,
  Equipment,
  Costume,
  AvatarData,
  RawAvatarDetail,
  RuneSlot,
  RuneInfo,
  WorldBossTotal,
  WorldBossAvatar,
} from '@/types/character'
import type { CsvSheetData } from '@/types/csv'
import {
  resolveNameFromCsv,
  resolveLevelRequirement,
  resolveCostumeStats,
  resolveWorldInfo,
  resolveRuneInfo,
  resolvePatrolRewardInfo,
  processSeasonPassData,
  resolveEventDungeonInfo,
  resolveWorldBossInfo,
  resolveGiftInfo,
  resolveSummonInfo,
} from './mapping'
import { resolveAssetUrl, getGradeColor } from './assets'
import type { ItemDisplayData, ItemStat, ItemSkill, ItemSubType } from '@/types/item'

/**
 * Calculates Combat Power (CP) for a piece of equipment.
 * Formula based on infoAccount.js: combatPotion logic.
 */
export function calculateEquipmentCP(stats: StatsMap, hasSkill: boolean): number {
  const getVal = (v: number | StatValue | undefined) => {
    if (typeof v === 'number') return v
    if (v && typeof v === 'object' && v !== null) {
      return (v.baseValue || 0) + (v.additionalValue || 0)
    }
    return 0
  }

  const hP = getVal(stats.hP)
  const aTK = getVal(stats.aTK)
  const dEF = getVal(stats.dEF)
  const sPD = getVal(stats.sPD)
  const hIT = getVal(stats.hIT)
  const cRI = getVal(stats.cRI)

  const { CP } = CHARACTER_LOGIC_CONSTANTS
  // CombatPotion which multiplies by 1.15 if hasSkill is true
  const buffCP = hasSkill ? CP.SKILL_BUFF : 1
  const itemCP =
    (hP * CP.HP + aTK * CP.ATK + dEF * CP.DEF + sPD * CP.SPD + hIT * CP.HIT + cRI * 0) * buffCP
  return Math.floor(itemCP)
}

/**
 * Converts a list of stat pairs (key-value) to a StatsMap.
 * Mimics statsMapConvert.
 */
export function convertToStatsMap(
  pairs: { key: string; value: number | { baseValue: number; additionalValue: number } }[],
): StatsMap {
  const stats: Record<string, number | StatValue> = {
    hP: 0,
    aTK: 0,
    dEF: 0,
    cRI: 0,
    hIT: 0,
    sPD: 0,
  }
  pairs.forEach((item) => {
    // Normalize key to camelCase (e.g., ATK -> aTK, HP -> hP)
    const key = item.key.charAt(0).toLowerCase() + item.key.slice(1)
    if (typeof item.value === 'number') {
      stats[key] = item.value
    } else {
      stats[key] = {
        baseValue: item.value.baseValue || 0,
        additionalValue: item.value.additionalValue || 0,
      }
    }
  })
  return stats as StatsMap
}

/**
 * Calculates AP Cost based on staked NCG.
 */
export function calculateAPCost(stakeNCG: number): number {
  const { AP } = CHARACTER_LOGIC_CONSTANTS
  if (stakeNCG >= AP.STAKE_THRESHOLD_TIER_1) return AP.COST_TIER_1
  if (stakeNCG >= AP.STAKE_THRESHOLD_TIER_2) return AP.COST_TIER_2
  return AP.COST_DEFAULT
}

/**
 * Maps stage ID to world ID and unlock status.
 */
export function getWorldInfo(
  stageId: number,
  _worldSheet: Record<string, Record<string, string | number>>,
  unlockedWorldIds: number[] = [],
  sheets?: Record<string, CsvSheetData>,
): { worldId: number; isUnlocked: boolean } {
  if (!sheets) {
    // Fallback if sheets not provided (legacy support)
    const { STAGE } = CHARACTER_LOGIC_CONSTANTS
    if (stageId <= STAGE.WORLD_1_END) {
      return { worldId: STAGE.DEFAULT_WORLD_ID, isUnlocked: true }
    }
    for (const [id, config] of Object.entries(_worldSheet)) {
      if (!config) continue
      const worldId = parseInt(id)
      const begin = parseInt(String(config['stage_begin'] ?? config['stageBegin'] ?? '0'))
      const end = parseInt(String(config['stage_end'] ?? config['stageEnd'] ?? '0'))
      if (stageId >= begin && stageId <= end) {
        return { worldId, isUnlocked: unlockedWorldIds.includes(worldId) }
      }
    }
    return { worldId: STAGE.ERROR_WORLD_ID, isUnlocked: false }
  }

  const result = resolveWorldInfo(stageId, sheets, unlockedWorldIds)
  return { worldId: result.worldId, isUnlocked: result.isUnlocked }
}

/**
 * Extracts the latest cleared stage from stageMap pairs.
 */
export function getLatestStageId(stagePairs: [number, number][]): number {
  const { STAGE } = CHARACTER_LOGIC_CONSTANTS
  let latestStage = 0
  for (const [stageId] of stagePairs) {
    // Usually main stages are < 1000, event stages > 1000
    if (stageId < STAGE.EVENT_THRESHOLD && stageId > latestStage) {
      latestStage = stageId
    }
  }
  return latestStage
}

/**
 * Calculates AP refill time based on last claim block and current block.
 */
export function calculateAPRefill(
  blockRefill: number,
  currentBlock: number,
  dailyRewardInterval: number,
  averageBlockTimeSeconds: number,
): { timeRefill: number; timeRefillReal: number } {
  if (blockRefill < 0) return { timeRefill: 0, timeRefillReal: 0 }
  if (blockRefill === 0) return { timeRefill: 0, timeRefillReal: 1 }

  const timeRefill = currentBlock - blockRefill
  const timeRefillReal =
    dailyRewardInterval - timeRefill >= 0
      ? (dailyRewardInterval - timeRefill) * averageBlockTimeSeconds
      : 0

  return { timeRefill, timeRefillReal }
}

/**
 * Processes materials and stackable items from avatar inventory.
 */
export function processMaterials(
  avatar: AvatarDetailHeadless,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): Material[] {
  const { ITEM_ID } = CHARACTER_LOGIC_CONSTANTS
  const inventory = avatar.inventory || {}
  const materialsMap = new Map<number, Material>()

  // 1. Process tracked items from i_id queries (GraphQL aliases)
  TRACKED_ITEM_IDS.forEach((id) => {
    const fieldKey = `i${id}` // uses i600201 format
    const items = inventory[fieldKey] as { count: number; tradableId: string | null }[] | undefined
    if (items && Array.isArray(items)) {
      const name = resolveNameFromCsv(id, sheets, locale)
      if (id === ITEM_ID.AP_POTION) {
        // Special case for AP Potion: splits into tradable (14000000 + id) and non-tradable (id)
        const tradableCount = items.reduce(
          (sum, item) => sum + (item.tradableId != null ? Number(item.count) || 0 : 0),
          0,
        )
        const nonTradableCount = items.reduce(
          (sum, item) => sum + (item.tradableId == null ? Number(item.count) || 0 : 0),
          0,
        )

        // Always set entries for AP Potion to ensure consistency in materialList, even if count is 0
        materialsMap.set(14000000 + id, {
          id: 14000000 + id,
          count: tradableCount,
          tradableCount,
          name: `(T) ${name}`,
        })
        materialsMap.set(id, {
          id,
          count: nonTradableCount,
          tradableCount: 0,
          name,
        })
      } else {
        const totalCount = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
        const tradableCount = items.reduce(
          (sum, item) => sum + (item.tradableId != null ? Number(item.count) || 0 : 0),
          0,
        )

        if (totalCount > 0) {
          materialsMap.set(id, {
            id: id,
            count: totalCount,
            tradableCount,
            name,
          })
        }
      }
    }
  })

  // 2. Process itemMap for other stackable items
  const itemMap = avatar.itemMap as { count: number; pairs: [number, number][] } | undefined
  if (itemMap?.pairs) {
    itemMap.pairs.forEach(([id, count]) => {
      if (count > 0 && !materialsMap.has(id)) {
        materialsMap.set(id, {
          id,
          count,
          name: resolveNameFromCsv(id, sheets, locale),
        })
      }
    })
  }

  const updateMetadata = (excelId: number, rawM: Record<string, unknown>) => {
    if (!excelId || isNaN(excelId)) return
    const existing = materialsMap.get(excelId)
    if (existing) {
      if (rawM.grade !== undefined) existing.grade = rawM.grade as string | number
      if (rawM.itemType) existing.itemType = rawM.itemType as string
      if (rawM.itemSubType) existing.itemSubType = rawM.itemSubType as string
      if (rawM.elementalType) existing.elementalType = rawM.elementalType as string
      if (rawM.requiredBlockIndex) existing.requiredBlockIndex = rawM.requiredBlockIndex as number
    } else {
      materialsMap.set(excelId, {
        id: excelId,
        count: Number((rawM.count as number) || 0),
        tradableCount:
          rawM.tradableId != null || rawM.tradable === true || rawM.tradable === 'TRUE'
            ? Number((rawM.count as number) || 0)
            : 0,
        name: resolveNameFromCsv(excelId, sheets, locale),
        grade: rawM.grade as string | number,
        itemType: rawM.itemType as string,
        itemSubType: rawM.itemSubType as string,
        elementalType: rawM.elementalType as string,
        requiredBlockIndex: rawM.requiredBlockIndex as number,
      })
    }
  }

  // 3. Enrich with metadata from standard inventory lists
  if (Array.isArray(inventory.materials)) {
    inventory.materials.forEach((m) => {
      const rawM = m as unknown as Record<string, unknown>
      const excelId = extractExcelId(rawM)
      if (excelId) updateMetadata(excelId, rawM)
    })
  }

  if (Array.isArray(inventory.consumables)) {
    inventory.consumables.forEach((m) => {
      const rawM = m as unknown as Record<string, unknown>
      const excelId = extractExcelId(rawM)
      if (excelId) updateMetadata(excelId, rawM)
    })
  }

  return Array.from(materialsMap.values()).sort((a, b) => b.count - a.count)
}

/**
 * Calculates total CP from equipped items.
 */
export function calculateTotalCP(equipments: Equipment[]): number {
  let total = 0
  equipments.forEach((eq) => {
    if (eq.equipped && eq.statsMap) {
      total += calculateEquipmentCP(eq.statsMap, (eq.skills?.length || 0) > 0)
    }
  })
  return total
}

/**
 * Extracts the numeric Excel ID from various potential fields in an item object.
 * Robust against swapped id/itemId fields in different data sources.
 */
export function extractExcelId(item: Record<string, unknown>): number | null {
  // Priority 1: Check known numeric fields
  const candidates = [item.id, item.itemId, item.itemId_excel]
  for (const c of candidates) {
    const num = typeof c === 'number' ? c : parseInt(String(c))
    if (!isNaN(num) && num > 1000) return num // Template IDs are usually > 1000
  }
  return null
}

/**
 * Resolves item names in equipment and costume lists based on CSV data.
 */
export function resolveItemNames(
  items: (Equipment | Costume)[],
  sheets: Record<string, CsvSheetData>,
  locale: string,
): void {
  items.forEach((item) => {
    const excelId = extractExcelId(item as unknown as Record<string, unknown>)
    if (excelId) {
      item.name = resolveNameFromCsv(excelId, sheets, locale)
    } else {
      // Fallback to whatever string looks like an ID if extraction fails
      const fallbackId = String(item.itemId || item.id)
      item.name = `ID: ${fallbackId}`
    }
  })
}

/**
 * Refreshes all localized names within an AvatarData object.
 * Useful when switching languages without re-fetching data.
 */
export function refreshAvatarNames(
  avatar: AvatarData,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): void {
  // 1. Equipments & Costumes
  resolveItemNames(avatar.inventory.equipments, sheets, locale)
  resolveItemNames(avatar.inventory.costumes, sheets, locale)

  // 2. Materials
  avatar.inventory.materials.forEach((m) => {
    m.name = resolveNameFromCsv(m.id, sheets, locale)
  })

  // 3. Runes & Rune Slots
  avatar.runes.forEach((r) => {
    const info = resolveRuneInfo(r.runeId, sheets, locale)
    r.name = info.name
  })

  avatar.runeSlots.forEach((slot) => {
    if (slot.runeId) {
      slot.name = resolveRuneInfo(slot.runeId, sheets, locale).name
    } else {
      slot.name = 'Empty'
    }
  })

  // 4. World Name
  if (typeof avatar.stage === 'number') {
    const worldInfo = resolveWorldInfo(avatar.stage, sheets, [], locale)
    avatar.worldName = worldInfo.name
  }
}

/**
 * Aggregates raw data from multiple sources into a unified AvatarData object.
 * Consolidates transformation logic for consistency across the application.
 */
export function aggregateAvatarData(
  raw: RawAvatarDetail,
  sheets: Record<string, CsvSheetData> = {},
  locale: string = 'en',
  avgBlockTimeSeconds: number = 10,
  blockNowOverride?: number,
): AvatarData {
  const { headless, mimir, rest, seasonPass, timestamp } = raw
  const blockNow = blockNowOverride ?? timestamp
  const avatar = headless.stateQuery.avatar
  const { SHEETS, AP } = CHARACTER_LOGIC_CONSTANTS

  const stage = getLatestStageId(avatar.stageMap?.pairs || [])
  const world = resolveWorldInfo(stage, sheets, headless.stateQuery.unlockedWorldIds || [], locale)

  const dailyRewardIntervalRaw = parseInt(
    String(sheets[SHEETS.GAME_CONFIG]?.mappedData?.['daily_reward_interval']?.['value'] || '0'),
  )
  const dailyRewardInterval =
    isNaN(dailyRewardIntervalRaw) || dailyRewardIntervalRaw <= 0
      ? AP.DAILY_REFILL_INTERVAL
      : dailyRewardIntervalRaw

  const refill = calculateAPRefill(
    mimir?.dailyRewardReceivedBlockIndex ?? -1,
    blockNow,
    dailyRewardInterval,
    avgBlockTimeSeconds,
  )

  const materials = processMaterials(avatar, sheets, locale)
  const materialList: Record<number, number> = {}
  materials.forEach((m) => {
    materialList[m.id] = (materialList[m.id] || 0) + m.count
  })

  const stakeNCG = parseFloat(headless.stateQuery.stakeState.deposit || '0')
  const apCost = calculateAPCost(stakeNCG)

  // Process Equipments
  const equipments = (avatar.inventory.equipments || []).map((eq, index) => {
    const stats = eq.statsMap || { hP: 0, aTK: 0, dEF: 0, sPD: 0, hIT: 0, cRI: 0 }
    const excelId = extractExcelId(eq as unknown as Record<string, unknown>) || eq.itemId
    return {
      ...eq,
      index,
      name: resolveNameFromCsv(excelId, sheets, locale),
      levelReq: resolveLevelRequirement(excelId, sheets),
      CP: calculateEquipmentCP(stats, (eq.skills?.length || 0) > 0),
      imageUrl: resolveAssetUrl({ portraitId: excelId }),
    }
  })

  // Process Costumes
  const costumes = (avatar.inventory.costumes || []).map((cos, index) => {
    const excelId = extractExcelId(cos as unknown as Record<string, unknown>) || cos.itemId
    const statsMap = resolveCostumeStats(Number(excelId), sheets)
    return {
      ...cos,
      index,
      name: resolveNameFromCsv(excelId, sheets, locale),
      levelReq: resolveLevelRequirement(excelId, sheets),
      statsMap,
      CP: calculateEquipmentCP(statsMap, false),
      imageUrl: resolveAssetUrl({ portraitId: excelId }),
    }
  })

  // Process Runes
  const runeSlots: RuneSlot[] = (rest?.lookupRuneSetMuti_Adventure || []).map((slot) => {
    const info = slot.runeId ? resolveRuneInfo(slot.runeId, sheets, locale) : null
    return {
      ...slot,
      name: info ? info.name : 'Empty',
      imageUrl: info?.imageUrl,
    }
  })

  const runes: RuneInfo[] = (avatar.runes || []).map((r, index) => ({
    ...resolveRuneInfo(r.runeId, sheets, locale),
    index,
    level: r.level,
  }))

  const patrolReward = resolvePatrolRewardInfo(
    ((rest?.other_lookupPatrolReward as Record<string, unknown> | undefined)?.blockLastClaim as
      | number
      | undefined) ??
      mimir?.dailyRewardReceivedBlockIndex ??
      0,
    avatar.level,
    blockNow,
    sheets,
  )

  // Find dungeon info in rest results using dynamic keys
  let eventDungeonInfoRaw: Record<string, unknown> | null = null
  if (rest) {
    const dungeonKey = Object.keys(rest).find((k) => k.startsWith('lookupEventDungeonInfo_'))
    if (dungeonKey) {
      eventDungeonInfoRaw = rest[dungeonKey] as Record<string, unknown>
    }
  }

  const eventDungeonInfo = resolveEventDungeonInfo(eventDungeonInfoRaw, sheets, blockNow)
  const worldBossInfo = resolveWorldBossInfo(sheets, blockNow)
  const claimedGifts = (rest?.other_lookupClaimedGiftIds as number[]) || []
  const gifts = (resolveGiftInfo(sheets, blockNow, locale) || []).filter(
    (g) => !claimedGifts.includes(g.id),
  )
  const summons = resolveSummonInfo(sheets, locale) || []

  const isHasCraftOneTime =
    (mimir?.isHasCraftOneTime?.items?.length ?? 0) > 0 || equipments.length > 3

  // World Boss data from REST API might be under dynamic keys
  let wbTotal: Record<string, unknown> | null = null
  let wbAvatar: Record<string, unknown> | null = null

  if (rest) {
    const totalKey = Object.keys(rest).find((k) => k.startsWith('other_lookupWorldBossInfoTotal_'))
    const avatarKey = Object.keys(rest).find((k) => k.startsWith('lookupWorldBossInfoAvatar_'))
    if (totalKey) wbTotal = rest[totalKey] as Record<string, unknown>
    if (avatarKey) wbAvatar = rest[avatarKey] as Record<string, unknown>
  }

  return {
    address: avatar.address,
    name: avatar.name,
    level: avatar.level,
    exp: avatar.exp,
    ncg: parseFloat(headless.stateQuery.agent.gold || '0'),
    crystal: parseFloat(headless.stateQuery.agent.crystal || '0'),
    stage,
    worldId: world.worldId,
    worldName: world.name,
    ap: mimir?.actionPoint ?? 0,
    maxAp: AP.MAX,
    cp: mimir?.myAdventureCpRanking?.userDocument.cp ?? calculateTotalCP(equipments),
    adventureCp: (rest?.other_lookupAdventureCp as number) || 0,
    portraitId: mimir?.myAdventureCpRanking?.userDocument.avatar.portraitId ?? 10200000,
    portraitUrl: resolveAssetUrl({
      portraitId: mimir?.myAdventureCpRanking?.userDocument.avatar.portraitId ?? 10200000,
    }),
    rank: mimir?.myAdventureCpRanking?.rank ?? 0,
    dailyRewardReceivedIndex: avatar.dailyRewardReceivedIndex,
    dailyRewardReceivedBlockIndex: mimir?.dailyRewardReceivedBlockIndex ?? -1,
    timeRefill: refill.timeRefill,
    timeRefillReal: refill.timeRefillReal,
    dailyRewardInterval,
    apCost,
    inventory: {
      equipments,
      costumes,
      materials,
    },
    runeSlots,
    runes,
    craftingSlots: avatar.combinationSlots || [],
    stakeNCG,
    seasonPass: processSeasonPassData(
      Array.isArray(seasonPass) ? seasonPass : seasonPass ? [seasonPass] : [],
    ),
    isHasCraftOneTime,
    isClaimPatrolRewardOneTime: (mimir?.isClaimPatrolRewardOneTime?.items?.length ?? 0) > 0,
    claimedGifts,
    gifts,
    summons,
    patrolReward,
    eventDungeonInfo,
    worldBossInfoTotal:
      (wbTotal as unknown as WorldBossTotal) ||
      (worldBossInfo.hasOngoingEvent ? ({} as WorldBossTotal) : null),
    worldBossInfoAvatar: wbAvatar as unknown as WorldBossAvatar,
    agentAddress: (rest as Record<string, unknown>)?.agentAddress as string | undefined,
    materialList,
    timestamp,
  }
}

/**
 * Standard mapper to ItemDisplayData for Equipment and Costumes.
 */
export function mapEquipmentToDisplayData(
  row: Equipment | Costume,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): ItemDisplayData {
  const excelId = extractExcelId(row as unknown as Record<string, unknown>) || Number(row.itemId)

  const isEquipment = (item: Equipment | Costume): item is Equipment => {
    return item.itemType.toUpperCase() === 'EQUIPMENT'
  }

  const getStatTotal = (v: number | StatValue | undefined): number => {
    if (typeof v === 'number') return v
    if (v && typeof v === 'object' && v !== null) {
      return (v.baseValue || 0) + (v.additionalValue || 0)
    }
    return 0
  }

  const isOptionStat = (v: number | StatValue | undefined): boolean => {
    if (typeof v === 'number') return v > 0
    if (v && typeof v === 'object' && v !== null) {
      return (v as StatValue).additionalValue > 0
    }
    return false
  }

  // 1. Identify All Active Stats
  const stats: ItemStat[] = []
  const statsMap = row.statsMap
  if (statsMap) {
    // Show all standard stats if they have a value > 0
    const allStatKeys = ['hP', 'aTK', 'dEF', 'sPD', 'hIT', 'cRI']
    allStatKeys.forEach((key) => {
      const val = statsMap[key]
      const total = getStatTotal(val)
      if (total > 0) {
        stats.push({ label: key.toUpperCase(), value: total })
      }
    })
  }

  const mappedSkills: ItemSkill[] | undefined = isEquipment(row)
    ? row.skills?.map((s) => ({
        id: s.id.toString(),
        name: resolveNameFromCsv(s.id, sheets, locale) || s.id.toString(),
        power: s.power,
        chance: s.chance,
        statPowerRatio: s.statPowerRatio,
        referencedStatType: s.referencedStatType,
      }))
    : undefined

  const grade = Number(row.grade) || 1
  const type = row.itemType.toLowerCase() === 'costume' ? 'costume' : 'equipment'

  // 2. Identify Option Stats (Yellow Stars)
  // Gold stars are stats that have an additionalValue > 0 (rolled options)
  // We no longer exclude main stats because they can also be rolled as options.
  // We only count options for equipments, as costumes have fixed stats.
  const optionStatTypes =
    type === 'equipment' && row.statsMap
      ? Object.entries(row.statsMap)
          .filter(([key, val]) => key !== 'cP' && isOptionStat(val))
          .map(([key]) => key)
      : []

  return {
    id: excelId,
    itemId: row.itemId,
    name: resolveNameFromCsv(excelId, sheets, locale) || `ID: ${excelId}`,
    grade,
    type,
    level: isEquipment(row) ? row.level : undefined,
    isEquipped: row.equipped,
    cp: row.CP,
    levelReq: row.levelReq,
    elementalType: row.elementalType,
    stats,
    statsMap: row.statsMap,
    skills: mappedSkills,
    hasSkill: isEquipment(row) ? (row.skills?.length || 0) > 0 : false,
    skillsCount: isEquipment(row) ? row.skills?.length || 0 : 0,
    optionStatTypes,
    optionStatsCount: optionStatTypes.length,
    itemSubType: row.itemSubType as ItemSubType,
    gradeColor: getGradeColor(grade),
    imageUrl: resolveAssetUrl({ portraitId: excelId }),
  }
}

/**
 * Standard mapper for Materials.
 */
export function mapMaterialToDisplayData(
  row: Material,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): ItemDisplayData {
  const grade = Number(row.grade || 1)
  return {
    id: row.id,
    name: resolveNameFromCsv(row.id, sheets, locale) || `ID: ${row.id}`,
    grade,
    type: 'material',
    count: row.count,
    tradableCount: row.tradableCount,
    elementalType: row.elementalType,
    requiredBlockIndex: row.requiredBlockIndex,
    itemSubType: row.itemSubType as ItemSubType,
    gradeColor: getGradeColor(grade),
    imageUrl: resolveAssetUrl({ portraitId: row.id }),
    // Materials don't have stars/skills
    hasSkill: false,
    optionStatTypes: [],
  }
}

/**
 * Resolves the portrait URL for a given portrait ID.
 */
export function resolvePortraitUrl(portraitId: number | string): string {
  return resolveAssetUrl({ portraitId: Number(portraitId) })
}

/**
 * Standard mapper for Costumes.
 */
export function mapCostumeToDisplayData(
  row: Costume,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): ItemDisplayData {
  const excelId = extractExcelId(row as unknown as Record<string, unknown>) || Number(row.itemId)
  const statsMap = resolveCostumeStats(Number(excelId), sheets)
  const grade = Number(row.grade) || 1

  const isOptionStat = (v: number | StatValue | undefined): boolean => {
    if (typeof v === 'number') return v > 0
    if (v && typeof v === 'object' && v !== null) {
      return (v as StatValue).additionalValue > 0
    }
    return false
  }

  // Identify Option Stats for Costumes (if any additional values exist)
  const optionStatTypes = statsMap
    ? Object.entries(statsMap)
        .filter(([key, val]) => key !== 'cP' && isOptionStat(val))
        .map(([key]) => key)
    : []

  return {
    id: excelId,
    itemId: row.itemId,
    name: resolveNameFromCsv(excelId, sheets, locale) || `ID: ${excelId}`,
    grade,
    type: 'costume',
    isEquipped: row.equipped,
    cp: calculateEquipmentCP(statsMap, false),
    levelReq: resolveLevelRequirement(excelId, sheets),
    elementalType: row.elementalType,
    stats: Object.entries(statsMap)
      .filter(([, val]) =>
        typeof val === 'number' ? val > 0 : (val.baseValue || 0) + (val.additionalValue || 0) > 0,
      )
      .map(([key, val]) => ({
        label: key.toUpperCase(),
        value: typeof val === 'number' ? val : (val.baseValue || 0) + (val.additionalValue || 0),
      })),
    statsMap,
    hasSkill: false,
    optionStatTypes,
    optionStatsCount: optionStatTypes.length,
    itemSubType: row.itemSubType as ItemSubType,
    gradeColor: getGradeColor(grade),
    imageUrl: resolveAssetUrl({ portraitId: excelId }),
  }
}

/**
 * Standard mapper for Runes.
 */
export function mapRuneToDisplayData(
  row: RuneSlot | RuneInfo,
  sheets: Record<string, CsvSheetData>,
  locale: string,
): ItemDisplayData {
  const runeId = (row as RuneInfo).runeId || (row as RuneSlot).runeId || 0
  const runeInfo = resolveRuneInfo(runeId, sheets, locale)
  const grade = 3 // Runes are generally rare (Blue) in UI standard
  return {
    id: runeId,
    name: runeInfo.name || 'Unknown Rune',
    grade,
    type: 'rune',
    level: row.level || 1,
    tickerRune: runeInfo.tickerRune,
    runeType: runeInfo.runeType as 'STAT' | 'SKILL',
    hasSkill: runeInfo.runeType === 'SKILL',
    optionStatTypes: [],
    levelReq: runeInfo.requiredLevel,
    gradeColor: getGradeColor(grade),
    imageUrl: runeInfo.imageUrl,
  }
}

/**
 * Standardized sorting logic for items.
 * Priority: Equipped > Grade (Desc) > Level (Desc) > CP (Desc) > ID (Asc)
 */
export function sortItems<T extends Equipment | Costume | Material>(
  items: T[],
  type: 'equipment' | 'material' | 'costume',
): T[] {
  return [...items].sort((a, b) => {
    // 1. Equipped status (for equipment/costumes) - HIGHEST PRIORITY
    if (type !== 'material') {
      const aEquipped = (a as Equipment | Costume).equipped ? 1 : 0
      const bEquipped = (b as Equipment | Costume).equipped ? 1 : 0
      if (aEquipped !== bEquipped) return bEquipped - aEquipped
    }

    // 2. Grade (Descending)
    const aGrade = Number(a.grade || 1)
    const bGrade = Number(b.grade || 1)
    if (aGrade !== bGrade) return bGrade - aGrade

    // 3. Level (Descending) - For equipments
    if (type === 'equipment') {
      const aLevel = (a as Equipment).level || 0
      const bLevel = (b as Equipment).level || 0
      if (aLevel !== bLevel) return bLevel - aLevel
    }

    // 4. CP (Descending) - For equipment/costumes
    if (type !== 'material') {
      const aCP = (a as Equipment | Costume).CP || 0
      const bCP = (b as Equipment | Costume).CP || 0
      if (aCP !== bCP) return bCP - aCP
    }

    // 5. Count (for materials, Descending)
    if (type === 'material') {
      const aCount = (a as Material).count || 0
      const bCount = (b as Material).count || 0
      if (aCount !== bCount) return bCount - aCount
    }

    // 6. ID (Ascending) - Final fallback
    return Number(a.id) - Number(b.id)
  })
}

/**
 * Standardized sorting logic for runes.
 * Priority: Level (Desc) > Name (Asc) > ID (Asc)
 */
export function sortRunes(runes: RuneInfo[]): RuneInfo[] {
  return [...runes].sort((a, b) => {
    if ((b.level || 0) !== (a.level || 0)) return (b.level || 0) - (a.level || 0)
    const nameA = a.name || ''
    const nameB = b.name || ''
    if (nameA !== nameB) return nameA.localeCompare(nameB)
    return (a.runeId || 0) - (b.runeId || 0)
  })
}
