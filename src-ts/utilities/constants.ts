import { enUS, dateEnUS, viVN, dateViVN, type NLocale, type NDateLocale } from 'naive-ui'

// ============================================================
// i18n Constants
// ============================================================

export const DEFAULT_LOCALE = 'en'
export const FALLBACK_LOCALE = 'en'

export interface I18nLanguageConfig {
  lang: string
  label: string
  description: string
  png: string
  uiConfig: NLocale
  uiConfigDate: NDateLocale
}

export const CONFIG_i18n_LANGUAGES: I18nLanguageConfig[] = [
  {
    lang: 'vi',
    label: 'Tiếng Việt',
    description: 'Xin chào Nine Chronicles 👋',
    png: 'https://flagcdn.com/w320/vn.png',
    uiConfig: viVN,
    uiConfigDate: dateViVN
  },
  {
    lang: 'en',
    label: 'English',
    description: 'Hello Nine Chronicles 👋',
    png: 'https://flagcdn.com/w320/us.png',
    uiConfig: enUS,
    uiConfigDate: dateEnUS
  }
]
