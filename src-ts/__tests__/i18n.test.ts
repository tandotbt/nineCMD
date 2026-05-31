import { describe, it, expect, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import vi from '@/i18n/locales/vi'
import { DEFAULT_LOCALE, FALLBACK_LOCALE, CONFIG_i18n_LANGUAGES } from '@/utilities/constants'

describe('i18n Language Switching', () => {
  let i18n: ReturnType<typeof createI18n>

  beforeEach(() => {
    i18n = createI18n({
      locale: DEFAULT_LOCALE,
      fallbackLocale: FALLBACK_LOCALE,
      messages: { en, vi },
      legacy: false
    })
  })

  it('should have default locale as "en"', () => {
    expect(DEFAULT_LOCALE).toBe('en')
    expect(i18n.global.locale.value).toBe('en')
  })

  it('should have fallback locale as "en"', () => {
    expect(FALLBACK_LOCALE).toBe('en')
  })

  it('should contain English translations', () => {
    expect(en).toHaveProperty('@--App')
    expect(en['@--App']).toHaveProperty('title')
    expect(en['@--App'].title).toBe('NineCMD TypeScript')
  })

  it('should contain Vietnamese translations', () => {
    expect(vi).toHaveProperty('@--App')
    expect(vi['@--App']).toHaveProperty('title')
    expect(vi['@--App'].title).toBe('NineCMD TypeScript')
  })

  it('should translate dark mode status in English', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('@--App.darkModeStatus.on')).toBe('🌙 Dark Mode ON')
    expect(i18n.global.t('@--App.darkModeStatus.off')).toBe('☀️ Dark Mode OFF')
  })

  it('should translate dark mode status in Vietnamese', () => {
    i18n.global.locale.value = 'vi'
    expect(i18n.global.t('@--App.darkModeStatus.on')).toBe('🌙 Chế độ tối BẬT')
    expect(i18n.global.t('@--App.darkModeStatus.off')).toBe('☀️ Chế độ tối TẮT')
  })

  it('should switch locale from "en" to "vi"', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.locale.value).toBe('en')

    i18n.global.locale.value = 'vi'
    expect(i18n.global.locale.value).toBe('vi')
  })

  it('should switch locale from "vi" to "en"', () => {
    i18n.global.locale.value = 'vi'
    expect(i18n.global.locale.value).toBe('vi')

    i18n.global.locale.value = 'en'
    expect(i18n.global.locale.value).toBe('en')
  })

  it('should translate footer in both languages', () => {
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('@--App.footer')).toBe('NineCMD TypeScript © 2024')

    i18n.global.locale.value = 'vi'
    expect(i18n.global.t('@--App.footer')).toBe('NineCMD TypeScript © 2024')
  })

  it('should have CONFIG_i18n_LANGUAGES with 2 languages', () => {
    expect(CONFIG_i18n_LANGUAGES).toHaveLength(2)
  })

  it('should have correct language configs', () => {
    const viConfig = CONFIG_i18n_LANGUAGES.find((c) => c.lang === 'vi')
    const enConfig = CONFIG_i18n_LANGUAGES.find((c) => c.lang === 'en')

    expect(viConfig).toBeDefined()
    expect(viConfig?.label).toBe('Tiếng Việt')
    expect(viConfig?.uiConfig).toBeDefined()

    expect(enConfig).toBeDefined()
    expect(enConfig?.label).toBe('English')
    expect(enConfig?.uiConfig).toBeDefined()
  })

  it('should have available locales "en" and "vi"', () => {
    expect(i18n.global.availableLocales).toContain('en')
    expect(i18n.global.availableLocales).toContain('vi')
  })
})

