/**
 * Avatar Data Helpers – Pure functions for avatar data processing
 *
 * Reuses:
 * - constants.ts: COST_AP_BY_STAKE, COST_AP_BY_STAKE_MIN, AP_POTION_ID, AP_POTION_TRADABLE_OFFSET
 * - types/avatarData.ts: StatsMap, StatSkillResult, MaterialItem, ConsumableItem
 *
 * Does NOT contain fetch/API logic — pure data processing only.
 */

import { COST_AP_BY_STAKE, COST_AP_BY_STAKE_MIN, AP_POTION_ID, AP_POTION_TRADABLE_OFFSET, AVATAR_DATA_CODE_GET_STATIC, STAGE_SPECIAL_PREFIX } from '@/utilities/constants'
import type { StatsMap, StatSkillResult, MaterialItem, ConsumableItem } from '../types/avatarData'

// ============================================================
// AP Cost
// ============================================================

/**
 * Calculate AP Cost from stake NCG.
 *
 * Iterates COST_AP_BY_STAKE from low to high, if stake < ncgStake then use costAP.
 * If >= all tiers, use COST_AP_BY_STAKE_MIN.
 *
 * @param stakeNCG - stake NCG value (string or number)
 * @returns AP cost (3, 4, or 5)
 */
export function calculateAPCost(stakeNCG: string | number): number {
  const stake = typeof stakeNCG === 'string' ? parseInt(stakeNCG, 10) || 0 : stakeNCG
  for (const tier of COST_AP_BY_STAKE) {
    if (stake < tier.ncgStake) {
      return tier.costAP
    }
  }
  return COST_AP_BY_STAKE_MIN
}

// ============================================================
// Stage
// ============================================================

/**
 * Find the highest normal stage ID from stageMap pairs.
 *
 * Filters out special stages (prefix '100000') and returns the highest ID.
 *
 * @param stageMap - stageMap from GraphQL response
 * @returns Highest stage ID cleared (0 if empty)
 */
export function getLatestStageClearedId(stageMap: {
  pairs: Array<[number | string, number | string]>
}): number {
  let latest = 0
  for (const [stageId] of stageMap.pairs) {
    // Filter out special stages (prefix '100000' e.g. 100000xx)
    const prefix = STAGE_SPECIAL_PREFIX
    if (String(stageId).startsWith(prefix)) continue
    const id = Number(stageId)
    if (id > latest) latest = id
  }
  return latest
}

// ============================================================
// CP Calculation
// ============================================================

/**
 * Calculate Combat Power (CP) from statsMap.
 *
 * Formula: (HP*0.7 + ATK*10.5 + DEF*10.5 + SPD*3 + HIT*2.3 + CRI*0) * buffCP
 * buffCP = 1.15 if hasSkill, else 1
 *
 * @param statsMap - equipment stats map
 * @param hasSkill - whether equipment has skills (default: false)
 * @returns Floor of computed CP
 */
export function combatPotion(statsMap: StatsMap, hasSkill: boolean = false): number {
  const buffCP = hasSkill ? 1.15 : 1
  const cp =
    (statsMap.hP * 0.7 +
      statsMap.aTK * 10.5 +
      statsMap.dEF * 10.5 +
      statsMap.sPD * 3 +
      statsMap.hIT * 2.3 +
      statsMap.cRI * 0) *
    buffCP
  return Math.floor(cp)
}

// ============================================================
// Stat + Skill Option
// ============================================================

/**
 * Calculate stat + skill option for equipment display.
 *
 * @param params - stat, skills, statsMap from equipment
 * @returns StatSkillResult with listStat, mainStat, optionStat, isHasSkill
 */
export function statAndSkillOption(params: {
  stat: { statType: string; totalValue: number }
  skills: Array<{ id: number; elementalType?: string; power?: number; chance?: number; statPowerRatio?: number; referencedStatType?: string }>
  statsMap: Record<string, number>
}): StatSkillResult {
  const { stat, skills, statsMap } = params
  // Normalize statType to uppercase for consistent key comparison
  // e.g. 'hP' → 'HP', 'aTK' → 'ATK', 'dEF' → 'DEF'
  const statKey = stat.statType.toUpperCase()
  const whiteStat = stat.totalValue
  const isHasSkill = skills.length !== 0

  const mainStat: Record<string, number> = {}
  const optionStat: Record<string, number> = {}
  const listStat: string[] = []

  mainStat[statKey] = whiteStat

  for (const key of Object.keys(statsMap)) {
    if (statsMap[key] !== 0) {
      listStat.push('stat')
      const upperKey = key.toUpperCase()
      if (upperKey === statKey) {
        optionStat[upperKey] = statsMap[key] - whiteStat
      } else {
        optionStat[upperKey] = statsMap[key]
      }
    }
  }
  if (isHasSkill) {
    listStat.push('skill')
  }

  return { listStat, mainStat, optionStat, isHasSkill }
}

