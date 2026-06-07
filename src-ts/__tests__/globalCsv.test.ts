/**
 * globalCsv Tests – Kiểm tra globalCsv store (pattern GLOBAL)
 *
 * Coverage:
 * 1. nameService: buildLocalizedCsvUrl, fetchLocalizedSheet, fetchAllLocalizedSheets,
 *    fetchRemoteCsv, getLocalizedName
 * 2. globalCsv store: state, loadAll (Promise.allSettled), localeColumn, getters,
 *    getItemName/getSkillName/getRemoteCsvRow, retry, clearData
 *
 * Pattern GLOBAL đã thay thế per-planet pattern cũ:
 * - KHÔNG có per-planet cache
 * - KHÔNG watch planet
 * - Promise.allSettled: 1 source fail không ảnh hưởng source khác
 * - KHÔNG retry bắt buộc (kiểu thứ 3 cần loading)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  buildLocalizedCsvUrl,
  fetchLocalizedSheet,
  fetchAllLocalizedSheets,
  fetchRemoteCsv,
  getLocalizedName
} from '../utilities/nameService'
import { useGlobalCsvStore } from '../stores/globalCsv'
import { useAppSettingsStore } from '../stores/appSettings'
import {
  URL_GITHUB_NineChronicles,
  URL_GITHUB_LIVEASSETS,
  REMOTE_CSV_URL
} from '../utilities/constants'
import type { LocalizedSheetData, RemoteCsvData } from '../types/i18nCsv'

// ============================================================
// Mock localStorage (cần thiết vì appSettings dùng localStorage)
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
// Mock CSV data
// ============================================================

const mockItemNameCsv = `Key,English,Vietnamese,Korean,Japanese
1001,Sword,Kiếm,검,剣
1002,Shield,Khiên,방패,盾
1003,Potion,Thuốc,물약,薬`

const mockSkillNameCsv = `Key,English,Vietnamese,Korean,Japanese
2001,Fireball,Quả cầu lửa,불꽃,火の玉
2002,Heal,Hồi máu,치유,治癒
2003,Ice Spike,Băng đinh,얼음,氷`

const mockRemoteCsv = `Key,Value,Type
shop_url,https://example.com,string
event_id,1234,number
max_count,100,number`

/** Mock fetch response */
function mockFetchResponse(body: string, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    text: async () => body
  } as Response
}

// ============================================================
// nameService Tests
// ============================================================

describe('nameService', () => {
  describe('buildLocalizedCsvUrl', () => {
    it('builds correct URL for ItemNameSheet with odin planet', () => {
      const url = buildLocalizedCsvUrl('ItemNameSheet', 'odin')
      expect(url).toBe(
        `${URL_GITHUB_NineChronicles}/nekoyume/Assets/StreamingAssets/Localization/item_name.csv#odin`
      )
    })

    it('builds correct URL for SkillNameSheet with heimdall planet', () => {
      const url = buildLocalizedCsvUrl('SkillNameSheet', 'heimdall')
      expect(url).toBe(
        `${URL_GITHUB_NineChronicles}/nekoyume/Assets/StreamingAssets/Localization/skill_name.csv#heimdall`
      )
    })

    it('contains cache busting hash for each planet', () => {
      const odinUrl = buildLocalizedCsvUrl('ItemNameSheet', 'odin')
      const heimdallUrl = buildLocalizedCsvUrl('ItemNameSheet', 'heimdall')
      const thorUrl = buildLocalizedCsvUrl('ItemNameSheet', 'thor')

      expect(odinUrl).toContain('#odin')
      expect(heimdallUrl).toContain('#heimdall')
      expect(thorUrl).toContain('#thor')
    })
  })

  describe('fetchLocalizedSheet', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('fetches and parses ItemNameSheet CSV', async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(mockItemNameCsv))
      const data = await fetchLocalizedSheet('ItemNameSheet', 'odin')
      expect(data).toBeDefined()
      expect(Object.keys(data).length).toBe(3)
      expect(data[1001].English).toBe('Sword')
      expect(data[1001].Vietnamese).toBe('Kiếm')
    })

    it('fetches and parses SkillNameSheet CSV', async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(mockSkillNameCsv))
      const data = await fetchLocalizedSheet('SkillNameSheet', 'odin')
      expect(data).toBeDefined()
      expect(Object.keys(data).length).toBe(3)
      expect(data[2001].English).toBe('Fireball')
      expect(data[2001].Vietnamese).toBe('Quả cầu lửa')
    })

    it('throws on fetch failure', async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse('', false, 500))
      await expect(fetchLocalizedSheet('ItemNameSheet', 'odin')).rejects.toThrow()
    })
  })

  describe('fetchAllLocalizedSheets', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('fetches both sheets in parallel', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))

      const result = await fetchAllLocalizedSheets('odin')
      expect(result.ItemNameSheet[1001].English).toBe('Sword')
      expect(result.SkillNameSheet[2001].English).toBe('Fireball')
    })

    it('rejects if any sheet fails (Promise.all behavior)', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))

      await expect(fetchAllLocalizedSheets('odin')).rejects.toThrow()
    })
  })

  describe('fetchRemoteCsv', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('fetches and parses RemoteCsv', async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(mockRemoteCsv))
      const data = await fetchRemoteCsv()
      expect(data).toBeDefined()
      expect(Object.keys(data).length).toBe(3)
      expect(data['shop_url'].Value).toBe('https://example.com')
    })

    it('uses correct URL', () => {
      expect(REMOTE_CSV_URL).toBe(`${URL_GITHUB_LIVEASSETS}/Assets/Csv/RemoteCsv.csv`)
    })
  })

  describe('getLocalizedName', () => {
    const row: LocalizedSheetData[string] = {
      Key: 1001,
      English: 'Sword',
      Vietnamese: 'Kiếm',
      Korean: '검',
      Japanese: '剣'
    }

    it('returns value from requested locale column', () => {
      expect(getLocalizedName(row, 'Vietnamese', 1001)).toBe('Kiếm')
      expect(getLocalizedName(row, 'Korean', 1001)).toBe('검')
    })

    it('falls back to English if requested locale is empty', () => {
      const emptyRow = { ...row, Vietnamese: '' }
      expect(getLocalizedName(emptyRow, 'Vietnamese', 1001)).toBe('Sword')
    })

    it('falls back to Key if both requested locale and English are empty', () => {
      const emptyRow = { ...row, Vietnamese: '', English: '' }
      expect(getLocalizedName(emptyRow, 'Vietnamese', 1001)).toBe('1001')
    })

    it('returns Key as string if row is undefined', () => {
      expect(getLocalizedName(undefined, 'English', 9999)).toBe('9999')
    })

    it('converts number key to string', () => {
      expect(getLocalizedName(undefined, 'English', 1001)).toBe('1001')
    })
  })
})

