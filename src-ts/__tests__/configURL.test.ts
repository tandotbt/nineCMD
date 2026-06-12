import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConfigURLStore } from '../stores/configURL'
import { URL_ALL_PLANET, type PlanetData } from '@/utilities/constants'

// ============================================================
// Mock localStorage
// ============================================================
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
  }),
  get length() {
    return Object.keys(localStorageStore).length
  },
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null)
}

// ============================================================
// Mock planet data
// ============================================================
const mockPlanets: PlanetData[] = [
  {
    id: '0x000000000000',
    name: 'odin',
    genesisHash: 'abc123',
    rpcEndpoints: {
      'headless.gql': [
        'https://odin-rpc-1.nine-chronicles.com/graphql',
        'https://odin-rpc-2.nine-chronicles.com/graphql'
      ],
      'arena.gql': ['https://odin-arena.9c.gg/graphql'],
      'mimir.gql': ['https://odin-mimir.9c.gg/graphql'],
      '9cscan.rest': ['https://api.9cscan.com'],
      'dp.gql': ['http://odin-dp.9c.gg/graphql']
    }
  },
  {
    id: '0x000000000001',
    name: 'heimdall',
    genesisHash: 'def456',
    rpcEndpoints: {
      'headless.gql': [
        'https://heimdall-rpc-1.nine-chronicles.com/graphql',
        'https://heimdall-rpc-2.nine-chronicles.com/graphql'
      ],
      'arena.gql': ['https://heimdall-arena.9c.gg/graphql'],
      'mimir.gql': ['https://heimdall-mimir.9c.gg/graphql'],
      '9cscan.rest': ['https://api-heimdall.9cscan.com']
    }
  }
]

