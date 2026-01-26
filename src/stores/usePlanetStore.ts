/**
 * @file stores/usePlanetStore.ts
 * @description Pinia store for managing current planet state and RPC URLs.
 * Supports persistence via LocalStorage.
 */

import { defineStore } from 'pinia'
import { computed, watch, ref, toRaw } from 'vue'
import { useStorage, useFetch } from '@vueuse/core'
import {
  DEFAULT_PLANET,
  PLANET_STORAGE_KEY,
  PLANET_RAW_DATA_KEY,
  PLANET_CONFIGS,
  PLANET_IDS,
  NODE_INDEX_STORAGE_KEY,
  MIMIR_INDEX_STORAGE_KEY,
  ARENA_INDEX_STORAGE_KEY,
  MARKET_INDEX_STORAGE_KEY,
  WORLD_BOSS_INDEX_STORAGE_KEY,
  STORAGE_KEYS,
} from '../constants'
import type { PlanetName, RpcConfig, PlanetConfig } from '../types/planet'
import { useApiStore } from './useApiStore'

export const usePlanetStore = defineStore('planet', () => {
  const apiStore = useApiStore()
  // State
  const isLoading = ref(false)

  const currentPlanetName = useStorage<PlanetName>(PLANET_STORAGE_KEY, DEFAULT_PLANET)
  const error = ref<string | null>(null)

  // Persistence via VueUse useStorage
  const rawPlanets = useStorage<PlanetConfig[]>(PLANET_RAW_DATA_KEY, [])
  const selectedNodeIndex = useStorage<number>(NODE_INDEX_STORAGE_KEY, 0)
  const selectedMimirIndex = useStorage<number>(MIMIR_INDEX_STORAGE_KEY, 0)
  const selectedArenaIndex = useStorage<number>(ARENA_INDEX_STORAGE_KEY, 0)
  const selectedMarketIndex = useStorage<number>(MARKET_INDEX_STORAGE_KEY, 0)
  const selectedWorldBossIndex = useStorage<number>(WORLD_BOSS_INDEX_STORAGE_KEY, 0)

  // Getters
  const currentPlanetConfig = computed<PlanetConfig>(() => {
    const targetId = PLANET_IDS[currentPlanetName.value as keyof typeof PLANET_IDS]

    // Try matching by ID first, then by case-insensitive name
    const dynamic = rawPlanets.value.find(
      (p) =>
        (targetId && p.id === targetId) ||
        p.name.toLowerCase() === currentPlanetName.value.toLowerCase(),
    )

    if (dynamic) return dynamic

    // Fallback to static constants
    const staticConfig = PLANET_CONFIGS[currentPlanetName.value as keyof typeof PLANET_CONFIGS]
    if (staticConfig) return staticConfig as PlanetConfig

    // Final fallback to first available or empty
    return (
      rawPlanets.value[0] ||
      (PLANET_CONFIGS[DEFAULT_PLANET] as PlanetConfig) ||
      ({
        id: '',
        name: currentPlanetName.value,
        genesisHash: '',
        rpcEndpoints: { 'headless.gql': [], 'mimir.gql': [] },
      } as PlanetConfig)
    )
  })

  const currentPlanetId = computed(() => currentPlanetConfig.value.id)
  const isIdMismatch = computed(() => {
    const targetId = PLANET_IDS[currentPlanetName.value as keyof typeof PLANET_IDS]
    if (!targetId || !currentPlanetConfig.value.id) return false
    return targetId !== currentPlanetConfig.value.id
  })
  const rpcEndpoints = computed(() => currentPlanetConfig.value.rpcEndpoints)

  const getUrl = (key: keyof RpcConfig, index: number) => {
    const nodes = rpcEndpoints.value[key]
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return ''
    // Ensure index is within bounds, otherwise fallback to first node
    const safeIndex = index >= 0 && index < nodes.length ? index : 0
    return nodes[safeIndex] || ''
  }

  const graphqlUrl = computed(() => getUrl('headless.gql', selectedNodeIndex.value))
  const mimirUrl = computed(() => getUrl('mimir.gql', selectedMimirIndex.value))
  const arenaUrl = computed(() => getUrl('arena.rest', selectedArenaIndex.value))
  const marketUrl = computed(() => getUrl('market.rest', selectedMarketIndex.value))
  const worldBossUrl = computed(() => getUrl('world-boss.rest', selectedWorldBossIndex.value))

  // Actions
  const fetchPlanets = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch(apiStore.planetRawUrl).json<
        PlanetConfig[]
      >()

      if (fetchError.value) {
        throw new Error(fetchError.value)
      }

      if (data.value && Array.isArray(data.value)) {
        rawPlanets.value = data.value
        // Sync to IndexedDB for Service Worker
        const { db } = await import('../db')
        // Use toRaw to avoid DataCloneError in IndexedDB/fake-indexeddb
        await db.settings.put({ key: STORAGE_KEYS.RAW_PLANETS, value: toRaw(data.value) })
      }
    } catch (err: unknown) {
      console.error('[PlanetStore] Failed to fetch planets:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch planets'

      // Offline/Failure: Try to load from IndexedDB if rawPlanets is empty
      if (rawPlanets.value.length === 0) {
        const { db } = await import('../db')
        const cached = await db.settings.get(STORAGE_KEYS.RAW_PLANETS)
        if (cached?.value && Array.isArray(cached.value)) {
          rawPlanets.value = cached.value
        }
      }
    } finally {
      isLoading.value = false
      // Fetch CSV data after planet info is loaded
      const csvStore = (await import('./useCsvDataStore')).useCsvDataStore()
      csvStore.fetchCsvData()
    }
  }

  const setPlanet = (name: PlanetName) => {
    currentPlanetName.value = name
    // Reset node indexes when planet changes
    selectedNodeIndex.value = 0
    selectedMimirIndex.value = 0
    selectedArenaIndex.value = 0
    selectedMarketIndex.value = 0
    selectedWorldBossIndex.value = 0
  }

  const setNodeIndex = (index: number) => {
    selectedNodeIndex.value = index
  }

  const setMimirIndex = (index: number) => {
    selectedMimirIndex.value = index
  }

  const setArenaIndex = (index: number) => {
    selectedArenaIndex.value = index
  }

  const setMarketIndex = (index: number) => {
    selectedMarketIndex.value = index
  }

  const setWorldBossIndex = (index: number) => {
    selectedWorldBossIndex.value = index
  }

  // Watch for planet change to perform side effects
  watch(currentPlanetName, async (newName) => {
    const { db } = await import('../db')
    await db.settings.put({ key: STORAGE_KEYS.PLANET, value: newName })
  })

  // Sync node indexes to IndexedDB for Service Worker
  watch(
    [
      selectedNodeIndex,
      selectedMimirIndex,
      selectedArenaIndex,
      selectedMarketIndex,
      selectedWorldBossIndex,
    ],
    async ([nodeIdx, mimirIdx, arenaIdx, marketIdx, wbIdx]) => {
      const { db } = await import('../db')
      await db.settings.bulkPut([
        { key: NODE_INDEX_STORAGE_KEY, value: nodeIdx },
        { key: MIMIR_INDEX_STORAGE_KEY, value: mimirIdx },
        { key: ARENA_INDEX_STORAGE_KEY, value: arenaIdx },
        { key: MARKET_INDEX_STORAGE_KEY, value: marketIdx },
        { key: WORLD_BOSS_INDEX_STORAGE_KEY, value: wbIdx },
      ])
    },
  )

  return {
    isLoading,
    error,
    currentPlanetName,
    rawPlanets,
    currentPlanetConfig,
    currentPlanetId,
    rpcEndpoints,
    graphqlUrl,
    mimirUrl,
    arenaUrl,
    marketUrl,
    worldBossUrl,
    isIdMismatch,
    selectedNodeIndex,
    selectedMimirIndex,
    selectedArenaIndex,
    selectedMarketIndex,
    selectedWorldBossIndex,
    fetchPlanets,
    setPlanet,
    setNodeIndex,
    setMimirIndex,
    setArenaIndex,
    setMarketIndex,
    setWorldBossIndex,
  }
})
