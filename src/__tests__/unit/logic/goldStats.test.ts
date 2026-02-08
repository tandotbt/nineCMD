import { test, expect, describe } from 'vitest'
import { mapEquipmentToDisplayData } from '../../../logic/character'
import type { Equipment } from '../../../types/character'
import type { CsvSheetData } from '../../../types/csv'

describe('Gold Stats Logic', () => {
  const mockSheets: Record<string, CsvSheetData> = {
    ItemNameSheet: {
      name: 'ItemNameSheet',
      headers: ['English'],
      rows: [],
      keyMain: 'id',
      mappedData: {},
    },
  }

  test('should count non-main stats with additionalValue as gold stars', () => {
    const eq = {
      itemId: 101000,
      itemType: 'EQUIPMENT',
      statsMap: {
        hP: { baseValue: 100, additionalValue: 0 },
        sPD: { baseValue: 0, additionalValue: 5 },
      },
      equipped: true,
      grade: 3,
      skills: [],
    } as unknown as Equipment

    const display = mapEquipmentToDisplayData(eq, mockSheets, 'en')
    expect(display.optionStatsCount).toBe(1)
    expect(display.optionStatTypes).toContain('sPD')
  })

  test('should count main stats as gold stars if they have additionalValue (REPRODUCING BUG)', () => {
    // Current logic excludes hP, aTK, dEF from optionStatTypes
    const eq = {
      itemId: 101000,
      itemType: 'EQUIPMENT',
      statsMap: {
        hP: { baseValue: 100, additionalValue: 50 }, // This might be an option HP
      },
      equipped: true,
      grade: 3,
      skills: [],
    } as unknown as Equipment

    const display = mapEquipmentToDisplayData(eq, mockSheets, 'en')
    // If the bug exists, this will be 0 because hP is in mainStats
    expect(display.optionStatsCount).toBe(1)
  })

  test('should handle numeric stat values (if any)', () => {
    const eq = {
      itemId: 101000,
      itemType: 'EQUIPMENT',
      statsMap: {
        sPD: 5, // Some sources might return numbers
      },
      equipped: true,
      grade: 3,
      skills: [],
    } as unknown as Equipment

    const display = mapEquipmentToDisplayData(eq, mockSheets, 'en')
    // Current isOptionStat returns false for numbers
    expect(display.optionStatsCount).toBe(1)
  })

  test('should count purple stars (skillsCount)', () => {
    const eq = {
      itemId: 101000,
      itemType: 'EQUIPMENT',
      statsMap: {},
      equipped: true,
      grade: 4,
      skills: [{ id: 1 }, { id: 2 }],
    } as unknown as Equipment

    const display = mapEquipmentToDisplayData(eq, mockSheets, 'en')
    expect(display.hasSkill).toBe(true)
    expect(display.skillsCount).toBe(2)
  })
})

import { resolveRuneInfo } from '../../../logic/mapping'

describe('Rune Icon Logic', () => {
  test('should resolve rune icon by ticker even if ID is provided', () => {
    const mockSheets: Record<string, CsvSheetData> = {
      RuneSheet: {
        name: 'RuneSheet',
        headers: [],
        rows: [],
        keyMain: 'id',
        mappedData: {
          '1001': { ticker: 'RUNE_TEST' },
        },
      },
    }
    const info = resolveRuneInfo(1001, mockSheets)
    expect(info.imageUrl).toContain('/Icons/FungibleAssetValue/RUNE_TEST.png')
  })

  test('should resolve rune icon by ticker if ID is 0', () => {
    const mockSheets: Record<string, CsvSheetData> = {
      RuneSheet: {
        name: 'RuneSheet',
        headers: [],
        rows: [],
        keyMain: 'id',
        mappedData: {
          '0': { ticker: 'RUNE_TEST' },
        },
      },
    }
    const info = resolveRuneInfo(0, mockSheets)
    expect(info.imageUrl).toContain('/Icons/FungibleAssetValue/RUNE_TEST.png')
  })
})