// ============================================================
// Arena / Event Helpers
// ============================================================

/**
 * Find active World Boss idRaid from blockNow.
 *
 * @param blockNow - current block index
 * @param worldBossData - list of world boss entries from CSV
 * @returns idRaid if active, null otherwise
 */
export function getActiveWorldBossId(
  blockNow: number,
  worldBossData: Array<{
    id: number
    startBlockIndex: number
    endBlockIndex: number
    [key: string]: unknown
  }>): number | null {
  for (const wb of worldBossData) {
    if (blockNow >= wb.startBlockIndex && blockNow <= wb.endBlockIndex) {
      return wb.id
    }
  }
  return null
}

/**
 * Find active Event Dungeon from blockNow.
 *
 * @param blockNow - current block index
 * @param eventScheduleData - list of event schedule entries from CSV
 * @returns dungeon info if active, null otherwise
 */
export function getActiveEventDungeon(
  blockNow: number,
  eventScheduleData: Array<{
    id: number
    dungeonId: number
    startBlockIndex: number
    endBlockIndex: number
    [key: string]: unknown
  }>
): { dungeonId: number; startEvent: number; endEvent: number } | null {
  for (const event of eventScheduleData) {
    if (blockNow >= event.startBlockIndex && blockNow <= event.endBlockIndex) {
      return {
        dungeonId: event.dungeonId,
        startEvent: event.startBlockIndex,
        endEvent: event.endBlockIndex
      }
    }
  }
  return null
}

// ============================================================
// Inventory Processing
// ============================================================

/**
 * Process inventory materials — count unique items.
 *
 * @param materials - raw materials from GraphQL
 * @returns Array of { id, count }
 */
export function processMaterials(
  materials: MaterialItem[] | undefined
): Array<{ id: number; count: number }> {
  if (!materials || materials.length === 0) return []
  const countMap = new Map<number, number>()
  for (const item of materials) {
    countMap.set(item.id, (countMap.get(item.id) ?? 0) + 1)
  }
  return Array.from(countMap.entries()).map(([id, count]) => ({ id, count }))
}

/**
 * Dedup consumables — group by id.
 *
 * @param consumables - raw consumables from GraphQL
 * @returns Array of deduped consumables with count + itemIdList
 */
export function dedupConsumables(
  consumables: ConsumableItem[] | undefined
): Array<{ id: number; count: number; itemIdList: number[] }> {
  if (!consumables || consumables.length === 0) return []
  const map = new Map<number, { count: number; itemIdList: number[] }>()
  for (const item of consumables) {
    const existing = map.get(item.id)
    if (existing) {
      existing.count++
      existing.itemIdList.push(item.id)
    } else {
      map.set(item.id, {
        count: 1,
        itemIdList: [item.id]
      })
    }
  }
  return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }))
}

// ============================================================
// Inventory Processing from GraphQL Query B
// ============================================================

/**
 * Process inventory data from GraphQL Query B response.
 *
 * Handles the `{ i<id>: [{ count, tradableId }] }` format.
 * Special case: AP potion (id=500000) splits tradable vs non-tradable.
 *
 * @param inventory - raw inventory object from GraphQL response
 * @returns Map of item ID → count (tradable AP potion uses offset ID)
 */
export function processInventoryFromGraphQL(
  inventory: Record<string, unknown>
): Record<number, number> {
  const materialMap: Record<number, number> = {}

  for (const key of Object.keys(inventory)) {
    if (!key.startsWith('i')) continue
    const value = inventory[key]
    const id = parseInt(key.slice(1))

    if (Array.isArray(value) && value.length > 0) {
      if (id === AP_POTION_ID) {
        // Special: split tradable vs non-tradable AP potions
        const tradableCount = value.reduce(
          (acc: number, item: Record<string, unknown>) => acc + (item.tradableId != null ? ((item.count as number) || 0) : 0),
          0
        )
        const nonTradableCount = value.reduce(
          (acc: number, item: Record<string, unknown>) => acc + (item.tradableId == null ? ((item.count as number) || 0) : 0),
          0
        )
        materialMap[AP_POTION_TRADABLE_OFFSET + id] = tradableCount
        materialMap[id] = nonTradableCount
      } else {
        const count = value.reduce(
          (acc: number, item: Record<string, unknown>) => acc + ((item.count as number) || 0),
          0
        )
        materialMap[id] = count
      }
    }
  }

  return materialMap
}

// ============================================================
// REST API codeGet List Builder
// ============================================================

/**
 * Build the complete codeGet list for getDataGraphql REST API.
 *
 * Combines static codeGet values (itemSet, runeSet, patrolReward) with
 * dynamic values that depend on CSV data (worldBoss, eventDungeon).
 *
 * @param worldBossData - rows from WorldBossListSheet (CSV)
 * @param eventScheduleData - rows from EventScheduleSheet (CSV)
 * @param blockNow - current block index from blockPolling store
 * @returns Array of codeGet string values for REST API
 */
