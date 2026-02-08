import { describe, it, expect, beforeEach } from 'vitest'
import {
  resolveNameFromCsv,
  resolveCostumeStats,
  resolveLevelRequirement,
  resolveRuneInfo,
  clearNameCache,
} from '../../../logic/mapping'
import { aggregateAvatarData } from '../../../logic/character'
import type { CsvSheetData } from '../../../types/csv'
import type { RawAvatarDetail } from '../../../types/character'

describe('CSV Data Enrichment', () => {
  beforeEach(() => {
    clearNameCache()
  })

  const mockSheets: Record<string, CsvSheetData> = {
    ItemNameSheet: {
      name: 'ItemNameSheet',
      headers: ['Key', 'English', 'Vietnam'],
      rows: [],
      keyMain: 'Key',
      mappedData: {
        ITEM_NAME_101000: { English: 'Sword', Vietnam: 'Kiếm' },
        ITEM_NAME_201000: { English: 'Armor', Vietnam: 'Giáp' },
        ITEM_NAME_401000: { English: 'Costume', Vietnam: 'Trang phục' },
      },
    },
    CostumeStatSheet: {
      name: 'CostumeStatSheet',
      headers: ['costume_id', 'stat_type', 'stat'],
      rows: [],
      keyMain: 'costume_id',
      mappedData: {
        '401000_0': { costume_id: 401000, stat_type: 'ATK', stat: 100 },
        '401000_1': { costume_id: 401000, stat_type: 'HP', stat: 500 },
      },
      secondaryIndices: {
        costume_id: {
          '401000': [
            { costume_id: 401000, stat_type: 'ATK', stat: 100 },
            { costume_id: 401000, stat_type: 'HP', stat: 500 },
          ],
        },
      },
    },
    ItemRequirementSheet: {
      name: 'ItemRequirementSheet',
      headers: ['item_id', 'level'],
      rows: [],
      keyMain: 'item_id',
      mappedData: {
        '101000': { item_id: 101000, level: 10 },
        '201000': { item_id: 201000, level: 20 },
        '401000': { item_id: 401000, level: 5 },
      },
    },
    RuneSheet: {
      name: 'RuneSheet',
      headers: ['c', '_name', 'ticker'],
      rows: [],
      keyMain: 'c',
      mappedData: {
        '1': { c: 1, _name: 'Power Rune', ticker: 'RUNE_POWER' },
      },
    },
    RuneListSheet: {
      name: 'RuneListSheet',
      headers: ['id', 'rune_type', 'required_level'],
      rows: [],
      keyMain: 'id',
      mappedData: {
        '1': { id: 1, rune_type: 2, required_level: 15 },
      },
    },
    GameConfigSheet: {
      name: 'GameConfigSheet',
      headers: ['key', 'value'],
      rows: [],
      keyMain: 'key',
      mappedData: {
        daily_reward_interval: { key: 'daily_reward_interval', value: 7200 },
      },
    },
    WorldSheet: {
      name: 'WorldSheet',
      headers: ['id', 'stage_begin', 'stage_end'],
      rows: [],
      keyMain: 'id',
      mappedData: {
        '1': { id: 1, stage_begin: 1, stage_end: 50 },
      },
    },
  }

  it('should resolve item names correctly with reactivity and fallback', () => {
    // English locale
    expect(resolveNameFromCsv(101000, mockSheets, 'en')).toBe('Sword')
    // Vietnamese locale
    expect(resolveNameFromCsv(101000, mockSheets, 'vi')).toBe('Kiếm')
    // Support flexible locale strings (vi-VN)
    expect(resolveNameFromCsv(101000, mockSheets, 'vi-VN')).toBe('Kiếm')
    // Fallback to English if Vietnamese not available (simulated)
    clearNameCache() // Clear cache before fallback test to avoid collision
    const sheetsWithNoVi: Record<string, CsvSheetData> = {
      ...mockSheets,
      ItemNameSheet: {
        ...mockSheets.ItemNameSheet,
        mappedData: {
          ITEM_NAME_101000: { English: 'Sword' }, // No Vietnam key
        },
      } as CsvSheetData,
    }
    expect(resolveNameFromCsv(101000, sheetsWithNoVi, 'vi')).toBe('Sword')
    // Fallback to ID if no name found
    expect(resolveNameFromCsv(999, mockSheets)).toBe('ID: 999')
  })

  it('should resolve costume stats correctly', () => {
    const stats = resolveCostumeStats(401000, mockSheets)
    expect(stats.aTK).toBe(100)
    expect(stats.hP).toBe(500)
    expect(stats.dEF).toBe(0)
  })

  it('should resolve level requirements correctly', () => {
    expect(resolveLevelRequirement(101000, mockSheets)).toBe(10)
    expect(resolveLevelRequirement(999, mockSheets)).toBe(888)
  })

  it('should resolve rune info correctly', () => {
    const rune = resolveRuneInfo(1, mockSheets)
    expect(rune.name).toBe('Power Rune')
    expect(rune.runeType).toBe('SKILL')
    expect(rune.requiredLevel).toBe(15)
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing sheets gracefully', () => {
      const emptySheets = {}
      expect(resolveNameFromCsv(101000, emptySheets)).toBe('ID: 101000')
      expect(resolveCostumeStats(401000, emptySheets)).toEqual({
        aTK: 0,
        dEF: 0,
        hIT: 0,
        hP: 0,
        cRI: 0,
        sPD: 0,
      })
      expect(resolveLevelRequirement(101000, emptySheets)).toBe(888)
      const rune = resolveRuneInfo(1, emptySheets)
      // Now returns ID: 1 because resolveNameFromCsv is used
      expect(rune.name).toBe('ID: 1')
      expect(rune.requiredLevel).toBe(888)
    })

    it('should handle malformed data in CSV rows', () => {
      const malformedSheets: Record<string, CsvSheetData> = {
        ItemRequirementSheet: {
          name: 'ItemRequirementSheet',
          headers: ['item_id', 'level'],
          rows: [],
          keyMain: 'item_id',
          mappedData: {
            '101000': { item_id: 101000, level: 'abc' }, // Malformed level
          },
        },
        CostumeStatSheet: {
          name: 'CostumeStatSheet',
          headers: ['costume_id', 'stat_type', 'stat'],
          rows: [],
          keyMain: 'costume_id',
          mappedData: {
            '401000_0': { costume_id: 401000, stat_type: 'ATK', stat: 'not-a-number' },
          },
        },
      }
      expect(resolveLevelRequirement(101000, malformedSheets)).toBe(888)
      const stats = resolveCostumeStats(401000, malformedSheets)
      expect(stats.aTK).toBe(0)
    })

    it('should handle equipment ID fallback (truncated IDs)', () => {
      const equipmentSheets: Record<string, CsvSheetData> = {
        ItemNameSheet: {
          name: 'ItemNameSheet',
          headers: ['Key', 'English'],
          rows: [],
          keyMain: 'Key',
          mappedData: {
            ITEM_NAME_101000: { English: 'Base Sword' },
          },
        },
      }
      // 10100001 is a specific version of 101000
      expect(resolveNameFromCsv(10100001, equipmentSheets)).toBe('Base Sword')
    })
  })

  it('should fully hydrate avatar data with enriched inventory', () => {
    const rawData: RawAvatarDetail = {
      headless: {
        stateQuery: {
          agent: { gold: '100', crystal: '50' },
          unlockedWorldIds: [1],
          avatar: {
            address: '0x123',
            name: 'Hero',
            level: 10,
            exp: 1000,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [[1, 1]], count: 1 },
            runes: [{ level: 1, runeId: 1 }],
            inventory: {
              equipments: [
                {
                  id: 'guid1',
                  itemId: 101000,
                  equipped: true,
                  level: 1,
                  statsMap: { hP: 10, aTK: 5, dEF: 2, sPD: 1, hIT: 1, cRI: 0 },
                  skills: [],
                  buffSkills: [],
                },
              ],
              costumes: [
                {
                  id: 'guid2',
                  itemId: 401000,
                  equipped: true,
                },
              ],
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: [],
          } as unknown as RawAvatarDetail['headless']['stateQuery']['avatar'],
          stakeState: { deposit: '0' },
        },
      },
      mimir: {
        actionPoint: 120,
        dailyRewardReceivedBlockIndex: 1000,
        isHasCraftOneTime: { items: [] },
        isClaimPatrolRewardOneTime: { items: [] },
        myAdventureCpRanking: {
          rank: 1,
          userDocument: {
            avatar: { portraitId: 10200000 },
            cp: 1000,
          },
        },
      } as unknown as RawAvatarDetail['mimir'],
      rest: {},
      seasonPass: null,
      timestamp: 2000,
    }

    const avatarData = aggregateAvatarData(rawData, mockSheets)

    // Check Equipment
    const eq = avatarData.inventory.equipments[0]
    expect(eq?.name).toBe('Sword')
    expect(eq?.levelReq).toBe(10)
    expect(eq?.index).toBe(0)

    // Check Costume
    const cos = avatarData.inventory.costumes[0]
    expect(cos?.index).toBe(0)
    expect(cos?.name).toBe('Costume')
    expect(cos?.levelReq).toBe(5)
    expect(cos?.statsMap?.aTK).toBe(100)
    expect(cos?.statsMap?.hP).toBe(500)
    expect(cos?.CP).toBeGreaterThan(0)

    // Check Runes
    expect(avatarData.runes[0]?.name).toBe('Power Rune')
    expect(avatarData.runes[0]?.index).toBe(0)
  })

  it('should process materials with specialized AP Potion handling (tradable vs non-tradable)', () => {
    const rawDataWithMaterials: RawAvatarDetail = {
      headless: {
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          unlockedWorldIds: [],
          avatar: {
            address: '0x123',
            name: 'Hero',
            level: 1,
            exp: 0,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              // i500000 is the alias for AP Potion
              i500000: [
                { count: 5, tradableId: 'T1' }, // Tradable
                { count: 10, tradableId: null }, // Non-tradable
              ],
              i600201: [{ count: 100, tradableId: null }],
              materials: [],
              consumables: [],
              equipments: [],
              costumes: [],
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: [],
          } as unknown as RawAvatarDetail['headless']['stateQuery']['avatar'],
          stakeState: { deposit: '0' },
        },
      },
      mimir: {
        actionPoint: 120,
        dailyRewardReceivedBlockIndex: 1000,
      } as unknown as RawAvatarDetail['mimir'],
      rest: {},
      seasonPass: null,
      timestamp: 2000,
    }

    const avatarData = aggregateAvatarData(rawDataWithMaterials, mockSheets)
    const materialList = avatarData.materialList

    // AP Potion Non-tradable (ID: 500000)
    expect(materialList['500000']).toBe(10)
    // AP Potion Tradable (ID: 14000000 + 500000 = 14500000)
    expect(materialList['14500000']).toBe(5)
    // Other item
    expect(materialList['600201']).toBe(100)
  })

  it('should enrich World Boss and Event Dungeon info from REST API dynamic keys', () => {
    const rawDataWithRest: RawAvatarDetail = {
      headless: {
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          unlockedWorldIds: [],
          avatar: {
            address: '0x123',
            name: 'Hero',
            level: 1,
            exp: 0,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipments: [],
              costumes: [],
              materials: [],
              consumables: [],
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: [],
          } as unknown as RawAvatarDetail['headless']['stateQuery']['avatar'],
          stakeState: { deposit: '0' },
        },
      },
      mimir: {
        actionPoint: 120,
        dailyRewardReceivedBlockIndex: 1000,
      } as unknown as RawAvatarDetail['mimir'],
      rest: {
        other_lookupWorldBossInfoTotal_raid1: { bossId: 'raid1', hp: 1000000 },
        lookupWorldBossInfoAvatar_raid1: { bossId: 'raid1', myDamage: 5000 },
        lookupEventDungeonInfo_dungeon1: { dungeonId: 'dungeon1', ticket: 3 },
      },
      seasonPass: null,
      timestamp: 2000,
    }

    const avatarData = aggregateAvatarData(rawDataWithRest, mockSheets)

    expect(avatarData.worldBossInfoTotal).toEqual({ bossId: 'raid1', hp: 1000000 })
    expect(avatarData.worldBossInfoAvatar).toEqual({ bossId: 'raid1', myDamage: 5000 })
    expect(avatarData.eventDungeonInfo.ticket).toBe(3)
  })

  it('should handle season pass data in both array and object formats', () => {
    const mockSeasonPassArr = [
      {
        season_pass: { pass_type: 'Pass1', season_index: 1 },
        level: 10,
        last_normal_claim: 5,
      },
    ]

    const rawDataArr: RawAvatarDetail = {
      headless: {
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          unlockedWorldIds: [],
          avatar: {
            address: '0x123',
            inventory: { equipments: [], costumes: [], materials: [] },
            stageMap: { pairs: [] },
          } as unknown as RawAvatarDetail['headless']['stateQuery']['avatar'],
          stakeState: { deposit: '0' },
        },
      },
      mimir: {} as unknown as RawAvatarDetail['mimir'],
      rest: {},
      seasonPass: mockSeasonPassArr,
      timestamp: 2000,
    }

    const avatarDataArr = aggregateAvatarData(rawDataArr, mockSheets)
    expect(avatarDataArr.seasonPass?.['Pass1']?.level).toBe(10)

    const rawDataObj: RawAvatarDetail = {
      ...rawDataArr,
      seasonPass: mockSeasonPassArr[0] as unknown as RawAvatarDetail['seasonPass'],
    }

    const avatarDataObj = aggregateAvatarData(rawDataObj, mockSheets)
    expect(avatarDataObj.seasonPass?.['Pass1']?.level).toBe(10)
  })
})
