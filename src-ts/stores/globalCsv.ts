/**
 * globalCsv Store – Pinia store quản lý dữ liệu CSV global (không phụ thuộc planet)
 *
 * Mục đích: Load 1 lần lúc preloading 3 loại CSV:
 * - ItemNameSheet (i18n tên vật phẩm)
 * - SkillNameSheet (i18n tên skill)
 * - RemoteCsv (config từ xa, schema chuẩn)
 *
 * Pattern GLOBAL (khác với csvData là per-planet):
 * - Load 1 lần, không watch planet
 * - KHÔNG retry khi lỗi (lỗi thì bỏ qua, vẫn redirect về home)
 * - Watch appSettings.lang → chỉ re-render (localeColumn thay đổi), KHÔNG fetch lại
 *
 * Ref:
 * - src/stores/configURL.js: ItemNameSheet/SkillNameSheet (logic cũ, per-planet)
 * - NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv (URL mới)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  LocalizedSheetData,
  RemoteCsvData
} from '../types/i18nCsv'
import { LOCALE_TO_CSV_COLUMN } from '../utilities/constants'
import { useAppSettingsStore } from './appSettings'
import {
  fetchAllLocalizedSheets,
  fetchRemoteCsv,
  getLocalizedName
} from '../utilities/nameService'
import { createLogger } from '../utilities/logger'

// ============================================================
// Store
// ============================================================

export const useGlobalCsvStore = defineStore('globalCsv', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'globalCsv' })

  // Reference to appSettings
  const appSettings = useAppSettingsStore()

  // ============================================================
  // State
  // ============================================================

  /** ItemNameSheet data (global) */
  const itemNameSheet = ref<LocalizedSheetData>({})

  /** SkillNameSheet data (global) */
  const skillNameSheet = ref<LocalizedSheetData>({})

  /** RemoteCsv data (global) */
  const remoteCsv = ref<RemoteCsvData>({})

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

  /** Per-source error tracking (cho hiển thị warning) */
  const sourceErrors = ref<{
    localized: string | null
    remote: string | null
  }>({ localized: null, remote: null })

  // ============================================================
  // Computed
  // ============================================================

  /**
   * Locale column name trong CSV tương ứng với appSettings.lang hiện tại
   */
  const localeColumn = computed<string>(() => {
    return LOCALE_TO_CSV_COLUMN[appSettings.lang] ?? 'English'
  })

  /** Number of entries in ItemNameSheet */
  const itemNameCount = computed<number>(() => Object.keys(itemNameSheet.value).length)

  /** Number of entries in SkillNameSheet */
  const skillNameCount = computed<number>(() => Object.keys(skillNameSheet.value).length)

  /** Number of entries in RemoteCsv */
  const remoteCsvCount = computed<number>(() => Object.keys(remoteCsv.value).length)

  /** True nếu có ít nhất 1 nguồn load thành công */
  const hasAnyData = computed<boolean>(() => {
    return itemNameCount.value > 0 ||
      skillNameCount.value > 0 ||
      remoteCsvCount.value > 0
  })

  /** True nếu tất cả nguồn đều load thất bại */
  const allSourcesFailed = computed<boolean>(() => {
    return sourceErrors.value.localized !== null && sourceErrors.value.remote !== null
  })

  // ============================================================
  // Getters
  // ============================================================

  /**
   * Lấy tên vật phẩm theo locale hiện tại.
   * Fallback chain: localeColumn → English → Key
   */
  function getItemName(key: string | number): string {
    const row = itemNameSheet.value[key]
    return getLocalizedName(row, localeColumn.value, key)
  }

  /**
   * Lấy tên skill theo locale hiện tại.
   * Fallback chain: localeColumn → English → Key
   */
  function getSkillName(key: string | number): string {
    const row = skillNameSheet.value[key]
    return getLocalizedName(row, localeColumn.value, key)
  }

  /**
   * Lấy 1 row từ RemoteCsv theo key
   */
  function getRemoteCsvRow(key: string | number): RemoteCsvData[string] | null {
    return remoteCsv.value[key] ?? null
  }

  /**
   * Lấy 1 row từ ItemNameSheet theo key
   */
  function getItemNameRow(key: string | number): LocalizedSheetData[string] | null {
    return itemNameSheet.value[key] ?? null
  }

  /**
   * Lấy 1 row từ SkillNameSheet theo key
   */
  function getSkillNameRow(key: string | number): LocalizedSheetData[string] | null {
    return skillNameSheet.value[key] ?? null
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Load tất cả 3 loại CSV song song (ItemName + SkillName + RemoteCsv).
   *
   * Pattern: Promise.allSettled - lỗi 1 nguồn KHÔNG ảnh hưởng các nguồn khác.
   * Khi gặp lỗi: log warning, lưu vào sourceErrors, tiếp tục.
   * KHÔNG throw, KHÔNG retry - vì đây là "kiểu thứ 3 cần loading".
   *
   * @returns true nếu ít nhất 1 nguồn load thành công
   */
  async function loadAll(): Promise<boolean> {
    // Đã load rồi thì skip
    if (isLoaded.value) {
      logger.info('globalCsv already loaded, skipping')
      return true
    }

    isLoading.value = true
    error.value = null
    sourceErrors.value = { localized: null, remote: null }
    loadingStatus.value = 'firstLoading.step.connecting'

    try {
      loadingStatus.value = 'firstLoading.step.fetching'

      // Chạy 2 promise song song (ItemName+SkillName gộp, RemoteCsv riêng)
      const [localizedResult, remoteResult] = await Promise.allSettled([
        fetchAllLocalizedSheets('odin'), // planet 'odin' cho URL cache busting, data giống nhau giữa các planet
        fetchRemoteCsv()
      ])

      loadingStatus.value = 'firstLoading.step.parsing'

      // Xử lý kết quả localized
      if (localizedResult.status === 'fulfilled') {
        itemNameSheet.value = localizedResult.value.ItemNameSheet
        skillNameSheet.value = localizedResult.value.SkillNameSheet
        sourceErrors.value.localized = null
        logger.info(`globalCsv localized loaded: ${itemNameCount.value} items, ${skillNameCount.value} skills`)
      } else {
        const message = localizedResult.reason instanceof Error
          ? localizedResult.reason.message
          : String(localizedResult.reason)
        sourceErrors.value.localized = message
        logger.warn('globalCsv localized failed (skipping):', message)
      }

      // Xử lý kết quả remote
      if (remoteResult.status === 'fulfilled') {
        remoteCsv.value = remoteResult.value
        sourceErrors.value.remote = null
        logger.info(`globalCsv remote loaded: ${remoteCsvCount.value} entries`)
      } else {
        const message = remoteResult.reason instanceof Error
          ? remoteResult.reason.message
          : String(remoteResult.reason)
        sourceErrors.value.remote = message
        logger.warn('globalCsv remote failed (skipping):', message)
      }

      // Có ít nhất 1 nguồn thành công → coi như loaded
      if (hasAnyData.value) {
        isLoaded.value = true
        lastFetchTime.value = Date.now()
      }

      // Nếu tất cả đều fail → vẫn set error để log
      if (allSourcesFailed.value) {
        error.value = 'All global CSV sources failed'
      }

      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'

      return hasAnyData.value
    } catch (e) {
      // Catch unexpected error (rất hiếm, vì allSettled không throw)
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'
      logger.error('globalCsv unexpected error:', message)
      return false
    }
  }

  /**
   * Clear all data
   */
  function clearData(): void {
    itemNameSheet.value = {}
    skillNameSheet.value = {}
    remoteCsv.value = {}
    isLoaded.value = false
    error.value = null
    lastFetchTime.value = 0
    sourceErrors.value = { localized: null, remote: null }
    logger.info('globalCsv data cleared')
  }

  /**
   * Retry loading (giống loadAll nhưng force reload)
   */
  async function retry(): Promise<boolean> {
    clearData()
    return loadAll()
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    itemNameSheet,
    skillNameSheet,
    remoteCsv,
    isLoading,
    error,
    isLoaded,
    loadingStatus,
    lastFetchTime,
    sourceErrors,

    // Computed
    localeColumn,
    itemNameCount,
    skillNameCount,
    remoteCsvCount,
    hasAnyData,
    allSourcesFailed,

    // Getters
    getItemName,
    getSkillName,
    getRemoteCsvRow,
    getItemNameRow,
    getSkillNameRow,

    // Actions
    loadAll,
    retry,
    clearData
  }
})
