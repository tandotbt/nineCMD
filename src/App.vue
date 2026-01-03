<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { darkTheme } from 'naive-ui'
import { useBlockStore } from '@/stores/useBlockStore'
import type { NLocale, NDateLocale } from 'naive-ui'
import { CONFIG_i18n_LANGUAGES, DEFAULT_LOCALE, STORAGE_KEYS, PWA_CONFIG } from '@/constants'

const isDark = useDark()
const isOnline = useOnline()
const { t, locale } = useI18n()

const uiConfig = ref<NLocale | null>(null)
const uiConfigDate = ref<NDateLocale | null>(null)

const settings = useStorage(STORAGE_KEYS.SETTINGS, {
  lang: DEFAULT_LOCALE,
})

const langOptions = CONFIG_i18n_LANGUAGES.map((item) => ({
  label: item.label,
  value: item.lang,
}))

const changeLang = (selectedLang: string) => {
  const langConfig = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang)
  if (langConfig) {
    uiConfig.value = langConfig.uiConfig as unknown as NLocale
    uiConfigDate.value = langConfig.uiConfigDate as unknown as NDateLocale
    settings.value.lang = selectedLang
    locale.value = selectedLang as 'en' | 'vi'
  }
}

const blockStore = useBlockStore()

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  periodicSync: {
    register(tag: string, options: { minInterval: number }): Promise<void>
  }
}

onMounted(async () => {
  changeLang(settings.value.lang)

  // Start global block fetching
  blockStore.startAutoFetch()

  // Register Periodic Background Sync if supported
  if ('serviceWorker' in navigator && 'periodicSync' in navigator) {
    const registration = (await navigator.serviceWorker
      .ready) as unknown as ServiceWorkerRegistrationWithSync
    try {
      await registration.periodicSync.register(PWA_CONFIG.SW_TAG_BLOCK_FETCH, {
        minInterval: PWA_CONFIG.SW_FETCH_INTERVAL_MIN * 60 * 1000,
      })
      console.log('[App] Periodic Sync registered')
    } catch (e) {
      console.error('[App] Periodic Sync could not be registered:', e)
    }
  }
})

onUnmounted(() => {
  blockStore.stopAutoFetch()
})
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :locale="uiConfig"
    :date-locale="uiConfigDate"
  >
    <n-message-provider>
      <n-global-style />
      <n-layout style="height: 100vh">
        <AppHeader
          :title="t('app_header_title')"
          :locale="locale"
          :lang-options="langOptions"
          :is-online="isOnline"
          :online-text="t('app_status_online')"
          :offline-text="t('app_status_offline')"
          @update:locale="changeLang"
        />

        <n-layout-content style="padding: 24px">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  margin: 0;
  font-family:
    v-sans,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
</style>
