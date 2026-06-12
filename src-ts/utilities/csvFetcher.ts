/**
 * CSV Fetcher Utility – Fetch CSV data from 9CMD API
 *
 * Build URL, fetch response, decode base64 → raw CSV strings per sheet
 *
 * Ref:
 * - src/utilities/constants.js: LIST_API_NINECMD, API_URL_PROXY
 * - .REF/vue3-tool/src/stores/initializeData.js: fetchSheetDataFrom9CMDAPI()
 * - .REF/python-tool/constants.py: build_csv_url()
 */

import type { CsvSheetName } from '../types/csvData'
import { CSV_ENDPOINT_PATH } from './constants'

// ============================================================
// Types
// ============================================================

/** Response from 9CMD API getGraphqlCSV */
interface CsvApiResponse {
  status: string
  message?: string
  data?: Record<string, string> // sheetName → base64CsvString
}

// ============================================================
// Core Functions
// ============================================================

/**
 * Build URL for getGraphqlCSV endpoint
 *
 * Ref: .REF/python-tool/constants.py: build_csv_url()
 *   return f"{base_url}/getGraphqlCSV?network={network}&{csv_params}&encodeAsBase64={base64_param}"
 *
 * @param apiBase API base URL (e.g. "https://api-nf.9cmd.top")
 * @param sheetNames Danh sách sheet names cần fetch
 * @param network Planet name: "odin" | "heimdall" | "thor"
 * @returns Complete URL string
 */
export function buildCsvFetchUrl(
  apiBase: string,
  sheetNames: CsvSheetName[],
  network: string
): string {
  const csvParams = sheetNames.map((name) => `csv=${encodeURIComponent(name)}`).join('&')
  return `${apiBase}${CSV_ENDPOINT_PATH}?network=${encodeURIComponent(network)}&${csvParams}&encodeAsBase64=true`
}

/**
 * Fetch raw CSV base64 strings from an API URL
 *
 * Ref: .REF/vue3-tool/src/stores/initializeData.js: fetchSheetDataFrom9CMDAPI()
 * - GET request to /getGraphqlCSV
 * - Response: { status: "success", data: { sheetName: base64String, ... } }
 *
 * @param apiUrl Full API URL (already built)
 * @param sheetNames List of sheet names (for response validation)
 * @returns Record<sheetName, base64CsvString>
 * @throws Error if fetch fails or status !== "success"
 */
export async function fetchCsvFromApi(
  apiUrl: string,
  sheetNames: CsvSheetName[]
): Promise<Record<CsvSheetName, string>> {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const json: CsvApiResponse = await response.json()

  if (json.status !== 'success') {
    throw new Error(json.message || `API returned status: ${json.status}`)
  }

  if (!json.data || typeof json.data !== 'object') {
    throw new Error('API response missing data field')
  }

  // Validate all requested sheets are present
  const result = {} as Record<CsvSheetName, string>
  const missingSheets: CsvSheetName[] = []

  for (const name of sheetNames) {
    if (json.data[name] && typeof json.data[name] === 'string') {
      result[name] = json.data[name]
    } else {
      missingSheets.push(name)
    }
  }

  if (missingSheets.length > 0) {
    throw new Error(`Missing sheets in response: ${missingSheets.join(', ')}`)
  }

  return result
}

/**
 * Fetch raw CSV text from GitHub raw URL.
 * Used for ItemNameSheet, SkillNameSheet (from repo planetarium/NineChronicles).
 *
 * Note: URL may contain hash `#${planet}` at the end for browser cache busting
 * when switching planets. Hash does not affect network requests,
 * browser treats it as a fragment identifier and won't cross-cache planets.
 *
 * @param url Full URL to .csv file on raw.githubusercontent.com
 * @returns Raw CSV string (UTF-8)
 * @throws Error if HTTP not ok
 *
 * @example
 *   const csv = await fetchGitHubCsv(
 *     'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/StreamingAssets/Localization/item_name.csv#odin'
 *   )
 */
export async function fetchGitHubCsv(url: string): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/csv; charset=utf-8'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub CSV HTTP ${response.status}: ${response.statusText}`)
  }

  return response.text()
}
