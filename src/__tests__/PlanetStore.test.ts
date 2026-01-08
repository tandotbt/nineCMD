import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanetStore } from '../stores/usePlanetStore'
import { PLANET_RAW_URL, PLANET_IDS, DEFAULT_PLANET } from '../constants'
describe('Planet Store (Real Integration)', () => {
  const originalFetch = global.fetch

  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorage.clear()

    // Clear IndexedDB thực tế (via fake-indexeddb)
    const { db } = await import('../db')
    await db.settings.clear()

    // Mock global fetch nhưng sẽ gọi fetch thật cho PLANET_RAW_URL
    global.fetch = vi.fn(async (url) => {
      const urlStr = String(url)

      // Nếu là URL lấy danh sách hành tinh, gọi fetch thật
      if (urlStr === PLANET_RAW_URL) {
        return originalFetch(url)
      }

      // Giả lập API CSV (Dữ liệu nhỏ để tránh OOM)
      // Chúng ta vẫn để logic fetchCsvData chạy nhưng trả về mock data cực nhẹ
      if (urlStr.includes('getGraphqlCSV') || urlStr.includes('item_name.csv')) {
        const data = { status: 'success', data: { ArenaSheet: 'YmFzZTY0' } }
        return {
          ok: true,
          status: 200,
          json: async () => data,
          text: async () => JSON.stringify(data),
          clone: function () {
            return this
          },
        } as unknown as Response
      }

      // Mặc định gọi fetch thật cho các URL khác nếu cần
      return originalFetch(url)
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should initialize with default planet from constants', () => {
    const store = usePlanetStore()
    expect(store.currentPlanetName).toBe(DEFAULT_PLANET)
    expect(store.currentPlanetId).toBe(PLANET_IDS[DEFAULT_PLANET as keyof typeof PLANET_IDS])
  })

  it('should fetch real planets from production API and sync to IndexedDB', async () => {
    const store = usePlanetStore()

    // Thực hiện fetch thật từ https://planets.nine-chronicles.com/planets/
    await store.fetchPlanets()

    // Kiểm tra dữ liệu nhận được từ API thật
    expect(store.rawPlanets.length).toBeGreaterThan(0)

    // Kiểm tra các hành tinh cốt lõi phải tồn tại trong dữ liệu thật
    const odin = store.rawPlanets.find((p) => p.name.toLowerCase() === 'odin')
    const heimdall = store.rawPlanets.find((p) => p.name.toLowerCase() === 'heimdall')

    expect(odin).toBeDefined()
    expect(heimdall).toBeDefined()

    // Kiểm tra tính đúng đắn của ID (có thể lấy từ constants để so sánh)
    expect(odin?.id).toBe(PLANET_IDS.odin)

    // Kiểm tra tính năng Offline-First: Dữ liệu phải được lưu vào IndexedDB thật
    const { db } = await import('../db')
    const { STORAGE_KEYS } = await import('../constants')
    const cached = await db.settings.get(STORAGE_KEYS.RAW_PLANETS)

    expect(cached?.value).toBeDefined()
    expect(Array.isArray(cached?.value)).toBe(true)
    expect((cached?.value as unknown[]).length).toBe(store.rawPlanets.length)
  }, 30000)

  it('should update URLs correctly when switching between real planets', async () => {
    const store = usePlanetStore()
    await store.fetchPlanets() // Tải dữ liệu thật trước

    // Chuyển sang Heimdall
    store.setPlanet('heimdall')
    expect(store.currentPlanetName).toBe('heimdall')

    // URL phải khớp với dữ liệu từ API (hoặc fallback constants nếu API trùng khớp)
    const heimdallConfig = store.rawPlanets.find((p) => p.name.toLowerCase() === 'heimdall')
    expect(store.graphqlUrl).toBe(heimdallConfig?.rpcEndpoints['headless.gql']![0])

    // Chuyển sang Odin
    store.setPlanet('odin')
    expect(store.selectedNodeIndex).toBe(0) // Reset index
    const odinConfig = store.rawPlanets.find((p) => p.name.toLowerCase() === 'odin')
    expect(store.graphqlUrl).toBe(odinConfig?.rpcEndpoints['headless.gql']![0])
  })

  it('should handle network failure by falling back to IndexedDB cache', async () => {
    const store = usePlanetStore()

    // 1. Tải và lưu cache thành công trước
    await store.fetchPlanets()
    const firstFetchCount = store.rawPlanets.length

    // 2. Giả lập mất mạng
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Xóa state trong memory nhưng giữ cache trong IndexedDB
    store.rawPlanets = []

    // 3. Thử fetch lại khi mất mạng
    await store.fetchPlanets()

    // Dữ liệu phải được phục hồi từ IndexedDB
    expect(store.rawPlanets.length).toBe(firstFetchCount)
    expect(store.error).toBe('Network Error')

    consoleSpy.mockRestore()
  })

  it('should reset node index when planet changes', () => {
    const store = usePlanetStore()
    store.setPlanet('odin')
    store.setNodeIndex(1)
    store.setPlanet('heimdall')
    expect(store.selectedNodeIndex).toBe(0)
  })
})
