/**
 * @file workers/csv-parser.worker.ts
 * @description Web Worker for parsing CSV data using PapaParse.
 */

import Papa, { type ParseResult } from 'papaparse'
import type { CsvParserMessage, CsvParserResult, CsvRow } from '../types/csv'

self.onmessage = (event: MessageEvent<CsvParserMessage>) => {
  const { sheetName, base64Content, keyMain, unique, isRawCsv, indexFields } = event.data

  try {
    // Get CSV string and filter out lines starting with '_'
    const rawContent = isRawCsv ? base64Content : atob(base64Content)
    const csvString = rawContent
      .split('\n')
      .filter((line) => line.trim() !== '' && !line.trim().startsWith('_'))
      .join('\n')

    // Parse CSV using PapaParse
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        const rows = results.data
        const headers = results.meta.fields || []
        const mappedData: Record<string, CsvRow> = {}
        const secondaryIndices: Record<string, Record<string, CsvRow[]>> = {}

        // Initialize indices
        const fields = indexFields || []
        fields.forEach((field) => {
          secondaryIndices[field] = {}
        })

        rows.forEach((row, index) => {
          const keyValue = row[keyMain]
          if (keyValue !== undefined && keyValue !== null && keyValue !== '') {
            const key = unique ? `${keyValue}_${index}` : String(keyValue)
            mappedData[key] = row
          }

          // Build secondary indices
          fields.forEach((field) => {
            const val = String(row[field] ?? '')
            if (val !== '') {
              const indexMap = secondaryIndices[field]
              if (indexMap) {
                if (!indexMap[val]) {
                  indexMap[val] = []
                }
                indexMap[val].push(row)
              }
            }
          })
        })

        const result: CsvParserResult = {
          sheetName,
          data: {
            name: sheetName,
            headers,
            rows,
            mappedData,
            secondaryIndices: indexFields ? secondaryIndices : undefined,
            keyMain,
          },
        }

        self.postMessage(result)
      },
      error: (error: Error) => {
        self.postMessage({
          sheetName,
          error: error.message,
        })
      },
    })
  } catch (err) {
    self.postMessage({
      sheetName,
      error: err instanceof Error ? err.message : 'Unknown error during Base64 decoding',
    })
  }
}
