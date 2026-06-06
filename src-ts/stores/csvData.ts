/**
 * csvData Store – Pinia store quản lý dữ liệu CSV từ 9CMD API
 *
 * Fetch, parse, và lưu trữ dữ liệu CSV game (items, skills, recipes...)
 * Dữ liệu được dùng để hiển thị, tìm kiếm, lọc trong ứng dụng.
 *
 * Pattern tương tự configURL store:
 * - isLoading, error, isLoaded, loadingStatus
 * - fetchAllSheets(planet) → Promise<boolean>
 * - retry() → thử API URL tiếp theo
 *
 * Ref:
 * - .REF/vue3-tool/src/stores/initializeData.js: useInitializeDataStore
 * - .REF/vue3-tool/src/components/initializeData.vue: config.graphQlSheetConfig
 * - src-ts/stores/configURL.ts: pattern cho retry mechanism
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  CsvSheetName,
  CsvRow,
  CsvSheetData,
  AllSheetsData
} from '../types/csvData'
import { type PlanetName } from '../utilities/constants'
import { useAppSettingsStore } from './appSettings'
import {
  LIST_API_NINECMD,
  CSV_SHEET_CONFIG,
  ALL_CSV_SHEET_NAMES
} from '../utilities/constants'
import { decodeBase64Csv, parseCsvSheet, validateCsvData, getCsvHeaders } from '../utilities/csvParser'
import { buildCsvFetchUrl, fetchCsvFromApi } from '../utilities/csvFetcher'
import { createLogger } from '../utilities/logger'

// ============================================================
// Store
// ============================================================

export const useCsvDataStore = defineStore('csvData', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'csvData' })

  // ============================================================
  // Reference to appSettings (for planet change watcher)
  // ============================================================
  const appSettings = useAppSettingsStore()

  // ============================================================
  // State
  // ============================================================

  /** Parsed CSV data – keyed by sheet name (current active planet) */
  const sheets = ref<AllSheetsData>({})

  /** Loading state */
  const isLoading = ref<boolean>(false)

  /** Error message (null = no error) */
  const error = ref<string | null>(null)

  /** Whether data has been successfully loaded at least once */
  const isLoaded = ref<boolean>(false)

  /** Timestamp of last successful fetch */
  const lastFetchTime = ref<number>(0)

  /** Loading status messages (i18n keys) */
  const loadingStatus = ref<string>('')

  /** Current API index in LIST_API_NINECMD (for retry rotation) */
  const currentApiIndex = ref<number>(0)

  /** Planet name when data was fetched */
  const fetchPlanet = ref<PlanetName | null>(null)

  /**
   * Per-planet cache: lưu dữ liệu CSV đã fetch theo từng planet.
   * Khi chuyển planet, kiểm tra cache trước → nếu có thì dùng lại,
   * không cần fetch lại từ API.
   *
   * Key: PlanetName ("odin" | "heimdall" | "thor")
   * Value: AllSheetsData (parsed CSV data)
   */
  const cacheByPlanet = ref<Record<PlanetName, AllSheetsData>>({} as Record<PlanetName, AllSheetsData>)

  /** Whether currently switching planet (for loading indicator) */
  const isPlanetSwitching = ref<boolean>(false)

  // ============================================================
  // Computed
  // ============================================================

  /** Check if any sheet is null (not loaded) */
  const anySheetNull = computed<boolean>(() => {
    return ALL_CSV_SHEET_NAMES.some((name) => !sheets.value[name])
  })

  /** Number of sheets loaded */
  const loadedSheetCount = computed<number>(() => {
    return ALL_CSV_SHEET_NAMES.filter((name) => sheets.value[name]).length
  })

  /** Total sheets count */
  const totalSheetCount = computed<number>(() => ALL_CSV_SHEET_NAMES.length)

  /**
   * Check if CSV data for a specific planet is already cached
   */
  function isPlanetCached(planet: PlanetName): boolean {
    const cached = cacheByPlanet.value[planet]
    return !!cached && ALL_CSV_SHEET_NAMES.some((name) => cached[name])
  }

  /**
   * Get list of planet names that have cached data
   */
  function getCachedPlanets(): PlanetName[] {
    return Object.keys(cacheByPlanet.value) as PlanetName[]
  }

  /**
   * Get cache stats for a planet
   */
  function getCacheStats(planet: PlanetName): { cached: boolean; sheetCount: number } {
    const cached = cacheByPlanet.value[planet]
    if (!cached) return { cached: false, sheetCount: 0 }
    const count = ALL_CSV_SHEET_NAMES.filter((name) => cached[name]).length
    return { cached: true, sheetCount: count }
  }

  // ============================================================
  // Getters
  // ============================================================

  /**
   * Get a specific sheet data
   */
  function getSheet(name: CsvSheetName): CsvSheetData | null {
    return sheets.value[name] ?? null
  }

  /**
   * Get a specific row by key from a sheet
   */
  function getSheetRow(name: CsvSheetName, key: string | number): CsvRow | null {
    const sheet = sheets.value[name]
    if (!sheet) return null
    return sheet[key] ?? null
  }

  /**
   * Get all rows from a sheet as an array
   */
  function getSheetRows(name: CsvSheetName): CsvRow[] {
    const sheet = sheets.value[name]
    if (!sheet) return []
    return Object.values(sheet)
  }

  /**
   * Search in a sheet by query string across specified fields (or all fields)
   */
  function searchInSheet(
    name: CsvSheetName,
    query: string,
    fields?: string[]
  ): CsvRow[] {
    const sheet = sheets.value[name]
    if (!sheet) return []

    const lowerQuery = query.toLowerCase()
    const rows = Object.values(sheet)

    if (!fields || fields.length === 0) {
      // Search all fields
      return rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lowerQuery)
        )
      )
    }

    // Search specified fields only
    return rows.filter((row) =>
      fields.some((field) => {
        const val = row[field]
        return val !== undefined && String(val).toLowerCase().includes(lowerQuery)
      })
    )
  }

  /**
   * Filter rows in a sheet by predicate function
   */
  function filterSheet(
    name: CsvSheetName,
    predicate: (row: CsvRow) => boolean
  ): CsvRow[] {
    const sheet = sheets.value[name]
    if (!sheet) return []
    return Object.values(sheet).filter(predicate)
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Fetch all CSV sheets từ 9CMD API
   *
   * Flow:
   * 1. Chọn API URL từ LIST_API_NINECMD[currentApiIndex]
   * 2. Build URL với danh sách sheets
   * 3. Fetch JSON response
   * 4. Decode base64 → parse CSV từng sheet
   * 5. Lưu vào store
   *
   * @param planet Planet name: "odin" | "heimdall" | "thor"
   * @returns true nếu thành công, false nếu lỗi
   */
  async function fetchAllSheets(planet: PlanetName): Promise<boolean> {
    // ============================================================
    // Check cache first
    // ============================================================
    if (isPlanetCached(planet)) {
      logger.info(`CSV cache hit for planet "${planet}", loading from cache`)
      sheets.value = cacheByPlanet.value[planet]
      isLoaded.value = true
      fetchPlanet.value = planet
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'
      return true
    }

    // ============================================================
    // Fetch from API
    // ============================================================
    isLoading.value = true
    error.value = null
    loadingStatus.value = 'firstLoading.step.connecting'

    const apiUrl = LIST_API_NINECMD[currentApiIndex.value]
    logger.info(`Fetching CSV from: ${apiUrl} (planet: ${planet})`)

    try {
      // Step 1: Build URL
      loadingStatus.value = 'firstLoading.step.fetching'
      const url = buildCsvFetchUrl(apiUrl, ALL_CSV_SHEET_NAMES, planet)
      logger.debug('Fetch URL:', url)

      // Step 2: Fetch base64 data
      loadingStatus.value = 'firstLoading.step.parsing'
      const base64Data = await fetchCsvFromApi(url, ALL_CSV_SHEET_NAMES)

      // Step 3: Decode + Parse each sheet
      const parsedSheets: AllSheetsData = {}

      for (const sheetName of ALL_CSV_SHEET_NAMES) {
        const meta = CSV_SHEET_CONFIG[sheetName]
        const base64Csv = base64Data[sheetName]

        // Decode base64 → CSV string
        const csvString = decodeBase64Csv(base64Csv)

        // Parse CSV → keyed data
        const sheetData = parseCsvSheet(csvString, meta.keyColumn, {
          unique: meta.unique
        })

        // Validate
        if (!validateCsvData(sheetData)) {
          const headers = getCsvHeaders(csvString)
          throw new Error(
            `Sheet "${sheetName}" invalid – key "${meta.keyColumn}" not found in: [${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}]`
          )
        }

        parsedSheets[sheetName] = sheetData
      }

      // Step 4: Save to store + cache
      sheets.value = parsedSheets as AllSheetsData
      cacheByPlanet.value[planet] = parsedSheets as AllSheetsData
      isLoaded.value = true
      lastFetchTime.value = Date.now()
      fetchPlanet.value = planet
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'

      logger.info(
        `CSV loaded + cached: ${loadedSheetCount.value}/${totalSheetCount.value} sheets (planet: ${planet})`
      )
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.fallback'
      logger.error('Failed to fetch CSV data:', message)
      return false
    }
  }

  /**
   * Retry fetching – thử API URL tiếp theo trong LIST_API_NINECMD
   */
  async function retry(): Promise<boolean> {
    // Rotate to next API URL
    currentApiIndex.value = (currentApiIndex.value + 1) % LIST_API_NINECMD.length
    const planet = fetchPlanet.value ?? 'odin'
    return fetchAllSheets(planet)
  }

  /**
   * Switch planet – load CSV data for new planet.
   * Nếu đã cache → load từ cache (instant).
   * Nếu chưa cache → fetch từ API.
   *
   * @param planet Planet name mới
   * @returns true nếu thành công
   */
  async function switchPlanet(planet: PlanetName): Promise<boolean> {
    if (fetchPlanet.value === planet && isLoaded.value && !error.value) {
      logger.info(`Planet "${planet}" is already active, skipping`)
      return true
    }

    logger.info(`Switching CSV to planet "${planet}"`)

    if (isPlanetCached(planet)) {
      // Cache hit → load instant, không cần loading indicator
      logger.info(`Cache hit for "${planet}", loading instantly`)
      sheets.value = cacheByPlanet.value[planet]
      isLoaded.value = true
      fetchPlanet.value = planet
      error.value = null
      return true
    }

    // Cache miss → fetch từ API với loading indicator
    isPlanetSwitching.value = true
    try {
      return await fetchAllSheets(planet)
    } finally {
      isPlanetSwitching.value = false
    }
  }

  /**
   * Clear all data (including cache)
   */
  function clearData(): void {
    sheets.value = {}
    cacheByPlanet.value = {} as Record<PlanetName, AllSheetsData>
    isLoaded.value = false
    lastFetchTime.value = 0
    error.value = null
    fetchPlanet.value = null
    logger.info('CSV data + cache cleared')
  }

  /**
   * Clear cache for a specific planet
   */
  function clearCacheForPlanet(planet: PlanetName): void {
    delete cacheByPlanet.value[planet]
    logger.info(`Cache cleared for planet "${planet}"`)
  }

  /**
   * Clear all cache
   */
  function clearCache(): void {
    cacheByPlanet.value = {} as Record<PlanetName, AllSheetsData>
    logger.info('All CSV cache cleared')
  }

  // ============================================================
  // Watcher: Planet changed → reload CSV data
  // ============================================================

  watch(
    () => appSettings.selectedPlanet,
    async (newPlanet) => {
      if (newPlanet && isLoaded.value) {
        logger.info(`Planet changed to "${newPlanet}", switching CSV data`)
        await switchPlanet(newPlanet)
      }
    }
  )

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    sheets,
    isLoading,
    error,
    isLoaded,
    lastFetchTime,
    loadingStatus,
    currentApiIndex,
    fetchPlanet,
    cacheByPlanet,
    isPlanetSwitching,

    // Computed
    anySheetNull,
    loadedSheetCount,
    totalSheetCount,

    // Getters
    getSheet,
    getSheetRow,
    getSheetRows,
    searchInSheet,
    filterSheet,

    // Cache helpers
    isPlanetCached,
    getCachedPlanets,
    getCacheStats,

    // Actions
    fetchAllSheets,
    switchPlanet,
    retry,
    clearData,
    clearCacheForPlanet,
    clearCache
  }
})
