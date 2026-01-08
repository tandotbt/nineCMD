import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCsvDataStore } from '@/stores/useCsvDataStore'
import { usePlanetStore } from '@/stores/usePlanetStore'
import type { CsvParserMessage } from '@/types/csv'

// Mocking useFetch from @vueuse/core
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useFetch: vi.fn().mockImplementation(() => {
      return {
        json: () =>
          Promise.resolve({
            data: {
              value: {
                status: 'success',
                data: { TestSheet: 'Y29sMSxjb2wyCjEsMg==' }, // base64 for "col1,col2\n1,2"
              },
            },
            error: { value: null },
          }),
        text: () =>
          Promise.resolve({
            data: { value: 'Key,Name\n1,TestItem' },
            error: { value: null },
          }),
      }
    }),
  }
})

// Mock Web Worker
class MockWorker {
  onmessage: ((ev: MessageEvent) => void) | null = null
  postMessage(message: CsvParserMessage) {
    // Simulate worker processing and returning data
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: {
            sheetName: message.sheetName,
            data: {
              name: message.sheetName,
              headers: ['id'],
              rows: [{ id: 1 }],
              mappedData: { '1': { id: 1 } },
              keyMain: message.keyMain,
            },
          },
        } as MessageEvent)
      }
    }, 0)
  }
  terminate() {}
}

// @ts-expect-error - Mocking global Worker
global.Worker = MockWorker
// @ts-expect-error - Mocking window Worker
if (typeof window !== 'undefined') window.Worker = MockWorker

describe('CsvDataStore - Caching and Planet Switching', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch data for a new planet and cache it', async () => {
    const csvStore = useCsvDataStore()
    const planetStore = usePlanetStore()

    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData()

    // Wait for worker simulation
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(csvStore.state.sheetsByPlanet['odin']).toBeDefined()
    expect(csvStore.state.lastUpdatedByPlanet['odin']).not.toBeNull()
  })

  it('should use cached data when switching back to a planet', async () => {
    const csvStore = useCsvDataStore()
    const planetStore = usePlanetStore()

    // 1. Fetch for Odin
    planetStore.currentPlanetName = 'odin'
    await csvStore.fetchCsvData()
    await new Promise((resolve) => setTimeout(resolve, 10))
    const firstUpdateOdin = csvStore.state.lastUpdatedByPlanet['odin']

    // 2. Switch to Heimdall and fetch
    planetStore.currentPlanetName = 'heimdall'
    await csvStore.fetchCsvData()
    await new Promise((resolve) => setTimeout(resolve, 10))
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
    await new Promise((resolve) => setTimeout(resolve, 10))
    const firstUpdate = csvStore.state.lastUpdatedByPlanet['odin']

    // Force fetch
    await new Promise((resolve) => setTimeout(resolve, 5))
    await csvStore.fetchCsvData(true)
    await new Promise((resolve) => setTimeout(resolve, 10))

    const secondUpdate = csvStore.state.lastUpdatedByPlanet['odin']
    expect(secondUpdate).not.toBe(firstUpdate)
  })
})
