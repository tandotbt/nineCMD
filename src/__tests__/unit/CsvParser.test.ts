import { describe, it, expect, vi } from 'vitest'
import Papa, { type ParseResult as PapaParseResult } from 'papaparse'
import type { CsvRow } from '@/types/csv'

// Mock worker environment
const mockPostMessage = vi.fn()

// polyfill for atob in node
if (typeof (global as unknown as Record<string, unknown>).atob === 'undefined') {
  ;(global as unknown as Record<string, unknown>).atob = (str: string) =>
    Buffer.from(str, 'base64').toString('binary')
}

// polyfill for self in node
if (typeof (global as unknown as Record<string, unknown>).self === 'undefined') {
  ;(global as unknown as Record<string, unknown>).self = { postMessage: mockPostMessage }
}

interface ParseResult {
  data: CsvRow[]
  mapped: Record<string, CsvRow>
  fields: string[] | undefined
}

describe('CSV Parser Worker Logic', () => {
  it('should parse CSV correctly from Base64 string', async () => {
    const csvContent = 'id,name,value\n1,Test 1,100\n2,Test 2,200'
    const base64Content = Buffer.from(csvContent).toString('base64')

    const parse = (content: string, keyMain: string): Promise<ParseResult> => {
      return new Promise((resolve) => {
        const decoded = atob(content)
        Papa.parse(decoded, {
          header: true,
          dynamicTyping: true,
          complete: (results: PapaParseResult<CsvRow>) => {
            const mapped: Record<string, CsvRow> = {}
            const data = results.data
            data.forEach((row) => {
              const key = String(row[keyMain])
              mapped[key] = row
            })
            resolve({ data, mapped, fields: results.meta.fields })
          },
        })
      })
    }

    const result = await parse(base64Content, 'id')

    expect(result.data).toHaveLength(2)
    expect(result.data[0]?.id).toBe(1)
    expect(result.data[0]?.name).toBe('Test 1')
    expect(result.mapped['1']).toBeDefined()
    expect(result.fields).toContain('id')
    expect(result.fields).toContain('name')
  })

  it('should handle unique key generation if requested', async () => {
    const csvContent = 'id,name\n1,First\n1,Second'
    const base64Content = Buffer.from(csvContent).toString('base64')

    const parseWithUnique = (content: string, keyMain: string): Promise<Record<string, CsvRow>> => {
      return new Promise((resolve) => {
        const decoded = atob(content)
        Papa.parse(decoded, {
          header: true,
          complete: (results: PapaParseResult<CsvRow>) => {
            const mapped: Record<string, CsvRow> = {}
            const data = results.data
            data.forEach((row, index) => {
              const key = `${row[keyMain]}_${index}`
              mapped[key] = row
            })
            resolve(mapped)
          },
        })
      })
    }

    const mapped = await parseWithUnique(base64Content, 'id')
    expect(mapped['1_0']).toBeDefined()
    expect(mapped['1_1']).toBeDefined()
    expect(mapped['1_0']?.name).toBe('First')
    expect(mapped['1_1']?.name).toBe('Second')
  })

  it('should filter out lines starting with _', async () => {
    const csvContent = 'id,name\n1,Normal\n_2,Trash\n3,Fine'

    const parseWithFilter = (content: string): Promise<CsvRow[]> => {
      return new Promise((resolve) => {
        const csvString = content
          .split('\n')
          .filter((line) => line.trim() !== '' && !line.trim().startsWith('_'))
          .join('\n')

        Papa.parse(csvString, {
          header: true,
          complete: (results: PapaParseResult<CsvRow>) => {
            resolve(results.data)
          },
        })
      })
    }

    const data = await parseWithFilter(csvContent)
    expect(data).toHaveLength(2)
    expect(data[0]?.id).toBe('1')
    expect(data[1]?.id).toBe('3')
  })
})
