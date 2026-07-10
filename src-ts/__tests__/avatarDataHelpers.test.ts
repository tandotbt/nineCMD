import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateAPCost,
  getLatestStageClearedId,
  combatPotion,
  statAndSkillOption,
  getActiveWorldBossId,
  getActiveEventDungeon,
  processMaterials,
  dedupConsumables,
  processInventoryFromGraphQL,
  parseWorldBossSheet,
  parseEventScheduleSheet,
  buildCodeGetList
} from '../utilities/avatarDataHelpers'
import type { StatsMap, MaterialItem, ConsumableItem } from '../types/avatarData'
import { AVATAR_DATA_CODE_GET_STATIC, AP_POTION_ID, AP_POTION_TRADABLE_OFFSET, STAGE_SPECIAL_PREFIX } from '../utilities/constants'

// ============================================================
// calculateAPCost — uses COST_AP_BY_STAKE from constants
// ============================================================
describe('calculateAPCost', () => {
  it('returns 5 when stake < 5000 (below first tier)', () => {
    expect(calculateAPCost(0)).toBe(5)
    expect(calculateAPCost(4999)).toBe(5)
  })

  it('returns 4 when stake >= 5000 but < 500000', () => {
    expect(calculateAPCost(5000)).toBe(4)
    expect(calculateAPCost(100000)).toBe(4)
    expect(calculateAPCost(499999)).toBe(4)
  })

  it('returns 3 (MIN) when stake >= 500000', () => {
    expect(calculateAPCost(500000)).toBe(3)
    expect(calculateAPCost(1000000)).toBe(3)
    expect(calculateAPCost(999999999)).toBe(3)
  })

  it('handles string input', () => {
    expect(calculateAPCost('0')).toBe(5)
    expect(calculateAPCost('5000')).toBe(4)
    expect(calculateAPCost('500000')).toBe(3)
  })

  it('handles invalid string (NaN → 0)', () => {
    expect(calculateAPCost('')).toBe(5)
    expect(calculateAPCost('abc')).toBe(5)
  })

  it('handles negative stake as 0', () => {
    expect(calculateAPCost(-100)).toBe(5)
  })

  it('tier boundary: exactly 5000 → tier 2 (cost 4)', () => {
    expect(calculateAPCost(5000)).toBe(4)
  })

  it('tier boundary: 4999 → tier 1 (cost 5)', () => {
    expect(calculateAPCost(4999)).toBe(5)
  })
})

