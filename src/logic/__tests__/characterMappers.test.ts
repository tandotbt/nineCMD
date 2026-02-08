import { describe, it, expect } from 'vitest'
import {
  mapEquipmentToDisplayData,
  mapMaterialToDisplayData,
  mapCostumeToDisplayData,
  mapRuneToDisplayData,
  sortItems,
  sortRunes,
} from '../character'
import type { Equipment, Material, Costume, RuneInfo, RuneSlot, StatsMap } from '@/types/character'
import type { CsvSheetData } from '@/types/csv'

describe('Character Mappers & Sorting', () => {
  const mockSheets: Record<string, CsvSheetData> = {
    ItemNameSheet: {
      name: 'ItemNameSheet',
      headers: [],
      rows: [],
      mappedData: {
        ITEM_NAME_101: { English: 'Sword', Vietnam: 'Kiếm' },
        ITEM_NAME_201: { English: 'Armor', Vietnam: 'Giáp' },
        ITEM_NAME_301: { English: 'Material A' },
        ITEM_NAME_10200000: { English: 'Portrait' },
      },
      keyMain: 'id',
    },
  }

  const emptyStats: StatsMap = {
    hP: 0,
    aTK: 0,
    dEF: 0,
    cRI: 0,
    hIT: 0,
    sPD: 0,
  }

  describe('mapEquipmentToDisplayData', () => {
    it('should map equipment correctly', () => {
      const eq: Equipment = {
        id: 1,
        itemId: '101',
        itemType: 'EQUIPMENT',
        itemSubType: 'Weapon',
        elementalType: 'Fire',
        grade: 3,
        level: 5,
        equipped: true,
        statsMap: {
          ...emptyStats,
          aTK: { baseValue: 10, additionalValue: 5 },
          hP: 100,
        },
        skills: [{ id: 'skill1', power: 100 }],
        buffSkills: [],
        CP: 1500,
      }
      const mapped = mapEquipmentToDisplayData(eq, mockSheets, 'en')
      expect(mapped.name).toBe('Sword')
      expect(mapped.grade).toBe(3)
      expect(mapped.level).toBe(5)
      expect(mapped.isEquipped).toBe(true)
      expect(mapped.hasSkill).toBe(true)
      expect(mapped.stats).toContainEqual({ label: 'ATK', value: 15 })
      expect(mapped.optionStatTypes).toContain('aTK')
    })
  })

  describe('mapMaterialToDisplayData', () => {
    it('should map material correctly', () => {
      const mat: Material = {
        id: 301,
        count: 10,
        tradableCount: 5,
        grade: 2,
        itemSubType: 'Material',
      }
      const mapped = mapMaterialToDisplayData(mat, mockSheets, 'en')
      expect(mapped.name).toBe('Material A')
      expect(mapped.count).toBe(10)
      expect(mapped.tradableCount).toBe(5)
      expect(mapped.grade).toBe(2)
      expect(mapped.type).toBe('material')
    })
  })

  describe('mapCostumeToDisplayData', () => {
    it('should map costume correctly', () => {
      const cos: Costume = {
        id: 2,
        itemId: '201',
        itemType: 'COSTUME',
        itemSubType: 'FullCostume',
        elementalType: 'None',
        grade: 4,
        equipped: true,
        CP: 200,
      }
      const mapped = mapCostumeToDisplayData(cos, mockSheets, 'en')
      expect(mapped.name).toBe('Armor')
      expect(mapped.grade).toBe(4)
      expect(mapped.type).toBe('costume')
    })
  })

  describe('mapRuneToDisplayData', () => {
    it('should map rune correctly', () => {
      const rune: RuneInfo = {
        runeId: 1,
        level: 1,
        name: 'Rune 1',
        runeType: 'STAT',
      }
      const mapped = mapRuneToDisplayData(rune, mockSheets, 'en')
      expect(mapped.id).toBe(1)
      expect(mapped.type).toBe('rune')
    })

    it('should map rune slot correctly', () => {
      const slot: RuneSlot = {
        index: 0,
        runeId: 1,
        isLock: false,
      }
      const mapped = mapRuneToDisplayData(slot, mockSheets, 'en')
      expect(mapped.id).toBe(1)
    })
  })

  describe('sortItems', () => {
    it('should sort equipments by Equipped > Grade > Level > CP', () => {
      const items: Equipment[] = [
        {
          id: 1,
          itemId: '1',
          itemType: 'EQUIPMENT',
          itemSubType: 'Weapon',
          elementalType: 'None',
          grade: 1,
          level: 1,
          CP: 100,
          equipped: false,
          statsMap: emptyStats,
          skills: [],
          buffSkills: [],
        },
        {
          id: 2,
          itemId: '2',
          itemType: 'EQUIPMENT',
          itemSubType: 'Weapon',
          elementalType: 'None',
          grade: 5,
          level: 1,
          CP: 500,
          equipped: false,
          statsMap: emptyStats,
          skills: [],
          buffSkills: [],
        },
        {
          id: 3,
          itemId: '3',
          itemType: 'EQUIPMENT',
          itemSubType: 'Weapon',
          elementalType: 'None',
          grade: 3,
          level: 10,
          CP: 300,
          equipped: true,
          statsMap: emptyStats,
          skills: [],
          buffSkills: [],
        },
      ]
      const sorted = sortItems(items, 'equipment')
      expect(sorted[0]?.itemId).toBe('3') // Equipped
      expect(sorted[1]?.itemId).toBe('2') // Grade 5
      expect(sorted[2]?.itemId).toBe('1') // Grade 1
    })

    it('should sort materials by Grade > Count', () => {
      const items: Material[] = [
        { id: 1, count: 100, grade: 1 },
        { id: 2, count: 10, grade: 5 },
        { id: 3, count: 50, grade: 5 },
      ]
      const sorted = sortItems(items, 'material')
      expect(sorted[0]?.id).toBe(3) // Grade 5, Count 50
      expect(sorted[1]?.id).toBe(2) // Grade 5, Count 10
      expect(sorted[2]?.id).toBe(1) // Grade 1
    })
  })

  describe('sortRunes', () => {
    it('should sort runes by Level > Name', () => {
      const runes: RuneInfo[] = [
        { runeId: 1, level: 5, name: 'B Rune' },
        { runeId: 2, level: 10, name: 'A Rune' },
        { runeId: 3, level: 5, name: 'C Rune' },
      ]
      const sorted = sortRunes(runes)
      expect(sorted[0]?.runeId).toBe(2) // Level 10
      expect(sorted[1]?.runeId).toBe(1) // Level 5, Name B
      expect(sorted[2]?.runeId).toBe(3) // Level 5, Name C
    })
  })
})
