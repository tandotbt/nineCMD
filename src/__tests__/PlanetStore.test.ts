import { ref } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanetStore } from '../stores/usePlanetStore'
import { PLANET_IDS, PLANET_CONFIGS, DEFAULT_PLANET } from '../constants'
import type { PlanetConfig } from '../types/planet'

// Mock @vueuse/core
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useFetch: vi.fn(() => ({
      json: vi.fn(() => ({
        data: ref(null),
        error: ref(null),
      })),
    })),
    useOnline: vi.fn(() => ref(true)),
    useStorage: vi.fn((_key, initial) => ref(initial)),
  }
})

describe('Planet Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()

    // Clear IndexedDB to prevent data leakage between tests
    const { db } = await import('../db')
    await db.settings.clear()
  })

  it('should initialize with default planet', () => {
    const store = usePlanetStore()
    expect(store.currentPlanetName).toBe(DEFAULT_PLANET)
    expect(store.currentPlanetId).toBe(PLANET_IDS[DEFAULT_PLANET as keyof typeof PLANET_IDS])
  })

  it('should update URLs when planet changes', () => {
    const store = usePlanetStore()

    // Switch to heimdall
    store.setPlanet('heimdall')
    expect(store.currentPlanetName).toBe('heimdall')
    expect(store.currentPlanetId).toBe(PLANET_IDS['heimdall' as keyof typeof PLANET_IDS])

    const heimdallConfig = PLANET_CONFIGS['heimdall' as keyof typeof PLANET_CONFIGS] as PlanetConfig
    expect(store.graphqlUrl).toBe(heimdallConfig.rpcEndpoints['headless.gql']![0])
    expect(store.mimirUrl).toBe(heimdallConfig.rpcEndpoints['mimir.gql']![0])
  })

  it('should fetch planets and update rawPlanets', async () => {
    const { useFetch } = await import('@vueuse/core')
    const mockPlanets: PlanetConfig[] = [
      {
        id: '0x123',
        name: 'test-planet',
        genesisHash: 'hash',
        rpcEndpoints: {
          'headless.gql': ['http://test-rpc-1', 'http://test-rpc-2', 'http://test-rpc-3'],
        },
      },
    ]

    vi.mocked(useFetch).mockReturnValue({
      json: vi.fn().mockReturnValue({
        data: ref(mockPlanets),
        error: ref(null),
      }),
    } as unknown as ReturnType<typeof useFetch>)

    const store = usePlanetStore()
    await store.fetchPlanets()

    expect(store.rawPlanets).toEqual(mockPlanets)
    expect(store.isLoading).toBe(false)

    store.setPlanet('test-planet')
    expect(store.currentPlanetName).toBe('test-planet')

    // Test multiple nodes from API
    expect(store.graphqlUrl).toBe('http://test-rpc-1')
    store.setNodeIndex(1)
    expect(store.graphqlUrl).toBe('http://test-rpc-2')
    store.setNodeIndex(2)
    expect(store.graphqlUrl).toBe('http://test-rpc-3')
  })

  it('should fallback to constants if fetch fails', async () => {
    const { useFetch } = await import('@vueuse/core')
    vi.mocked(useFetch).mockReturnValue({
      json: vi.fn().mockReturnValue({
        data: ref(null),
        error: ref('Fetch error'),
      }),
    } as unknown as ReturnType<typeof useFetch>)

    const store = usePlanetStore()
    // Explicitly set rawPlanets to empty for this test
    store.rawPlanets = []
    await store.fetchPlanets()

    expect(store.rawPlanets).toEqual([])
    expect(store.currentPlanetName).toBe(DEFAULT_PLANET)
    expect(store.currentPlanetId).toBe(PLANET_IDS[DEFAULT_PLANET as keyof typeof PLANET_IDS])
  })

  it('should reset node index when planet changes', () => {
    const store = usePlanetStore()
    store.setPlanet('odin')
    store.setNodeIndex(1)
    expect(store.selectedNodeIndex).toBe(1)

    store.setPlanet('heimdall')
    expect(store.selectedNodeIndex).toBe(0)
  })

  it('should reflect HEADLESS GQL URL changes correctly when switching planets from raw data', async () => {
    const { useFetch } = await import('@vueuse/core')
    const mockPlanets: PlanetConfig[] = [
      {
        id: '0x000000000000', // odin
        name: 'odin',
        genesisHash: 'hash1',
        rpcEndpoints: {
          'headless.gql': ['https://odin-rpc-1.com/graphql'],
        },
      },
      {
        id: '0x000000000001', // heimdall
        name: 'heimdall',
        genesisHash: 'hash2',
        rpcEndpoints: {
          'headless.gql': ['https://heimdall-rpc-1.com/graphql'],
        },
      },
    ]

    vi.mocked(useFetch).mockReturnValue({
      json: vi.fn().mockReturnValue({
        data: ref(mockPlanets),
        error: ref(null),
      }),
    } as unknown as ReturnType<typeof useFetch>)

    const store = usePlanetStore()
    await store.fetchPlanets()

    // Initially Odin
    store.setPlanet('odin')
    expect(store.currentPlanetId).toBe('0x000000000000')
    expect(store.graphqlUrl).toBe('https://odin-rpc-1.com/graphql')

    // Switch to Heimdall
    store.setPlanet('heimdall')
    expect(store.currentPlanetId).toBe('0x000000000001')
    expect(store.graphqlUrl).toBe('https://heimdall-rpc-1.com/graphql')

    // Check reactivity of raw data debug
    expect(store.currentPlanetConfig).toEqual(mockPlanets[1])
  })
})
