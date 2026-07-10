/**
 * CSV Data Types – Type definitions for receiving and processing CSV from 9CMD API
 *
 * Ref:
 * - .REF/vue3-tool/src/stores/initializeData.js: parseCsvSheet()
 * - .REF/vue3-tool/src/components/initializeData.vue: graphQlSheetConfig
 * - .REF/python-tool/constants.py: CSV_SHEET_NAMES
 */

// ============================================================
// Sheet Name Union Type (21 sheets, excluding ArenaSheet)
// ============================================================

export type CsvSheetName =
  | 'GameConfigSheet'
  | 'ItemRequirementSheet'
  | 'CostumeStatSheet'
  | 'RuneListSheet'
  | 'RuneSheet'
  | 'CostumeItemSheet'
  | 'WorldUnlockSheet'
  | 'WorldSheet'
  | 'PatrolRewardSheet'
  | 'EquipmentItemRecipeSheet'
  | 'SummonSheet'
  | 'ClaimableGiftsSheet'
  | 'EventScheduleSheet'
  | 'WorldBossListSheet'
  | 'EquipmentItemSubRecipeSheetV2'
  | 'CrystalHammerPointSheet'
  | 'StageSheet'
  | 'CharacterLevelSheet'
  | 'CrystalMaterialCostSheet'
  | 'ConsumableItemSheet'
  | 'ConsumableItemRecipeSheet'

// ============================================================
// Row & Sheet Data Types
// ============================================================

/** A single CSV row – values can be string or number (after parsing) */
export type CsvRow = Record<string, string | number>

/** Single sheet data – keyed by keyColumn value */
export type CsvSheetData = Record<string | number, CsvRow>

/** Metadata for a sheet: key column, unique flag, description */
export interface CsvSheetMeta {
  /** Column name used as primary key */
  keyColumn: string
  /** If true, key is not unique → use `${key}_${rowIndex}` */
  unique?: boolean
  /** Short description */
  description?: string
}

// ============================================================
// Store State Types
// ============================================================

/** All sheets data keyed by sheet name */
export type AllSheetsData = Partial<Record<CsvSheetName, CsvSheetData>>

/** Persisted data in localStorage */
export interface CsvPersistedData {
  /** Planet name when data was fetched */
  planet?: string
  /** Last fetch timestamp */
  lastFetchTime?: number
  /** JSON serialized sheets */
  sheetsJson?: string
}
