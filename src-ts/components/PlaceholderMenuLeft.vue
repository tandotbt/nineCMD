<template>
  <n-space vertical style="padding: 8px">
    <n-menu
      ref="menuRef"
      v-model:value="selectedKey"
      :options="menuOptions"
      :accordion="true"
    />

    <n-divider style="margin: 4px 0" />

    <!-- Language selector - bound directly to appSettings (reactive with FooterSettings) -->
    <div style="padding: 0 8px">
      <n-select
        :value="appSettings.lang"
        :options="langOptions"
        :render-label="renderLabel"
        :render-tag="renderSingleSelectTag"
        @update:value="changeLang"
        size="small"
      />
    </div>

    <!-- Dark mode toggle - bound directly to appSettings (reactive with FooterSettings) -->
    <div style="padding: 0 8px; display: flex; align-items: center; justify-content: space-between">
      <n-text depth="3" style="font-size: 12px">{{ t('@--App.toggleTheme.light') }}</n-text>
      <n-switch
        :round="true"
        :value="appSettings.isDarkMode"
        @update:value="onToggleTheme"
      >
        <template #checked>
          <n-icon :component="DarkIcon" />
        </template>
        <template #unchecked>
          <n-icon :component="LightIcon" />
        </template>
      </n-switch>
    </div>
  </n-space>
</template>

<script setup lang="ts">
import { h, ref, inject, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NIcon, NMenu, NSpace, NSelect, NSwitch, NText, NDivider, NAvatar } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import {
  HomeRound as HomeIcon,
  LogInRound as LoginIcon,
  DarkModeFilled as DarkIcon,
  LightModeFilled as LightIcon
} from '@vicons/material'
// `TableChartRound` is exported from the package root but the installed
// version of `vue-tsc` in this project does not resolve it through the
// aggregated barrel; importing the subpath directly guarantees resolution.
import TableChartRound from '@vicons/material/es/TableChartRound.js'
const CsvIcon = TableChartRound
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppSettingsStore } from '../stores/appSettings'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'

const route = useRoute()
const { t, availableLocales } = useI18n()
const appSettings = useAppSettingsStore()

// Inject theme toggle from App.vue
const toggleTheme = inject<(isDark: boolean) => void>('toggleTheme', () => {})
const changeLangFn = inject<(lang: string) => void>('changeLang', () => {})

const selectedKey = ref<string>('home')
const menuRef = shallowRef<unknown>(null)

/** Language options - synced with FooterSettings (uses CONFIG_i18n_LANGUAGES) */
const langOptions = availableLocales.map((item: string) => ({
  label: CONFIG_i18n_LANGUAGES.find((data) => data.lang === item)?.label ?? item,
  value: item
}))

/** Change lang - updates both store + i18n locale (synced with FooterSettings) */
function changeLang(selectedLang: string): void {
  appSettings.setLang(selectedLang)
  changeLangFn(selectedLang)
}

/** Toggle theme - updates both store + dark mode class (synced with FooterSettings) */
function onToggleTheme(isDark: boolean): void {
  appSettings.setDarkMode(isDark)
  toggleTheme(isDark)
}

function renderIcon(icon: typeof HomeIcon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'home' } },
        { default: () => t('page.home') }
      ),
    key: 'home',
    icon: renderIcon(HomeIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'login' } },
        { default: () => t('page.login') }
      ),
    key: 'login',
    icon: renderIcon(LoginIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'csv-data' } },
        { default: () => 'CSV Data' }
      ),
    key: 'csv-data',
    icon: renderIcon(CsvIcon)
  }
]

const renderSingleSelectTag = ({ option }: { option: SelectOption }) => {
  // `label` may be a function or undefined per SelectBaseOption typing;
  // resolve to a string before rendering as a text child.
  const labelText = typeof option.label === 'function' ? '' : (option.label ?? '')
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center' } },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value)?.png,
        round: true,
        size: 24,
        style: { marginRight: '12px' }
      }),
      labelText
    ]
  )
}

const renderLabel = (option: SelectOption) => {
  const labelText = typeof option.label === 'function' ? '' : (option.label ?? '')
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center' } },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value)?.png,
        round: false,
        size: 'small'
      }),
      h(
        'div',
        { style: { marginLeft: '12px', padding: '4px 0' } },
        [
          h('div', null, [labelText]),
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

// Route name -> menu key mapping
const routeToMenuKey: Record<string, string> = {
  'home': 'home',
  'login': 'login',
  'csv-data': 'csv-data'
}

// Sync selectedKey with current route
watch(
  () => route.name,
  (routeName) => {
    const key = routeToMenuKey[routeName as string]
    if (key) {
      selectedKey.value = key
    }
  },
  { immediate: true }
)

</script>
