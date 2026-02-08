/**
 * @file logic/mapping.ts
 * @description Data mapping and enrichment logic using CSV sheets.
 */

import { CHARACTER_LOGIC_CONSTANTS, LEVEL_REQUIREMENT_FALLBACK } from '@/constants'
import type { CsvSheetData, CsvRow } from '@/types/csv'
import type {
  StatsMap,
  RuneInfo,
  PatrolRewardInfo,
  SeasonPassInfo,
  SeasonPassStatus,
  EventDungeonInfo,
  GiftInfo,
  SummonInfo,
  WorldBossInfo,
} from '@/types/character'
import { resolveAssetUrl } from './assets'

/**
 * Resolves a human-readable name for an item or entity from ItemNameSheet.
 */
const nameCache = new Map<string, string>()

/**
 * Resolves a human-readable name for an item or entity from ItemNameSheet.
 * Implements memoization to improve performance for repeated lookups.
 */
export function resolveNameFromCsv(
  id: string | number,
  sheets: Record<string, CsvSheetData>,
  locale: string = 'en',
  prefix: string = 'ITEM_NAME_',
): string {
  // We use a simple cache key. In tests where sheets change but have same length,
  // clearNameCache() should be called manually if needed.
  const cacheKey = `${id}:${locale}:${prefix}:${Object.keys(sheets).length}`
  if (nameCache.has(cacheKey)) return nameCache.get(cacheKey)!

  const { LANG, SHEETS } = CHARACTER_LOGIC_CONSTANTS
  // Support flexible locale strings (e.g., vi-VN, en-US)
  const isVietnamese = locale.toLowerCase().startsWith('vi')
  const langCol = (isVietnamese ? LANG.VI : LANG.EN) as 'Vietnam' | 'English'
  const nameSheet = sheets[SHEETS.ITEM_NAME]
  if (!nameSheet || !nameSheet.mappedData) return `ID: ${id}`

  const excelId = typeof id === 'number' ? id : parseInt(id)
  if (isNaN(excelId)) return `ID: ${id}`

  // Try exact ID match first
  let nameData = nameSheet.mappedData[`${prefix}${excelId}`]

  // Fallback for equipment IDs which might be specific versions (Math.floor(id / 100))
  if (!nameData && excelId > 999999) {
    const baseId = Math.floor(excelId / 100)
    nameData = nameSheet.mappedData[`${prefix}${baseId}`]
  }

  // If still not found, try without prefix if it's already a string key
  if (!nameData && typeof id === 'string' && !id.startsWith(prefix)) {
    nameData = nameSheet.mappedData[id]
  }

  if (!nameData) return `ID: ${id}`

  // Ensure reactivity by checking current locale, then fallback to English, then other variants
  const name =
    nameData[langCol] ||
    nameData[isVietnamese ? 'Vietnam' : 'English'] ||
    nameData[LANG.EN] ||
    nameData['English'] ||
    nameData['En'] ||
    nameData['_name'] ||
    nameData['Name'] ||
    nameData['original']

  const result = name ? String(name) : `ID: ${id}`
  nameCache.set(cacheKey, result)
  return result
}

/**
 * Clears the name resolution cache.
 * Useful when sheets are re-fetched or updated.
 */
export function clearNameCache(): void {
  nameCache.clear()
}

/**
 * Resolves level requirement for an item from ItemRequirementSheet.
 */
export function resolveLevelRequirement(
  id: string | number,
  sheets: Record<string, CsvSheetData>,
): number {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const reqSheet = sheets[SHEETS.ITEM_REQUIREMENT]
  if (!reqSheet || !reqSheet.mappedData) return LEVEL_REQUIREMENT_FALLBACK

  const row = reqSheet.mappedData[String(id)] as CsvRow | undefined
  if (!row) return LEVEL_REQUIREMENT_FALLBACK

  const level = parseInt(String(row['level'] || LEVEL_REQUIREMENT_FALLBACK))
  return isNaN(level) ? LEVEL_REQUIREMENT_FALLBACK : level
}

/**
 * Resolves detailed rune info by combining RuneSheet and RuneListSheet.
 */
