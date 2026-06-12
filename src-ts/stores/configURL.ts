/**
 * configURL Store – Pinia store for managing planet URL data from Nine Chronicles API
 *
 * Fetches planet data from URL_ALL_PLANET on app startup.
 * Data includes: available planets, RPC endpoints, genesis hash...
 *
 * Ref:
 * - .REF/python-tool/constants.py: URL_ALL_PLANET, link_planet(), LIST_URL_PLANET
 * - src/stores/configURL.js: useConfigURLStore (JS version)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  URL_ALL_PLANET,
  type PlanetName,
  type PlanetData,
  type PlanetRpcEndpoints,
  PLANET_CONFIGS,
  STORAGE_KEY_ENDPOINTS
} from '@/utilities/constants'
import { createLogger } from '../utilities/logger'

// ============================================================
// Fallback data (when API is unavailable)
// Ref: src/utilities/constants.js CONFIG_URL_ALL_PLANET
// ============================================================
const FALLBACK_PLANETS: PlanetData[] = [
  {
    id: '0x000000000000',
    name: 'odin',
    genesisHash: '4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce',
    genesisUri: 'https://release.nine-chronicles.com/genesis-block-9c-main',
    guildIconBucket: 'https://guild-odin.nine-chronicles.com',
    '9cscanUrl': 'https://9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://odin-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api.9cscan.com'],
      'headless.gql': [
        'https://odin-rpc-1.nine-chronicles.com/graphql',
        'https://odin-rpc-2.nine-chronicles.com/graphql'
      ],
      'headless.grpc': [
        'http://odin-rpc-1.nine-chronicles.com:31238',
        'http://odin-rpc-2.nine-chronicles.com:31238'
      ],
      'market.rest': ['https://odin-market.9c.gg'],
      'world-boss.rest': ['https://odin-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://odin-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild-odin.nine-chronicles.com'],
      'arena.gql': ['https://odin-arena.9c.gg/graphql']
    },
    bridges: {
      '0x000000000001': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc'
      }
    }
  },
  {
    id: '0x000000000001',
    name: 'heimdall',
    genesisHash: '729fa26958648a35b53e8e3905d11ec53b1b4929bf5f499884aed7df616f5913',
    genesisUri: 'https://planets.nine-chronicles.com/planets/0x000000000001/genesis',
    guildIconBucket: 'https://guild.nine-chronicles.com',
    '9cscanUrl': 'https://heimdall.9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://heimdall-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api-heimdall.9cscan.com'],
      'headless.gql': [
        'https://heimdall-rpc-1.nine-chronicles.com/graphql',
        'https://heimdall-rpc-2.nine-chronicles.com/graphql'
      ],
      'headless.grpc': [
        'http://heimdall-rpc-1.nine-chronicles.com:31238',
        'http://heimdall-rpc-2.nine-chronicles.com:31238'
      ],
      'market.rest': ['http://heimdall-market.9c.gg'],
      'world-boss.rest': ['http://heimdall-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://heimdall-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild.nine-chronicles.com'],
      'arena.gql': ['https://heimdall-arena.9c.gg/graphql']
    },
    bridges: {
      '0x000000000000': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc'
      }
    }
  }
]

// ============================================================
// Helper: random pick from array (mirror Python random.choice)
// ============================================================
function randomChoice<T>(arr: T[] | undefined, fallback: T): T {
  if (!arr || arr.length === 0) return fallback
  return arr[Math.floor(Math.random() * arr.length)]
}

// ============================================================
// Helper: pick endpoint (random or manual)
// ============================================================
type EndpointMode = 'random' | 'manual'
const STORAGE_KEY = STORAGE_KEY_ENDPOINTS

interface PersistedEndpoints {
  /** Map of "planet:endpointKey" → selected URL */
  selections?: Record<string, string>
  /** Map of "planet:endpointKey" → 'random' | 'manual' */
  modes?: Record<string, EndpointMode>
}

