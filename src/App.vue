<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import NotificationListener from '@/components/layout/NotificationListener.vue'
import { darkTheme } from 'naive-ui'
import { useBlockStore } from '@/stores/useBlockStore'
import { usePlanetStore } from '@/stores/usePlanetStore'
import type { NLocale, NDateLocale } from 'naive-ui'
import {
  CONFIG_i18n_LANGUAGES,
  DEFAULT_LOCALE,
  STORAGE_KEYS,
  PWA_CONFIG,
  PLANET_IDS,
} from '@/constants'
import type { PlanetName } from '@/types/planet'
import { ArrowSync24Regular as LoadingIcon } from '@vicons/fluent'
import { NotificationService } from '@/logic/NotificationService'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useDark, useOnline, useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const planetStore = usePlanetStore()
const settingsStore = useSettingsStore()

const planetOptions = computed(() => {
  if (planetStore.rawPlanets.length > 0) {
    return planetStore.rawPlanets.map((p) => ({
      label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      value: p.name,
    }))
  }
  return Object.keys(PLANET_IDS).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: key,
  }))
})

const changePlanet = (name: string) => {
  planetStore.setPlanet(name as PlanetName)
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  periodicSync: {
    register(tag: string, options: { minInterval: number }): Promise<void>
  }
}

onMounted(async () => {
  changeLang(settings.value.lang)
  await settingsStore.loadSettings()

  // Fetch planets first
  await planetStore.fetchPlanets()

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

  // Request Notification permission
  NotificationService.requestPermission().then((granted) => {
    if (granted) {
      console.log('[App] Notification permission granted')
    }
  })
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
    <n-notification-provider>
      <NotificationListener />
      <n-message-provider>
        <n-global-style />
        <div
          v-if="planetStore.isLoading"
          style="
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          "
        >
          <n-icon size="48" :component="LoadingIcon" class="is-loading" />
          <n-text depth="3">Loading Planet Data...</n-text>
        </div>
        <n-layout v-else style="height: 100vh">
          <AppHeader
            :title="t('app_header_title')"
            :locale="locale"
            :lang-options="langOptions"
            :planet="planetStore.currentPlanetName"
            :planet-options="planetOptions"
            :is-online="isOnline"
            :online-text="t('app_status_online')"
            :offline-text="t('app_status_offline')"
            @update:locale="changeLang"
            @update:planet="changePlanet"
          />

          <n-layout-content style="padding: 24px">
            <AppBreadcrumb />
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </n-layout-content>
        </n-layout>
      </n-message-provider>
    </n-notification-provider>
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
