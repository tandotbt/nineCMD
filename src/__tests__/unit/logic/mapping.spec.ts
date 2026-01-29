import { describe, it, expect } from 'vitest'
import {
  resolveNameFromCsv,
  resolveLevelRequirement,
  resolveRuneInfo,
  resolveCostumeStats,
  resolveWorldInfo,
  resolveWorldBossInfo,
  resolvePatrolRewardInfo,
  processSeasonPassData,
  resolveEventDungeonInfo,
  resolveGiftInfo,
  resolveSummonInfo,
} from '@/logic/mapping'
import { extractExcelId } from '@/logic/character'
import { CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import type { CsvSheetData } from '@/types/csv'

describe('Mapping Logic Modules', () => {
  const { SHEETS } = CHARACTER_LOGIC_CONSTANTS

  const mockSheets: Record<string, CsvSheetData> = {
    [SHEETS.ITEM_NAME]: {
      name: 'ItemNameSheet',
      headers: ['Key', 'English', 'Vietnam'],
      rows: [],
      mappedData: {
        ITEM_NAME_101: { English: 'Sword', Vietnam: 'Kiếm' },
        ITEM_NAME_500000: { English: 'AP Potion', Vietnam: 'Bình AP' },
        ITEM_NAME_1: { English: 'Power Rune', Vietnam: 'Rune Sức Mạnh' },
      },
      keyMain: 'Key',
    },
    [SHEETS.ITEM_REQUIREMENT]: {
      name: 'ItemRequirementSheet',
      headers: ['item_id', 'level'],
      rows: [],
      mappedData: {
        '101': { level: 10 },
      },
      keyMain: 'item_id',
    },
    [SHEETS.RUNE]: {
      name: 'RuneSheet',
      headers: ['id', '_name', 'ticker'],
      rows: [],
      mappedData: {
        '1': { _name: 'Power Rune', ticker: 'POWER' },
      },
      keyMain: 'id',
    },
    [SHEETS.RUNE_LIST]: {
      name: 'RuneListSheet',
      headers: ['id', 'rune_type', 'required_level'],
      rows: [],
      mappedData: {
        '1': { rune_type: 2, required_level: 5 },
      },
      keyMain: 'id',
    },
    [SHEETS.WORLD]: {
      name: 'WorldSheet',
      headers: ['id', 'stage_begin', 'stage_end', 'Name'],
      rows: [],
      mappedData: {
        '2': { stage_begin: 51, stage_end: 100, Name: 'World 2' },
      },
      keyMain: 'id',
    },
    [SHEETS.GAME_CONFIG]: {
      name: 'GameConfigSheet',
      headers: ['key', 'value'],
      rows: [],
      mappedData: {
        daily_worldboss_interval: { value: 100 },
      },
      keyMain: 'key',
    },
    [SHEETS.WORLD_BOSS_LIST]: {
      name: 'WorldBossListSheet',
      headers: ['id', 'started_block_index', 'ended_block_index'],
      rows: [],
      mappedData: {
        '1': { id: 1, started_block_index: 1000, ended_block_index: 2000 },
      },
      keyMain: 'id',
    },
    [SHEETS.COSTUME_STAT]: {
      name: 'CostumeStatSheet',
      headers: ['costume_id', 'stat_type', 'stat'],
      rows: [],
      mappedData: {
        '1001_ATK': { costume_id: 1001, stat_type: 'ATK', stat: 100 },
        '1001_HP': { costume_id: 1001, stat_type: 'HP', stat: 500 },
      },
      secondaryIndices: {
        costume_id: {
          '1001': [
            { costume_id: 1001, stat_type: 'ATK', stat: 100 },
            { costume_id: 1001, stat_type: 'HP', stat: 500 },
          ],
        },
      },
      keyMain: 'costume_id',
    },
    [SHEETS.PATROL_REWARD]: {
      name: 'PatrolRewardSheet',
      headers: ['id', 'start', 'end', 'min_level', 'max_level', 'interval'],
      rows: [],
      mappedData: {
        '1': { id: 1, start: 0, end: 10000, min_level: 1, max_level: 100, interval: 5400 },
      },
      keyMain: 'id',
    },
    [SHEETS.EVENT_SCHEDULE]: {
      name: 'EventScheduleSheet',
      headers: [
        'id',
        'start_block_index',
        'dungeon_end_block_index',
        'dungeon_tickets_reset_interval_block_range',
      ],
      rows: [],
      mappedData: {
        '1': {
          id: 1,
          start_block_index: 1000,
          dungeon_end_block_index: 2000,
          dungeon_tickets_reset_interval_block_range: 200,
        },
      },
      keyMain: 'id',
    },
    [SHEETS.CLAIMABLE_GIFTS]: {
      name: 'ClaimableGiftsSheet',
      headers: ['id', 'started_block_index', 'ended_block_index', 'item_1_id', 'item_1_quantity'],
      rows: [],
      mappedData: {
        '10': {
          id: 10,
          started_block_index: 1000,
          ended_block_index: 1500,
          item_1_id: 500000,
          item_1_quantity: 1,
        },
      },
      keyMain: 'id',
    },
    [SHEETS.SUMMON]: {
      name: 'SummonSheet',
      headers: ['groupID', 'recipe1ID', 'recipe1ratio'],
      rows: [],
      mappedData: {
        '1': { groupID: 1, recipe1ID: 101, recipe1ratio: 0.5 },
      },
      keyMain: 'groupID',
    },
    [SHEETS.EQUIPMENT_RECIPE]: {
      name: 'EquipmentRecipeSheet',
      headers: ['id', 'result_equipment_id'],
      rows: [],
      mappedData: {
        '101': { id: 101, result_equipment_id: 100001 },
      },
      keyMain: 'id',
    },
  }

  describe('resolveNameFromCsv', () => {
    it('resolves item names correctly', () => {
      expect(resolveNameFromCsv(101, mockSheets)).toBe('Sword')
      expect(resolveNameFromCsv(101, mockSheets, 'vi')).toBe('Kiếm')
      expect(resolveNameFromCsv(999, mockSheets)).toBe('ID: 999')
    })

    it('handles fallback for equipment with sub-ids', () => {
      // 10000105 -> 100001
      const itemNameSheet = mockSheets[SHEETS.ITEM_NAME]
      if (itemNameSheet && itemNameSheet.mappedData) {
        itemNameSheet.mappedData['ITEM_NAME_100001'] = { English: 'God Sword' }
      }
      expect(resolveNameFromCsv(10000105, mockSheets)).toBe('God Sword')
    })
  })

  describe('resolveLevelRequirement', () => {
    it('resolves level requirements', () => {
      expect(resolveLevelRequirement(101, mockSheets)).toBe(10)
    })

    it('returns 888 if not found (matching logic in mapping.ts)', () => {
      expect(resolveLevelRequirement(999, mockSheets)).toBe(888)
    })
  })

  describe('resolveRuneInfo', () => {
    it('resolves rune info correctly', () => {
      const info = resolveRuneInfo(1, mockSheets)
      expect(info.name).toBe('Power Rune')
      expect(info.runeType).toBe('SKILL')
      expect(info.requiredLevel).toBe(5)
      expect(info.tickerRune).toBe('POWER')
    })

    it('handles missing rune data with fallbacks', () => {
      const info = resolveRuneInfo(999, mockSheets)
      // resolveNameFromCsv returns `ID: ${id}` if not found,
      // and resolveRuneInfo uses that if name is not in RuneSheet.
      expect(info.name).toBe('ID: 999')
      expect(info.requiredLevel).toBe(8888)
    })
  })

  describe('resolveCostumeStats', () => {
    it('resolves costume stats using secondary index', () => {
      const stats = resolveCostumeStats(1001, mockSheets)
      expect(stats.aTK).toBe(100)
      expect(stats.hP).toBe(500)
      expect(stats.dEF).toBe(0)
    })

    it('resolves costume stats using fallback when index missing', () => {
      const costumeStatSheet = mockSheets[SHEETS.COSTUME_STAT]
      const sheetsNoIndex: Record<string, CsvSheetData> = {
        ...mockSheets,
        [SHEETS.COSTUME_STAT]: {
          ...costumeStatSheet,
          secondaryIndices: undefined,
        } as CsvSheetData,
      }
      const stats = resolveCostumeStats(1001, sheetsNoIndex)
      expect(stats.aTK).toBe(100)
      expect(stats.hP).toBe(500)
    })
  })

  describe('resolveWorldInfo', () => {
    it('resolves world info', () => {
      const world1 = resolveWorldInfo(10, mockSheets)
      expect(world1.worldId).toBe(1)
      expect(world1.isUnlocked).toBe(true)

      const world2 = resolveWorldInfo(60, mockSheets, [2])
      expect(world2.worldId).toBe(2)
      expect(world2.isUnlocked).toBe(true)
    })
  })

  describe('resolvePatrolRewardInfo', () => {
    it('identifies claimable status correctly', () => {
      const blockNow = 6000
      const blockLastClaim = 0
      const level = 50
      const result = resolvePatrolRewardInfo(blockLastClaim, level, blockNow, mockSheets)

      expect(result.isCanClaim).toBe(true)
      expect(result.interval).toBe(5400)
    })

    it('identifies non-claimable status if interval not passed', () => {
      const result = resolvePatrolRewardInfo(0, 50, 1000, mockSheets)
      expect(result.isCanClaim).toBe(false)
    })
  })

  describe('processSeasonPassData', () => {
    it('processes raw season pass data and identifies claimable rewards', () => {
      const rawData = [
        {
          season_pass: { pass_type: 'Standard', season_index: 2 },
          level: 20,
          last_normal_claim: 15,
          last_premium_claim: 5,
        },
      ]
      const result = processSeasonPassData(rawData)
      expect(result['Standard']).toBeDefined()
      expect(result['Standard']?.isCanClaim.isCanClaimNormal).toBe(true)
      expect(result['Standard']?.isCanClaim.isCanClaimPremium).toBe(true)
    })
  })

  describe('resolveWorldBossInfo', () => {
    it('resolves World Boss rounds correctly', () => {
      const blockNow = 1050 // 50 blocks into a 100 block interval
      const info = resolveWorldBossInfo(mockSheets, blockNow)
      expect(info.hasOngoingEvent).toBe(true)
      expect(info.currentTurn).toBe(1)
      expect(info.currentRoundStartBlock).toBe(1000)
      expect(info.currentRoundEndBlock).toBe(1099)
    })

    it('calculates next turn correctly', () => {
      const blockNow = 1250 // elapsed = 250, interval = 100 => index 2 => turn 3
      const info = resolveWorldBossInfo(mockSheets, blockNow)
      expect(info.currentTurn).toBe(3)
      expect(info.currentRoundStartBlock).toBe(1200)
      expect(info.currentRoundEndBlock).toBe(1299)
    })
  })

  describe('resolveEventDungeonInfo', () => {
    it('resolves event dungeon info for ongoing event', () => {
      const blockNow = 1100 // Middle of first turn (1000-1199)
      const result = resolveEventDungeonInfo({}, mockSheets, blockNow)
      expect(result.currentTurn).toBe(1)
      expect(result.totalTurns).toBe(5) // (2000-1000)/200
      expect(result.currentRoundStartBlock).toBe(1000)
      expect(result.currentRoundEndBlock).toBe(1199)
    })

    it('handles boundary between turns', () => {
      const blockBoundary = 1200
      const result = resolveEventDungeonInfo({}, mockSheets, blockBoundary)
      expect(result.currentTurn).toBe(2)
      expect(result.currentRoundStartBlock).toBe(1200)
      expect(result.currentRoundEndBlock).toBe(1399)
    })

    it('handles blocks before event starts', () => {
      const result = resolveEventDungeonInfo({}, mockSheets, 500)
      expect(result.currentTurn).toBe(1)
      expect(result.currentRoundStartBlock).toBe(0) // Logic in code returns 0 if no event found
    })
  })

  describe('resolveGiftInfo', () => {
    it('filters and resolves claimable gifts', () => {
      const blockNow = 1200
      const result = resolveGiftInfo(mockSheets, blockNow)
      expect(result.length).toBe(1)
      expect(result[0]?.id).toBe(10)
      expect(result[0]?.isCanClaim).toBe(true)
      expect(result[0]?.giftItems).toContainEqual([500000, 1, false])
    })

    it('returns empty if no gifts are within block range', () => {
      const result = resolveGiftInfo(mockSheets, 2000)
      expect(result.length).toBe(0)
    })
  })

  describe('resolveSummonInfo', () => {
    it('resolves summon groups and equipment items', () => {
      const result = resolveSummonInfo(mockSheets)
      expect(result.length).toBe(1)
      expect(result[0]?.groupID).toBe(1)
      // [id, ratio, img, isEquipment]
      expect(result[0]?.itemSummons[0]).toEqual([101, 0.5, 100001, 1])
    })

    it('resolves summon items as runes if recipe not found', () => {
      const sheetsWithRune: Record<string, CsvSheetData> = {
        ...mockSheets,
        [SHEETS.SUMMON]: {
          ...mockSheets[SHEETS.SUMMON],
          mappedData: {
            '2': { groupID: 2, recipe1ID: 1, recipe1ratio: 0.1 },
          },
        } as CsvSheetData,
      }
      const result = resolveSummonInfo(sheetsWithRune)
      const group2 = result.find((g) => g.groupID === 2)
      expect(group2?.itemSummons[0]).toEqual([1, 0.1, 'POWER', 2])
    })
  })

  describe('extractExcelId', () => {
    it('extracts Excel ID correctly from various formats', () => {
      expect(extractExcelId({ id: 40100059, itemId: 'guid' })).toBe(40100059)
      expect(extractExcelId({ id: '40100059', itemId: 'guid' })).toBe(40100059)
      expect(extractExcelId({ id: 'guid', itemId: 40100059 })).toBe(40100059)
      expect(extractExcelId({ itemId_excel: 40100059 })).toBe(40100059)
    })
  })

  describe('Edge Cases & Error Handling', () => {
    it('handles empty or missing sheets gracefully', () => {
      const emptySheets: Record<string, CsvSheetData> = {}
      expect(resolveNameFromCsv(101, emptySheets)).toBe('ID: 101')
      expect(resolveLevelRequirement(101, emptySheets)).toBe(888)
      expect(resolveRuneInfo(1, emptySheets).name).toBe('ID: 1')
      expect(resolveCostumeStats(1, emptySheets).aTK).toBe(0)
      expect(resolveWorldInfo(1, emptySheets).worldId).toBe(1)
      expect(resolvePatrolRewardInfo(0, 1, 100, emptySheets).isCanClaim).toBe(false)
      expect(resolveEventDungeonInfo({}, emptySheets, 100).totalTurns).toBe(1)
      expect(resolveGiftInfo(emptySheets, 100)).toEqual([])
      expect(resolveSummonInfo(emptySheets)).toEqual([])
    })

    it('handles malformed CSV data (NaN values)', () => {
      const malformedSheets: Record<string, CsvSheetData> = {
        [SHEETS.ITEM_REQUIREMENT]: {
          name: 'Req',
          headers: ['item_id', 'level'],
          mappedData: { '101': { level: 'invalid' } },
          keyMain: 'item_id',
        } as unknown as CsvSheetData,
      }
      expect(resolveLevelRequirement(101, malformedSheets)).toBe(888)
    })

    it('handles null/undefined input data for processors', () => {
      expect(processSeasonPassData(null)).toEqual({})
      expect(processSeasonPassData(undefined)).toEqual({})
      expect(resolveEventDungeonInfo(null, {}, 100).roundReset).toBe(1)
    })
  })
})
