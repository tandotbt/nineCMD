<template>
  <n-space vertical style="padding: 8px">
    <n-menu
      ref="menuRef"
      v-model:value="selectedKey"
      :options="menuOptions"
      :accordion="true"
    />

    <n-divider style="margin: 4px 0" />

    <!-- Language selector -->
    <div style="padding: 0 8px">
      <n-select
        v-model:value="currentLang"
        :options="langOptions"
        :render-label="renderLabel"
        :render-tag="renderSingleSelectTag"
        @update:value="changeLang"
        size="small"
      />
    </div>

    <!-- Dark mode toggle -->
    <div style="padding: 0 8px; display: flex; align-items: center; justify-content: space-between">
      <n-text depth="3" style="font-size: 12px">{{ t('@--App.toggleTheme.light') }}</n-text>
      <n-switch
        :round="true"
        v-model:value="isDarkMode"
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
import { h, ref, inject, onMounted, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NIcon, NMenu, NSpace, NSelect, NSwitch, NText, NDivider, NAvatar } from 'naive-ui'
import {
  HomeRound as HomeIcon,
  LogInRound as LoginIcon,
  DarkModeFilled as DarkIcon,
  LightModeFilled as LightIcon
} from '@vicons/material'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppSettingsStore } from '../stores/appSettings'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'

const route = useRoute()
const { t, locale, availableLocales } = useI18n()
const appSettings = useAppSettingsStore()

// Inject theme toggle from App.vue
const toggleTheme = inject<(isDark: boolean) => void>('toggleTheme', () => {})
const changeLangFn = inject<(lang: string) => void>('changeLang', () => {})

const selectedKey = ref<string>('home')
const menuRef = shallowRef<unknown>(null)
const isDarkMode = ref<boolean>(appSettings.isDarkMode)
const currentLang = ref<string>(appSettings.lang || locale.value)

const langOptions = availableLocales.map((item: string) => ({
  label: CONFIG_i18n_LANGUAGES.find((data) => data.lang === item)?.label ?? item,
  value: item
}))

function changeLang(selectedLang: string): void {
  currentLang.value = selectedLang
  appSettings.setLang(selectedLang)
  changeLangFn(selectedLang)
}

function onToggleTheme(isDark: boolean): void {
  isDarkMode.value = isDark
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
  }
]

const renderSingleSelectTag = ({ option }: { option: { label: string; value: string } }) => {
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
      option.label
    ]
  )
}

const renderLabel = (option: { label: string; value: string }) => {
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

// Route name -> menu key mapping
const routeToMenuKey: Record<string, string> = {
  'home': 'home',
  'login': 'login'
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

onMounted(() => {
  // Menu initialized
})
</script>
