/**
 * Banner Service – Fetch + parse + filter banner list từ GitHub Event.json
 *
 * Mục đích: Lấy danh sách banner đang active từ repo `planetarium/NineChronicles.LiveAssets`.
 * Mỗi banner có ảnh + thời gian hiển thị (BeginDateTime / EndDateTime).
 * Banner hết hạn sẽ bị filter bỏ.
 *
 * Ref:
 * - src/utilities/constants.js: LINK_BANNER
 * - src/stores/configURL.js: getBanner(), filter logic
 */

import type { BannerItem } from '../types/i18nCsv'
import { LINK_BANNER, URL_GITHUB_LIVEASSETS } from './constants'

// ============================================================
// Types
// ============================================================

/** Cấu trúc 1 banner trong Event.json (raw, chưa transform) */
interface RawBannerItem {
  BannerImageName: string
  BeginDateTime?: string | null
  EndDateTime?: string | null
  Description?: string
  [key: string]: unknown
}

/** Response shape từ Event.json */
interface EventJsonResponse {
  Banners: RawBannerItem[] | null
}

// ============================================================
// URL Helpers
// ============================================================

/** Folder chứa ảnh banner trong LiveAssets repo */
const BANNER_IMAGE_FOLDER = '/Assets/Images/Banner/'

/** Extension mặc định của file ảnh banner */
const BANNER_IMAGE_EXT = '.png'

/**
 * Build full URL cho 1 banner image từ tên file (không có extension).
 * @param imageName Tên file ảnh (không có extension), ví dụ: 'banner_001'
 * @returns Full URL trên raw.githubusercontent.com
 */
export function buildBannerImageUrl(imageName: string): string {
  return `${URL_GITHUB_LIVEASSETS}${BANNER_IMAGE_FOLDER}${imageName}${BANNER_IMAGE_EXT}`
}

// ============================================================
// Filter Logic
// ============================================================

/**
 * Kiểm tra 1 banner có còn trong thời gian hiển thị không.
 *
 * Quy tắc (mirror src/stores/configURL.js getBanner):
 * - BeginDateTime rỗng + EndDateTime rỗng → luôn hiển thị
 * - BeginDateTime rỗng + EndDateTime có giá trị → chỉ hiển thị nếu EndDateTime > now
 * - BeginDateTime có + EndDateTime rỗng → chỉ hiển thị nếu BeginDateTime <= now
 * - Cả 2 có giá trị → hiển thị nếu BeginDateTime <= now <= EndDateTime
 *
 * @param banner BannerItem đã transform (có BeginDateTime, EndDateTime)
 * @param now Thời điểm hiện tại (Date object, default: new Date())
 * @returns true nếu banner đang active
 */
export function isBannerActive(banner: BannerItem, now: Date = new Date()): boolean {
  const begin = banner.BeginDateTime
  const end = banner.EndDateTime

  // Cả 2 rỗng → luôn active
  if (!begin && !end) return true

  // Chỉ có EndDateTime
  if (!begin && end) {
    return new Date(end) > now
  }

  // Chỉ có BeginDateTime
  if (begin && !end) {
    return new Date(begin) <= now
  }

  // Cả 2 có giá trị
  return new Date(begin!) <= now && new Date(end!) >= now
}

/**
 * Filter danh sách banner, chỉ giữ lại các banner đang active.
 * @param banners Danh sách banner gốc
 * @param now Thời điểm hiện tại (default: new Date())
 * @returns Danh sách banner đã filter
 */
export function filterActiveBanners(
  banners: BannerItem[],
  now: Date = new Date()
): BannerItem[] {
  return banners.filter((b) => isBannerActive(b, now))
}

// ============================================================
// Transform Raw → BannerItem
// ============================================================

/**
 * Transform 1 raw banner từ Event.json thành BannerItem chuẩn hoá.
 * - Thêm BannerImageUrl (resolve từ BannerImageName)
 * - Chuẩn hoá BeginDateTime/EndDateTime về `string | null`
 *
 * @param raw Raw banner từ Event.json
 * @returns BannerItem đã transform
 */
export function transformBannerItem(raw: RawBannerItem): BannerItem {
  return {
    ...raw,
    BannerImageName: raw.BannerImageName,
    BannerImageUrl: buildBannerImageUrl(raw.BannerImageName),
    // Chuẩn hoá: nếu rỗng / undefined → null
    // Dùng || (không phải ??) để bắt cả empty string ''
    BeginDateTime: raw.BeginDateTime || null,
    EndDateTime: raw.EndDateTime || null
  }
}

// ============================================================
// Main Fetch
// ============================================================

/**
 * Fetch + parse + filter banner list từ GitHub Event.json.
 *
 * Flow:
 * 1. GET LINK_BANNER → JSON
 * 2. Extract `Banners` array (nếu null → trả về mảng rỗng)
 * 3. Transform mỗi raw banner → BannerItem (resolve image URL)
 * 4. Filter các banner đang active (theo BeginDateTime/EndDateTime)
 *
 * @returns Danh sách BannerItem đang active
 * @throws Error nếu HTTP không ok
 *
 * @example
 *   const banners = await fetchBanners()
 *   // => [{ BannerImageName: '...', BannerImageUrl: '...', ... }, ...]
 */
export async function fetchBanners(): Promise<BannerItem[]> {
  const response = await fetch(LINK_BANNER, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`Banner HTTP ${response.status}: ${response.statusText}`)
  }

  const json: EventJsonResponse = await response.json()
  const rawBanners = json.Banners ?? []

  // Transform: thêm BannerImageUrl + chuẩn hoá
  const items: BannerItem[] = rawBanners.map(transformBannerItem)

  // Filter: chỉ giữ banner đang active
  return filterActiveBanners(items)
}