// ============================================================
// Test Suite
// ============================================================
describe('configURL Store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
    setActivePinia(createPinia())
  })

  // ============================================================
  // Initial State
  // ============================================================
  describe('Initial State', () => {
    it('should have fallback planets loaded initially', () => {
      const store = useConfigURLStore()
      expect(store.planets.length).toBeGreaterThan(0)
      expect(store.planets[0].name).toBe('odin')
    })

    it('should not be loaded initially', () => {
      const store = useConfigURLStore()
      expect(store.isLoaded).toBe(false)
    })

    it('should not be loading initially', () => {
      const store = useConfigURLStore()
      expect(store.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const store = useConfigURLStore()
      expect(store.error).toBeNull()
    })
  })

  // ============================================================
  // fetchPlanets – Success
  // ============================================================
  describe('fetchPlanets – Success', () => {
    it('should fetch planets from URL_ALL_PLANET', async () => {
      const store = useConfigURLStore()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await store.fetchPlanets()

      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.planets).toEqual(mockPlanets)
      expect(mockFetch).toHaveBeenCalledWith(URL_ALL_PLANET, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
    })

    it('should set loadingStatus during fetch', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))

      await store.fetchPlanets()
      expect(store.loadingStatus).toBe('firstLoading.step.done')
    })

    it('should update availablePlanetNames after fetch', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))

      await store.fetchPlanets()
      expect(store.availablePlanetNames).toContain('odin')
      expect(store.availablePlanetNames).toContain('heimdall')
      expect(store.availablePlanetNames).not.toContain('thor')
    })
  })

  // ============================================================
  // fetchPlanets – Failure
  // ============================================================
  describe('fetchPlanets – Failure', () => {
    it('should use fallback data when fetch fails', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

      const result = await store.fetchPlanets()

      expect(result).toBe(false)
      expect(store.isLoaded).toBe(true) // Still marked as loaded (fallback)
      expect(store.error).toBe('Network error')
      // Fallback should have odin and heimdall
      expect(store.planets.some((p) => p.name === 'odin')).toBe(true)
    })

    it('should use fallback when HTTP response is not ok', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }))

      const result = await store.fetchPlanets()
      expect(result).toBe(false)
      expect(store.error).toContain('500')
    })

    it('should use fallback when response is empty array', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      }))

      const result = await store.fetchPlanets()
      expect(result).toBe(false)
      expect(store.error).toContain('không hợp lệ')
    })

    it('should set loadingStatus to fallback on error', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')))

      await store.fetchPlanets()
      expect(store.loadingStatus).toBe('firstLoading.step.fallback')
    })
  })

  // ============================================================
  // retry
  // ============================================================
  describe('retry', () => {
    it('should retry fetch and update state', async () => {
      const store = useConfigURLStore()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await store.retry()
      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.planets).toEqual(mockPlanets)
    })
  })

  // ============================================================
  // Planet Availability
  // ============================================================
  describe('Planet Availability', () => {
    it('should check if planet is available', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.isPlanetAvailable('odin')).toBe(true)
      expect(store.isPlanetAvailable('heimdall')).toBe(true)
      expect(store.isPlanetAvailable('thor')).toBe(false)
    })

    it('should be case-insensitive for planet check', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.isPlanetAvailable('Odin')).toBe(true)
      expect(store.isPlanetAvailable('ODIN')).toBe(true)
    })

    it('should get planet data by name', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const odin = store.getPlanetData('odin')
      expect(odin).toBeDefined()
      expect(odin?.id).toBe('0x000000000000')
      expect(odin?.genesisHash).toBe('abc123')
    })

    it('should return undefined for non-existent planet', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.getPlanetData('thor')).toBeUndefined()
    })
  })

  // ============================================================
  // RPC Endpoints – Random Mode
  // ============================================================
  describe('RPC Endpoints – Random Mode', () => {
    it('should return a URL from available endpoints (random)', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const url = store.getRpcEndpoint('odin', 'headless.gql')
      expect(mockPlanets[0].rpcEndpoints['headless.gql']).toContain(url)
    })

    it('should get mimir URL for odin', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const url = store.getMimirUrl('odin')
      expect(url).toBe('https://odin-mimir.9c.gg/graphql')
    })

    it('should get mimir URL for heimdall', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const url = store.getMimirUrl('heimdall')
      expect(url).toBe('https://heimdall-mimir.9c.gg/graphql')
    })

    it('should get headless GQL URL', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const url = store.getHeadlessGql('odin')
      expect(mockPlanets[0].rpcEndpoints['headless.gql']).toContain(url)
    })

    it('should fallback to PLANET_CONFIGS when endpoint not in API data', async () => {
      const store = useConfigURLStore()
      // Fetch planets without 'arena.gql' for a custom planet
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{
          id: '0x99',
          name: 'testplanet',
          genesisHash: 'xxx',
          rpcEndpoints: {}
        }])
      }))
      await store.fetchPlanets()

      // Should fallback to PLANET_CONFIGS or return empty
      const url = store.getRpcEndpoint('odin', 'headless.gql')
      // odin has fallback in PLANET_CONFIGS
      expect(url).toBeTruthy()
    })
  })

  // ============================================================
  // RPC Endpoints – Manual Mode
  // ============================================================
  describe('RPC Endpoints – Manual Mode', () => {
    it('should default to random mode', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const mode = store.getEndpointMode('odin', 'headless.gql')
      expect(mode).toBe('random')
    })

    it('should set endpoint mode to manual', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      store.setEndpointMode('odin', 'headless.gql', 'manual')
      expect(store.getEndpointMode('odin', 'headless.gql')).toBe('manual')
    })

    it('should persist endpoint mode to localStorage', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      store.setEndpointMode('odin', 'headless.gql', 'manual')
      const stored = JSON.parse(localStorageStore['configURL-endpoints'] || '{}')
      expect(stored.modes?.['odin:headless.gql']).toBe('manual')
    })

    it('should set manual endpoint selection', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const manualUrl = 'https://odin-rpc-1.nine-chronicles.com/graphql'
      store.setEndpointSelection('odin', 'headless.gql', manualUrl)

      expect(store.getEndpointSelection('odin', 'headless.gql')).toBe(manualUrl)
      expect(store.getEndpointMode('odin', 'headless.gql')).toBe('manual')
    })

    it('should use manual selection when mode is manual', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const manualUrl = 'https://odin-rpc-1.nine-chronicles.com/graphql'
      store.setEndpointSelection('odin', 'headless.gql', manualUrl)

      const url = store.getRpcEndpoint('odin', 'headless.gql')
      expect(url).toBe(manualUrl)
    })

    it('should switch back to random when mode is set to random', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      // Set manual first
      store.setEndpointSelection('odin', 'headless.gql', 'https://custom-url.com')
      expect(store.getRpcEndpoint('odin', 'headless.gql')).toBe('https://custom-url.com')

      // Switch to random
      store.setEndpointMode('odin', 'headless.gql', 'random')
      expect(store.getEndpointMode('odin', 'headless.gql')).toBe('random')

      const url = store.getRpcEndpoint('odin', 'headless.gql')
      expect(mockPlanets[0].rpcEndpoints['headless.gql']).toContain(url)
    })

    it('should clear manual selection when switching to random', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      store.setEndpointSelection('odin', 'headless.gql', 'https://custom.com')
      store.setEndpointMode('odin', 'headless.gql', 'random')

      expect(store.getEndpointSelection('odin', 'headless.gql')).toBe('')
    })
  })

  // ============================================================
  // Available Endpoints List
  // ============================================================
  describe('Available Endpoints List', () => {
    it('should return all available URLs for an endpoint', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const urls = store.getAvailableEndpoints('odin', 'headless.gql')
      expect(urls).toContain('https://odin-rpc-1.nine-chronicles.com/graphql')
      expect(urls).toContain('https://odin-rpc-2.nine-chronicles.com/graphql')
    })

    it('should deduplicate URLs', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const urls = store.getAvailableEndpoints('odin', 'dp.gql')
      // Should not have duplicates
      expect(urls.length).toBe(new Set(urls).size)
    })
  })

  // ============================================================
  // Active Endpoints
  // ============================================================
  describe('Active Endpoints', () => {
    it('should return active endpoints map for a planet', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const active = store.getActiveEndpoints('odin')
      expect(active).toHaveProperty('headless.gql')
      expect(active).toHaveProperty('arena.gql')
      expect(active).toHaveProperty('9cscan.rest')
      expect(active).toHaveProperty('dp.gql')
      expect(active['headless.gql']).toBeTruthy()
    })
  })

  // ============================================================
  // Planet-specific Data
  // ============================================================
  describe('Planet-specific Data', () => {
    it('should get planet ID', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.getPlanetId('odin')).toBe('0x000000000000')
      expect(store.getPlanetId('heimdall')).toBe('0x000000000001')
    })

    it('should get genesis hash', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.getGenesisHash('odin')).toBe('abc123')
      expect(store.getGenesisHash('heimdall')).toBe('def456')
    })
  })

  // ============================================================
  // Integration: Different planets return different URLs
  // ============================================================
  describe('Integration: Planet Switching', () => {
    it('should return different mimir URLs for different planets', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const odinMimir = store.getMimirUrl('odin')
      const heimdallMimir = store.getMimirUrl('heimdall')

      expect(odinMimir).not.toBe(heimdallMimir)
      expect(odinMimir).toContain('odin')
      expect(heimdallMimir).toContain('heimdall')
    })

    it('should return different headless URLs for different planets', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      const odinUrls = store.getAvailableEndpoints('odin', 'headless.gql')
      const heimdallUrls = store.getAvailableEndpoints('heimdall', 'headless.gql')

      // No overlap between planet URLs
      const overlap = odinUrls.filter((u) => heimdallUrls.includes(u))
      expect(overlap.length).toBe(0)
    })

    it('should disable unavailable planets', async () => {
      const store = useConfigURLStore()
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPlanets)
      }))
      await store.fetchPlanets()

      expect(store.isPlanetAvailable('odin')).toBe(true)
      expect(store.isPlanetAvailable('heimdall')).toBe(true)
      expect(store.isPlanetAvailable('thor')).toBe(false)
    })
  })
})
