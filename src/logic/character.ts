/**
 * @file logic/character.ts
 * @description Core business logic for character data processing.
 * Extracted and adapted from infoAccount.js for Nine CMD.
 */

import { CHARACTER_LOGIC_CONSTANTS, TRACKED_ITEM_IDS } from '@/constants'
import type {
  StatsMap,
  AvatarDetailHeadless,
  Material,
  Equipment,
  Costume,
} from '@/types/character'
import type { CsvSheetData } from '@/types/csv'

/**
 * Calculates Combat Power (CP) for a piece of equipment.
 * Formula based on infoAccount.js: combatPotion logic.
 */
export function calculateEquipmentCP(stats: StatsMap, hasSkill: boolean): number {
  const { hP = 0, aTK = 0, dEF = 0, sPD = 0, hIT = 0, cRI = 0 } = stats
  const { CP } = CHARACTER_LOGIC_CONSTANTS
  // project_v2 uses combatPotion which multiplies by 1.15 if hasSkill is true
  const buffCP = hasSkill ? CP.SKILL_BUFF : 1
  const itemCP =
    (hP * CP.HP + aTK * CP.ATK + dEF * CP.DEF + sPD * CP.SPD + hIT * CP.HIT + cRI * 0) * buffCP
  return Math.floor(itemCP)
}

/**
 * Converts a list of stat pairs (key-value) to a StatsMap.
 * Mimics statsMapConvert from project_v2.
 */
