/**
 * CSV Parser Utility – Parse CSV data from 9CMD API
 *
 * Uses PapaParse instead of custom parser for better CSV handling:
 * - Correct quoted fields, escape characters
 * - Multi-line fields
 * - Automatic type detection
 *
 * Ref:
 * - .REF/vue3-tool/src/stores/initializeData.js: parseCsvSheet() (line 60-150)
 * - PapaParse 5.5.3 (already in dependencies)
 */

import Papa from 'papaparse'
import type { CsvRow, CsvSheetData } from '../types/csvData'

// ============================================================
// Core Functions
// ============================================================

/**
 * Decode base64 string → UTF-8 string
 * Used for 9CMD API response with encodeAsBase64=true
 *
 * Ref: .REF/vue3-tool/src/stores/initializeData.js line 370
 *   const decodedCsvString = atob(base64CsvString)
 */
export function decodeBase64Csv(base64String: string): string {
  try {
    // atob() only handles Latin-1, no direct UTF-8 support
    // Need TextDecoder to decode UTF-8 after atob
    if (typeof atob === 'function') {
      const binaryString = atob(base64String)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return new TextDecoder('utf-8').decode(bytes)
    }
    // Node.js fallback
    return Buffer.from(base64String, 'base64').toString('utf-8')
  } catch (e) {
    throw new Error(`Failed to decode base64: ${e instanceof Error ? e.message : String(e)}`)
  }
}

/**
 * Parse CSV string thành CsvSheetData (keyed by keyColumn)
 *
 * Ref: .REF/vue3-tool/src/stores/initializeData.js: parseCsvSheet()
 * - Skip empty lines and lines starting with '_'
 * - Parse numbers if possible
 * - If unique=true → key = `${value}_${rowIndex}`
 *
 * @param csvString Raw CSV string (decoded from base64)
 * @param keyColumn Column name used as primary key
 * @param options { unique: boolean } – if true, key is not unique
 * @returns CsvSheetData – object keyed by keyColumn value
 */
export function parseCsvSheet(
  csvString: string,
  keyColumn: string,
  options?: { unique?: boolean }
): CsvSheetData {
  const unique = options?.unique ?? false

  // Pre-process: filter out empty lines and lines starting with '_'
  // (same behavior as original parseCsvSheet)
  const lines = csvString
    .trim()
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.trim().startsWith('_'))

  if (lines.length === 0) {
    return {}
  }

  // Rejoin filtered lines and parse with PapaParse
  const filteredCsv = lines.join('\n')

  const result = Papa.parse(filteredCsv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false // We handle type conversion ourselves
  })

  if (result.errors.length > 0) {
    console.warn('[csvParser] PapaParse warnings:', result.errors.slice(0, 5))
  }

  // Check if keyColumn exists in headers (case-insensitive)
  const headers = result.meta.fields ?? []
  const keyColumnLower = keyColumn.toLowerCase()
  const actualKeyColumn = headers.find((h) => h.toLowerCase() === keyColumnLower)

  if (!actualKeyColumn) {
    console.warn(`[csvParser] Key column "${keyColumn}" not found in CSV headers:`, headers)
    return {}
  }

  // Build keyed data
  const data: CsvSheetData = {}

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i] as Record<string, string>
    const rawKeyValue = row[actualKeyColumn]

    if (rawKeyValue === undefined || rawKeyValue === null || rawKeyValue === '') {
      continue
    }

    // Parse row values: try to convert numbers
    const parsedRow: CsvRow = {}
    for (const header of headers) {
      parsedRow[header] = tryParseValue(row[header])
    }

    // Determine key
    let keyValue: string | number
    if (unique) {
      keyValue = `${rawKeyValue}_${i}`
    } else {
      keyValue = tryParseValue(rawKeyValue)
    }

    data[keyValue] = parsedRow
  }

  return data
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Try to parse a value to number if possible, otherwise keep as string
 *
 * Ref: .REF/vue3-tool/src/stores/initializeData.js: tryParseInt() (line 100-112)
 */
function tryParseValue(val: string): string | number {
  if (val === '' || val === null || val === undefined) {
    return val ?? ''
  }

  // Remove surrounding quotes if present
  const cleaned = val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val

  // Try integer
  if (/^-?\d+$/.test(cleaned)) {
    const parsed = parseInt(cleaned, 10)
    // Verify: "0123" → 123, but "0" → 0
    if (
      parsed.toString() === cleaned ||
      parsed.toString() === cleaned.replace(/^0+/, '') ||
      cleaned === '0'
    ) {
      return parsed
    }
  }

  // Try float
  if (/^-?\d+\.\d+$/.test(cleaned)) {
    const parsed = parseFloat(cleaned)
    if (!isNaN(parsed)) {
      return parsed
    }
  }

  return cleaned
}

/**
 * Get headers from a CSV string (first line)
 */
export function getCsvHeaders(csvString: string): string[] {
  const firstLine = csvString.trim().split('\n')[0]
  if (!firstLine) return []

  const result = Papa.parse(firstLine, { header: true })
  return result.meta.fields ?? []
}

/**
 * Validate that parsed data is not empty and has expected structure
 */
export function validateCsvData(data: CsvSheetData): boolean {
  if (!data || typeof data !== 'object') return false
  const keys = Object.keys(data)
  if (keys.length === 0) return false
  // Check first row has at least 1 property
  const firstRow = data[keys[0]]
  if (!firstRow || typeof firstRow !== 'object') return false
  return Object.keys(firstRow).length > 0
}
