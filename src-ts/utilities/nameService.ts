/**
 * Name Service – Fetch + parse localized CSV (ItemName + SkillName) from GitHub
 *
 * Purpose: Get multilingual item + skill name data from repo
 * `planetarium/NineChronicles` (file item_name.csv, skill_name.csv).
 *
 * Pattern similar to csvFetcher (9CMD API) but source is GitHub raw URL.
 *
 * Ref:
 * - src/utilities/constants.js: V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles
 * - src/stores/configURL.js: urlItemNameSheet, urlSkillNameSheet (legacy logic)
 * - src-ts/utilities/csvParser.ts: parseCsvSheet (case-insensitive key column)
 */

import type { LocalizedSheetName, LocalizedSheetData, RemoteCsvData } from '../types/i18nCsv'
import { type PlanetName } from './constants'
import { fetchGitHubCsv } from './csvFetcher'
import { parseCsvSheet } from './csvParser'
import {
  LOCALIZED_CSV_PATHS,
  LOCALIZED_CSV_KEY_COLUMN,
  REMOTE_CSV_KEY_COLUMN,
  REMOTE_CSV_URL,
  URL_GITHUB_NineChronicles
} from './constants'

// ============================================================
// URL Building
// ============================================================

/**
 * Build URL for a localized CSV sheet, with cache busting hash per planet.
 *
 * Pattern: `{base}{path}#{planet}`
 * - base: `https://raw.githubusercontent.com/planetarium/NineChronicles/development`
 * - path: `/nekoyume/Assets/StreamingAssets/Localization/item_name.csv`
 * - hash: `#${planet}` → bust cache when switching planet
 *
 * @param sheetName 'ItemNameSheet' | 'SkillNameSheet'
 * @param planet Planet name: 'odin' | 'heimdall' | 'thor'
 * @returns Full URL string
 *
 * @example
 *   buildLocalizedCsvUrl('ItemNameSheet', 'odin')
 *   // => 'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/StreamingAssets/Localization/item_name.csv#odin'
 */
export function buildLocalizedCsvUrl(
  sheetName: LocalizedSheetName,
  planet: PlanetName
): string {
  const path = LOCALIZED_CSV_PATHS[sheetName]
  return `${URL_GITHUB_NineChronicles}${path}#${planet}`
}

// ============================================================
// Fetch + Parse
// ============================================================

/**
 * Fetch + parse 1 localized CSV sheet.
 *
 * @param sheetName 'ItemNameSheet' | 'SkillNameSheet'
 * @param planet Planet name
 * @returns LocalizedSheetData (keyed by Key column)
 * @throws Error if fetch or parse fails
 */
export async function fetchLocalizedSheet(
  sheetName: LocalizedSheetName,
  planet: PlanetName
): Promise<LocalizedSheetData> {
  const url = buildLocalizedCsvUrl(sheetName, planet)
  const csvText = await fetchGitHubCsv(url)

  // parseCsvSheet supports case-insensitive key column matching
  // (CSV has 'Key' capitalized, config uses 'Key' → matches)
  return parseCsvSheet(csvText, LOCALIZED_CSV_KEY_COLUMN) as LocalizedSheetData
}

/**
 * Fetch both localized sheets in parallel (ItemName + SkillName) for a planet.
 * Uses Promise.all for parallel fetch → faster than sequential.
 *
 * @param planet Planet name
 * @returns Object containing both sheet data
 * @throws Error if either fails (Promise.all rejects on first error)
 */
export async function fetchAllLocalizedSheets(
  planet: PlanetName
): Promise<{
  ItemNameSheet: LocalizedSheetData
  SkillNameSheet: LocalizedSheetData
}> {
  const [itemName, skillName] = await Promise.all([
    fetchLocalizedSheet('ItemNameSheet', planet),
    fetchLocalizedSheet('SkillNameSheet', planet)
  ])
  return { ItemNameSheet: itemName, SkillNameSheet: skillName }
}

// ============================================================
// RemoteCsv (global - planet-independent)
// ============================================================

/**
 * Fetch + parse RemoteCsv (NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv).
 * This is a global CSV, planet-independent - load once is sufficient.
 *
 * @returns RemoteCsvData (keyed by Key column)
 * @throws Error if fetch fails
 */
export async function fetchRemoteCsv(): Promise<RemoteCsvData> {
  const csvText = await fetchGitHubCsv(REMOTE_CSV_URL)
  return parseCsvSheet(csvText, REMOTE_CSV_KEY_COLUMN) as RemoteCsvData
}

// ============================================================
// Getters (helper for store / component)
// ============================================================

/**
 * Get localized name from a parsed row.
 * Fallback chain: localeColumn → English → Key
 *
 * @param row LocalizedNameRow (or undefined if key doesn't exist)
 * @param localeColumn Locale column name: 'English' | 'Vietnamese' | 'Korean' | 'Japanese'
 * @param fallbackKey Key to fallback to if row has no locale value
 * @returns Localized name, or fallbackKey if not found
 */
export function getLocalizedName(
  row: LocalizedSheetData[string] | undefined,
  localeColumn: string,
  fallbackKey: string | number
): string {
  if (!row) return String(fallbackKey)

  // Prefer the requested locale column
  const value = row[localeColumn]
  if (value !== undefined && value !== null && value !== '') {
    return String(value)
  }

  // Fallback to English
  const english = row['English']
  if (english !== undefined && english !== null && english !== '') {
    return String(english)
  }

  // Finally, return the key
  return String(fallbackKey)
}
