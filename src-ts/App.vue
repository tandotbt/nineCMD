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

    <!-- First Loading Overlay – hiện khi dữ liệu URL planet chưa load -->
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
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'
import { useAppSettingsStore } from './stores/appSettings'
import FirstLoadingOverlay from './views/FirstLoadingPage.vue'

const { locale } = useI18n()
const appSettings = useAppSettingsStore()

const themeBreakpoints = {
  xs: 320,
  s: 470,
  m: 660,
  l: 1280,
  xl: 1536,
  xxl: 1920
}

const theme = ref<GlobalTheme | null>(null)
const themeOverrides = ref<GlobalThemeOverrides | null>(null)
const uiConfig = ref<NLocale | null>(null)
const uiConfigDate = ref<NDateLocale | null>(null)

const lightThemeOverrides: GlobalThemeOverrides = {
  Result: {
    titleTextColor: 'rgba(203, 203, 33, 1)',
    textColor: 'rgba(203, 203, 23, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
}

const darkThemeOverrides: GlobalThemeOverrides = {
  Result: {
    titleTextColor: 'rgba(60, 160, 0, 1)',
    textColor: 'rgba(40, 140, 0, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
}

function applyTheme(isDark: boolean): void {
  theme.value = isDark ? darkTheme : null
  themeOverrides.value = isDark ? darkThemeOverrides : lightThemeOverrides
}

/**
 * Apply language cho toàn bộ app:
 * 1. Cập nhật uiConfig + uiConfigDate cho n-config-provider (naive-ui NLocale + NDateLocale)
 * 2. Cập nhật vue-i18n locale
 *
 * Pattern tham khảo từ bản JS (src/App.vue - changeLang):
 * - Trước tiên tìm config trong CONFIG_i18n_LANGUAGES (lang, uiConfig, uiConfigDate)
 * - Fallback về enUS + dateEnUS nếu không tìm thấy
 * - Set cả uiConfig/uiConfigDate lẫn vue-i18n locale cùng lúc
 *
 * Khi user đổi ngôn ngữ ở FooterSettings hoặc PlaceholderMenuLeft
 * → appSettings.setLang() → watcher bên dưới trigger → applyLang() → UI update đồng nhất
 */
function applyLang(selectedLang: string): void {
  const langConfig = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang)
  if (langConfig) {
    uiConfig.value = langConfig.uiConfig
    uiConfigDate.value = langConfig.uiConfigDate
  } else {
    // Fallback: English (giống pattern bản JS)
    uiConfig.value = enUS
    uiConfigDate.value = dateEnUS
  }
  // Cập nhật vue-i18n locale (cùng lúc với naive-ui)
  locale.value = selectedLang
}

// Provide theme toggle + lang change to child components (backward compat với bản JS)
provide('toggleTheme', (isDark: boolean) => appSettings.setDarkMode(isDark))
provide('changeLang', (lang: string) => appSettings.setLang(lang))

// Watch dark mode changes from store
watch(
  () => appSettings.isDarkMode,
  (isDark) => applyTheme(isDark),
  { immediate: true }
)

// Watch language changes from store (key watcher để i18n đồng nhất)
watch(
  () => appSettings.lang,
  (lang) => applyLang(lang),
  { immediate: true }
)
</script>
