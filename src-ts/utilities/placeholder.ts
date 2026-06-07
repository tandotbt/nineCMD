/**
 * Placeholder Utilities – Stub cho các hàm JS cũ chưa được refactor
 *
 * Mục đích: Giữ chỗ (placeholder) cho các hàm liên quan URL `/planetarium/`
 * mà CHƯA được implement trong giai đoạn này. Khi nào cần dùng sẽ refactor sau.
 *
 * Các hàm này CHỈ trả về giá trị mặc định + log warning, KHÔNG fetch / parse.
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
 * STUB – Lấy DCC ID từ avatar address.
 *
 * Trong code cũ: fetch từ 9CMD API + cache localStorage.
 * Hiện tại: trả về 0 (placeholder).
 *
 * @param _avatarAddress Avatar address (chưa dùng)
 * @returns DCC ID (luôn là 0)
 */
export function getListDCCFromCacheOrFetch(_avatarAddress: string): number {
  logger.warn('[placeholder] getListDCCFromCacheOrFetch – not implemented, returning 0')
  return 0
}

// ============================================================
// getListGuildFromCacheOrFetch (stub)
// ============================================================

/**
 * STUB – Lấy tên guild từ avatar address.
 *
 * Trong code cũ: fetch từ Guild API qua 9CMD proxy + cache.
 * Hiện tại: trả về chuỗi rỗng (placeholder).
 *
 * @param _avatarAddress Avatar address (chưa dùng)
 * @returns Tên guild (luôn là '')
 */
export function getListGuildFromCacheOrFetch(_avatarAddress: string): string {
  logger.warn('[placeholder] getListGuildFromCacheOrFetch – not implemented, returning ""')
  return ''
}

// ============================================================
// getPortraitId (stub)
// ============================================================

/**
 * STUB – Lấy portrait ID cho avatar.
 *
 * Trong code cũ: lookup trong dataPortraitId (merge arena) + fallback dataFromRest9cscan.
 * Hiện tại: trả về default 10200000.
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
 * STUB – Lấy danh sách equipment + rune từ 9cscan cho avatar.
 *
 * Trong code cũ: fetch từ 9cscan REST API.
 * Hiện tại: trả về mảng rỗng (placeholder).
 *
 * @returns Mảng rỗng (luôn là [])
 */
export async function getEquipmentsAndRuneFrom9cscan(): Promise<[]> {
  logger.warn('[placeholder] getEquipmentsAndRuneFrom9cscan – not implemented, returning []')
  return []
}

// ============================================================
// getImageBase64FromCacheOrFetch (stub)
// ============================================================

/**
 * STUB – Cache ảnh base64 từ URL (banner, item icon...).
 *
 * Trong code cũ: dùng useFetch + useBase64 + sessionStorage.
 * Hiện tại: trả về URL gốc (không cache).
 *
 * @param imageUrl URL ảnh gốc
 * @returns imageUrl (không transform)
 */
export function getImageBase64FromCacheOrFetch(imageUrl: string): string {
  logger.warn('[placeholder] getImageBase64FromCacheOrFetch – not implemented, returning URL as-is')
  return imageUrl
}
