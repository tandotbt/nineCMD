import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/utilities/constants'
import en from './locales/en'
import vi from './locales/vi'
import en_numbers from './numbers/en'
import vi_numbers from './numbers/vi'


const messages = {
  en,
  vi
}
const numberFormats = {
  en: en_numbers,
  vi: vi_numbers
}

export default createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  numberFormats,
  legacy: false,
})
