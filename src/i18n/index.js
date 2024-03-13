import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/utilities/constants'
import en from './locales/en'
import vi from './locales/vi'

const messages = {
  en,
  vi
}

export default createI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  legacy: false,
})