// ============================================================
// getLatestStageClearedId
// ============================================================
describe('getLatestStageClearedId', () => {
  it('returns 0 for empty pairs', () => {
    expect(getLatestStageClearedId({ pairs: [] })).toBe(0)
  })

  it('returns highest normal stage ID', () => {
    const stageMap = {
      pairs: [
        [1, 1],
        [5, 1],
        [10, 2],
        [3, 1]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(10)
  })

  it('handles string stage IDs', () => {
    const stageMap = {
      pairs: [
        ['1', 1],
        ['15', 2],
        ['8', 1]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(15)
  })

  it('stage ID = 0 is valid (not special)', () => {
    const stageMap = {
      pairs: [
        [0, 1],
        [5, 1]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(5)
  })

  it('single stage', () => {
    const stageMap = { pairs: [[42, 1]] as Array<[number | string, number | string]> }
    expect(getLatestStageClearedId(stageMap)).toBe(42)
  })

  it('all same stage IDs', () => {
    const stageMap = {
      pairs: [[5, 1], [5, 2], [5, 3]] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(5)
  })
})

// ============================================================
// combatPotion (CP calculation)
// ============================================================
describe('combatPotion', () => {
  const zeroStats: StatsMap = { hP: 0, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }

  it('returns 0 for all zero stats without skill', () => {
    expect(combatPotion(zeroStats, false)).toBe(0)
  })

  it('returns 0 for all zero stats with skill', () => {
    expect(combatPotion(zeroStats, true)).toBe(0)
  })

  it('calculates CP correctly', () => {
    const stats: StatsMap = { hP: 100, aTK: 10, dEF: 10, cRI: 5, hIT: 10, sPD: 10 }
    // HP: 100*0.7=70, ATK: 10*10.5=105, DEF: 10*10.5=105, SPD: 10*3=30, HIT: 10*2.3=23, CRI: 5*0=0
    expect(combatPotion(stats, false)).toBe(333)
  })

  it('applies buffCP = 1.15 when hasSkill = true', () => {
    const stats: StatsMap = { hP: 100, aTK: 10, dEF: 10, cRI: 0, hIT: 0, sPD: 0 }
    // Without skill: 70+105+105 = 280; With skill: 280*1.15 = 322
    expect(combatPotion(stats, true)).toBe(322)
  })

  it('floors the result', () => {
    const stats: StatsMap = { hP: 1, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    expect(combatPotion(stats, false)).toBe(0) // 0.7 → floor = 0
  })

  it('CRI contributes 0 regardless of value', () => {
    const stats1: StatsMap = { hP: 0, aTK: 0, dEF: 0, cRI: 1000, hIT: 0, sPD: 0 }
    const stats2: StatsMap = { hP: 0, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    expect(combatPotion(stats1, false)).toBe(combatPotion(stats2, false))
  })

  it('defaults hasSkill to false', () => {
    const stats: StatsMap = { hP: 100, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    expect(combatPotion(stats)).toBe(combatPotion(stats, false))
  })

  it('HP only', () => {
    const stats: StatsMap = { hP: 200, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    expect(combatPotion(stats, false)).toBe(140) // 200*0.7
  })

  it('ATK only', () => {
    const stats: StatsMap = { hP: 0, aTK: 20, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    expect(combatPotion(stats, false)).toBe(210) // 20*10.5
  })
})

// ============================================================
// statAndSkillOption
// ============================================================
describe('statAndSkillOption', () => {
  it('returns mainStat with correct key casing', () => {
    const result = statAndSkillOption({
      stat: { statType: 'hP', totalValue: 100 },
      skills: [],
      statsMap: { hP: 100, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat).toHaveProperty('HP')
    expect(result.mainStat['HP']).toBe(100)
  })

  it('isHasSkill = false when skills empty', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.isHasSkill).toBe(false)
    expect(result.listStat).not.toContain('skill')
  })

  it('isHasSkill = true when skills present', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [{ id: 1, elementalType: 'fire', power: 10, chance: 100, statPowerRatio: 1, referencedStatType: 'aTK' }],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.isHasSkill).toBe(true)
    expect(result.listStat).toContain('skill')
  })

  it('optionStat subtracts mainStat totalValue when same key', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 0, aTK: 80, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.optionStat['ATK']).toBe(30) // 80 - 50
  })

  it('optionStat keeps full value when different key', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 0, aTK: 50, dEF: 30, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.optionStat['DEF']).toBe(30)
  })

  it('skips stats with value 0 in optionStat', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.optionStat).not.toHaveProperty('HP')
    expect(result.optionStat).not.toHaveProperty('DEF')
  })

  it('listStat contains "stat" for each non-zero statsMap entry (including mainStat)', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 10, aTK: 50, dEF: 20, cRI: 0, hIT: 0, sPD: 0 }
    })
    // listStat pushes 'stat' for EVERY non-zero statsMap entry BEFORE checking mainStat
    // hP=10 → stat, aTK=50 → stat (even though optionStat becomes 0), dEF=20 → stat
    // cRI=0, hIT=0, sPD=0 → skipped
    const statCount = result.listStat.filter((s) => s === 'stat').length
    expect(statCount).toBe(3)
  })

  it('listStat includes "skill" when skills present', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [{ id: 1, elementalType: 'fire', power: 10, chance: 100, statPowerRatio: 1, referencedStatType: 'aTK' }],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.listStat).toContain('skill')
  })
})

