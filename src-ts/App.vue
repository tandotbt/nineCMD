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
import { ref, provide } from 'vue'
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
import { useStorage } from '@vueuse/core'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'

interface SettingNineCMD {
  isDarkMode?: boolean
  lang?: string
}

const { locale } = useI18n()

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

const settingNineCMD = useStorage<SettingNineCMD>('setting-nine-cmd', {}, localStorage)

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

function toggleTheme(isDark: boolean): void {
  theme.value = isDark ? darkTheme : null
  themeOverrides.value = isDark ? darkThemeOverrides : lightThemeOverrides
  settingNineCMD.value.isDarkMode = isDark
}

function changeLang(selectedLang: string): void {
  const langConfig = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang)
  if (langConfig) {
    uiConfig.value = langConfig.uiConfig as unknown as Record<string, unknown>
    uiConfigDate.value = langConfig.uiConfigDate as unknown as Record<string, unknown>
  }
  settingNineCMD.value.lang = selectedLang
  locale.value = selectedLang
}

// Provide theme toggle to child components
provide('toggleTheme', toggleTheme)
provide('changeLang', changeLang)

// Initialize from localStorage
const isDarkMode = settingNineCMD.value.isDarkMode ?? false
toggleTheme(isDarkMode)

if (settingNineCMD.value.lang) {
  changeLang(settingNineCMD.value.lang)
}
</script>
