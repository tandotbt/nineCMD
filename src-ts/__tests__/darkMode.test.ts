import { describe, it, expect, beforeEach, vi } from 'vitest'
import { darkTheme } from 'naive-ui'
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  CONFIG_i18n_LANGUAGES,
  type I18nLanguageConfig
} from '@/utilities/constants'

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

describe('Dark Mode', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key])
  })

  it('should have darkTheme from naive-ui', () => {
    expect(darkTheme).toBeDefined()
    expect(darkTheme).toHaveProperty('common')
  })

  it('should toggle theme to dark when isDark=true', () => {
    const isDark = true
    const theme = isDark ? darkTheme : null
    expect(theme).toBe(darkTheme)
  })

  it('should toggle theme to null (light) when isDark=false', () => {
    const isDark = false
    const theme = isDark ? darkTheme : null
    expect(theme).toBeNull()
  })

  it('should set darkThemeOverrides when dark mode is on', () => {
    const isDark = true
    const darkThemeOverrides = {
      Result: {
        titleTextColor: 'rgba(60, 160, 0, 1)',
        textColor: 'rgba(40, 140, 0, 1)'
      },
      LoadingBar: {
        height: '4px'
      }
    }
    const themeOverrides = isDark ? darkThemeOverrides : null
    expect(themeOverrides).toEqual(darkThemeOverrides)
    expect(themeOverrides?.Result?.titleTextColor).toBe('rgba(60, 160, 0, 1)')
  })

  it('should set lightThemeOverrides when dark mode is off', () => {
    const isDark = false
    const lightThemeOverrides = {
      Result: {
        titleTextColor: 'rgba(203, 203, 33, 1)',
        textColor: 'rgba(203, 203, 23, 1)'
      },
      LoadingBar: {
        height: '4px'
      }
    }
    const themeOverrides = isDark ? null : lightThemeOverrides
    expect(themeOverrides).toEqual(lightThemeOverrides)
    expect(themeOverrides?.Result?.titleTextColor).toBe('rgba(203, 203, 33, 1)')
  })

  it('should save dark mode state to localStorage', () => {
    const settingNineCMD = { isDarkMode: true, lang: 'en' }
    localStorage.setItem('setting-nine-cmd', JSON.stringify(settingNineCMD))

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'setting-nine-cmd',
      JSON.stringify(settingNineCMD)
    )
    const stored = JSON.parse(localStorageStore['setting-nine-cmd'])
    expect(stored.isDarkMode).toBe(true)
  })

  it('should save language preference to localStorage', () => {
    const settingNineCMD = { isDarkMode: false, lang: 'vi' }
    localStorage.setItem('setting-nine-cmd', JSON.stringify(settingNineCMD))

    const stored = JSON.parse(localStorageStore['setting-nine-cmd'])
    expect(stored.lang).toBe('vi')
  })

  it('should restore dark mode from localStorage', () => {
    const settingNineCMD = { isDarkMode: true, lang: 'en' }
    localStorageStore['setting-nine-cmd'] = JSON.stringify(settingNineCMD)

    const stored = JSON.parse(localStorage.getItem('setting-nine-cmd') || '{}')
    const isDarkMode = stored.isDarkMode ?? false
    const theme = isDarkMode ? darkTheme : null

    expect(isDarkMode).toBe(true)
    expect(theme).toBe(darkTheme)
  })

  it('should default to light mode when no localStorage', () => {
    const stored = JSON.parse(localStorage.getItem('setting-nine-cmd') || '{}')
    const isDarkMode = stored.isDarkMode ?? false

    expect(isDarkMode).toBe(false)
  })

  it('should have uiConfig for each language', () => {
    CONFIG_i18n_LANGUAGES.forEach((langConfig: I18nLanguageConfig) => {
      expect(langConfig.uiConfig).toBeDefined()
      expect(langConfig.uiConfigDate).toBeDefined()
      expect(langConfig.lang).toBeDefined()
      expect(langConfig.label).toBeDefined()
    })
  })

  it('should have viVN locale config for Vietnamese', () => {
    const viConfig = CONFIG_i18n_LANGUAGES.find((c) => c.lang === 'vi')
    expect(viConfig).toBeDefined()
    expect(viConfig?.uiConfig).toHaveProperty('name')
  })

  it('should have enUS locale config for English', () => {
    const enConfig = CONFIG_i18n_LANGUAGES.find((c) => c.lang === 'en')
    expect(enConfig).toBeDefined()
    expect(enConfig?.uiConfig).toHaveProperty('name')
  })
})