// ============================================================
// getActiveWorldBossId
// ============================================================
describe('getActiveWorldBossId', () => {
  const worldBossData = [
    { id: 1, startBlockIndex: 100, endBlockIndex: 200 },
    { id: 2, startBlockIndex: 300, endBlockIndex: 400 }
  ]

  it('returns id when blockNow is within range', () => {
    expect(getActiveWorldBossId(150, worldBossData)).toBe(1)
    expect(getActiveWorldBossId(350, worldBossData)).toBe(2)
  })

  it('returns null when no active world boss', () => {
    expect(getActiveWorldBossId(250, worldBossData)).toBeNull()
    expect(getActiveWorldBossId(50, worldBossData)).toBeNull()
    expect(getActiveWorldBossId(500, worldBossData)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(getActiveWorldBossId(100, [])).toBeNull()
  })

  it('handles boundary: blockNow = startBlockIndex', () => {
    expect(getActiveWorldBossId(100, worldBossData)).toBe(1)
  })

  it('handles boundary: blockNow = endBlockIndex', () => {
    expect(getActiveWorldBossId(200, worldBossData)).toBe(1)
  })

  it('returns first matching (not necessarily highest id)', () => {
    const overlapping = [
      { id: 1, startBlockIndex: 100, endBlockIndex: 500 },
      { id: 2, startBlockIndex: 200, endBlockIndex: 300 }
    ]
    expect(getActiveWorldBossId(250, overlapping)).toBe(1)
  })
})

// ============================================================
// getActiveEventDungeon
// ============================================================
describe('getActiveEventDungeon', () => {
  const eventData = [
    { id: 1, dungeonId: 10, startBlockIndex: 100, endBlockIndex: 200 },
    { id: 2, dungeonId: 20, startBlockIndex: 300, endBlockIndex: 400 }
  ]

  it('returns dungeon info when active', () => {
    const result = getActiveEventDungeon(150, eventData)
    expect(result).toEqual({ dungeonId: 10, startEvent: 100, endEvent: 200 })
  })

  it('returns null when no active event', () => {
    expect(getActiveEventDungeon(250, eventData)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(getActiveEventDungeon(100, [])).toBeNull()
  })

  it('handles boundary: blockNow = startBlockIndex', () => {
    expect(getActiveEventDungeon(100, eventData)?.dungeonId).toBe(10)
  })

  it('handles boundary: blockNow = endBlockIndex', () => {
    expect(getActiveEventDungeon(200, eventData)).not.toBeNull()
  })

  it('returns first matching event', () => {
    const overlapping = [
      { id: 1, dungeonId: 10, startBlockIndex: 100, endBlockIndex: 500 },
      { id: 2, dungeonId: 20, startBlockIndex: 200, endBlockIndex: 300 }
    ]
    expect(getActiveEventDungeon(250, overlapping)?.dungeonId).toBe(10)
  })
})

// ============================================================
// processMaterials
// ============================================================
describe('processMaterials', () => {
  it('returns [] for undefined', () => {
    expect(processMaterials(undefined)).toEqual([])
  })

  it('returns [] for empty array', () => {
    expect(processMaterials([])).toEqual([])
  })

  it('counts unique material ids', () => {
    const materials: MaterialItem[] = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }, { id: 2 }, { id: 1 }]
    const result = processMaterials(materials)
    expect(result).toHaveLength(3)
    expect(result.find((r) => r.id === 1)?.count).toBe(3)
    expect(result.find((r) => r.id === 2)?.count).toBe(2)
    expect(result.find((r) => r.id === 3)?.count).toBe(1)
  })

  it('handles single material', () => {
    expect(processMaterials([{ id: 42 }])).toEqual([{ id: 42, count: 1 }])
  })
})

// ============================================================
// dedupConsumables
// ============================================================
describe('dedupConsumables', () => {
  it('returns [] for undefined', () => {
    expect(dedupConsumables(undefined)).toEqual([])
  })

  it('returns [] for empty array', () => {
    expect(dedupConsumables([])).toEqual([])
  })

  it('groups by id with count and itemIdList', () => {
    const consumables: ConsumableItem[] = [{ id: 10 }, { id: 20 }, { id: 10 }, { id: 30 }, { id: 10 }]
    const result = dedupConsumables(consumables)
    expect(result).toHaveLength(3)
    const item10 = result.find((r) => r.id === 10)
    expect(item10?.count).toBe(3)
    expect(item10?.itemIdList).toEqual([10, 10, 10])
  })

  it('handles single consumable', () => {
    const result = dedupConsumables([{ id: 5 }])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 5, count: 1, itemIdList: [5] })
  })
})

// ============================================================
// processInventoryFromGraphQL
// ============================================================
describe('processInventoryFromGraphQL', () => {
  it('returns empty object for empty input', () => {
    expect(processInventoryFromGraphQL({})).toEqual({})
  })

  it('skips keys not starting with "i"', () => {
    const inventory = { foo: [{ count: 5, tradableId: null }], bar: [{ count: 3, tradableId: null }] }
    expect(processInventoryFromGraphQL(inventory)).toEqual({})
  })

  it('sums counts for non-AP-potion items', () => {
    const inventory = { i1000: [{ count: 5, tradableId: null }, { count: 3, tradableId: '0xabc' }] }
    expect(processInventoryFromGraphQL(inventory)).toEqual({ 1000: 8 })
  })

  it('handles key with empty array', () => {
    expect(processInventoryFromGraphQL({ i999: [] })).toEqual({})
  })

  it('handles multiple different items', () => {
    const inventory = {
      i100: [{ count: 5, tradableId: null }],
      i200: [{ count: 3, tradableId: null }],
      i300: [{ count: 1, tradableId: null }]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[100]).toBe(5)
    expect(result[200]).toBe(3)
    expect(result[300]).toBe(1)
  })
})

