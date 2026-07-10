/**
 * csvData Store Tests – Tests for Pinia store csvData
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCsvDataStore } from '../stores/csvData'
import { ALL_CSV_SHEET_NAMES, LIST_API_NINECMD } from '@/utilities/constants'

describe('csvData Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ============================================================
  // Initial State
  // ============================================================
  describe('initial state', () => {
    it('has correct default values', () => {
      const store = useCsvDataStore()
      expect(store.sheets).toEqual({})
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isLoaded).toBe(false)
      expect(store.lastFetchTime).toBe(0)
      expect(store.currentApiIndex).toBe(0)
      expect(store.fetchPlanet).toBeNull()
      expect(store.isPlanetSwitching).toBe(false)
    })

    it('reports anySheetNull as true when no data', () => {
      const store = useCsvDataStore()
      expect(store.anySheetNull).toBe(true)
    })

    it('reports loadedSheetCount as 0 when no data', () => {
      const store = useCsvDataStore()
      expect(store.loadedSheetCount).toBe(0)
    })

    it('reports correct totalSheetCount', () => {
      const store = useCsvDataStore()
      expect(store.totalSheetCount).toBe(ALL_CSV_SHEET_NAMES.length)
      expect(store.totalSheetCount).toBe(21)
    })
  })

  // ============================================================
  // Getters
  // ============================================================
  describe('getters', () => {
    it('getSheet returns null for unknown sheet', () => {
      const store = useCsvDataStore()
      expect(store.getSheet('GameConfigSheet')).toBeNull()
    })

    it('getSheetRow returns null for unknown sheet', () => {
      const store = useCsvDataStore()
      expect(store.getSheetRow('GameConfigSheet', 'key')).toBeNull()
    })

    it('getSheetRows returns empty array for unknown sheet', () => {
      const store = useCsvDataStore()
      expect(store.getSheetRows('GameConfigSheet')).toEqual([])
    })

    it('searchInSheet returns empty for unknown sheet', () => {
      const store = useCsvDataStore()
      expect(store.searchInSheet('GameConfigSheet', 'test')).toEqual([])
    })

    it('filterSheet returns empty for unknown sheet', () => {
      const store = useCsvDataStore()
      expect(store.filterSheet('GameConfigSheet', () => true)).toEqual([])
    })
  })

  // ============================================================
  // clearData
  // ============================================================
  describe('clearData', () => {
    it('resets all state including cache', () => {
      const store = useCsvDataStore()
      store.clearData()
      expect(store.sheets).toEqual({})
      expect(store.isLoaded).toBe(false)
      expect(store.lastFetchTime).toBe(0)
      expect(store.error).toBeNull()
      expect(store.fetchPlanet).toBeNull()
      expect(store.getCachedPlanets()).toEqual([])
    })
  })

  // ============================================================
  // fetchAllSheets (mocked)
  // ============================================================
  describe('fetchAllSheets', () => {
    it('sets loading state during fetch', async () => {
      const store = useCsvDataStore()
      // Mock fetch to delay
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      // Don't await – just check loading state
      store.fetchAllSheets('odin')

      // Wait a tick for the async to start
      await new Promise((r) => setTimeout(r, 10))
      expect(store.isLoading).toBe(true)
    })

    it('sets error on fetch failure', async () => {
      const store = useCsvDataStore()
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

      const result = await store.fetchAllSheets('odin')

      expect(result).toBe(false)
      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
      expect(store.isLoaded).toBe(false)
    })

    it('retry rotates API index', async () => {
      const store = useCsvDataStore()
      const apiCount = LIST_API_NINECMD.length
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fail'))

      expect(store.currentApiIndex).toBe(0)
      await store.retry()
      expect(store.currentApiIndex).toBe(1 % apiCount)
      if (apiCount > 2) {
        await store.retry()
        expect(store.currentApiIndex).toBe(2 % apiCount)
      }
      // Wrap around
      for (let i = 1; i < apiCount; i++) {
        await store.retry()
      }
      expect(store.currentApiIndex).toBe(0)
    })
  })

  // ============================================================
  // Cache Helpers
  // ============================================================
  describe('cache helpers', () => {
    it('isPlanetCached returns false when no cache', () => {
      const store = useCsvDataStore()
      expect(store.isPlanetCached('odin')).toBe(false)
    })

    it('isPlanetCached returns true when planet has cached data', () => {
      const store = useCsvDataStore()
      // Manually inject cache data
      store.cacheByPlanet = {
        odin: {
          GameConfigSheet: { '1': { id: 1, name: 'test' } }
        }
      } as any
      expect(store.isPlanetCached('odin')).toBe(true)
      expect(store.isPlanetCached('heimdall')).toBe(false)
    })

    it('getCachedPlanets returns empty array when no cache', () => {
      const store = useCsvDataStore()
      expect(store.getCachedPlanets()).toEqual([])
    })

    it('getCachedPlanets returns planet names with cache', () => {
      const store = useCsvDataStore()
      store.cacheByPlanet = {
        odin: { GameConfigSheet: { '1': { id: 1 } } },
        heimdall: { GameConfigSheet: { '1': { id: 1 } } }
      } as any
      const cached = store.getCachedPlanets()
      expect(cached).toContain('odin')
      expect(cached).toContain('heimdall')
    })

    it('getCacheStats returns correct stats', () => {
      const store = useCsvDataStore()
      expect(store.getCacheStats('odin')).toEqual({ cached: false, sheetCount: 0 })

      store.cacheByPlanet = {
        odin: { GameConfigSheet: { '1': { id: 1 } }, StageSheet: { '1': { id: 1 } } }
      } as any
      const stats = store.getCacheStats('odin')
      expect(stats.cached).toBe(true)
      expect(stats.sheetCount).toBe(2)
    })
  })

  // ============================================================
  // switchPlanet
  // ============================================================
  describe('switchPlanet', () => {
    it('skips if planet is already active', async () => {
      const store = useCsvDataStore()
      // Manually set current planet as loaded
      store.cacheByPlanet = {
        odin: { GameConfigSheet: { '1': { id: 1 } } }
      } as any
      store.sheets = { GameConfigSheet: { '1': { id: 1 } } }
      store.fetchPlanet = 'odin' as any
      store.isLoaded = true

      const result = await store.switchPlanet('odin')
      expect(result).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('loads from cache when available', async () => {
      const store = useCsvDataStore()
      store.cacheByPlanet = {
        heimdall: { GameConfigSheet: { '1': { id: 1, name: 'heimdall-data' } } }
      } as any

      const result = await store.switchPlanet('heimdall')
      expect(result).toBe(true)
      expect(store.fetchPlanet).toBe('heimdall')
      expect(store.isLoaded).toBe(true)
      expect(store.sheets).toEqual({ GameConfigSheet: { '1': { id: 1, name: 'heimdall-data' } } })
    })

    it('sets isPlanetSwitching when cache miss', async () => {
      const store = useCsvDataStore()
      // Mock fetch to never resolve
      vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))

      const switchPromise = store.switchPlanet('odin')
      await new Promise((r) => setTimeout(r, 10))
      expect(store.isPlanetSwitching).toBe(true)

      // Cleanup
      vi.restoreAllMocks()
    })
  })

  // ============================================================
  // clearCache / clearCacheForPlanet
  // ============================================================
  describe('clearCache', () => {
    it('clearCacheForPlanet removes specific planet cache', () => {
      const store = useCsvDataStore()
      store.cacheByPlanet = {
        odin: { GameConfigSheet: { '1': { id: 1 } } },
        heimdall: { GameConfigSheet: { '1': { id: 1 } } }
      } as any

      store.clearCacheForPlanet('odin')
      expect(store.isPlanetCached('odin')).toBe(false)
      expect(store.isPlanetCached('heimdall')).toBe(true)
    })

    it('clearCache removes all cache', () => {
      const store = useCsvDataStore()
      store.cacheByPlanet = {
        odin: { GameConfigSheet: { '1': { id: 1 } } },
        heimdall: { GameConfigSheet: { '1': { id: 1 } } }
      } as any

      store.clearCache()
      expect(store.getCachedPlanets()).toEqual([])
    })
  })
})
