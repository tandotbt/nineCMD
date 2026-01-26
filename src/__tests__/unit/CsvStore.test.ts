import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCsvDataStore } from '../../stores/useCsvDataStore'
import { usePlanetStore } from '../../stores/usePlanetStore'

/**
 * CsvStore.test.ts (Mocked via MSW)
 *
 * Mục tiêu: Kiểm tra tích hợp giữa CsvDataStore và hệ thống Mock Network.
 */
describe('CsvDataStore - Caching and Planet Switching (Mocked Playback)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should fetch data for a new planet and cache it', async () => {
    const csvStore = useCsvDataStore()
    const planetStore = usePlanetStore()

    // Sẽ gọi API và bị MSW chặn
    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData()

    // Wait for worker simulation (since CsvDataStore uses Web Workers)
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(csvStore.state.sheetsByPlanet['odin']).toBeDefined()
    expect(csvStore.state.lastUpdatedByPlanet['odin']).not.toBeNull()
  })

  it('should use cached data when switching back to a planet', async () => {
    const csvStore = useCsvDataStore()
    const planetStore = usePlanetStore()

    // 1. Fetch for Odin
    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData()
    await new Promise((resolve) => setTimeout(resolve, 50))
    const firstUpdateOdin = csvStore.state.lastUpdatedByPlanet['odin']

    // 2. Switch to Heimdall and fetch
    planetStore.currentPlanetName = 'heimdall'
    await csvStore.fetchCsvData()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(csvStore.state.sheetsByPlanet['heimdall']).toBeDefined()

    // 3. Switch back to Odin
    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData() // Should use cache

    expect(csvStore.state.lastUpdatedByPlanet['odin']).toBe(firstUpdateOdin)
  })

  it('should force refetch when requested', async () => {
    const csvStore = useCsvDataStore()
    const planetStore = usePlanetStore()

    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData()
    await new Promise((resolve) => setTimeout(resolve, 50))
    const firstUpdate = csvStore.state.lastUpdatedByPlanet['odin']

    // Force fetch
    await new Promise((resolve) => setTimeout(resolve, 10))
    await csvStore.fetchCsvData(true)
    await new Promise((resolve) => setTimeout(resolve, 50))

    const secondUpdate = csvStore.state.lastUpdatedByPlanet['odin']
    expect(secondUpdate).not.toBe(firstUpdate)
  })
})
