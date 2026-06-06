/**
 * CSV Parser Tests – Kiểm tra csvParser utility
 */

import { describe, it, expect } from 'vitest'
import { decodeBase64Csv, parseCsvSheet, getCsvHeaders, validateCsvData } from '../utilities/csvParser'

describe('CSV Parser Utility', () => {
  // ============================================================
  // decodeBase64Csv
  // ============================================================
  describe('decodeBase64Csv', () => {
    it('decodes base64 string to UTF-8', () => {
      const original = 'hello,world\n1,2,3'
      const encoded = btoa(original)
      const result = decodeBase64Csv(encoded)
      expect(result).toBe(original)
    })

    it('handles Vietnamese characters', () => {
      const original = 'Kim cương,Trứng rán'
      const encoded = btoa(unescape(encodeURIComponent(original)))
      const result = decodeBase64Csv(encoded)
      expect(result).toBe(original)
    })

    it('throws on invalid base64', () => {
      // Force error by providing invalid base64 that can't be decoded
      // btoa would throw for non-latin1, but atob handles valid base64 only
      expect(() => decodeBase64Csv('!!!invalid!!!')).toThrow('Failed to decode base64')
    })
  })

  // ============================================================
  // parseCsvSheet
  // ============================================================
  describe('parseCsvSheet', () => {
    const simpleCsv = `id,name,value
1,apple,100
2,banana,200
3,cherry,300`

    it('parses simple CSV with string key', () => {
      const result = parseCsvSheet(simpleCsv, 'name')
      expect(Object.keys(result)).toHaveLength(3)
      expect(result['apple']).toEqual({ id: 1, name: 'apple', value: 100 })
      expect(result['banana']).toEqual({ id: 2, name: 'banana', value: 200 })
      expect(result['cherry']).toEqual({ id: 3, name: 'cherry', value: 300 })
    })

    it('parses CSV with numeric key', () => {
      const result = parseCsvSheet(simpleCsv, 'id')
      expect(Object.keys(result)).toHaveLength(3)
      expect(result[1]).toEqual({ id: 1, name: 'apple', value: 100 })
      expect(result[2]).toEqual({ id: 2, name: 'banana', value: 200 })
      expect(result[3]).toEqual({ id: 3, name: 'cherry', value: 300 })
    })

    it('parses CSV with quoted values', () => {
      const csv = `id,desc
1,"hello, world"
2,"he said ""hi"""`

      const result = parseCsvSheet(csv, 'id')
      expect(result[1]?.desc).toBe('hello, world')
      expect(result[2]?.desc).toBe('he said "hi"')
    })

    it('skips lines starting with underscore', () => {
      const csv = `id,name
1,apple
_2,skipped
3,cherry`

      const result = parseCsvSheet(csv, 'id')
      expect(Object.keys(result)).toHaveLength(2)
      expect(result[1]).toBeDefined()
      expect(result[3]).toBeDefined()
      expect(result[2]).toBeUndefined()
    })

    it('skips empty lines', () => {
      const csv = `id,name
1,apple

2,banana
`

      const result = parseCsvSheet(csv, 'id')
      expect(Object.keys(result)).toHaveLength(2)
    })

    it('returns empty object for empty CSV', () => {
      const result = parseCsvSheet('', 'id')
      expect(result).toEqual({})
    })

    it('returns empty object when key column not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = parseCsvSheet(simpleCsv, 'nonexistent')
      expect(result).toEqual({})
      consoleSpy.mockRestore()
    })

    it('skips rows with empty key value', () => {
      const csv = `id,name
1,apple
,empty
3,cherry`

      const result = parseCsvSheet(csv, 'id')
      expect(Object.keys(result)).toHaveLength(2)
    })

    it('handles unique keys (CostumeStatSheet pattern)', () => {
      const csv = `id,costume_id,stat_type,stat
1,40100000,ATK,1829
2,40100000,DEF,1205
3,40100001,HIT,3009`

      const result = parseCsvSheet(csv, 'costume_id', { unique: true })
      // Keys use 0-based index from PapaParse: "40100000_0", "40100000_1", "40100001_2"
      expect(Object.keys(result)).toHaveLength(3)
      expect(result['40100000_0']).toBeDefined()
      expect(result['40100000_1']).toBeDefined()
      expect(result['40100001_2']).toBeDefined()
    })

    it('matches key column case-insensitively', () => {
      const csv = `ID,name,value
1,apple,100
2,banana,200`

      // Config uses lowercase 'id' but CSV has uppercase 'ID'
      const result = parseCsvSheet(csv, 'id')
      expect(Object.keys(result)).toHaveLength(2)
      expect(result[1]).toEqual({ ID: 1, name: 'apple', value: 100 })
    })

    it('converts numeric strings to numbers', () => {
      const csv = `key,value
1,100
2,200.5`

      const result = parseCsvSheet(csv, 'key')
      expect(result[1]?.value).toBe(100)
      expect(result[2]?.value).toBe(200.5)
    })

    it('handles GameConfigSheet pattern (key-value)', () => {
      const csv = `key,value
hourglass_per_block,3
action_point_max,120`

      const result = parseCsvSheet(csv, 'key')
      expect(result['hourglass_per_block']?.value).toBe(3)
      expect(result['action_point_max']?.value).toBe(120)
    })

    it('handles multi-column CSV with mixed types', () => {
      const csv = `start_block_index,id,round,arena_type,end_block_index
4440401,1,2,Season,4541200
4541201,1,3,OffSeason,4591600`

      const result = parseCsvSheet(csv, 'start_block_index')
      expect(result[4440401]).toBeDefined()
      expect(result[4440401]?.round).toBe(2)
      expect(result[4440401]?.arena_type).toBe('Season')
    })
  })

  // ============================================================
  // getCsvHeaders
  // ============================================================
  describe('getCsvHeaders', () => {
    it('extracts headers from CSV string', () => {
      const csv = 'id,name,value\n1,apple,100'
      const headers = getCsvHeaders(csv)
      expect(headers).toEqual(['id', 'name', 'value'])
    })

    it('returns empty array for empty string', () => {
      const headers = getCsvHeaders('')
      expect(headers).toEqual([])
    })
  })

  // ============================================================
  // validateCsvData
  // ============================================================
  describe('validateCsvData', () => {
    it('returns true for valid data', () => {
      const data = { 1: { id: 1, name: 'test' } }
      expect(validateCsvData(data)).toBe(true)
    })

    it('returns false for empty object', () => {
      expect(validateCsvData({})).toBe(false)
    })

    it('returns false for null', () => {
      expect(validateCsvData(null as any)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(validateCsvData(undefined as any)).toBe(false)
    })

    it('returns false for row with no properties', () => {
      expect(validateCsvData({ 1: {} as any })).toBe(false)
    })
  })
})