function loadPersistedEndpoints(): PersistedEndpoints {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePersistedEndpoints(data: PersistedEndpoints): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ============================================================
// Store
// ============================================================
export const useConfigURLStore = defineStore('configURL', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'configURL' })

  // ============================================================
  // State
  // ============================================================

  /** Raw planet data from API */
  const planets = ref<PlanetData[]>([...FALLBACK_PLANETS])

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

  /** Persisted endpoint selections */
  const persistedEndpoints = ref<PersistedEndpoints>(loadPersistedEndpoints())

  // ============================================================
  // Computed
  // ============================================================

  /** List of available planet names */
  const availablePlanetNames = computed<PlanetName[]>(() =>
    planets.value
      .map((p) => p.name.toLowerCase() as PlanetName)
      .filter((name) => name in PLANET_CONFIGS)
  )

  /** Set of available planet names for quick lookup */
  const availablePlanetSet = computed<Set<string>>(() =>
    new Set(planets.value.map((p) => p.name.toLowerCase()))
  )

  /**
   * Check if a planet is available
   */
  function isPlanetAvailable(planet: PlanetName | string): boolean {
    return availablePlanetSet.value.has(planet.toLowerCase())
  }

  /**
   * Get planet data by name
   * Ref: .REF/python-tool/constants.py link_planet() – find planet by name
   */
  function getPlanetData(planet: PlanetName): PlanetData | undefined {
    return planets.value.find((p) => p.name.toLowerCase() === planet.toLowerCase())
  }

  /**
   * Get the storage key for a planet+endpoint combo
   */
  function getEndpointStorageKey(planet: PlanetName, endpointKey: string): string {
    return `${planet}:${endpointKey}`
  }

  /**
   * Get endpoint mode (random/manual) for a planet+endpoint
   */
  function getEndpointMode(planet: PlanetName, endpointKey: string): EndpointMode {
    const key = getEndpointStorageKey(planet, endpointKey)
    return persistedEndpoints.value.modes?.[key] ?? 'random'
  }

  /**
   * Get selected URL for manual mode
   */
  function getEndpointSelection(planet: PlanetName, endpointKey: string): string {
    const key = getEndpointStorageKey(planet, endpointKey)
    return persistedEndpoints.value.selections?.[key] ?? ''
  }

  /**
   * Set endpoint mode (random/manual)
   */
  function setEndpointMode(planet: PlanetName, endpointKey: string, mode: EndpointMode): void {
    if (!persistedEndpoints.value.modes) persistedEndpoints.value.modes = {}
    const key = getEndpointStorageKey(planet, endpointKey)
    persistedEndpoints.value.modes[key] = mode
    savePersistedEndpoints(persistedEndpoints.value)
    // Clear manual selection when switching to random
    if (mode === 'random' && persistedEndpoints.value.selections) {
      delete persistedEndpoints.value.selections[key]
      savePersistedEndpoints(persistedEndpoints.value)
    }
  }

  /**
   * Set manual endpoint selection
   */
  function setEndpointSelection(planet: PlanetName, endpointKey: string, url: string): void {
    if (!persistedEndpoints.value.selections) persistedEndpoints.value.selections = {}
    const key = getEndpointStorageKey(planet, endpointKey)
    persistedEndpoints.value.selections[key] = url
    // Also set mode to manual
    if (!persistedEndpoints.value.modes) persistedEndpoints.value.modes = {}
    persistedEndpoints.value.modes[key] = 'manual'
    savePersistedEndpoints(persistedEndpoints.value)
  }

  /**
   * Get all available endpoint URLs for a planet+endpointKey
   * Includes both dynamic (from API) and static (fallback) URLs
   */
  function getAvailableEndpoints(planet: PlanetName, endpointKey: string): string[] {
    const planetData = getPlanetData(planet)
    const dynamicUrls = planetData?.rpcEndpoints[endpointKey] ?? []

    // Also include static fallback URLs
    const staticConfig = PLANET_CONFIGS[planet]
    let staticUrls: string[] = []
    if (endpointKey === 'mimir.gql' && staticConfig?.mimirUrl) {
      staticUrls = [staticConfig.mimirUrl]
    } else if (endpointKey === 'headless.gql' && staticConfig?.headlessGql) {
      staticUrls = [staticConfig.headlessGql]
    }

    // Merge, deduplicate
    const all = [...dynamicUrls, ...staticUrls]
    return [...new Set(all)]
  }

  /**
   * Get a specific RPC endpoint URL for a planet
   * - If manual mode: use persisted selection
   * - If random mode: random pick from available endpoints
   * Falls back to PLANET_CONFIGS if no dynamic URL available
   */
  function getRpcEndpoint(planet: PlanetName, endpointKey: string): string {
    const mode = getEndpointMode(planet, endpointKey)

    // Manual mode: use persisted selection
    if (mode === 'manual') {
      const selected = getEndpointSelection(planet, endpointKey)
      if (selected) return selected
    }

    // Random mode (or no manual selection): pick from available
    const planetData = getPlanetData(planet)
    if (planetData) {
      const endpoints = planetData.rpcEndpoints[endpointKey]
      if (endpoints && endpoints.length > 0) {
        return randomChoice(endpoints, '')
      }
    }
    // Fallback to static config
    const staticConfig = PLANET_CONFIGS[planet]
    if (endpointKey === 'mimir.gql' || endpointKey === 'mimir') {
      return staticConfig?.mimirUrl ?? ''
    }
    if (endpointKey === 'headless.gql' || endpointKey === 'headless') {
      return staticConfig?.headlessGql ?? ''
    }
    return ''
  }

  /**
   * Get all active URLs currently being used for a planet
   * Returns a map of endpointKey → URL
   */
  function getActiveEndpoints(planet: PlanetName): Record<string, string> {
    const keys = ['headless.gql', 'arena.gql', '9cscan.rest', 'dp.gql']
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = getRpcEndpoint(planet, key)
    }
    // mimir may not exist for all planets
    const mimirUrl = getRpcEndpoint(planet, 'mimir.gql')
    if (mimirUrl) result['mimir.gql'] = mimirUrl
    return result
  }

  /** Get mimir URL for a planet (convenience method) */
  function getMimirUrl(planet: PlanetName): string {
    return getRpcEndpoint(planet, 'mimir.gql')
  }

  /** Get headless GraphQL URL for a planet (convenience method) */
  function getHeadlessGql(planet: PlanetName): string {
    return getRpcEndpoint(planet, 'headless.gql')
  }

  /** Get arena GraphQL URL for a planet */
  function getArenaGql(planet: PlanetName): string {
    return getRpcEndpoint(planet, 'arena.gql')
  }

  /** Get 9cscan REST URL for a planet */
  function get9cscanRest(planet: PlanetName): string {
    return getRpcEndpoint(planet, '9cscan.rest')
  }

  /** Get 9cscan web URL for a planet */
  function get9cscanWebUrl(planet: PlanetName): string {
    const planetData = getPlanetData(planet)
    return planetData?.['9cscanUrl'] ?? ''
  }

  /** Get guild icon bucket URL for a planet */
  function getGuildIconBucket(planet: PlanetName): string {
    const planetData = getPlanetData(planet)
    return planetData?.guildIconBucket ?? ''
  }

  /** Get planet ID (hex) */
  function getPlanetId(planet: PlanetName): string {
    const planetData = getPlanetData(planet)
    return planetData?.id ?? ''
  }

  /** Get genesis hash for a planet */
  function getGenesisHash(planet: PlanetName): string {
    const planetData = getPlanetData(planet)
    return planetData?.genesisHash ?? ''
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Fetch planet data from URL_ALL_PLANET
   * Ref: .REF/python-tool/constants.py link_planet() – requests.get(URL_ALL_PLANET)
   *
   * Flow:
   * 1. Fetch URL_ALL_PLANET
   * 2. Parse JSON array of planet objects
   * 3. Store in planets ref
   * 4. If fetch fails, use fallback data
   */
  async function fetchPlanets(): Promise<boolean> {
    isLoading.value = true
    error.value = null
    loadingStatus.value = 'firstLoading.step.connecting'

    try {
      loadingStatus.value = 'firstLoading.step.fetching'
      const response = await fetch(URL_ALL_PLANET, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      loadingStatus.value = 'firstLoading.step.parsing'
      const data: PlanetData[] = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid planet data returned from API')
      }

      planets.value = data
      isLoaded.value = true
      lastFetchTime.value = Date.now()
      isLoading.value = false
      loadingStatus.value = 'firstLoading.step.done'

      logger.info('Fetched planets:', data.map((p) => p.name).join(', '))
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      error.value = message
      loadingStatus.value = 'firstLoading.step.fallback'
      logger.error('Failed to fetch planets:', message)

      // Use fallback data
      planets.value = [...FALLBACK_PLANETS]
      isLoaded.value = true // Mark as loaded (with fallback)
      isLoading.value = false

      return false
    }
  }

  /**
   * Retry fetching planet data
   */
  async function retry(): Promise<boolean> {
    return fetchPlanets()
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    planets,
    isLoading,
    error,
    isLoaded,
    lastFetchTime,
    loadingStatus,

    // Computed
    availablePlanetNames,
    availablePlanetSet,

    // Getters
    isPlanetAvailable,
    getPlanetData,
    getRpcEndpoint,
    getMimirUrl,
    getHeadlessGql,
    getArenaGql,
    get9cscanRest,
    get9cscanWebUrl,
    getGuildIconBucket,
    getPlanetId,
    getGenesisHash,
    getAvailableEndpoints,
    getActiveEndpoints,
    getEndpointMode,
    getEndpointSelection,

    // Endpoint selection actions
    setEndpointMode,
    setEndpointSelection,

    // Actions
    fetchPlanets,
    retry
  }
})
