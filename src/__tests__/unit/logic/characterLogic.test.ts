import { test, expect, describe } from 'vitest'
import { CHARACTER_LOGIC_CONSTANTS, BLOCK_CONFIG } from '../../../constants'
import {
  calculateEquipmentCP,
  calculateAPCost,
  getWorldInfo,
  getLatestStageId,
  calculateAPRefill,
  convertToStatsMap,
  calculateTotalCP,
  resolveItemNames,
} from '../../../logic/character'
import type { Equipment } from '../../../types/character'
import type { CsvSheetData } from '../../../types/csv'

describe('Character Logic', () => {
  test('calculate CP correctly without skill', () => {
    const stats = { hP: 100, aTK: 10, dEF: 10, sPD: 5, hIT: 2, cRI: 0 }
    expect(calculateEquipmentCP(stats, false)).toBe(299)
  })

  test('calculate CP correctly with skill', () => {
    const stats = { hP: 100, aTK: 10, dEF: 10, sPD: 5, hIT: 2, cRI: 0 }
    expect(calculateEquipmentCP(stats, true)).toBe(344)
  })

  test('calculate APCost', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    expect(calculateAPCost(AP.STAKE_THRESHOLD_TIER_1)).toBe(AP.COST_TIER_1)
    expect(calculateAPCost(AP.STAKE_THRESHOLD_TIER_2)).toBe(AP.COST_TIER_2)
    expect(calculateAPCost(0)).toBe(AP.COST_DEFAULT)
  })

  test('getWorldInfo', () => {
    const worldSheet = {
      '2': { stage_begin: 51, stage_end: 100 },
    }
    const { STAGE } = CHARACTER_LOGIC_CONSTANTS
    const info = getWorldInfo(25, worldSheet)
    expect(info.worldId).toBe(STAGE.DEFAULT_WORLD_ID)
    expect(info.isUnlocked).toBe(true)

    const infoError = getWorldInfo(999, worldSheet)
    expect(infoError.worldId).toBe(STAGE.ERROR_WORLD_ID)
  })

  test('getLatestStageId', () => {
    const pairs: [number, number][] = [
      [1, 1],
      [50, 1],
      [1001, 1],
    ]
    expect(getLatestStageId(pairs)).toBe(50)
  })

  test('calculateAPRefill correctly', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    const avgBlockTime = BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS / 1000
    // blockRefill = 100, currentBlock = 110, interval = 7200, avgBlockTime = 10s
    const result = calculateAPRefill(100, 110, AP.DAILY_REFILL_INTERVAL, avgBlockTime)
    expect(result.timeRefill).toBe(10)
    expect(result.timeRefillReal).toBe((AP.DAILY_REFILL_INTERVAL - 10) * avgBlockTime)
  })

  test('calculateAPRefill when available', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    const avgBlockTime = BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS / 1000
    const result = calculateAPRefill(
      100,
      100 + AP.DAILY_REFILL_INTERVAL + 1,
      AP.DAILY_REFILL_INTERVAL,
      avgBlockTime,
    )
    expect(result.timeRefill).toBe(AP.DAILY_REFILL_INTERVAL + 1)
    expect(result.timeRefillReal).toBe(0)
  })

  test('calculateAPRefill edge cases', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    const avgBlockTime = BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS / 1000
    expect(calculateAPRefill(-1, 100, AP.DAILY_REFILL_INTERVAL, avgBlockTime).timeRefill).toBe(0)
    expect(calculateAPRefill(0, 100, AP.DAILY_REFILL_INTERVAL, avgBlockTime).timeRefillReal).toBe(1)
  })

  test('convertToStatsMap correctly', () => {
    const pairs = [
      { key: 'HP', value: { baseValue: 100, additionalValue: 50 } },
      { key: 'ATK', value: { baseValue: 10, additionalValue: 5 } },
    ]
    const stats = convertToStatsMap(pairs)
    expect(stats.hP).toBe(150)
    expect(stats.aTK).toBe(15)
    expect(stats.dEF).toBe(0)
  })

  test('calculateTotalCP with multiple items', () => {
    const equipments = [
      {
        equipped: true,
        statsMap: { hP: 100, aTK: 10, dEF: 10, sPD: 5, hIT: 2, cRI: 0 },
        skills: [{ id: 1 }],
      } as unknown as Equipment,
      {
        equipped: true,
        statsMap: { hP: 200, aTK: 20, dEF: 20, sPD: 10, hIT: 4, cRI: 0 },
        skills: [],
      } as unknown as Equipment,
      {
        equipped: false, // Should be ignored
        statsMap: { hP: 999, aTK: 999, dEF: 999, sPD: 999, hIT: 999, cRI: 0 },
      } as unknown as Equipment,
    ]
    // Item 1 (with skill): 344 CP (343.85 rounded down)
    // Item 2 (no skill): 599 CP (599.2 rounded down)
    // Total: 943 CP
    expect(calculateTotalCP(equipments)).toBe(943)
  })

  test('resolveItemNames correctly', () => {
    const items = [
      { id: 101000, name: 'Old Name' },
      { itemId: 102000, name: 'Old Name 2' },
    ] as unknown as Equipment[]

    const sheets: Record<string, CsvSheetData> = {
      ItemNameSheet: {
        name: 'ItemNameSheet',
        headers: ['Vietnam', 'English'],
        rows: [],
        keyMain: 'id',
        mappedData: {
          ITEM_NAME_101000: { Vietnam: 'Tên Tiếng Việt 1', English: 'English Name 1' },
          ITEM_NAME_102000: { Vietnam: 'Tên Tiếng Việt 2', English: 'English Name 2' },
        },
      },
    }

    resolveItemNames(items, sheets, 'vi')
    expect(items[0]!.name).toBe('Tên Tiếng Việt 1')
    expect(items[1]!.name).toBe('Tên Tiếng Việt 2')

    resolveItemNames(items, sheets, 'en')
    expect(items[0]!.name).toBe('English Name 1')
  })
})