// ============================================================
// parseWorldBossSheet
// ============================================================
describe('parseWorldBossSheet', () => {
  it('returns [] for null/undefined', () => {
    expect(parseWorldBossSheet(null)).toEqual([])
    expect(parseWorldBossSheet(undefined)).toEqual([])
  })

  it('parses snake_case keys', () => {
    const sheet = { row1: { id: '1', started_block_index: '100', ended_block_index: '200' } }
    const result = parseWorldBossSheet(sheet)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 1, startBlockIndex: 100, endBlockIndex: 200 })
  })

  it('parses camelCase keys', () => {
    const sheet = { row1: { id: '2', startBlockIndex: 300, endBlockIndex: 400 } }
    const result = parseWorldBossSheet(sheet)
    expect(result[0]).toEqual({ id: 2, startBlockIndex: 300, endBlockIndex: 400 })
  })

  it('parses alternative snake_case keys', () => {
    const sheet = { row1: { id: '3', start_block_index: 500, end_block_index: 600 } }
    const result = parseWorldBossSheet(sheet)
    expect(result[0]).toEqual({ id: 3, startBlockIndex: 500, endBlockIndex: 600 })
  })

  it('handles missing keys gracefully (defaults to 0)', () => {
    const sheet = { row1: {} }
    expect(parseWorldBossSheet(sheet)[0]).toEqual({ id: 0, startBlockIndex: 0, endBlockIndex: 0 })
  })

  it('parses multiple rows', () => {
    const sheet = {
      row1: { id: '1', started_block_index: '100', ended_block_index: '200' },
      row2: { id: '2', started_block_index: '300', ended_block_index: '400' }
    }
    expect(parseWorldBossSheet(sheet)).toHaveLength(2)
  })
})

// ============================================================
// parseEventScheduleSheet
// ============================================================
describe('parseEventScheduleSheet', () => {
  it('returns [] for null/undefined', () => {
    expect(parseEventScheduleSheet(null)).toEqual([])
    expect(parseEventScheduleSheet(undefined)).toEqual([])
  })

  it('parses snake_case keys', () => {
    const sheet = { row1: { id: '1', dungeon_id: '10', started_block_index: '100', ended_block_index: '200' } }
    const result = parseEventScheduleSheet(sheet)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ id: 1, dungeonId: 10, startBlockIndex: 100, endBlockIndex: 200 })
  })

  it('parses camelCase keys', () => {
    const sheet = { row1: { id: '2', dungeonId: 20, startBlockIndex: 300, endBlockIndex: 400 } }
    const result = parseEventScheduleSheet(sheet)
    expect(result[0]).toEqual({ id: 2, dungeonId: 20, startBlockIndex: 300, endBlockIndex: 400 })
  })

  it('handles missing dungeonId (defaults to 0)', () => {
    expect(parseEventScheduleSheet({ row1: { id: '1' } })[0]?.dungeonId).toBe(0)
  })

  it('handles missing keys gracefully', () => {
    expect(parseEventScheduleSheet({ row1: {} })[0]).toEqual({ id: 0, dungeonId: 0, startBlockIndex: 0, endBlockIndex: 0 })
  })

  it('parses multiple rows', () => {
    const sheet = {
      row1: { id: '1', dungeon_id: '10', started_block_index: '100', ended_block_index: '200' },
      row2: { id: '2', dungeon_id: '20', started_block_index: '300', ended_block_index: '400' }
    }
    expect(parseEventScheduleSheet(sheet)).toHaveLength(2)
  })
})