export function resolveRuneInfo(
  runeId: number,
  sheets: Record<string, CsvSheetData>,
  locale: string = 'en',
): RuneInfo {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const runeSheet = sheets[SHEETS.RUNE]
  const runeListSheet = sheets[SHEETS.RUNE_LIST]

  const runeData = runeSheet?.mappedData?.[String(runeId)] as CsvRow | undefined
  const listData = runeListSheet?.mappedData?.[String(runeId)] as CsvRow | undefined

  // Attempt to resolve localized name from ItemNameSheet first (most accurate for UI)
  let name = resolveNameFromCsv(runeId, sheets, locale, 'ITEM_NAME_')

  // Fallback to RuneSheet internal name if resolveNameFromCsv returned the ID
  if (name === `ID: ${runeId}` && runeData) {
    const isVietnamese = locale.toLowerCase().startsWith('vi')
    name = String(
      runeData[isVietnamese ? 'Vietnam' : 'English'] ||
        runeData['English'] ||
        runeData['_name'] ||
        runeData['Name'] ||
        'Unknown',
    )
  }
  const runeTypeNumber = listData ? parseInt(String(listData['rune_type'] || '1')) : 1
  const runeType = runeTypeNumber === 2 ? 'SKILL' : 'STAT'
  const requiredLevelRaw = listData
    ? parseInt(String(listData['required_level'] || LEVEL_REQUIREMENT_FALLBACK))
    : LEVEL_REQUIREMENT_FALLBACK
  const requiredLevel = isNaN(requiredLevelRaw) ? LEVEL_REQUIREMENT_FALLBACK : requiredLevelRaw
  const tickerRune = runeData ? String(runeData['ticker'] || 'RUNE_ADVENTURER') : 'RUNE_ADVENTURER'

  // Standardized Rune icon logic:
  // Both Skill and Stat Runes should use tickerRune for icons from FungibleAssetValue
  const imageUrl = resolveAssetUrl({ tickerRune })

  return {
    runeId,
    level: 0, // Level is usually provided by the avatar state, not CSV
    name,
    runeType,
    requiredLevel,
    tickerRune,
    imageUrl,
  }
}

/**
 * Aggregates stats for a costume from CostumeStatSheet.
 * Uses indexed data for O(1) lookup.
 */
export function resolveCostumeStats(
  costumeId: number,
  sheets: Record<string, CsvSheetData>,
): StatsMap {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const statSheet = sheets[SHEETS.COSTUME_STAT]
  const stats: Record<string, number> = { aTK: 0, dEF: 0, hIT: 0, hP: 0, cRI: 0, sPD: 0 }

  if (!statSheet || (!statSheet.mappedData && !statSheet.secondaryIndices))
    return stats as unknown as StatsMap

  const rows = statSheet.secondaryIndices?.['costume_id']?.[String(costumeId)]
  if (rows) {
    rows.forEach((row) => {
      const type = String(row['stat_type']).toUpperCase()
      const valueRaw = parseInt(String(row['stat'] || '0'))
      const value = isNaN(valueRaw) ? 0 : valueRaw

      if (type === 'ATK') stats['aTK'] = (stats['aTK'] || 0) + value
      else if (type === 'DEF') stats['dEF'] = (stats['dEF'] || 0) + value
      else if (type === 'HIT') stats['hIT'] = (stats['hIT'] || 0) + value
      else if (type === 'HP') stats['hP'] = (stats['hP'] || 0) + value
      else if (type === 'CRI') stats['cRI'] = (stats['cRI'] || 0) + value
      else if (type === 'SPD') stats['sPD'] = (stats['sPD'] || 0) + value
    })
  } else if (statSheet.mappedData) {
    // Fallback to iteration if index not available
    Object.values(statSheet.mappedData).forEach((row) => {
      const rowCostumeId = parseInt(String(row['costume_id']))
      if (rowCostumeId === costumeId) {
        const type = String(row['stat_type']).toUpperCase()
        const valueRaw = parseInt(String(row['stat'] || '0'))
        const value = isNaN(valueRaw) ? 0 : valueRaw

        if (type === 'ATK') stats['aTK'] = (stats['aTK'] || 0) + value
        else if (type === 'DEF') stats['dEF'] = (stats['dEF'] || 0) + value
        else if (type === 'HIT') stats['hIT'] = (stats['hIT'] || 0) + value
        else if (type === 'HP') stats['hP'] = (stats['hP'] || 0) + value
        else if (type === 'CRI') stats['cRI'] = (stats['cRI'] || 0) + value
        else if (type === 'SPD') stats['sPD'] = (stats['sPD'] || 0) + value
      }
    })
  }

  return stats as unknown as StatsMap
}

/**
 * Resolves world information including unlock status.
 */
