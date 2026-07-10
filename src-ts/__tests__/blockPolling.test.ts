import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBlockPollingStore } from '../stores/blockPolling'
import { useAppSettingsStore } from '../stores/appSettings'

// Mock localStorage
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

// Mock fetch
const mockFetch = vi.fn()

function mockSuccessResponse(blockIndex: number) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        data: {
          blocks: {
            items: [{ object: { index: blockIndex } }]
          }
        }
      })
  }
}

describe('blockPolling Store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('fetch', mockFetch)
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
    mockFetch.mockReset()
    // Default: successful response
    mockFetch.mockResolvedValue(mockSuccessResponse(1000))
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================
  // Initial State
  // ============================================================
  describe('Initial State', () => {
    it('should default to odin planet', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.selectedPlanet).toBe('odin')
      expect(store.planetLabel).toBe('Odin')
    })

    it('should have avgBlockTime fallback with no history', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.avgBlockTime).toBe(8) // AVG_BLOCK_FALLBACK
    })

    it('should have default poll interval', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.pollIntervalMs).toBe(10000)
    })
  })

  // ============================================================
  // Planet Management
  // ============================================================
  describe('Planet Management', () => {
    it('should switch planet via appSettings', () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      blockStore.switchPlanet('heimdall')
      expect(appStore.selectedPlanet).toBe('heimdall')
      expect(blockStore.planetLabel).toBe('Heimdall')
    })

    it('should update planetLabel when planet changes', () => {
      const store = useBlockPollingStore()
      store.stopPolling()

      store.switchPlanet('heimdall')
      expect(store.planetLabel).toBe('Heimdall')

      store.switchPlanet('odin')
      expect(store.planetLabel).toBe('Odin')
    })
  })

  // ============================================================
  // Poll Interval
  // ============================================================
  describe('Poll Interval', () => {
    it('should default to 10000ms', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.pollIntervalMs).toBe(10000)
    })

    it('should change poll interval via appSettings', () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      blockStore.setPollInterval(5000)
      expect(appStore.pollIntervalMs).toBe(5000)
      expect(blockStore.pollIntervalMs).toBe(5000)
    })
  })

  // ============================================================
  // Polling Control
  // ============================================================
  describe('Polling Control', () => {
    it('should stop polling', () => {
      const store = useBlockPollingStore()
      // Store auto-starts, so stop it
      store.stopPolling()
      expect(store.isPolling).toBe(false)
    })

    it('should start polling from stopped state', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.isPolling).toBe(false)

      store.startPolling()
      expect(store.isPolling).toBe(true)

      store.stopPolling()
      expect(store.isPolling).toBe(false)
    })
  })

  // ============================================================
  // Data Processing (no async needed)
  // ============================================================
  describe('Data Processing', () => {
    it('should show 0% success rate when no polls', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.successRate).toBe('0%')
    })

    it('should show 0 history length initially', () => {
      const store = useBlockPollingStore()
      store.stopPolling()
      expect(store.historyLength).toBe(0)
    })
  })

  // ============================================================
  // GraphQL Query (test refresh directly)
  // ============================================================
  describe('GraphQL Query', () => {
    it('should send correct query to mimir endpoint', async () => {
      mockFetch.mockResolvedValue(mockSuccessResponse(99999))
      const store = useBlockPollingStore()
      store.stopPolling()

      await store.refresh()

      expect(mockFetch).toHaveBeenCalled()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('https://odin-mimir.9c.gg/graphql')
      expect(options.method).toBe('POST')

      const body = JSON.parse(options.body)
      expect(body.query).toContain('blocks(take: 1)')
      expect(body.query).toContain('index')
    })

    it('should parse block index from response', async () => {
      mockFetch.mockResolvedValue(mockSuccessResponse(42))
      const store = useBlockPollingStore()
      store.stopPolling()

      await store.refresh()

      expect(store.currentBlockIndex).toBe(42)
      expect(store.successCount).toBeGreaterThanOrEqual(1)
    })

    it('should handle fetch error gracefully', async () => {
      const store = useBlockPollingStore()
      store.stopPolling()

      mockFetch.mockRejectedValue(new Error('Network error'))
      await store.refresh()

      expect(store.error).toBe('Network error')
    })

    it('should handle HTTP error response', async () => {
      const store = useBlockPollingStore()
      store.stopPolling()

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
      await store.refresh()

      expect(store.error).toContain('500')
    })

    it('should handle empty response gracefully', async () => {
      const store = useBlockPollingStore()
      store.stopPolling()

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { blocks: { items: [] } } })
      })
      await store.refresh()

      expect(store.error).toContain('No block data received from Mimir')
    })

    it('should use heimdall mimir URL when planet is heimdall', async () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      appStore.setPlanet('heimdall')
      mockFetch.mockResolvedValue(mockSuccessResponse(100))

      await blockStore.refresh()

      const [url] = mockFetch.mock.calls[0]
      expect(url).toBe('https://heimdall-mimir.9c.gg/graphql')
    })

    it('should increment pollCount on refresh', async () => {
      mockFetch.mockResolvedValue(mockSuccessResponse(100))
      const store = useBlockPollingStore()
      store.stopPolling()

      const initialCount = store.pollCount
      await store.refresh()
      expect(store.pollCount).toBe(initialCount + 1)
    })

    it('should increment successCount on successful poll', async () => {
      mockFetch.mockResolvedValue(mockSuccessResponse(100))
      const store = useBlockPollingStore()
      store.stopPolling()

      const initialCount = store.successCount
      await store.refresh()
      expect(store.successCount).toBe(initialCount + 1)
    })

    it('should increment failCount on failed poll', async () => {
      const store = useBlockPollingStore()
      store.stopPolling()

      const initialCount = store.failCount
      mockFetch.mockRejectedValue(new Error('fail'))
      await store.refresh()
      expect(store.failCount).toBe(initialCount + 1)
    })
  })

  // ============================================================
  // Integration with appSettings
  // ============================================================
  describe('Integration with appSettings', () => {
    it('should reflect planet from appSettings', () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      appStore.setPlanet('heimdall')
      expect(blockStore.selectedPlanet).toBe('heimdall')
      expect(blockStore.planetLabel).toBe('Heimdall')
    })

    it('should reflect poll interval from appSettings', () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      appStore.setPollInterval(30000)
      expect(blockStore.pollIntervalMs).toBe(30000)
    })
  })

  // ============================================================
  // Auto-start polling from persisted isPolling
  // ============================================================
  describe('Auto-start from isPolling', () => {
    it('should auto-start polling when isPolling is persisted as true', () => {
      // Pre-set isPolling in localStorage before creating store
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ isPolling: true })
      setActivePinia(createPinia())

      const blockStore = useBlockPollingStore()
      expect(blockStore.isPolling).toBe(true)
      blockStore.stopPolling()
    })

    it('should not auto-start when isPolling is false', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ isPolling: false })
      setActivePinia(createPinia())

      const blockStore = useBlockPollingStore()
      expect(blockStore.isPolling).toBe(false)
    })

    it('should start polling when isPolling changes to true', async () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()
      blockStore.stopPolling()

      expect(blockStore.isPolling).toBe(false)
      appStore.setIsPolling(true)

      // The watch with { immediate: true } should trigger startPolling
      // Give it a tick to process
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(blockStore.isPolling).toBe(true)
      blockStore.stopPolling()
    })

    it('should stop polling when isPolling changes to false', async () => {
      const blockStore = useBlockPollingStore()
      const appStore = useAppSettingsStore()

      // Start polling first
      appStore.setIsPolling(true)
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(blockStore.isPolling).toBe(true)

      // Now stop
      appStore.setIsPolling(false)
      await new Promise((resolve) => setTimeout(resolve, 10))
      expect(blockStore.isPolling).toBe(false)
    })
  })
})
