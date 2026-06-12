/**
 * globalCsv Store – Pinia store for managing global CSV data (planet-independent)
 *
 * Purpose: Load once during preloading, 3 types of CSV:
 * - ItemNameSheet (i18n item names)
 * - SkillNameSheet (i18n skill names)
 * - RemoteCsv (remote config, standard schema)
 *
 * GLOBAL pattern (unlike csvData which is per-planet):
 * - Load once, no planet watcher
 * - NO retry on error (skip errors, still redirect to home)
 * - Watch appSettings.lang → re-render only (localeColumn changes), NO re-fetch
 *
 * Ref:
 * - src/stores/configURL.js: ItemNameSheet/SkillNameSheet (legacy logic, per-planet)
 * - NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv (new URL)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  LocalizedSheetData,
  RemoteCsvData
} from '../types/i18nCsv'
import { LOCALE_TO_CSV_COLUMN } from '@/utilities/constants'
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

  /** Per-source error tracking (for warning display) */
  const sourceErrors = ref<{
    localized: string | null
    remote: string | null
  }>({ localized: null, remote: null })

  // ============================================================
  // Computed
  // ============================================================

  /**
   * Locale column name in CSV corresponding to current appSettings.lang
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

  /** True if at least 1 source loaded successfully */
  const hasAnyData = computed<boolean>(() => {
    return itemNameCount.value > 0 ||
      skillNameCount.value > 0 ||
      remoteCsvCount.value > 0
  })

  /** True if all sources failed to load */
  const allSourcesFailed = computed<boolean>(() => {
    return sourceErrors.value.localized !== null && sourceErrors.value.remote !== null
  })

  // ============================================================
  // Getters
  // ============================================================

  /**
   * Get item name for current locale.
   * Fallback chain: localeColumn → English → Key
   */
  function getItemName(key: string | number): string {
    const row = itemNameSheet.value[key]
    return getLocalizedName(row, localeColumn.value, key)
  }

  /**
   * Get skill name for current locale.
   * Fallback chain: localeColumn → English → Key
   */
  function getSkillName(key: string | number): string {
    const row = skillNameSheet.value[key]
    return getLocalizedName(row, localeColumn.value, key)
  }

  /**
   * Get a row from RemoteCsv by key
   */
  function getRemoteCsvRow(key: string | number): RemoteCsvData[string] | null {
    return remoteCsv.value[key] ?? null
  }

  /**
   * Get a row from ItemNameSheet by key
   */
  function getItemNameRow(key: string | number): LocalizedSheetData[string] | null {
    return itemNameSheet.value[key] ?? null
  }

  /**
   * Get a row from SkillNameSheet by key
   */
  function getSkillNameRow(key: string | number): LocalizedSheetData[string] | null {
    return skillNameSheet.value[key] ?? null
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Load all 3 CSV types in parallel (ItemName + SkillName + RemoteCsv).
   *
   * Pattern: Promise.allSettled - 1 source error does NOT affect other sources.
   * On error: log warning, save to sourceErrors, continue.
   * NO throw, NO retry - this is the "3rd loading type".
   *
   * @returns true if at least 1 source loaded successfully
   */
  async function loadAll(): Promise<boolean> {
    // Already loaded, skip
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

      // Run 2 promises in parallel (ItemName+SkillName combined, RemoteCsv separate)
      const [localizedResult, remoteResult] = await Promise.allSettled([
        fetchAllLocalizedSheets('odin'), // planet 'odin' for URL cache busting, data is same across planets
        fetchRemoteCsv()
      ])

      loadingStatus.value = 'firstLoading.step.parsing'

      // Process localized results
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

      // Process remote results
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

      // At least 1 source succeeded → consider loaded
      if (hasAnyData.value) {
        isLoaded.value = true
        lastFetchTime.value = Date.now()
      }

      // If all failed → still set error for logging
      if (allSourcesFailed.value) {
        error.value = 'All global CSV sources failed'
      }

      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'

      return hasAnyData.value
    } catch (e) {
      // Catch unexpected error (very rare, since allSettled doesn't throw)
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
   * Retry loading (same as loadAll but force reload)
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
