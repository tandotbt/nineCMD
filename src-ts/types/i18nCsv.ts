/**
 * i18n CSV Types – Type definitions for displaying multilingual item/skill names + Banner
 *
 * Purpose: When user switches language (vi/en/ko/ja), components use 2 CSV files
 * (item_name.csv, skill_name.csv) from GitHub `planetarium/NineChronicles` to display
 * item and skill names in the corresponding language.
 *
 * This file contains ONLY TYPE DEFINITIONS, no store. Store has been refactored:
 * - OLD: `stores/i18nCsv.ts` (per-planet cache, watch planet) — REMOVED
 * - NEW: `stores/globalCsv.ts` (GLOBAL pattern, Promise.allSettled, 3 sources)
 *
 * Banner types (`BannerItem`) are also here since they relate to Event.json from NineChronicles.LiveAssets.
 *
 * Ref:
 * - src/utilities/constants.js: V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles
 * - src/stores/configURL.js: urlItemNameSheet, urlSkillNameSheet, getSheet
 * - src-ts/utilities/csvParser.ts: parseCsvSheet (case-insensitive key column 'Key')
 * - src-ts/stores/globalCsv.ts: new store using these types
 */

/**
 * Names of 2 localized sheets from GitHub NineChronicles repo
 * - ItemNameSheet: item names (item_name.csv)
 * - SkillNameSheet: contains skill names (skill_name.csv)
 */
export type LocalizedSheetName = 'ItemNameSheet' | 'SkillNameSheet'

/**
 * A single row in item_name.csv / skill_name.csv
 *
 * Original file structure (from NineChronicles repo):
 * Key,English,Vietnamese,Korean,Japanese,...
 *
 * Key is the item/skill ID (string or number depending on the ID).
 * Locale columns contain translated names.
 */
export interface LocalizedNameRow {
  /** Key ID (string or number) */
  Key: string | number
  /** English name (default fallback) */
  English: string
  /** Vietnamese name */
  Vietnamese: string
  /** Korean name */
  Korean: string
  /** Japanese name */
  Japanese: string
  /** Allows additional locales if CSV is extended */
  [locale: string]: string | number
}

/**
 * Localized sheet data – indexed by Key column
 * Can use string key (for ID like '1001') or number key (for ID like 10110000)
 */
export type LocalizedSheetData = Record<string | number, LocalizedNameRow>

/**
 * Per-planet cache – stores data for both sheets (ItemName + SkillName) for 1 planet
 */
export interface LocalizedSheetsPair {
  ItemNameSheet: LocalizedSheetData
  SkillNameSheet: LocalizedSheetData
}

/** Planet name type — re-exported from utilities/constants for convenience */
import type { PlanetName } from '@/utilities/constants'
export type { PlanetName }

/**
 * Banner data from Event.json (NineChronicles.LiveAssets)
 *
 * Original file structure:
 * {
 *   "Banners": [
 *     { "BannerImageName": "...", "BeginDateTime": "...", "EndDateTime": "...", ... }
 *   ]
 * }
 */
export interface BannerItem {
  /** Image file name (without extension) – used to build URL */
  BannerImageName: string
  /** Display start time (ISO 8601 string), null = no limit */
  BeginDateTime: string | null
  /** Display end time (ISO 8601 string), null = no limit */
  EndDateTime: string | null
  /** Original URL from GitHub (resolved from BannerImageName) */
  BannerImageUrl: string
  /** Banner description (optional, depends on Event.json) */
  Description?: string
  /** URL click target - opens new tab when banner is clicked (optional) */
  Url?: string
  /** Priority order in carousel (optional) */
  Priority?: number
  /** Allows additional fields depending on Event.json */
  [key: string]: unknown
}

/**
 * RemoteCsv row - standard CSV schema, not i18n
 * Used for NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv
 */
export type RemoteCsvRow = Record<string, string | number>

/** RemoteCsv data - keyed by Key column */
export type RemoteCsvData = Record<string | number, RemoteCsvRow>
