/**
 * @file stores/useCsvDataStore.ts
 * @description Pinia store for managing CSV data from 9capi with per-planet caching.
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useFetch } from '@vueuse/core'
import { CSV_SHEET_CONFIG } from '../constants'
import { usePlanetStore } from './usePlanetStore'
import { useApiStore } from './useApiStore'
import type { CsvState, CsvParserMessage, CsvParserResult } from '../types/csv'

/**
 * Builds the URL for fetching CSV data from 9capi
 */
export const buildCsvUrl = (
  planetName: string,
  api9CmdUrl: string,
  sheets: string[] = Object.keys(CSV_SHEET_CONFIG),
) => {
  const params = new URLSearchParams()
  sheets.forEach((sheet) => {
    params.append('csv', sheet)
  })
  params.append('encodeAsBase64', 'true')
  params.append('network', planetName)
  return `${api9CmdUrl}/getGraphqlCSV?${params.toString()}`
}

export const useCsvDataStore = defineStore('csvData', () => {
  const planetStore = usePlanetStore()
  const apiStore = useApiStore()

  const state = ref<CsvState>({
    sheetsByPlanet: {},
    isLoading: false,
    error: null,
    lastUpdatedByPlanet: {},
  })

  // Web Worker instance
  let worker: Worker | null = null
  let expectedSheetsCount = 0

  /**
   * Initialize Web Worker
   */
  const initWorker = () => {
    if (!worker) {
      worker = new Worker(new URL('../workers/csv-parser.worker.ts', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event: MessageEvent<CsvParserResult>) => {
        const { sheetName, data, error } = event.data
        const currentPlanet = planetStore.currentPlanetName

        if (error) {
          console.error(`Worker error parsing ${sheetName}:`, error)
          state.value.error = error
        } else {
          if (!state.value.sheetsByPlanet[currentPlanet]) {
            state.value.sheetsByPlanet[currentPlanet] = {}
          }
          const planetSheets = state.value.sheetsByPlanet[currentPlanet]
          if (planetSheets) {
            planetSheets[sheetName] = data
          }
        }

        // Check if all sheets are loaded for current planet
        const currentPlanetSheets = state.value.sheetsByPlanet[currentPlanet] || {}
        const loadedKeys = Object.keys(currentPlanetSheets)

        if (expectedSheetsCount > 0 && loadedKeys.length >= expectedSheetsCount) {
          state.value.isLoading = false
          const timestamp = Date.now()
          console.log(
            `[CsvDataStore] All sheets loaded for ${currentPlanet}. Updating timestamp to: ${timestamp}`,
          )
          state.value.lastUpdatedByPlanet[currentPlanet] = timestamp
        }
      }
    }
  }

  /**
   * Fetch CSV data from 9capi
   * @param force - If true, bypass cache and fetch fresh data
   */
  const fetchCsvData = async (force = false) => {
    const planetName = planetStore.currentPlanetName

    // Check cache
    if (
      !force &&
      state.value.sheetsByPlanet[planetName] &&
      Object.keys(state.value.sheetsByPlanet[planetName] || {}).length > 0
    ) {
      console.log(`[CsvDataStore] Using cached data for planet: ${planetName}`)
      return
    }

    state.value.isLoading = true
    state.value.error = null
    initWorker()

    try {
      const url = buildCsvUrl(planetName, apiStore.api9CmdUrl)
      console.log(`[CsvDataStore] Fetching CSV data from: ${url}`)

      // Fetch 9capi data and item_name.csv concurrently
      const [nineCapiResponse, itemNameResponse] = await Promise.all([
        useFetch(url).json<{
          status: string
          message?: string
          data: Record<string, string>
        }>(),
        useFetch(apiStore.scanItemNameUrl).text(),
      ])
      console.log('[CsvDataStore] Fetch responses received')

      const { data: capiData, error: capiError } = nineCapiResponse
      const { data: itemNameData, error: itemNameError } = itemNameResponse

      if (capiError.value) {
        throw new Error(`9capi Fetch Error: ${capiError.value}`)
      }

      if (capiData.value?.status !== 'success') {
        throw new Error(capiData.value?.message || 'Failed to fetch CSV data from 9capi')
      }

      // Process item_name.csv if successful
      if (!itemNameError.value && itemNameData.value) {
        worker?.postMessage({
          sheetName: 'ItemNameSheet',
          base64Content: itemNameData.value,
          keyMain: 'Key',
          isRawCsv: true,
        } as CsvParserMessage)
      }

      const csvDataMap = capiData.value.data
      const csvSheets = Object.keys(csvDataMap)
      expectedSheetsCount = csvSheets.length + (itemNameData.value ? 1 : 0)

      // Send each sheet to worker for parsing
      Object.entries(csvDataMap).forEach(([sheetName, base64Content]) => {
        const config = CSV_SHEET_CONFIG[sheetName] || { keyMain: 'id' }
        const message: CsvParserMessage = {
          sheetName,
          base64Content,
          keyMain: config.keyMain,
          unique: config.unique || false,
        }
        worker?.postMessage(message)
      })
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Unknown error fetching CSV data'
      state.value.isLoading = false
      console.error('Error in fetchCsvData:', err)
    }
  }

  // Watch for planet changes to fetch/update data
  watch(
    () => planetStore.currentPlanetName,
    () => {
      fetchCsvData()
    },
  )

  // Getters
  const allSheets = computed(() => state.value.sheetsByPlanet[planetStore.currentPlanetName] || {})
  const getSheet = (name: string) => computed(() => allSheets.value[name] || null)
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)

  return {
    state,
    fetchCsvData,
    getSheet,
    allSheets,
    isLoading,
    error,
  }
})
