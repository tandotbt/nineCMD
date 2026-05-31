import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppSettingsStore } from '../stores/appSettings'

// Mock localStorage for jsdom environment
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

describe('appSettings Store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
    setActivePinia(createPinia())
  })

  // ============================================================
  // Dark Mode
  // ============================================================
  describe('Dark Mode', () => {
    it('should default to light mode', () => {
      const store = useAppSettingsStore()
      expect(store.isDarkMode).toBe(false)
    })

    it('should toggle dark mode', () => {
      const store = useAppSettingsStore()
      expect(store.isDarkMode).toBe(false)

      store.toggleDarkMode()
      expect(store.isDarkMode).toBe(true)

      store.toggleDarkMode()
      expect(store.isDarkMode).toBe(false)
    })

    it('should set dark mode explicitly', () => {
      const store = useAppSettingsStore()
      store.setDarkMode(true)
      expect(store.isDarkMode).toBe(true)

      store.setDarkMode(true) // idempotent
      expect(store.isDarkMode).toBe(true)

      store.setDarkMode(false)
      expect(store.isDarkMode).toBe(false)
    })

    it('should persist dark mode to localStorage', () => {
      const store = useAppSettingsStore()
      store.setDarkMode(true)

      const stored = JSON.parse(localStorageStore['setting-nine-cmd'] || '{}')
      expect(stored.isDarkMode).toBe(true)
    })

    it('should restore dark mode from localStorage', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ isDarkMode: true })
      const store = useAppSettingsStore()
      expect(store.isDarkMode).toBe(true)
    })
  })

  // ============================================================
  // Language
  // ============================================================
  describe('Language', () => {
    it('should default to "en"', () => {
      const store = useAppSettingsStore()
      expect(store.lang).toBe('en')
    })

    it('should change language', () => {
      const store = useAppSettingsStore()
      store.setLang('vi')
      expect(store.lang).toBe('vi')
    })

    it('should persist language to localStorage', () => {
      const store = useAppSettingsStore()
      store.setLang('vi')

      const stored = JSON.parse(localStorageStore['setting-nine-cmd'] || '{}')
      expect(stored.lang).toBe('vi')
    })

    it('should restore language from localStorage', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ lang: 'vi' })
      const store = useAppSettingsStore()
      expect(store.lang).toBe('vi')
    })
  })

  // ============================================================
  // Planet
  // ============================================================
  describe('Planet', () => {
    it('should default to "odin"', () => {
      const store = useAppSettingsStore()
      expect(store.selectedPlanet).toBe('odin')
    })

    it('should change planet', () => {
      const store = useAppSettingsStore()
      store.setPlanet('heimdall')
      expect(store.selectedPlanet).toBe('heimdall')
      expect(store.planetLabel).toBe('Heimdall')
    })

    it('should update planetLabel when planet changes', () => {
      const store = useAppSettingsStore()
      store.setPlanet('thor')
      expect(store.planetLabel).toBe('Thor')

      store.setPlanet('odin')
      expect(store.planetLabel).toBe('Odin')
    })

    it('should not change if same planet', () => {
      const store = useAppSettingsStore()
      store.setPlanet('odin') // already default
      expect(store.selectedPlanet).toBe('odin')
    })

    it('should persist planet to localStorage', () => {
      const store = useAppSettingsStore()
      store.setPlanet('heimdall')

      const stored = JSON.parse(localStorageStore['setting-nine-cmd'] || '{}')
      expect(stored.lastPlanet).toBe('heimdall')
    })

    it('should restore planet from localStorage', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ lastPlanet: 'thor' })
      const store = useAppSettingsStore()
      expect(store.selectedPlanet).toBe('thor')
    })
  })

  // ============================================================
  // Poll Interval
  // ============================================================
  describe('Poll Interval', () => {
    it('should default to 10000ms', () => {
      const store = useAppSettingsStore()
      expect(store.pollIntervalMs).toBe(10000)
    })

    it('should change poll interval', () => {
      const store = useAppSettingsStore()
      store.setPollInterval(5000)
      expect(store.pollIntervalMs).toBe(5000)
    })

    it('should reject interval < 1000ms', () => {
      const store = useAppSettingsStore()
      const original = store.pollIntervalMs
      store.setPollInterval(500) // too small
      expect(store.pollIntervalMs).toBe(original) // unchanged
    })

    it('should persist poll interval to localStorage', () => {
      const store = useAppSettingsStore()
      store.setPollInterval(15000)

      const stored = JSON.parse(localStorageStore['setting-nine-cmd'] || '{}')
      expect(stored.pollIntervalMs).toBe(15000)
    })

    it('should restore poll interval from localStorage', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({ pollIntervalMs: 30000 })
      const store = useAppSettingsStore()
      expect(store.pollIntervalMs).toBe(30000)
    })
  })

  // ============================================================
  // Integration: multiple settings
  // ============================================================
  describe('Integration', () => {
    it('should persist all settings together', () => {
      const store = useAppSettingsStore()
      store.setDarkMode(true)
      store.setLang('vi')
      store.setPlanet('heimdall')
      store.setPollInterval(5000)

      const stored = JSON.parse(localStorageStore['setting-nine-cmd'] || '{}')
      expect(stored.isDarkMode).toBe(true)
      expect(stored.lang).toBe('vi')
      expect(stored.lastPlanet).toBe('heimdall')
      expect(stored.pollIntervalMs).toBe(5000)
    })

    it('should restore all settings from localStorage', () => {
      localStorageStore['setting-nine-cmd'] = JSON.stringify({
        isDarkMode: true,
        lang: 'vi',
        lastPlanet: 'thor',
        pollIntervalMs: 8000
      })

      const store = useAppSettingsStore()
      expect(store.isDarkMode).toBe(true)
      expect(store.lang).toBe('vi')
      expect(store.selectedPlanet).toBe('thor')
      expect(store.planetLabel).toBe('Thor')
      expect(store.pollIntervalMs).toBe(8000)
    })
  })
})