// ============================================================
// globalCsv Store Tests
// ============================================================

describe('globalCsv Store (GLOBAL pattern)', () => {
  beforeEach(() => {
    // Reset localStorage + inject mock
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true
    })
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with empty sheets and not loaded', () => {
      const store = useGlobalCsvStore()
      expect(store.itemNameSheet).toEqual({})
      expect(store.skillNameSheet).toEqual({})
      expect(store.remoteCsv).toEqual({})
      expect(store.isLoaded).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('has correct sourceErrors initial values', () => {
      const store = useGlobalCsvStore()
      expect(store.sourceErrors).toEqual({ localized: null, remote: null })
    })

    it('hasAnyData is false when empty', () => {
      const store = useGlobalCsvStore()
      expect(store.hasAnyData).toBe(false)
    })

    it('allSourcesFailed is true only when both errors set', () => {
      const store = useGlobalCsvStore()
      expect(store.allSourcesFailed).toBe(false)
    })
  })

  describe('localeColumn computed', () => {
    it('returns English as fallback for unknown lang', () => {
      const store = useGlobalCsvStore()
      expect(store.localeColumn).toBe('English')
    })

    it('updates when appSettings.lang changes', () => {
      const appSettings = useAppSettingsStore()
      const store = useGlobalCsvStore()

      appSettings.setLang('vi')
      expect(store.localeColumn).toBe('Vietnamese')

      appSettings.setLang('en')
      expect(store.localeColumn).toBe('English')
    })

    it('does NOT trigger loadAll when lang changes', async () => {
      const appSettings = useAppSettingsStore()
      const store = useGlobalCsvStore()
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      appSettings.setLang('vi')
      appSettings.setLang('en')

      // Wait a tick
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('loadAll – Promise.allSettled pattern', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('loads all 3 sources successfully', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))

      const store = useGlobalCsvStore()
      const result = await store.loadAll()

      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.itemNameCount).toBe(3)
      expect(store.skillNameCount).toBe(3)
      expect(store.remoteCsvCount).toBe(3)
      expect(store.hasAnyData).toBe(true)
      expect(store.sourceErrors.localized).toBe(null)
      expect(store.sourceErrors.remote).toBe(null)
    })

    it('continues with partial data when localized fails but remote succeeds', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse('', false, 500)) // ItemName fail
        .mockResolvedValueOnce(mockFetchResponse('', false, 500)) // SkillName fail
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv)) // Remote ok

      const store = useGlobalCsvStore()
      const result = await store.loadAll()

      expect(result).toBe(true) // Có data từ remote
      expect(store.isLoaded).toBe(true)
      expect(store.itemNameCount).toBe(0)
      expect(store.skillNameCount).toBe(0)
      expect(store.remoteCsvCount).toBe(3)
      expect(store.sourceErrors.localized).toBeTruthy()
      expect(store.sourceErrors.remote).toBe(null)
    })

    it('continues with partial data when remote fails but localized succeeds', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500)) // Remote fail

      const store = useGlobalCsvStore()
      const result = await store.loadAll()

      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.itemNameCount).toBe(3)
      expect(store.skillNameCount).toBe(3)
      expect(store.remoteCsvCount).toBe(0)
      expect(store.sourceErrors.localized).toBe(null)
      expect(store.sourceErrors.remote).toBeTruthy()
    })

    it('returns false and sets error when ALL sources fail', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))

      const store = useGlobalCsvStore()
      const result = await store.loadAll()

      expect(result).toBe(false)
      expect(store.isLoaded).toBe(false)
      expect(store.hasAnyData).toBe(false)
      expect(store.allSourcesFailed).toBe(true)
      expect(store.error).toBeTruthy()
    })

    it('skips reload if already loaded', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))

      const store = useGlobalCsvStore()
      await store.loadAll()
      const callCount = fetchSpy.mock.calls.length

      // Gọi lần 2
      const result = await store.loadAll()
      expect(result).toBe(true)
      expect(fetchSpy.mock.calls.length).toBe(callCount) // Không fetch thêm
    })

    it('updates lastFetchTime on success', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))

      const store = useGlobalCsvStore()
      const before = Date.now()
      await store.loadAll()
      const after = Date.now()

      expect(store.lastFetchTime).toBeGreaterThanOrEqual(before)
      expect(store.lastFetchTime).toBeLessThanOrEqual(after)
    })
  })

  describe('Getters', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('getItemName returns localized name', async () => {
      const appSettings = useAppSettingsStore()
      appSettings.setLang('vi')

      const store = useGlobalCsvStore()
      await store.loadAll()

      expect(store.getItemName(1001)).toBe('Kiếm')
      expect(store.getItemName(1002)).toBe('Khiên')
    })

    it('getItemName falls back to English for non-Vietnamese locale', async () => {
      const store = useGlobalCsvStore()
      await store.loadAll()

      expect(store.getItemName(1001)).toBe('Sword')
    })

    it('getItemName returns key as string when not found', async () => {
      const store = useGlobalCsvStore()
      await store.loadAll()

      expect(store.getItemName(9999)).toBe('9999')
    })

    it('getSkillName returns localized name', async () => {
      const appSettings = useAppSettingsStore()
      appSettings.setLang('vi')

      const store = useGlobalCsvStore()
      await store.loadAll()

      expect(store.getSkillName(2001)).toBe('Quả cầu lửa')
    })

    it('getItemNameRow / getSkillNameRow return full row', async () => {
      const store = useGlobalCsvStore()
      await store.loadAll()

      const row = store.getItemNameRow(1001)
      expect(row).toBeTruthy()
      expect(row?.English).toBe('Sword')

      const missing = store.getItemNameRow(9999)
      expect(missing).toBe(null)
    })

    it('getRemoteCsvRow returns row by key', async () => {
      const store = useGlobalCsvStore()
      await store.loadAll()

      const row = store.getRemoteCsvRow('shop_url')
      expect(row).toBeTruthy()
      expect((row as RemoteCsvData[string])?.Value).toBe('https://example.com')
    })
  })

  describe('retry and clearData', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('retry clears data and reloads', async () => {
      const store = useGlobalCsvStore()

      // First load: all fail
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))
        .mockResolvedValueOnce(mockFetchResponse('', false, 500))

      await store.loadAll()
      expect(store.isLoaded).toBe(false)

      // Retry: all succeed
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))

      const result = await store.retry()
      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.itemNameCount).toBe(3)
    })

    it('clearData resets all state', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetchResponse(mockItemNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockSkillNameCsv))
        .mockResolvedValueOnce(mockFetchResponse(mockRemoteCsv))

      const store = useGlobalCsvStore()
      await store.loadAll()

      store.clearData()

      expect(store.itemNameSheet).toEqual({})
      expect(store.skillNameSheet).toEqual({})
      expect(store.remoteCsv).toEqual({})
      expect(store.isLoaded).toBe(false)
      expect(store.error).toBe(null)
      expect(store.lastFetchTime).toBe(0)
      expect(store.sourceErrors).toEqual({ localized: null, remote: null })
    })
  })

  describe('GLOBAL behavior (no per-planet)', () => {
    it('does not have switchPlanet or per-planet cache', () => {
      const store = useGlobalCsvStore()
      // Không có method switchPlanet trong globalCsv
      expect((store as unknown as { switchPlanet?: unknown }).switchPlanet).toBeUndefined()
    })

    it('does not have isPlanetCached helper', () => {
      const store = useGlobalCsvStore()
      expect((store as unknown as { isPlanetCached?: unknown }).isPlanetCached).toBeUndefined()
    })

    it('does not watch planet changes', async () => {
      const appSettings = useAppSettingsStore()
      const store = useGlobalCsvStore()
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      appSettings.setPlanet('heimdall')
      appSettings.setPlanet('thor')
      appSettings.setPlanet('odin')

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(store.isLoaded).toBe(false)
    })
  })
})
