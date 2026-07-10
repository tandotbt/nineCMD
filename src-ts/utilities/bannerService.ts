/**
 * Banner Service – Fetch + parse + filter banner list from GitHub Event.json
 *
 * Purpose: Get active banners from repo `planetarium/NineChronicles.LiveAssets`.
 * Each banner has an image + display time (BeginDateTime / EndDateTime).
 * Expired banners are filtered out.
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

/** Structure of a banner in Event.json (raw, before transform) */
interface RawBannerItem {
  BannerImageName: string
  BeginDateTime?: string | null
  EndDateTime?: string | null
  Description?: string
  [key: string]: unknown
}

/** Response shape from Event.json */
interface EventJsonResponse {
  Banners: RawBannerItem[] | null
}

// ============================================================
// URL Helpers
// ============================================================

/** Folder containing banner images in LiveAssets repo */
const BANNER_IMAGE_FOLDER = '/Assets/Images/Banner/'

/** Default extension for banner image files */
const BANNER_IMAGE_EXT = '.png'

/**
 * Build full URL for a banner image from file name (without extension).
 * @param imageName Image file name (without extension), e.g. 'banner_001'
 * @returns Full URL on raw.githubusercontent.com
 */
export function buildBannerImageUrl(imageName: string): string {
  return `${URL_GITHUB_LIVEASSETS}${BANNER_IMAGE_FOLDER}${imageName}${BANNER_IMAGE_EXT}`
}

// ============================================================
// Filter Logic
// ============================================================

/**
 * Check if a banner is still within its display time.
 *
 * Rules (mirror src/stores/configURL.js getBanner):
 * - BeginDateTime empty + EndDateTime empty → always show
 * - BeginDateTime empty + EndDateTime has value → show only if EndDateTime > now
 * - BeginDateTime has value + EndDateTime empty → show only if BeginDateTime <= now
 * - Both have values → show if BeginDateTime <= now <= EndDateTime
 *
 * @param banner BannerItem with BeginDateTime, EndDateTime
 * @param now Current time (Date object, default: new Date())
 * @returns true if banner is active
 */
export function isBannerActive(banner: BannerItem, now: Date = new Date()): boolean {
  const begin = banner.BeginDateTime
  const end = banner.EndDateTime

  // Both empty → always active
  if (!begin && !end) return true

  // Only EndDateTime present
  if (!begin && end) {
    return new Date(end) > now
  }

  // Only BeginDateTime present
  if (begin && !end) {
    return new Date(begin) <= now
  }

  // Both have values
  return new Date(begin!) <= now && new Date(end!) >= now
}

/**
 * Filter banner list, keeping only active banners.
 * @param banners Original banner list
 * @param now Current time (default: new Date())
 * @returns Filtered banner list
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
 * Transform a raw banner from Event.json into a standardized BannerItem.
 * - Add BannerImageUrl (resolved from BannerImageName)
 * - Normalize BeginDateTime/EndDateTime to `string | null`
 *
 * @param raw Raw banner from Event.json
 * @returns Transformed BannerItem
 */
export function transformBannerItem(raw: RawBannerItem): BannerItem {
  return {
    ...raw,
    BannerImageName: raw.BannerImageName,
    BannerImageUrl: buildBannerImageUrl(raw.BannerImageName),
    // Normalize: empty / undefined → null
    // Use || (not ??) to also catch empty string ''
    BeginDateTime: raw.BeginDateTime || null,
    EndDateTime: raw.EndDateTime || null
  }
}

// ============================================================
// Main Fetch
// ============================================================

/**
 * Fetch + parse + filter banner list from GitHub Event.json.
 *
 * Flow:
 * 1. GET LINK_BANNER → JSON
 * 2. Extract `Banners` array (if null → return empty array)
 * 3. Transform each raw banner → BannerItem (resolve image URL)
 * 4. Filter active banners (by BeginDateTime/EndDateTime)
 *
 * @returns List of active BannerItem
 * @throws Error if HTTP not ok
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

  // Transform: add BannerImageUrl + normalize
  const items: BannerItem[] = rawBanners.map(transformBannerItem)

  // Filter: keep only active banners
  return filterActiveBanners(items)
}
