/**
 * Placeholder Utilities – Stubs for legacy JS functions not yet refactored
 *
 * Purpose: Placeholder for functions related to `/planetarium/` URLs
 * that have NOT been implemented in this phase. Will be refactored later.
 *
 * These functions only return default values + log warning, NO fetch / parse.
 *
 * Ref:
 * - src/utilities/getListDCCFromCacheOrFetch.js
 * - src/utilities/getListGuildFromCacheOrFetch.js
 * - src/utilities/getPortraitId.js
 * - src/utilities/getEquipmentsAndRuneFrom9cscan.js
 * - src/utilities/getImageBase64FromCacheOrFetch.js
 */

import { createLogger } from './logger'

const logger = createLogger({ module: 'placeholder' })

// ============================================================
// getListDCCFromCacheOrFetch (stub)
// ============================================================

/**
 * STUB – Get DCC ID from avatar address.
 *
 * Legacy code: fetch from 9CMD API + localStorage cache.
 * Currently: returns 0 (placeholder).
 *
 * @param _avatarAddress Avatar address (unused)
 * @returns DCC ID (always 0)
 */
export function getListDCCFromCacheOrFetch(_avatarAddress: string): number {
  logger.warn('[placeholder] getListDCCFromCacheOrFetch – not implemented, returning 0')
  return 0
}

// ============================================================
// getListGuildFromCacheOrFetch (stub)
// ============================================================

/**
 * STUB – Get guild name from avatar address.
 *
 * Legacy code: fetch from Guild API via 9CMD proxy + cache.
 * Currently: returns empty string (placeholder).
 *
 * @param _avatarAddress Avatar address (unused)
 * @returns Guild name (always '')
 */
export function getListGuildFromCacheOrFetch(_avatarAddress: string): string {
  logger.warn('[placeholder] getListGuildFromCacheOrFetch – not implemented, returning ""')
  return ''
}

// ============================================================
// getPortraitId (stub)
// ============================================================

/**
 * STUB – Get portrait ID for avatar.
 *
 * Legacy code: lookup in dataPortraitId (merge arena) + fallback dataFromRest9cscan.
 * Currently: returns default 10200000.
 *
 * @returns Portrait ID mặc định (10200000)
 */
export function getPortraitId(): number {
  logger.warn('[placeholder] getPortraitId – not implemented, returning 10200000')
  return 10200000
}

// ============================================================
// getEquipmentsAndRuneFrom9cscan (stub)
// ============================================================

/**
 * STUB – Get equipment + rune list from 9cscan for avatar.
 *
 * Legacy code: fetch from 9cscan REST API.
 * Currently: returns empty array (placeholder).
 *
 * @returns Empty array (always [])
 */
export async function getEquipmentsAndRuneFrom9cscan(): Promise<[]> {
  logger.warn('[placeholder] getEquipmentsAndRuneFrom9cscan – not implemented, returning []')
  return []
}

// ============================================================
// getImageBase64FromCacheOrFetch (stub)
// ============================================================

/**
 * STUB – Cache base64 image from URL (banner, item icon...).
 *
 * Legacy code: used useFetch + useBase64 + sessionStorage.
 * Currently: returns original URL (no caching).
 *
 * @param imageUrl Original image URL
 * @returns imageUrl (no transform)
 */
export function getImageBase64FromCacheOrFetch(imageUrl: string): string {
  logger.warn('[placeholder] getImageBase64FromCacheOrFetch – not implemented, returning URL as-is')
  return imageUrl
}
