/**
 * Name Service – Fetch + parse localized CSV (ItemName + SkillName) từ GitHub
 *
 * Mục đích: Lấy dữ liệu tên vật phẩm + skill đa ngôn ngữ từ repo
 * `planetarium/NineChronicles` (file item_name.csv, skill_name.csv).
 *
 * Pattern tương tự csvFetcher (9CMD API) nhưng source là GitHub raw URL.
 *
 * Ref:
 * - src/utilities/constants.js: V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles
 * - src/stores/configURL.js: urlItemNameSheet, urlSkillNameSheet (logic cũ)
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
 * Build URL cho 1 localized CSV sheet, có cache busting hash theo planet.
 *
 * Pattern: `{base}{path}#{planet}`
 * - base: `https://raw.githubusercontent.com/planetarium/NineChronicles/development`
 * - path: `/nekoyume/Assets/StreamingAssets/Localization/item_name.csv`
 * - hash: `#${planet}` → bust cache khi switch planet
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
 * @throws Error nếu fetch fail hoặc parse fail
 */
export async function fetchLocalizedSheet(
  sheetName: LocalizedSheetName,
  planet: PlanetName
): Promise<LocalizedSheetData> {
  const url = buildLocalizedCsvUrl(sheetName, planet)
  const csvText = await fetchGitHubCsv(url)

  // parseCsvSheet đã hỗ trợ case-insensitive key column matching
  // (CSV có 'Key' viết hoa nhưng config dùng 'Key' → khớp)
  return parseCsvSheet(csvText, LOCALIZED_CSV_KEY_COLUMN) as LocalizedSheetData
}

/**
 * Fetch cả 2 localized sheets song song (ItemName + SkillName) cho 1 planet.
 * Dùng Promise.all để parallel fetch → nhanh hơn sequential.
 *
 * @param planet Planet name
 * @returns Object chứa 2 sheet data
 * @throws Error nếu 1 trong 2 fail (Promise.all reject ngay khi gặp lỗi đầu tiên)
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
// RemoteCsv (global - không phụ thuộc planet)
// ============================================================

/**
 * Fetch + parse RemoteCsv (NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv).
 * Đây là CSV global, không phụ thuộc planet - load 1 lần là đủ.
 *
 * @returns RemoteCsvData (keyed by Key column)
 * @throws Error nếu fetch fail
 */
export async function fetchRemoteCsv(): Promise<RemoteCsvData> {
  const csvText = await fetchGitHubCsv(REMOTE_CSV_URL)
  return parseCsvSheet(csvText, REMOTE_CSV_KEY_COLUMN) as RemoteCsvData
}

// ============================================================
// Getters (helper cho store / component)
// ============================================================

/**
 * Lấy tên theo locale từ 1 row đã parse.
 * Có fallback chain: localeColumn → English → Key
 *
 * @param row LocalizedNameRow (hoặc undefined nếu key không tồn tại)
 * @param localeColumn Tên cột locale: 'English' | 'Vietnamese' | 'Korean' | 'Japanese'
 * @param fallbackKey Key để fallback nếu row không có giá trị locale
 * @returns Tên đã localize, hoặc fallbackKey nếu không tìm thấy
 */
export function getLocalizedName(
  row: LocalizedSheetData[string] | undefined,
  localeColumn: string,
  fallbackKey: string | number
): string {
  if (!row) return String(fallbackKey)

  // Ưu tiên locale column được yêu cầu
  const value = row[localeColumn]
  if (value !== undefined && value !== null && value !== '') {
    return String(value)
  }

  // Fallback về English
  const english = row['English']
  if (english !== undefined && english !== null && english !== '') {
    return String(english)
  }

  // Cuối cùng mới trả về key
  return String(fallbackKey)
}
