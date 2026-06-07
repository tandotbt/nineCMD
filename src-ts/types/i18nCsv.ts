/**
 * i18n CSV Types – Kiểu dữ liệu cho việc hiển thị tên vật phẩm / skill đa ngôn ngữ + Banner
 *
 * Mục đích: Khi user chuyển ngôn ngữ (vi/en/ko/ja), các component sẽ dùng 2 CSV
 * (item_name.csv, skill_name.csv) từ GitHub `planetarium/NineChronicles` để hiển thị
 * tên vật phẩm và skill theo ngôn ngữ tương ứng.
 *
 * File này CHỈ chứa TYPE DEFINITIONS, không có store. Store đã được refactor:
 * - CŨ: `stores/i18nCsv.ts` (per-planet cache, watch planet) — ĐÃ XÓA
 * - MỚI: `stores/globalCsv.ts` (GLOBAL pattern, Promise.allSettled, 3 nguồn)
 *
 * Banner types (`BannerItem`) cũng ở đây vì liên quan đến Event.json từ NineChronicles.LiveAssets.
 *
 * Ref:
 * - src/utilities/constants.js: V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles
 * - src/stores/configURL.js: urlItemNameSheet, urlSkillNameSheet, getSheet
 * - src-ts/utilities/csvParser.ts: parseCsvSheet (case-insensitive key column 'Key')
 * - src-ts/stores/globalCsv.ts: store mới dùng các type này
 */

/**
 * Tên 2 localized sheets từ GitHub NineChronicles repo
 * - ItemNameSheet: chứa tên vật phẩm (item_name.csv)
 * - SkillNameSheet: chứa tên skill (skill_name.csv)
 */
export type LocalizedSheetName = 'ItemNameSheet' | 'SkillNameSheet'

/**
 * Một dòng trong item_name.csv / skill_name.csv
 *
 * Cấu trúc file gốc (theo repo NineChronicles):
 * Key,English,Vietnamese,Korean,Japanese,...
 *
 * Key là ID của vật phẩm / skill (string hoặc number tuỳ theo ID).
 * Các cột locale chứa tên đã dịch.
 */
export interface LocalizedNameRow {
  /** Key ID (string hoặc number) */
  Key: string | number
  /** Tên Tiếng Anh (mặc định fallback) */
  English: string
  /** Tên Tiếng Việt */
  Vietnamese: string
  /** Tên Tiếng Hàn */
  Korean: string
  /** Tên Tiếng Nhật */
  Japanese: string
  /** Cho phép thêm locale khác nếu CSV mở rộng */
  [locale: string]: string | number
}

/**
 * Dữ liệu 1 localized sheet – được index theo Key column
 * Có thể dùng string key (cho ID kiểu '1001') hoặc number key (cho ID kiểu 10110000)
 */
export type LocalizedSheetData = Record<string | number, LocalizedNameRow>

/**
 * Cache theo planet – lưu data của cả 2 sheet (ItemName + SkillName) cho 1 planet
 */
export interface LocalizedSheetsPair {
  ItemNameSheet: LocalizedSheetData
  SkillNameSheet: LocalizedSheetData
}

/** Planet name type — re-export từ utilities/constants để tiện dùng */
import type { PlanetName } from '../utilities/constants'
export type { PlanetName }

/**
 * Banner data từ Event.json (NineChronicles.LiveAssets)
 *
 * Cấu trúc file gốc:
 * {
 *   "Banners": [
 *     { "BannerImageName": "...", "BeginDateTime": "...", "EndDateTime": "...", ... }
 *   ]
 * }
 */
export interface BannerItem {
  /** Tên file ảnh (không có extension) – dùng để build URL */
  BannerImageName: string
  /** Thời gian bắt đầu hiển thị (ISO 8601 string), null = không giới hạn */
  BeginDateTime: string | null
  /** Thời gian kết thúc hiển thị (ISO 8601 string), null = không giới hạn */
  EndDateTime: string | null
  /** URL gốc từ GitHub (đã resolve từ BannerImageName) */
  BannerImageUrl: string
  /** Mô tả banner (optional, tuỳ theo Event.json) */
  Description?: string
  /** URL click target - mở tab mới khi click banner (optional) */
  Url?: string
  /** Thứ tự ưu tiên trong carousel (optional) */
  Priority?: number
  /** Cho phép thêm field khác tuỳ theo Event.json */
  [key: string]: unknown
}

/**
 * RemoteCsv row - schema chuẩn CSV, không phải i18n
 * Dùng cho NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv
 */
export type RemoteCsvRow = Record<string, string | number>

/** RemoteCsv data - keyed by Key column */
export type RemoteCsvData = Record<string | number, RemoteCsvRow>
