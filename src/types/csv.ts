/**
 * @file types/csv.ts
 * @description Type definitions for CSV data handling and storage.
 */

export interface CsvRow {
  [key: string]: string | number | boolean | null
}

export interface CsvSheetData {
  name: string
  headers: string[]
  rows: CsvRow[]
  mappedData: Record<string, CsvRow>
  secondaryIndices?: Record<string, Record<string, CsvRow[]>> // fieldName -> fieldValue -> rows[]
  keyMain: string
}

export interface CsvState {
  // Cache sheets by planet name: Record<planetName, Record<sheetName, CsvSheetData>>
  sheetsByPlanet: Record<string, Record<string, CsvSheetData>>
  isLoading: boolean
  error: string | null
  lastUpdatedByPlanet: Record<string, number | null>
}

export interface CsvParserMessage {
  sheetName: string
  base64Content: string
  keyMain: string
  unique?: boolean
  isRawCsv?: boolean // If true, content is raw string, not base64
  indexFields?: string[] // Fields to create secondary indices for
}

export interface CsvParserResult {
  sheetName: string
  data: CsvSheetData
  error?: string
}