describe('i18n Block Monitor Translations', () => {
  let i18n: ReturnType<typeof createI18n>

  beforeEach(() => {
    i18n = createI18n({
      locale: DEFAULT_LOCALE,
      fallbackLocale: FALLBACK_LOCALE,
      messages: { en, vi },
      legacy: false
    })
  })

  // ============================================================
  // Block Monitor keys
  // ============================================================
  describe('Block Monitor', () => {
    it('should have blockMonitor keys in English', () => {
      i18n.global.locale.value = 'en'
      expect(i18n.global.t('blockMonitor.tab')).toBe('Block Monitor')
      expect(i18n.global.t('blockMonitor.planet')).toBe('Planet')
      expect(i18n.global.t('blockMonitor.pollInterval')).toBe('Poll interval (seconds)')
      expect(i18n.global.t('blockMonitor.blockInfo')).toBe('Block Info')
      expect(i18n.global.t('blockMonitor.currentBlock')).toBe('Current block:')
      expect(i18n.global.t('blockMonitor.avgBlockTime')).toBe('Avg block time:')
      expect(i18n.global.t('blockMonitor.pollStats')).toBe('Poll Stats')
      expect(i18n.global.t('blockMonitor.status')).toBe('Status')
      expect(i18n.global.t('blockMonitor.refreshNow')).toBe('Refresh now')
    })

    it('should have blockMonitor keys in Vietnamese', () => {
      i18n.global.locale.value = 'vi'
      expect(i18n.global.t('blockMonitor.tab')).toBe('Theo dõi Block')
      expect(i18n.global.t('blockMonitor.planet')).toBe('Planet')
      expect(i18n.global.t('blockMonitor.pollInterval')).toBe('Chu kỳ Poll (giây)')
      expect(i18n.global.t('blockMonitor.blockInfo')).toBe('Thông tin Block')
      expect(i18n.global.t('blockMonitor.currentBlock')).toBe('Block hiện tại:')
      expect(i18n.global.t('blockMonitor.pollStats')).toBe('Thống kê Poll')
      expect(i18n.global.t('blockMonitor.status')).toBe('Trạng thái')
      expect(i18n.global.t('blockMonitor.refreshNow')).toBe('Refresh ngay')
    })

    it('should have polling status translations in both languages', () => {
      i18n.global.locale.value = 'en'
      expect(i18n.global.t('blockMonitor.pollingRunning')).toBe('Running')
      expect(i18n.global.t('blockMonitor.pollingStopped')).toBe('Stopped')
      expect(i18n.global.t('blockMonitor.start')).toBe('Start')
      expect(i18n.global.t('blockMonitor.stop')).toBe('Stop')

      i18n.global.locale.value = 'vi'
      expect(i18n.global.t('blockMonitor.pollingRunning')).toBe('Đang chạy')
      expect(i18n.global.t('blockMonitor.pollingStopped')).toBe('Đã dừng')
      expect(i18n.global.t('blockMonitor.start')).toBe('Bắt đầu')
      expect(i18n.global.t('blockMonitor.stop')).toBe('Dừng')
    })
  })

  // ============================================================
  // Settings keys
  // ============================================================
  describe('Settings', () => {
    it('should have settings keys in English', () => {
      i18n.global.locale.value = 'en'
      expect(i18n.global.t('settings.tab')).toBe('Setting')
      expect(i18n.global.t('settings.darkMode')).toBe('Dark Mode')
      expect(i18n.global.t('settings.language')).toBe('Language')
      expect(i18n.global.t('settings.currentPlanet')).toBe('Current planet')
    })

    it('should have settings keys in Vietnamese', () => {
      i18n.global.locale.value = 'vi'
      expect(i18n.global.t('settings.tab')).toBe('Cài đặt')
      expect(i18n.global.t('settings.darkMode')).toBe('Chế độ tối')
      expect(i18n.global.t('settings.language')).toBe('Ngôn ngữ')
      expect(i18n.global.t('settings.currentPlanet')).toBe('Planet hiện tại')
    })
  })

  // ============================================================
  // Footer & Actions keys
  // ============================================================
  describe('Footer & Actions', () => {
    it('should have footer.makeWith in both languages', () => {
      i18n.global.locale.value = 'en'
      expect(i18n.global.t('footer.makeWith')).toContain('tanbt')

      i18n.global.locale.value = 'vi'
      expect(i18n.global.t('footer.makeWith')).toContain('tanbt')
    })

    it('should have actions keys in both languages', () => {
      i18n.global.locale.value = 'en'
      expect(i18n.global.t('actions.tab')).toBe('Actions')

      i18n.global.locale.value = 'vi'
      expect(i18n.global.t('actions.tab')).toBe('Hành động')
    })
  })
})
