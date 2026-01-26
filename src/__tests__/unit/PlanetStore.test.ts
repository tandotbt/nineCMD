import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlanetStore } from '../../stores/usePlanetStore'
import { PLANET_IDS, DEFAULT_PLANET } from '../../constants'

/**
 * PlanetStore.test.ts (Mocked via MSW)
 *
 * Mục tiêu: Kiểm tra tích hợp giữa PlanetStore và hệ thống Mock Network.
 * Đảm bảo store có thể load và process dữ liệu từ các file fixture local thông qua MSW.
 */
describe('Planet Store (Mocked Playback)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorage.clear()

    // Clear IndexedDB thực tế (via fake-indexeddb)
    const { db } = await import('../../db')
    await db.settings.clear()
  })

  it('should initialize with default planet from constants', () => {
    const store = usePlanetStore()
    expect(store.currentPlanetName).toBe(DEFAULT_PLANET)
    expect(store.currentPlanetId).toBe(PLANET_IDS[DEFAULT_PLANET as keyof typeof PLANET_IDS])
  })

  it('should fetch planets from mocked API and sync to IndexedDB', async () => {
    const store = usePlanetStore()

    // Thực hiện fetch (Sẽ bị MSW chặn và trả về từ planets.json fixture)
    await store.fetchPlanets()

    // Kiểm tra dữ liệu nhận được từ fixture
    expect(store.rawPlanets.length).toBeGreaterThan(0)

    // Kiểm tra các hành tinh cốt lõi
    const odin = store.rawPlanets.find((p) => p.name.toLowerCase() === 'odin')
    const heimdall = store.rawPlanets.find((p) => p.name.toLowerCase() === 'heimdall')

    expect(odin).toBeDefined()
    expect(heimdall).toBeDefined()
    expect(odin?.id).toBe(PLANET_IDS.odin)

    // Kiểm tra tính năng Offline-First: Dữ liệu phải được lưu vào IndexedDB
    const { db } = await import('../../db')
    const { STORAGE_KEYS } = await import('../../constants')
    const cached = await db.settings.get(STORAGE_KEYS.RAW_PLANETS)

    expect(cached?.value).toBeDefined()
    expect(Array.isArray(cached?.value)).toBe(true)
    expect((cached?.value as unknown[]).length).toBe(store.rawPlanets.length)
  })

  it('should update URLs correctly when switching between mocked planets', async () => {
    const store = usePlanetStore()
    await store.fetchPlanets()

    // Chuyển sang Heimdall
    store.setPlanet('heimdall')
    expect(store.currentPlanetName).toBe('heimdall')

    const heimdallConfig = store.rawPlanets.find((p) => p.name.toLowerCase() === 'heimdall')
    expect(store.graphqlUrl).toBe(heimdallConfig?.rpcEndpoints['headless.gql']![0])

    // Chuyển sang Odin
    store.setPlanet('odin')
    expect(store.selectedNodeIndex).toBe(0)
    const odinConfig = store.rawPlanets.find((p) => p.name.toLowerCase() === 'odin')
    expect(store.graphqlUrl).toBe(odinConfig?.rpcEndpoints['headless.gql']![0])
  })

  it('should reset node index when planet changes', () => {
    const store = usePlanetStore()
    store.setPlanet('odin')
    store.setNodeIndex(1)
    store.setPlanet('heimdall')
    expect(store.selectedNodeIndex).toBe(0)
  })
})
