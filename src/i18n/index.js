import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/utilities/constants'
import en from './locales/en'
import vi from './locales/vi'
import en_number from './numberFormats/en'
import vi_number from './numberFormats/vi'
import en_datetime from './datetimeFormats/en'
import vi_datetime from './datetimeFormats/vi'

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

export default createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  numberFormats,
  datetimeFormats,
  legacy: false
})
