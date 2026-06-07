/**
 * banner Store – Pinia store quản lý danh sách banner từ Event.json
 *
 * Mục đích: Fetch + filter danh sách banner đang active từ GitHub
 * `planetarium/NineChronicles.LiveAssets/main/Assets/Json/Event.json`.
 *
 * Pattern: GLOBAL (cùng với globalCsv) - load 1 lần lúc preloading
 * - Banner là global, không phụ thuộc planet
 * - Fetch 1 lần khi cần, cache trong memory
 * - Filter theo BeginDateTime/EndDateTime mỗi lần fetch
 * - Lỗi → vẫn set error nhưng KHÔNG retry bắt buộc (kiểu thứ 3 cần loading)
 * - Click banner → mở tab mới với `Url` field
 *
 * Ref:
 * - src/utilities/constants.js: LINK_BANNER
 * - src/stores/configURL.js: getBanner()
 * - src/views/HomeMain.vue: Banner carousel clickable với `Url` field
 * - src-ts/utilities/bannerService.ts: fetchBanners
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BannerItem } from '../types/i18nCsv'
import { fetchBanners } from '../utilities/bannerService'
import { createLogger } from '../utilities/logger'

// ============================================================
// Store
// ============================================================

export const useBannerStore = defineStore('banner', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'banner' })

  // ============================================================
  // State
  // ============================================================

  /** Danh sách banner đang active (sau khi filter theo date) */
  const banners = ref<BannerItem[]>([])

  /** Loading state */
  const isLoading = ref<boolean>(false)

  /** Error message (null = no error) */
  const error = ref<string | null>(null)

  /** Whether data has been successfully loaded at least once */
  const isLoaded = ref<boolean>(false)

  /** Loading status messages (i18n keys) */
  const loadingStatus = ref<string>('')

  /** Timestamp of last successful fetch */
  const lastFetchTime = ref<number>(0)

  // ============================================================
  // Computed
  // ============================================================

  /** Số lượng banner đang active */
  const bannerCount = computed<number>(() => banners.value.length)

  /** Có banner nào không? */
  const hasBanners = computed<boolean>(() => banners.value.length > 0)

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Fetch + parse + filter banner list từ GitHub Event.json.
   *
   * @returns true nếu thành công
   */
  async function loadBanners(): Promise<boolean> {
    isLoading.value = true
    error.value = null
    loadingStatus.value = 'firstLoading.step.connecting'

    try {
      loadingStatus.value = 'firstLoading.step.fetching'
      const data = await fetchBanners()

      loadingStatus.value = 'firstLoading.step.parsing'
      banners.value = data
      isLoaded.value = true
      lastFetchTime.value = Date.now()
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'

      logger.info(`Banner loaded: ${data.length} active banners`)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.fallback'
      logger.error('Failed to fetch banners:', message)
      return false
    }
  }

  /**
   * Retry fetching banner data
   */
  async function retry(): Promise<boolean> {
    return loadBanners()
  }

  /**
   * Clear all data
   */
  function clearData(): void {
    banners.value = []
    isLoaded.value = false
    lastFetchTime.value = 0
    error.value = null
    logger.info('Banner data cleared')
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    banners,
    isLoading,
    error,
    isLoaded,
    loadingStatus,
    lastFetchTime,

    // Computed
    bannerCount,
    hasBanners,

    // Actions
    loadBanners,
    retry,
    clearData
  }
})
