/**
 * @file workers/csv-parser.worker.ts
 * @description Web Worker for parsing CSV data using PapaParse.
 */

import Papa, { type ParseResult } from 'papaparse'
import type { CsvParserMessage, CsvParserResult, CsvRow } from '../types/csv'

self.onmessage = (event: MessageEvent<CsvParserMessage>) => {
  const { sheetName, base64Content, keyMain, unique, isRawCsv } = event.data

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

        rows.forEach((row, index) => {
          const keyValue = row[keyMain]
          if (keyValue !== undefined && keyValue !== null && keyValue !== '') {
            const key = unique ? `${keyValue}_${index}` : String(keyValue)
            mappedData[key] = row
          }
        })

        const result: CsvParserResult = {
          sheetName,
          data: {
            name: sheetName,
            headers,
            rows,
            mappedData,
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