export function convertToStatsMap(
  pairs: { key: string; value: { baseValue: number; additionalValue: number } }[],
): StatsMap {
  const stats: StatsMap = { hP: 0, aTK: 0, dEF: 0, sPD: 0, hIT: 0, cRI: 0 }
  pairs.forEach((item) => {
    const key = item.key.charAt(0).toLowerCase() + item.key.slice(1)
    if (key in stats) {
      stats[key as keyof StatsMap] = (item.value.baseValue || 0) + (item.value.additionalValue || 0)
    }
  })
  return stats
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
  worldSheet: Record<string, Record<string, string | number>>,
  unlockedWorldIds: number[] = [],
): { worldId: number; isUnlocked: boolean } {
  const { STAGE } = CHARACTER_LOGIC_CONSTANTS
  // World 1 default
  if (stageId <= STAGE.WORLD_1_END) {
    return { worldId: STAGE.DEFAULT_WORLD_ID, isUnlocked: true }
  }

  for (const [id, config] of Object.entries(worldSheet)) {
    if (!config) continue
    const worldId = parseInt(id)
    const begin = parseInt(String(config['stage_begin'] ?? config['stageBegin'] ?? '0'))
    const end = parseInt(String(config['stage_end'] ?? config['stageEnd'] ?? '0'))

    if (stageId >= begin && stageId <= end) {
      return {
        worldId,
        isUnlocked: unlockedWorldIds.includes(worldId),
      }
    }
  }

  return { worldId: STAGE.ERROR_WORLD_ID, isUnlocked: false }
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
 * Sync with project_v2: getTimeRefillAP logic.
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
  const { LANG, SHEETS, ITEM_ID } = CHARACTER_LOGIC_CONSTANTS
  const inventory = avatar.inventory || {}
  const materialsMap = new Map<number, Material>()
  const langCol = locale === 'vi' ? LANG.VI : LANG.EN

  const itemNameSheet = sheets[SHEETS.ITEM_NAME]

  // 1. Process tracked items from i+id queries
  TRACKED_ITEM_IDS.forEach((id) => {
    const fieldKey = `i_${id}`
    const items = inventory[fieldKey] as { count: number; tradableId: string | null }[] | undefined
    if (items && Array.isArray(items)) {
      console.log(`[CharacterLogic] Processing tracked item ${id}, count: ${items.length}`)
      if (id === ITEM_ID.AP_POTION) {
        // Special case for AP Potion in project_v2: splits into tradable (14000000 + id) and non-tradable (id)
        const tradableCount = items.reduce(
          (sum, item) => sum + (item.tradableId ? Number(item.count) || 0 : 0),
          0,
        )
        const nonTradableCount = items.reduce(
          (sum, item) => sum + (!item.tradableId ? Number(item.count) || 0 : 0),
          0,
        )

        const itemData = itemNameSheet?.mappedData?.[`ITEM_NAME_${id}`] as
          | Record<string, string | number>
          | undefined
        const name = String(itemData?.[langCol] || itemData?.[LANG.EN] || `Item ${id}`)

        if (tradableCount > 0) {
          materialsMap.set(14000000 + id, {
            id: 14000000 + id,
            count: tradableCount,
            tradableCount,
            name: `(T) ${name}`,
          })
        }
        if (nonTradableCount > 0) {
          materialsMap.set(id, {
            id,
            count: nonTradableCount,
            tradableCount: 0,
            name,
          })
        }
      } else {
        const totalCount = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
        const tradableCount = items.reduce(
          (sum, item) => sum + (item.tradableId ? Number(item.count) || 0 : 0),
          0,
        )

        if (totalCount > 0) {
          const itemData = itemNameSheet?.mappedData?.[`ITEM_NAME_${id}`] as
            | Record<string, string | number>
            | undefined
          materialsMap.set(id, {
            id,
            count: totalCount,
            tradableCount,
            name: String(itemData?.[langCol] || itemData?.[LANG.EN] || `Item ${id}`),
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
        const itemData = itemNameSheet?.mappedData?.[`ITEM_NAME_${id}`] as
          | Record<string, string | number>
          | undefined
        materialsMap.set(id, {
          id,
          count,
          name: String(itemData?.[langCol] || itemData?.[LANG.EN] || `Item ${id}`),
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
      const itemData = itemNameSheet?.mappedData?.[`ITEM_NAME_${excelId}`] as
        | Record<string, string | number>
        | undefined
      materialsMap.set(excelId, {
        id: excelId,
        count: Number((rawM.count as number) || 1),
        tradableCount: rawM.tradableId || rawM.tradable ? Number((rawM.count as number) || 1) : 0,
        name: String(itemData?.[langCol] || itemData?.[LANG.EN] || `Item ${excelId}`),
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
      const excelId = Number(rawM.itemId || rawM.id)
      updateMetadata(excelId, rawM)
    })
  }

  if (Array.isArray(inventory.consumables)) {
    inventory.consumables.forEach((m) => {
      const rawM = m as unknown as Record<string, unknown>
      const excelId = Number(rawM.itemId || rawM.id)
      updateMetadata(excelId, rawM)
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
 * Resolves item names in equipment and costume lists based on CSV data.
 */
export function resolveItemNames(
  items: (Equipment | Costume)[],
  sheets: Record<string, CsvSheetData>,
  locale: string,
): void {
  const { LANG, SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const langCol = (locale === 'vi' ? LANG.VI : LANG.EN) as 'Vietnam' | 'English'
  const itemNameSheet = sheets[SHEETS.ITEM_NAME]
  if (!itemNameSheet) return

  items.forEach((item) => {
    const i = item as { itemId?: number; id: string | number }
    const excelId = i.itemId || i.id
    // Try full ID first, then fallback to base ID (first 6 digits) if not found
    let itemData = itemNameSheet.mappedData?.[`ITEM_NAME_${excelId}`] as
      | Record<string, string | number>
      | undefined

    if (!itemData && typeof excelId === 'number' && excelId > 999999) {
      const baseId = Math.floor(excelId / 100)
      itemData = itemNameSheet.mappedData?.[`ITEM_NAME_${baseId}`] as
        | Record<string, string | number>
        | undefined
    }

    if (itemData) {
      item.name = String(itemData[langCol] || itemData[LANG.EN] || item.name)
    }
  })
}