export function resolveWorldInfo(
  stageId: number,
  sheets: Record<string, CsvSheetData>,
  unlockedWorldIds: number[] = [],
  locale: string = 'en',
): { worldId: number; isUnlocked: boolean; name: string } {
  const { SHEETS, STAGE, LANG } = CHARACTER_LOGIC_CONSTANTS
  const worldSheet = sheets[SHEETS.WORLD]
  const isVietnamese = locale.toLowerCase().startsWith('vi')
  const langCol = (isVietnamese ? LANG.VI : LANG.EN) as 'Vietnam' | 'English'

  if (stageId <= STAGE.WORLD_1_END) {
    return { worldId: 1, isUnlocked: true, name: isVietnamese ? 'Thế giới 1' : 'World 1' }
  }

  let foundWorldId: number = STAGE.DEFAULT_WORLD_ID
  let worldName = 'Unknown World'

  if (worldSheet) {
    for (const [id, config] of Object.entries(worldSheet.mappedData)) {
      const begin = parseInt(String(config['stage_begin'] || config['stageBegin'] || '0'))
      const end = parseInt(String(config['stage_end'] || config['stageEnd'] || '0'))

      if (stageId >= begin && stageId <= end) {
        foundWorldId = parseInt(id)
        worldName = String(
          config[langCol] ||
            config[LANG.EN] ||
            config['English'] ||
            config['Name'] ||
            config['_name'] ||
            `World ${id}`,
        )
        break
      }
    }
  }

  return {
    worldId: foundWorldId,
    isUnlocked: unlockedWorldIds.includes(foundWorldId),
    name: worldName,
  }
}

/**
 * Resolves patrol reward information based on block last claim and character level.
 */
export function resolvePatrolRewardInfo(
  blockLastClaim: number,
  level: number,
  blockNow: number,
  sheets: Record<string, CsvSheetData>,
): PatrolRewardInfo {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const patrolSheet = sheets[SHEETS.PATROL_REWARD]

  let infoPatrolReward: Record<string, unknown> | null = null
  let isCanClaim = false
  let diffBlock = 0
  let interval = 5400

  if (patrolSheet) {
    const rewards = Object.values(patrolSheet.mappedData).map((row) => ({
      ...row,
      start: parseInt(String(row['start'] || '0')),
      end: parseInt(String(row['end'] || '0')),
      min_level: parseInt(String(row['min_level'] || '0')),
      max_level:
        row['max_level'] === '' || row['max_level'] === null || row['max_level'] === undefined
          ? 999
          : parseInt(String(row['max_level'])),
      interval: parseInt(String(row['interval'] || '5400')),
    }))

    type PatrolRewardRow = (typeof rewards)[number]

    const foundReward = rewards
      .filter(
        ({ start, min_level, max_level }) =>
          level >= min_level && level <= max_level && blockNow > start,
      )
      .reduce((acc: PatrolRewardRow | null, curr: PatrolRewardRow) => {
        if (!acc || curr.start < acc.start) {
          return curr
        }
        return acc
      }, null)

    if (foundReward) {
      infoPatrolReward = foundReward as unknown as Record<string, unknown>
      interval = foundReward.interval
    }
  }

  diffBlock = blockNow - blockLastClaim
  isCanClaim = diffBlock >= interval

  return {
    blockLastClaim,
    infoPatrolReward,
    isCanClaim,
    diffBlock,
    interval,
  }
}

/**
 * Processes raw season pass data to extract the latest pass per type.
 */
export function processSeasonPassData(data: unknown[] | null | undefined): SeasonPassInfo {
  if (!Array.isArray(data)) return {}

  const latestPasses: SeasonPassInfo = {}
  const currentTime = new Date()

  for (const item of data) {
    const pass = item as Record<string, unknown> & {
      season_pass?: { pass_type: string | number; season_index: number }
      level?: number
      last_normal_claim?: number
      last_premium_claim?: number
      claim_limit_timestamp?: string
    }
    if (!pass?.season_pass || typeof pass.season_pass.pass_type === 'undefined') continue
    const passType = String(pass.season_pass.pass_type)
    const seasonIndex = pass.season_pass.season_index ?? -1

    const currentLatest = latestPasses[passType] as
      | (Record<string, unknown> & { season_pass?: { season_index: number } })
      | undefined
    if (!currentLatest || seasonIndex > (currentLatest.season_pass?.season_index ?? -1)) {
      const level = typeof pass.level === 'number' ? pass.level : 0
      const lastNormalClaim =
        typeof pass.last_normal_claim === 'number' ? pass.last_normal_claim : -1
      const lastPremiumClaim =
        typeof pass.last_premium_claim === 'number' ? pass.last_premium_claim : -1

      const isCanClaimNormal = level > lastNormalClaim
      const isCanClaimPremium = level > lastPremiumClaim

      let isInTimeClaim = true
      if (pass.claim_limit_timestamp) {
        const claimLimitDate = new Date(pass.claim_limit_timestamp)
        isInTimeClaim =
          !isNaN(claimLimitDate.getTime()) && currentTime.getTime() < claimLimitDate.getTime()
      }

      latestPasses[passType] = {
        ...pass,
        level,
        exp: (pass.exp as number) || 0,
        is_premium: !!pass.is_premium,
        last_normal_claim: lastNormalClaim,
        last_premium_claim: lastPremiumClaim,
        isCanClaim: {
          isCanClaimNormal,
          isCanClaimPremium,
        },
        isInTimeClaim,
        season_pass: pass.season_pass as SeasonPassStatus['season_pass'],
      } as SeasonPassStatus
    }
  }

  return latestPasses
}