// ============================================================
// buildCodeGetList
// ============================================================
describe('buildCodeGetList', () => {
  it('includes all static codeGet values', () => {
    const result = buildCodeGetList([], [], 1000)
    for (const staticVal of AVATAR_DATA_CODE_GET_STATIC) {
      expect(result).toContain(staticVal)
    }
  })

  it('returns only static values when no active world boss or event', () => {
    const result = buildCodeGetList([], [], 1000)
    expect(result).toHaveLength(AVATAR_DATA_CODE_GET_STATIC.length)
  })

  it('adds world boss codeGets when active', () => {
    const worldBossData = [
      { id: 42, startBlockIndex: 100, endBlockIndex: 200 }
    ]
    const result = buildCodeGetList(worldBossData, [], 150)
    expect(result).toContain('other_lookupWorldBossInfoTotal_idRaid_42')
    expect(result).toContain('lookupWorldBossInfoAvatar_idRaid_42')
  })

  it('adds event dungeon codeGet when active', () => {
    const eventData = [
      { id: 1, dungeonId: 7, startBlockIndex: 100, endBlockIndex: 200 }
    ]
    const result = buildCodeGetList([], eventData, 150)
    expect(result).toContain('lookupEventDungeonInfo_dungeonId_70001')
  })

  it('adds both world boss and event dungeon when both active', () => {
    const worldBossData = [{ id: 1, startBlockIndex: 100, endBlockIndex: 200 }]
    const eventData = [{ id: 1, dungeonId: 5, startBlockIndex: 100, endBlockIndex: 200 }]
    const result = buildCodeGetList(worldBossData, eventData, 150)
    expect(result).toContain('other_lookupWorldBossInfoTotal_idRaid_1')
    expect(result).toContain('lookupWorldBossInfoAvatar_idRaid_1')
    expect(result).toContain('lookupEventDungeonInfo_dungeonId_50001')
  })

  it('does not add dynamic codeGets when nothing is active', () => {
    const worldBossData = [{ id: 1, startBlockIndex: 100, endBlockIndex: 200 }]
    const eventData = [{ id: 1, dungeonId: 5, startBlockIndex: 100, endBlockIndex: 200 }]
    const result = buildCodeGetList(worldBossData, eventData, 500) // outside all ranges
    expect(result).toHaveLength(AVATAR_DATA_CODE_GET_STATIC.length)
  })

  it('handles undefined worldBossData and eventScheduleData', () => {
    const result = buildCodeGetList(undefined, undefined, 1000)
    expect(result).toHaveLength(AVATAR_DATA_CODE_GET_STATIC.length)
  })

  it('returns first matching world boss (not highest id)', () => {
    const worldBossData = [
      { id: 1, startBlockIndex: 100, endBlockIndex: 500 },
      { id: 2, startBlockIndex: 200, endBlockIndex: 300 }
    ]
    const result = buildCodeGetList(worldBossData, [], 250)
    expect(result).toContain('other_lookupWorldBossInfoTotal_idRaid_1')
    expect(result).not.toContain('other_lookupWorldBossInfoTotal_idRaid_2')
  })
})

// ============================================================
// processInventoryFromGraphQL — AP potion edge cases
// ============================================================
describe('processInventoryFromGraphQL — AP potion special case', () => {
  it('splits tradable vs non-tradable AP potions', () => {
    const inventory = {
      [`i${AP_POTION_ID}`]: [
        { count: 5, tradableId: '0xabc' },   // tradable
        { count: 3, tradableId: null },        // non-tradable
        { count: 2, tradableId: '0xdef' }     // tradable
      ]
    }
    const result = processInventoryFromGraphQL(inventory)
    // tradable: 5 + 2 = 7, stored at AP_POTION_TRADABLE_OFFSET + AP_POTION_ID
    expect(result[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID]).toBe(7)
    // non-tradable: 3, stored at AP_POTION_ID
    expect(result[AP_POTION_ID]).toBe(3)
  })

  it('handles AP potion with all tradable', () => {
    const inventory = {
      [`i${AP_POTION_ID}`]: [
        { count: 10, tradableId: '0xabc' },
        { count: 5, tradableId: '0xdef' }
      ]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID]).toBe(15)
    expect(result[AP_POTION_ID]).toBe(0)
  })

  it('handles AP potion with all non-tradable', () => {
    const inventory = {
      [`i${AP_POTION_ID}`]: [
        { count: 8, tradableId: null }
      ]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID]).toBe(0)
    expect(result[AP_POTION_ID]).toBe(8)
  })

  it('handles AP potion with empty array', () => {
    const inventory = { [`i${AP_POTION_ID}`]: [] }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[AP_POTION_ID]).toBeUndefined()
    expect(result[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID]).toBeUndefined()
  })

  it('handles mixed AP potion and regular items', () => {
    const inventory = {
      [`i${AP_POTION_ID}`]: [
        { count: 3, tradableId: '0xabc' },
        { count: 2, tradableId: null }
      ],
      i1000: [{ count: 5, tradableId: null }],
      i2000: [{ count: 1, tradableId: '0x123' }, { count: 1, tradableId: null }]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[AP_POTION_TRADABLE_OFFSET + AP_POTION_ID]).toBe(3)
    expect(result[AP_POTION_ID]).toBe(2)
    expect(result[1000]).toBe(5)
    expect(result[2000]).toBe(2) // summed regardless of tradableId
  })
})

