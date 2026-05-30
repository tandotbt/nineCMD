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
          <n-layout style="height: 100vh">
            <!-- Header -->
            <n-layout-header
              bordered
              style="height: 10vh; display: flex; align-items: center; justify-content: space-between; padding: 0 24px"
            >
              <h2 style="margin: 0">{{ t('@--App.title') }}</h2>
              <n-space align="center">
                <!-- Language selector -->
                <n-select
                  v-model:value="locale"
                  :options="langOptions"
                  :render-label="renderLabel"
                  :render-tag="renderSingleSelectTag"
                  @update:value="changeLang"
                  style="width: 180px"
                  size="small"
                />
                <!-- Dark mode toggle -->
                <n-switch
                  :round="true"
                  v-model:value="isDarkMode"
                  @update:value="toggleTheme"
                >
                  <template #checked>
                    <n-icon :component="DarkIcon" />
                  </template>
                  <template #unchecked>
                    <n-icon :component="LightIcon" />
                  </template>
                </n-switch>
              </n-space>
            </n-layout-header>

            <!-- Content -->
            <n-layout position="absolute" style="top: 10vh; bottom: 10vh">
              <n-scrollbar>
                <n-space vertical align="center" style="padding: 40px 20px">
                  <n-card :title="t('@--App.title')" style="max-width: 500px; width: 100%">
                    <n-text depth="3">
                      {{ t('@--App.description') }}
                    </n-text>
                    <n-divider />
                    <n-space vertical>
                      <n-text>{{ t('@--App.toggleTheme.dark') }}:</n-text>
                      <n-tag :type="isDarkMode ? 'success' : 'warning'" round>
                        {{ isDarkMode ? t('@--App.darkModeStatus.on') : t('@--App.darkModeStatus.off') }}
                      </n-tag>
                    </n-space>
                    <n-divider />
                    <n-text depth="3" style="font-size: 12px">
                      {{ t('@--App.devNote') }}
                    </n-text>
                  </n-card>
                </n-space>
              </n-scrollbar>
            </n-layout>

            <!-- Footer -->
            <n-layout-footer
              bordered
              style="height: 10vh; padding: 3vh; display: flex; align-items: center; justify-content: center; position: absolute; bottom: 0; left: 0; right: 0"
            >
              <n-text depth="3">{{ t('@--App.footer') }}</n-text>
            </n-layout-footer>
          </n-layout>
        </n-message-provider>
      </n-modal-provider>
    </n-loading-bar-provider>

    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  darkTheme,
  NIcon,
  NAvatar,
  NText,
  NCard,
  NTag,
  NDivider,
  NSpace,
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NLoadingBarProvider,
  NModalProvider,
  NMessageProvider,
  NScrollbar,
  NSwitch,
  NSelect,
  NGlobalStyle,
  type GlobalTheme,
  type GlobalThemeOverrides
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useStorage } from '@vueuse/core'
import { DarkModeFilled as DarkIcon, LightModeFilled as LightIcon } from '@vicons/material'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'

// Types
interface SettingNineCMD {
  isDarkMode?: boolean
  lang?: string
}

// ============================================================
// i18n
// ============================================================
const { t, locale, availableLocales } = useI18n()

// ============================================================
// Theme Breakpoints (responsive)
// ============================================================
const themeBreakpoints = {
  xs: 320,
  s: 470,
  m: 660,
  l: 1280,
  xl: 1536,
  xxl: 1920
}

// ============================================================
// Dark Mode + Naive UI Locale
// ============================================================
const isDarkMode = ref<boolean>(false)
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
  isDarkMode.value = isDark
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

// ============================================================
// Language Selector (with flag avatar)
// ============================================================
const langOptions = availableLocales.map((item: string) => ({
  label: CONFIG_i18n_LANGUAGES.find((data) => data.lang === item)?.label ?? item,
  value: item
}))

const renderSingleSelectTag = ({ option }: { option: { label: string; value: string } }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value)?.png,
        round: true,
        size: 24,
        style: {
          marginRight: '12px'
        }
      }),
      option.label
    ]
  )
}

const renderLabel = (option: { label: string; value: string }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value)?.png,
        round: false,
        size: 'small'
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0'
          }
        },
        [
          h('div', null, [option.label]),
          h(
            NText,
            { depth: 3, tag: 'div' },
            {
              default: () =>
                CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value)?.description ?? ''
            }
          )
        ]
      )
    ]
  )
}

// ============================================================
// Initialize from localStorage
// ============================================================
isDarkMode.value = settingNineCMD.value.isDarkMode ?? false
toggleTheme(isDarkMode.value)

if (settingNineCMD.value.lang) {
  changeLang(settingNineCMD.value.lang)
}
</script>