/**
 * Resolves event dungeon information including round and turn calculations.
 */
export function resolveEventDungeonInfo(
  data: Record<string, unknown> | null | undefined,
  sheets: Record<string, CsvSheetData>,
  blockNow: number,
): EventDungeonInfo {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const eventSheet = sheets[SHEETS.EVENT_SCHEDULE]

  const baseInfo: EventDungeonInfo = {
    roundReset: typeof data?.roundReset === 'number' ? data.roundReset : 1,
    ticket: typeof data?.ticket === 'number' ? data.ticket : 0,
    ticketBuyed: typeof data?.ticketBuyed === 'number' ? data.ticketBuyed : 0,
    stageIdUnlocked: typeof data?.stageIdUnlocked === 'number' ? data.stageIdUnlocked : 0,
    currentTurn: 1,
    totalTurns: 1,
    currentRoundStartBlock: 0,
    currentRoundEndBlock: 0,
  }

  if (!eventSheet) return baseInfo

  // Find ongoing event
  const ongoingEvent = Object.values(eventSheet.mappedData).find((event) => {
    const start = parseInt(String(event['start_block_index'] || '0'))
    const end = parseInt(String(event['dungeon_end_block_index'] || '0'))
    return blockNow >= start && blockNow <= end
  })

  if (ongoingEvent) {
    const start = parseInt(String(ongoingEvent['start_block_index'] || '0'))
    const end = parseInt(String(ongoingEvent['dungeon_end_block_index'] || '0'))
    const interval = parseInt(
      String(ongoingEvent['dungeon_tickets_reset_interval_block_range'] || '0'),
    )

    const duration = end - start
    if (interval > 0 && duration > 0) {
      baseInfo.totalTurns = Math.ceil(duration / interval)
      const elapsed = blockNow - start
      if (elapsed >= 0) {
        const turnIndex = Math.floor(elapsed / interval)
        baseInfo.currentTurn = Math.min(turnIndex + 1, baseInfo.totalTurns)
        baseInfo.currentRoundStartBlock = start + turnIndex * interval
        // End block = Start + interval - 1 (Inclusive)
        baseInfo.currentRoundEndBlock = Math.min(
          baseInfo.currentRoundStartBlock + interval - 1,
          end,
        )
      } else {
        baseInfo.currentTurn = 1
        baseInfo.currentRoundStartBlock = start
        baseInfo.currentRoundEndBlock = Math.min(start + interval - 1, end)
      }
    } else {
      baseInfo.totalTurns = 1
      baseInfo.currentTurn = 1
      baseInfo.currentRoundStartBlock = start
      baseInfo.currentRoundEndBlock = end
    }
  }

  return baseInfo
}

/**
 * Resolves World Boss information including round and turn calculations.
 */
export function resolveWorldBossInfo(
  sheets: Record<string, CsvSheetData>,
  blockNow: number,
): WorldBossInfo {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const wbSheet = sheets[SHEETS.WORLD_BOSS_LIST]
  const configSheet = sheets[SHEETS.GAME_CONFIG]

  const interval = parseInt(
    String(configSheet?.mappedData?.['daily_worldboss_interval']?.['value'] || '28800'),
  )

  const ongoingBosses = wbSheet
    ? Object.values(wbSheet.mappedData)
        .filter((boss) => {
          const start = parseInt(String(boss['started_block_index'] || '0'))
          const end = parseInt(String(boss['ended_block_index'] || '0'))
          return blockNow >= start && blockNow <= end
        })
        .map((boss) => parseInt(String(boss['id'])))
    : []

  const result: WorldBossInfo = {
    hasOngoingEvent: ongoingBosses.length > 0,
    listIdOngoingWorldBoss: ongoingBosses,
    totalTurns: 0,
    currentTurn: 0,
    tickets_reset_interval_block_range: interval,
    currentRoundStartBlock: 0,
    currentRoundEndBlock: 0,
  }

  if (result.hasOngoingEvent && wbSheet) {
    const boss = wbSheet.mappedData[String(ongoingBosses[0])]
    if (!boss) return result
    const start = parseInt(String(boss['started_block_index'] || '0'))
    const end = parseInt(String(boss['ended_block_index'] || '0'))

    const duration = end - start
    if (interval > 0 && duration > 0) {
      result.totalTurns = Math.ceil(duration / interval)
      const elapsed = blockNow - start
      if (elapsed >= 0) {
        const turnIndex = Math.floor(elapsed / interval)
        result.currentTurn = Math.min(turnIndex + 1, result.totalTurns)
        result.currentRoundStartBlock = start + turnIndex * interval
        // End block = Start + interval - 1 (Inclusive)
        result.currentRoundEndBlock = Math.min(result.currentRoundStartBlock + interval - 1, end)
      } else {
        result.currentTurn = 1
        result.currentRoundStartBlock = start
        result.currentRoundEndBlock = Math.min(start + interval - 1, end)
      }
    } else {
      result.totalTurns = 1
      result.currentTurn = 1
      result.currentRoundStartBlock = start
      result.currentRoundEndBlock = end
    }
  }

  return result
}

