import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/utilities/constants'
import en from './locales/en.json'
import vi from './locales/vi.json'
import en_number from './numberFormats/en.json'
import vi_number from './numberFormats/vi.json'
import en_datetime from './datetimeFormats/en.json'
import vi_datetime from './datetimeFormats/vi.json'

const messages = {
  en,
  vi
}

const numberFormats = {
  en: en_number,
  vi: vi_number
}

const datetimeFormats = {
  en: en_datetime,
  vi: vi_datetime
}

const i18n = createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  numberFormats,
  datetimeFormats,
  legacy: false
})

export default i18n
