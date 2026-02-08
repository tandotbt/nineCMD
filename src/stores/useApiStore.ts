/**
 * @file stores/useApiStore.ts
 * @description Pinia store for managing global API URLs and their selection.
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import {
  API_URLS,
  API_9CMD_INDEX_STORAGE_KEY,
  SEASON_PASS_INDEX_STORAGE_KEY,
  SCAN_ITEM_NAME_INDEX_STORAGE_KEY,
  PLANET_RAW_INDEX_STORAGE_KEY,
  NINE_CHRONICLES_API_INDEX_STORAGE_KEY,
} from '../constants'

export const useApiStore = defineStore('api', () => {
  // Selected indices for each API
  const api9CmdIndex = useStorage<number>(API_9CMD_INDEX_STORAGE_KEY, 0)
  const seasonPassIndex = useStorage<number>(SEASON_PASS_INDEX_STORAGE_KEY, 0)
  const scanItemNameIndex = useStorage<number>(SCAN_ITEM_NAME_INDEX_STORAGE_KEY, 0)
  const planetRawIndex = useStorage<number>(PLANET_RAW_INDEX_STORAGE_KEY, 0)
  const nineChroniclesApiIndex = useStorage<number>(NINE_CHRONICLES_API_INDEX_STORAGE_KEY, 0)

  /**
   * Helper to get URL from API_URLS with safety check
   */
  const getUrl = (urls: readonly string[], index: number): string => {
    if (index >= 0 && index < urls.length) {
      const url = urls[index]
      if (url !== undefined) return url
    }
    return urls[0] || ''
  }

  // Computed URLs
  const api9CmdUrl = computed<string>(() => getUrl(API_URLS.API_9CMD, api9CmdIndex.value))
  const seasonPassUrl = computed<string>(() => getUrl(API_URLS.SEASON_PASS, seasonPassIndex.value))
  const scanItemNameUrl = computed<string>(() =>
    getUrl(API_URLS.SCAN_ITEM_NAME, scanItemNameIndex.value),
  )
  const planetRawUrl = computed<string>(() => getUrl(API_URLS.PLANET_RAW, planetRawIndex.value))
  const nineChroniclesApiUrl = computed<string>(() =>
    getUrl(API_URLS.NINE_CHRONICLES_API, nineChroniclesApiIndex.value),
  )

  // Actions
  const setApi9CmdIndex = (index: number) => (api9CmdIndex.value = index)
  const setSeasonPassIndex = (index: number) => (seasonPassIndex.value = index)
  const setScanItemNameIndex = (index: number) => (scanItemNameIndex.value = index)
  const setPlanetRawIndex = (index: number) => (planetRawIndex.value = index)
  const setNineChroniclesApiIndex = (index: number) => (nineChroniclesApiIndex.value = index)

  return {
    api9CmdIndex,
    seasonPassIndex,
    scanItemNameIndex,
    planetRawIndex,
    nineChroniclesApiIndex,
    api9CmdUrl,
    seasonPassUrl,
    scanItemNameUrl,
    planetRawUrl,
    nineChroniclesApiUrl,
    setApi9CmdIndex,
    setSeasonPassIndex,
    setScanItemNameIndex,
    setPlanetRawIndex,
    setNineChroniclesApiIndex,
  }
})
