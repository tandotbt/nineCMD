<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="uiConfig"
    :date-locale="uiConfigDate"
    :breakpoints="themeBreakpoints"
  >
    <n-loading-bar-provider>
      <n-modal-provider>
        <n-message-provider :closable="true" :duration="5000">
          <router-view />
        </n-message-provider>
      </n-modal-provider>
    </n-loading-bar-provider>

    <n-global-style />

    <!-- First Loading Overlay – shown when planet URL data hasn't loaded yet -->
    <FirstLoadingOverlay />
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue'
import {
  darkTheme,
  enUS,
  dateEnUS,
  type GlobalTheme,
  type GlobalThemeOverrides,
  type NLocale,
  type NDateLocale,
  NConfigProvider,
  NLoadingBarProvider,
  NModalProvider,
  NMessageProvider,
  NGlobalStyle
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  CONFIG_i18n_LANGUAGES,
  THEME_BREAKPOINTS,
  LIGHT_THEME_OVERRIDES,
  DARK_THEME_OVERRIDES
} from '@/utilities/constants'
import { useAppSettingsStore } from './stores/appSettings'
import FirstLoadingOverlay from './views/FirstLoadingPage.vue'

const { locale } = useI18n()
const appSettings = useAppSettingsStore()

const themeBreakpoints = THEME_BREAKPOINTS

const theme = ref<GlobalTheme | null>(null)
const themeOverrides = ref<GlobalThemeOverrides | null>(null)
const uiConfig = ref<NLocale | null>(null)
const uiConfigDate = ref<NDateLocale | null>(null)

const lightThemeOverrides: GlobalThemeOverrides = LIGHT_THEME_OVERRIDES as unknown as GlobalThemeOverrides

const darkThemeOverrides: GlobalThemeOverrides = DARK_THEME_OVERRIDES as unknown as GlobalThemeOverrides

function applyTheme(isDark: boolean): void {
  theme.value = isDark ? darkTheme : null
  themeOverrides.value = isDark ? darkThemeOverrides : lightThemeOverrides
}

/**
 * Apply language for the entire app:
 * 1. Update uiConfig + uiConfigDate for n-config-provider (naive-ui NLocale + NDateLocale)
 * 2. Update vue-i18n locale
 *
 * Pattern reference from JS version (src/App.vue - changeLang):
 * - First find config in CONFIG_i18n_LANGUAGES (lang, uiConfig, uiConfigDate)
 * - Fallback to enUS + dateEnUS if not found
 * - Set both uiConfig/uiConfigDate and vue-i18n locale simultaneously
 *
 * When user changes language in FooterSettings or PlaceholderMenuLeft
 * → appSettings.setLang() → watcher below triggers → applyLang() → UI updates in sync
 */
function applyLang(selectedLang: string): void {
  const langConfig = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang)
  if (langConfig) {
    uiConfig.value = langConfig.uiConfig
    uiConfigDate.value = langConfig.uiConfigDate
  } else {
    // Fallback: English (same pattern as JS version)
    uiConfig.value = enUS
    uiConfigDate.value = dateEnUS
  }
  // Update vue-i18n locale (simultaneous with naive-ui)
  locale.value = selectedLang
}

// Provide theme toggle + lang change to child components (backward compat with JS version)
provide('toggleTheme', (isDark: boolean) => appSettings.setDarkMode(isDark))
provide('changeLang', (lang: string) => appSettings.setLang(lang))

// Watch dark mode changes from store
watch(
  () => appSettings.isDarkMode,
  (isDark) => applyTheme(isDark),
  { immediate: true }
)

// Watch language changes from store (key watcher for i18n sync)
watch(
  () => appSettings.lang,
  (lang) => applyLang(lang),
  { immediate: true }
)
</script>
