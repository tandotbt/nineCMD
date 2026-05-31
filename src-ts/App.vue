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
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue'
import {
  darkTheme,
  type GlobalTheme,
  type GlobalThemeOverrides,
  NConfigProvider,
  NLoadingBarProvider,
  NModalProvider,
  NMessageProvider,
  NGlobalStyle
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'
import { useAppSettingsStore } from './stores/appSettings'

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
const uiConfig = ref<Record<string, unknown> | null>(null)
const uiConfigDate = ref<Record<string, unknown> | null>(null)

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

function applyLang(selectedLang: string): void {
  const langConfig = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang)
  if (langConfig) {
    uiConfig.value = langConfig.uiConfig as unknown as Record<string, unknown>
    uiConfigDate.value = langConfig.uiConfigDate as unknown as Record<string, unknown>
  }
  locale.value = selectedLang
}

// Provide theme toggle to child components (backward compat)
provide('toggleTheme', (isDark: boolean) => appSettings.setDarkMode(isDark))
provide('changeLang', (lang: string) => appSettings.setLang(lang))

// Watch dark mode changes from store
watch(
  () => appSettings.isDarkMode,
  (isDark) => applyTheme(isDark),
  { immediate: true }
)

// Watch language changes from store
watch(
  () => appSettings.lang,
  (lang) => applyLang(lang),
  { immediate: true }
)
</script>
