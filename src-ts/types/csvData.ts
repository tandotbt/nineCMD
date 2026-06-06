/**
 * CSV Data Types – Kiểu dữ liệu cho việc nhận và xử lý CSV từ 9CMD API
 *
 * Ref:
 * - .REF/vue3-tool/src/stores/initializeData.js: parseCsvSheet()
 * - .REF/vue3-tool/src/components/initializeData.vue: graphQlSheetConfig
 * - .REF/python-tool/constants.py: CSV_SHEET_NAMES
 */

// ============================================================
// Sheet Name Union Type (21 sheets, bỏ ArenaSheet)
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

/** Một dòng dữ liệu CSV – values có thể là string hoặc number (sau khi parse) */
export type CsvRow = Record<string, string | number>

/** Dữ liệu 1 sheet – keyed by keyColumn value */
export type CsvSheetData = Record<string | number, CsvRow>

/** Metadata cho 1 sheet: key column, unique flag, description */
export interface CsvSheetMeta {
  /** Tên cột dùng làm key chính */
  keyColumn: string
  /** Nếu true, key không unique → dùng `${key}_${rowIndex}` */
  unique?: boolean
  /** Mô tả ngắn */
  description?: string
}

// ============================================================
// Store State Types
// ============================================================

/** All sheets data keyed by sheet name */
export type AllSheetsData = Partial<Record<CsvSheetName, CsvSheetData>>

/** Persisted data trong localStorage */
export interface CsvPersistedData {
  /** Planet name khi data được fetch */
  planet?: string
  /** Timestamp fetch cuối */
  lastFetchTime?: number
  /** JSON serialized sheets */
  sheetsJson?: string
}