// ============================================================
// getLatestStageClearedId — special stage filtering
// ============================================================
describe('getLatestStageClearedId — special stage filtering', () => {
  it(`filters out stages starting with ${STAGE_SPECIAL_PREFIX}`, () => {
    const stageMap = {
      pairs: [
        [50, 1],
        [`${STAGE_SPECIAL_PREFIX}01`, 2],
        [100, 3],
        [`${STAGE_SPECIAL_PREFIX}02`, 4]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(100)
  })

  it('returns 0 when all stages are special', () => {
    const stageMap = {
      pairs: [
        [`${STAGE_SPECIAL_PREFIX}01`, 1],
        [`${STAGE_SPECIAL_PREFIX}02`, 2]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(0)
  })

  it('stage 100000 (exactly prefix) is filtered as special', () => {
    const stageMap = {
      pairs: [
        [50, 1],
        [100000, 2] // "100000" starts with "100000"
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(50)
  })
})

// ============================================================
// statAndSkillOption — additional edge cases
// ============================================================
describe('statAndSkillOption — edge cases', () => {
  it('handles all 6 stat types in statsMap', () => {
    const result = statAndSkillOption({
      stat: { statType: 'hP', totalValue: 100 },
      skills: [],
      statsMap: { hP: 100, aTK: 50, dEF: 30, cRI: 10, hIT: 20, sPD: 40 }
    })
    expect(result.mainStat['HP']).toBe(100)
    expect(result.optionStat['ATK']).toBe(50)
    expect(result.optionStat['DEF']).toBe(30)
    expect(result.optionStat['CRI']).toBe(10)
    expect(result.optionStat['HIT']).toBe(20)
    expect(result.optionStat['SPD']).toBe(40)
    // mainStat key 'hP' → optionStat['HP'] = 100 - 100 = 0 (property exists with value 0)
    expect(result.optionStat['HP']).toBe(0)
  })

  it('handles empty statsMap (all zeros)', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { hP: 0, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat['ATK']).toBe(50)
    expect(result.optionStat).toEqual({})
    expect(result.listStat).toEqual([])
    expect(result.isHasSkill).toBe(false)
  })

  it('sPD stat type', () => {
    const result = statAndSkillOption({
      stat: { statType: 'sPD', totalValue: 20 },
      skills: [],
      statsMap: { hP: 0, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 60 }
    })
    expect(result.mainStat['SPD']).toBe(20)
    expect(result.optionStat['SPD']).toBe(40) // 60 - 20
  })

  it('hIT stat type', () => {
    const result = statAndSkillOption({
      stat: { statType: 'hIT', totalValue: 15 },
      skills: [],
      statsMap: { hP: 0, aTK: 0, dEF: 0, cRI: 0, hIT: 45, sPD: 0 }
    })
    expect(result.mainStat['HIT']).toBe(15)
    expect(result.optionStat['HIT']).toBe(30) // 45 - 15
  })

  it('cRI stat type', () => {
    const result = statAndSkillOption({
      stat: { statType: 'cRI', totalValue: 5 },
      skills: [],
      statsMap: { hP: 0, aTK: 0, dEF: 0, cRI: 25, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat['CRI']).toBe(5)
    expect(result.optionStat['CRI']).toBe(20) // 25 - 5
  })

  it('dEF stat type', () => {
    const result = statAndSkillOption({
      stat: { statType: 'dEF', totalValue: 30 },
      skills: [],
      statsMap: { hP: 0, aTK: 0, dEF: 80, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat['DEF']).toBe(30)
    expect(result.optionStat['DEF']).toBe(50) // 80 - 30
  })

  it('multiple skills still pushes one skill entry', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [
        { id: 1, elementalType: 'fire', power: 10, chance: 100, statPowerRatio: 1, referencedStatType: 'aTK' },
        { id: 2, elementalType: 'water', power: 20, chance: 50, statPowerRatio: 0.5, referencedStatType: 'dEF' }
      ],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.isHasSkill).toBe(true)
    // listStat should have 'stat' for aTK + one 'skill' (regardless of skills count)
    const skillCount = result.listStat.filter((s) => s === 'skill').length
    expect(skillCount).toBe(1) // isHasSkill = true → push 'skill' once
  })
})

// ============================================================
// processInventoryFromGraphQL — tradableId: undefined edge case
// ============================================================
describe('processInventoryFromGraphQL — tradableId undefined', () => {
  it('treats tradableId undefined as non-tradable', () => {
    const inventory = {
      i999: [{ count: 5, tradableId: undefined }]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[999]).toBe(5)
  })

  it('treats missing tradableId property as non-tradable', () => {
    const inventory = {
      i888: [{ count: 3 }] // no tradableId property at all
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[888]).toBe(3)
  })
})

// ============================================================
// calculateAPCost — additional edge cases
// ============================================================
describe('calculateAPCost — edge cases', () => {
  it('handles very large numbers', () => {
    expect(calculateAPCost(Number.MAX_SAFE_INTEGER)).toBe(3)
  })

  it('handles float stake (truncated by parseInt)', () => {
    expect(calculateAPCost(4999.9)).toBe(5) // parseInt("4999.9") = 4999 → tier 1
  })

  it('handles NaN string', () => {
    expect(calculateAPCost('not-a-number')).toBe(5) // parseInt returns NaN → || 0
  })
})

// ============================================================
// combatPotion — all stats non-zero
// ============================================================
describe('combatPotion — all stats non-zero', () => {
  it('calculates CP with all stats non-zero', () => {
    const stats: StatsMap = { hP: 100, aTK: 20, dEF: 15, cRI: 10, hIT: 12, sPD: 8 }
    // HP: 70 + ATK: 210 + DEF: 157.5 + SPD: 24 + HIT: 27.6 + CRI: 0 = 489.1 → 489
    expect(combatPotion(stats, false)).toBe(489)
  })

  it('all stats with skill buff', () => {
    const stats: StatsMap = { hP: 100, aTK: 20, dEF: 15, cRI: 10, hIT: 12, sPD: 8 }
    // 489.1 * 1.15 = 562.465 → 562
    expect(combatPotion(stats, true)).toBe(562)
  })
})

// ============================================================
// parseWorldBossSheet / parseEventScheduleSheet — additional
// ============================================================
describe('parseWorldBossSheet — edge cases', () => {
  it('handles empty object (no rows)', () => {
    expect(parseWorldBossSheet({})).toEqual([])
  })

  it('handles rows with mixed types (number and string)', () => {
    const sheet = { row1: { id: 1, started_block_index: '200', ended_block_index: 400 } }
    const result = parseWorldBossSheet(sheet)
    expect(result[0]).toEqual({ id: 1, startBlockIndex: 200, endBlockIndex: 400 })
  })
})

describe('parseEventScheduleSheet — edge cases', () => {
  it('handles empty object (no rows)', () => {
    expect(parseEventScheduleSheet({})).toEqual([])
  })

  it('handles rows with mixed types', () => {
    const sheet = { row1: { id: '5', dungeonId: 15, started_block_index: 300, ended_block_index: '600' } }
    const result = parseEventScheduleSheet(sheet)
    expect(result[0]).toEqual({ id: 5, dungeonId: 15, startBlockIndex: 300, endBlockIndex: 600 })
  })
})

// ============================================================
// statAndSkillOption — case-insensitive statsMap keys
// ============================================================
describe('statAndSkillOption — case-insensitive statsMap keys', () => {
  it('handles uppercase statsMap keys (HP, ATK, DEF)', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 50 },
      skills: [],
      statsMap: { HP: 0, ATK: 50, DEF: 30, CRI: 0, HIT: 0, SPD: 0 }
    })
    expect(result.mainStat['ATK']).toBe(50)
    expect(result.optionStat['ATK']).toBe(0) // 50 - 50 = 0
    expect(result.optionStat['DEF']).toBe(30)
  })

  it('subtracts mainStat from optionStat when statsMap uses uppercase keys', () => {
    const result = statAndSkillOption({
      stat: { statType: 'hP', totalValue: 100 },
      skills: [],
      statsMap: { HP: 200, ATK: 50, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
    })
    expect(result.mainStat['HP']).toBe(100)
    expect(result.optionStat['HP']).toBe(100) // 200 - 100
    expect(result.optionStat['ATK']).toBe(50)
  })

  it('handles mixed-case keys (hP, ATK, dEF)', () => {
    const result = statAndSkillOption({
      stat: { statType: 'dEF', totalValue: 30 },
      skills: [],
      statsMap: { hP: 100, ATK: 0, dEF: 80, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat['DEF']).toBe(30)
    expect(result.optionStat['DEF']).toBe(50) // 80 - 30
    expect(result.optionStat['HP']).toBe(100)
  })

  it('statType "HP" (uppercase input) works the same as "hP"', () => {
    const resultUpper = statAndSkillOption({
      stat: { statType: 'HP', totalValue: 100 },
      skills: [],
      statsMap: { HP: 200, ATK: 50, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
    })
    const resultLower = statAndSkillOption({
      stat: { statType: 'hP', totalValue: 100 },
      skills: [],
      statsMap: { HP: 200, ATK: 50, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
    })
    expect(resultUpper.mainStat).toEqual(resultLower.mainStat)
    expect(resultUpper.optionStat).toEqual(resultLower.optionStat)
  })
})

// ============================================================
// buildCodeGetList — edge cases
// ============================================================
describe('buildCodeGetList — edge cases', () => {
  it('returns static-only list when blockNow is 0', () => {
    const result = buildCodeGetList([], [], 0)
    expect(result).toEqual(AVATAR_DATA_CODE_GET_STATIC)
  })

  it('handles very large blockNow values', () => {
    const worldBossData = [{ id: 1, startBlockIndex: 100, endBlockIndex: 200 }]
    const result = buildCodeGetList(worldBossData, [], Number.MAX_SAFE_INTEGER)
    expect(result).toEqual(AVATAR_DATA_CODE_GET_STATIC)
  })
})

// ============================================================
// processInventoryFromGraphQL — additional edge cases
// ============================================================
describe('processInventoryFromGraphQL — key edge cases', () => {
  it('skips non-"i" prefixed keys entirely', () => {
    const inventory = {
      data: [{ count: 99, tradableId: null }],
      foo: [{ count: 88, tradableId: null }],
      bar: [{ count: 77, tradableId: null }]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('handles mixed valid and non-"i" keys', () => {
    const inventory = {
      i100: [{ count: 5, tradableId: null }],
      data: [{ count: 1, tradableId: null }],
      i200: [{ count: 7, tradableId: null }]
    }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[100]).toBe(5)
    expect(result[200]).toBe(7)
    expect(result).not.toHaveProperty('data')
  })
})

describe('processInventoryFromGraphQL — count edge cases', () => {
  it('handles items with count = 0', () => {
    const inventory = { i500: [{ count: 0, tradableId: null }] }
    const result = processInventoryFromGraphQL(inventory)
    expect(result[500]).toBe(0)
  })

  it('handles items with count = undefined', () => {
    const inventory = { i600: [{ tradableId: null }] }
    const result = processInventoryFromGraphQL(inventory)
    // (undefined) || 0 = 0
    expect(result[600]).toBe(0)
  })

  it('handles items with count = null', () => {
    const inventory = { i700: [{ count: null, tradableId: null }] }
    const result = processInventoryFromGraphQL(inventory)
    // (null) || 0 = 0
    expect(result[700]).toBe(0)
  })
})

// ============================================================
// dedupConsumables — stress test
// ============================================================
describe('dedupConsumables — large input', () => {
  it('handles large array with many duplicates', () => {
    const consumables: ConsumableItem[] = []
    for (let i = 0; i < 1000; i++) {
      consumables.push({ id: i % 10 }) // 10 unique IDs, 100 each
    }
    const result = dedupConsumables(consumables)
    expect(result).toHaveLength(10)
    for (const item of result) {
      expect(item.count).toBe(100)
      expect(item.itemIdList).toHaveLength(100)
    }
  })
})

// ============================================================
// processMaterials — large input
// ============================================================
describe('processMaterials — large input', () => {
  it('handles large array with many duplicates', () => {
    const materials: MaterialItem[] = []
    for (let i = 0; i < 500; i++) {
      materials.push({ id: i % 5 }) // 5 unique IDs, 100 each
    }
    const result = processMaterials(materials)
    expect(result).toHaveLength(5)
    for (const item of result) {
      expect(item.count).toBe(100)
    }
  })
})

// ============================================================
// combatPotion — negative stats (edge case)
// ============================================================
describe('combatPotion — negative stats', () => {
  it('handles negative stats (produces negative CP before floor)', () => {
    const stats: StatsMap = { hP: -100, aTK: 0, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    // -100 * 0.7 = -70 → floor = -70
    expect(combatPotion(stats, false)).toBe(-70)
  })
})

// ============================================================
// getLatestStageClearedId — negative stage IDs
// ============================================================
describe('getLatestStageClearedId — negative IDs', () => {
  it('ignores negative stage IDs (not > latest=0)', () => {
    const stageMap = {
      pairs: [
        [-5, 1],
        [-10, 2]
      ] as Array<[number | string, number | string]>
    }
    expect(getLatestStageClearedId(stageMap)).toBe(0)
  })
})

// ============================================================
// statAndSkillOption — negative values
// ============================================================
describe('statAndSkillOption — negative values', () => {
  it('handles negative totalValue', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: -10 },
      skills: [],
      statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    expect(result.mainStat['ATK']).toBe(-10)
    expect(result.optionStat['ATK']).toBe(60) // 50 - (-10) = 60
  })

  it('handles negative statsMap values', () => {
    const result = statAndSkillOption({
      stat: { statType: 'aTK', totalValue: 10 },
      skills: [],
      statsMap: { hP: 0, aTK: -5, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
    })
    // -5 !== 0 so it's included in listStat, optionStat['ATK'] = -5 - 10 = -15
    expect(result.optionStat['ATK']).toBe(-15)
  })
})