/**
 * Resolves all claimable gifts.
 */
export function resolveGiftInfo(
  sheets: Record<string, CsvSheetData>,
  blockNow: number,
  locale: string = 'en',
): GiftInfo[] {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const giftSheet = sheets[SHEETS.CLAIMABLE_GIFTS]
  if (!giftSheet) return []

  return Object.values(giftSheet.mappedData)
    .map((gift) => {
      const start = parseInt(String(gift['started_block_index'] || '0'))
      const end = parseInt(String(gift['ended_block_index'] || '0'))
      const id = parseInt(String(gift['id']))

      const giftItems: [number, number, boolean][] = []
      for (let i = 1; i <= 5; i++) {
        const itemId = parseInt(String(gift[`item_${i}_id`]))
        if (itemId) {
          const quantity = parseInt(String(gift[`item_${i}_quantity`] || '0'))
          const tradable = String(gift[`item_${i}_tradable`]).toUpperCase() === 'TRUE'
          giftItems.push([itemId, quantity, tradable])
        }
      }

      return {
        id,
        isCanClaim: blockNow >= start && blockNow <= end,
        giftItems,
        name: resolveNameFromCsv(id, sheets, locale, 'GIFT_NAME_'), // Assuming GIFT_NAME_ prefix or similar
        imageUrl:
          giftItems.length > 0 && giftItems[0]
            ? resolveAssetUrl({ portraitId: giftItems[0][0] })
            : '',
      }
    })
    .filter((g) => g.isCanClaim)
}

/**
 * Resolves all summon groups and their items.
 */
export function resolveSummonInfo(
  sheets: Record<string, CsvSheetData>,
  locale: string = 'en',
): SummonInfo[] {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS
  const summonSheet = sheets[SHEETS.SUMMON]
  const recipeSheet = sheets[SHEETS.EQUIPMENT_RECIPE]
  const runeSheet = sheets[SHEETS.RUNE]

  if (!summonSheet) return []

  return Object.values(summonSheet.mappedData).map((summon) => {
    const groupID = parseInt(String(summon['groupID']))
    const itemSummons: [number, number, string | number, number, string?][] = []

    Object.keys(summon).forEach((key) => {
      if (key.startsWith('recipe') && key.endsWith('ID')) {
        const id = parseInt(String(summon[key]))
        if (id) {
          const ratioKey = key.replace('ID', 'ratio')
          const ratio = parseFloat(String(summon[ratioKey] || '0'))

          const recipe = recipeSheet?.mappedData?.[String(id)]
          const resultEquipmentId = recipe ? parseInt(String(recipe['result_equipment_id'])) : null
          const rune = runeSheet?.mappedData?.[String(id)]
          const tickerRune = rune ? String(rune['ticker']) : 'RUNE_ADVENTURER'

          const isEquipment = resultEquipmentId ? 1 : 2
          const img = resultEquipmentId || tickerRune
          const imageUrl =
            isEquipment === 1
              ? resolveAssetUrl({ portraitId: img })
              : resolveAssetUrl({ tickerRune: String(img) })

          const summonEntry: [number, number, string | number, number, string?] = [
            id,
            ratio,
            img,
            isEquipment,
            imageUrl,
          ]
          itemSummons.push(summonEntry)
        }
      }
    })

    return {
      groupID,
      itemSummons,
      name: resolveNameFromCsv(groupID, sheets, locale, 'SUMMON_GROUP_NAME_'),
    }
  })
}