export function buildCodeGetList(
  worldBossData: Array<{
    id: number
    startBlockIndex: number
    endBlockIndex: number
    [key: string]: unknown
  }> | undefined,
  eventScheduleData: Array<{
    id: number
    dungeonId: number
    startBlockIndex: number
    endBlockIndex: number
    [key: string]: unknown
  }> | undefined,
  blockNow: number
): string[] {
  const codeGets: string[] = [...AVATAR_DATA_CODE_GET_STATIC]

  // Dynamic: World Boss (note: total uses other_ prefix, avatar does not)
  const activeWorldBossId = getActiveWorldBossId(blockNow, worldBossData ?? [])
  if (activeWorldBossId !== null) {
    codeGets.push(`other_lookupWorldBossInfoTotal_idRaid_${activeWorldBossId}`)
    codeGets.push(`lookupWorldBossInfoAvatar_idRaid_${activeWorldBossId}`)
  }

  // Dynamic: Event Dungeon
  // Vue3 pattern: ${listIdOngoingEvents[0]}0001 → e.g. "123" → "1230001"
  const activeEventDungeon = getActiveEventDungeon(blockNow, eventScheduleData ?? [])
  if (activeEventDungeon !== null) {
    codeGets.push(`lookupEventDungeonInfo_dungeonId_${activeEventDungeon.dungeonId}0001`)
  }

  return codeGets
}

// ============================================================
// CSV Sheet Parsing Helpers (for fetchStep2)
// ============================================================

/** Parsed World Boss row from CSV sheet */
export interface ParsedWorldBossRow {
  id: number
  startBlockIndex: number
  endBlockIndex: number
  [key: string]: unknown
}

/** Parsed Event Schedule row from CSV sheet */
export interface ParsedEventScheduleRow {
  id: number
  dungeonId: number
  startBlockIndex: number
  endBlockIndex: number
  [key: string]: unknown
}

/**
 * Shared helper: resolve a field value from a CSV row using multiple possible key formats.
 * Supports snake_case, camelCase, and alternate spellings.
 *
 * @param row - raw CSV row
 * @param keys - possible key names to try (in priority order)
 * @param fallback - default value if no key matches
 * @returns Resolved number value
 */
function resolveField(
  row: Record<string, string | number>,
  keys: string[],
  fallback: number
): number {
  for (const key of keys) {
    if (row[key] !== undefined) return Number(row[key]) || fallback
  }
  return fallback
}

/**
 * Parse a CSV sheet into typed rows with flexible key resolution.
 * Shared logic for WorldBossListSheet and EventScheduleSheet.
 *
 * @param sheet - raw CSV sheet data from csvData store
 * @param extraFields - additional fields to extract (e.g. dungeonId)
 * @returns Array of parsed rows
 */
function parseSheetWithFields<T extends { id: number; startBlockIndex: number; endBlockIndex: number }>(
  sheet: Record<string, unknown> | null | undefined,
  extraFields?: Array<{ target: keyof T; keys: string[] }>
): T[] {
  if (!sheet) return []
  return (Object.values(sheet) as Array<Record<string, string | number>>).map((row) => {
    const base = {
      id: Number(row.id ?? row['id']) || 0,
      startBlockIndex: resolveField(row, ['started_block_index', 'startBlockIndex', 'start_block_index'], 0),
      endBlockIndex: resolveField(row, ['ended_block_index', 'endBlockIndex', 'end_block_index'], 0)
    }
    const extras: Record<string, unknown> = {}
    if (extraFields) {
      for (const { target, keys } of extraFields) {
        extras[target as string] = resolveField(row, keys, 0)
      }
    }
    return { ...base, ...extras } as T
  })
}

/**
 * Parse WorldBossListSheet into typed rows.
 * Handles multiple possible CSV key formats (snake_case / camelCase).
 *
 * @param sheet - raw CSV sheet data from csvData store
 * @returns Array of parsed world boss rows
 */
export function parseWorldBossSheet(
  sheet: Record<string, unknown> | null | undefined
): ParsedWorldBossRow[] {
  return parseSheetWithFields<ParsedWorldBossRow>(sheet)
}

/**
 * Parse EventScheduleSheet into typed rows.
 * Handles multiple possible CSV key formats (snake_case / camelCase).
 *
 * @param sheet - raw CSV sheet data from csvData store
 * @returns Array of parsed event schedule rows
 */
export function parseEventScheduleSheet(
  sheet: Record<string, unknown> | null | undefined
): ParsedEventScheduleRow[] {
  return parseSheetWithFields<ParsedEventScheduleRow>(sheet, [
    { target: 'dungeonId', keys: ['dungeon_id', 'dungeonId'] }
  ])
}
