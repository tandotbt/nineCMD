<template>
  <n-space vertical>
    <n-collapse default-expanded-names="general">
      <!-- Section 1: General Settings -->
      <n-collapse-item name="general" :title="t('settings.general.title')">
        <n-space vertical>
          <!-- Dark Mode Toggle -->
          <n-space justify="space-between" align="center">
            <n-text depth="2" strong>{{ t('settings.darkMode') }}</n-text>
            <n-switch :value="appSettings.isDarkMode" @update:value="onDarkModeToggle" />
          </n-space>

          <!-- Language -->
          <n-space vertical>
            <n-text depth="2" strong>{{ t('settings.language') }}</n-text>
            <n-select
              :value="appSettings.lang"
              :options="langOptions"
              :placeholder="t('settings.selectLanguage')"
              @update:value="onLangChange"
            />
          </n-space>

          <!-- Planet (quick access) -->
          <n-space vertical>
            <n-text depth="2" strong>{{ t('settings.currentPlanet') }}</n-text>
            <n-text depth="3">{{ appSettings.planetLabel }}</n-text>
          </n-space>
        </n-space>
      </n-collapse-item>

      <!-- Section 2: Block Polling -->
      <n-collapse-item name="polling" :title="t('settings.polling.title')">
        <n-space vertical>
          <!-- Poll Interval -->
          <n-space vertical>
            <n-text depth="2" strong>{{ t('settings.polling.interval') }}</n-text>
            <n-select
              :value="appSettings.pollIntervalMs"
              :options="pollIntervalOptions"
              :placeholder="t('blockMonitor.selectInterval')"
              @update:value="onIntervalChange"
            />
          </n-space>

          <!-- Auto-poll on startup -->
          <n-space justify="space-between" align="center">
            <n-text depth="2" strong>{{ t('settings.polling.autoStart') }}</n-text>
            <n-switch :value="appSettings.isPolling" @update:value="onPollingToggle" />
          </n-space>

          <!-- Polling Status -->
          <n-space>
            <n-text depth="3">{{ t('blockMonitor.polling') }}</n-text>
            <n-tag :type="appSettings.isPolling ? 'success' : 'info'" size="small">
              {{ appSettings.isPolling ? t('blockMonitor.pollingRunning') : t('blockMonitor.pollingStopped') }}
            </n-tag>
          </n-space>
        </n-space>
      </n-collapse-item>

      <!-- Section 3: Endpoints Summary -->
      <n-collapse-item name="endpoints" :title="t('settings.endpointsSummary.title')">
        <n-space vertical>
          <n-text depth="3" style="font-size: 12px">
            {{ t('settings.endpointsSummary.currentPlanet') }} {{ appSettings.planetLabel }}
          </n-text>
          <n-divider style="margin: 4px 0" />
          <n-space
            v-for="(url, key) in activeEndpoints"
            :key="key"
            vertical
            :size="2"
          >
            <n-text depth="3" style="font-size: 11px; font-weight: 600">{{ key }}</n-text>
            <n-text
              depth="3"
              style="font-size: 10px; word-break: break-all; font-family: monospace; color: #999"
            >
              {{ url || 'N/A' }}
            </n-text>
          </n-space>
          <n-text depth="3" style="font-size: 11px; color: #999">
            {{ t('settings.endpointsSummary.hint') }}
          </n-text>
        </n-space>
      </n-collapse-item>

      <!-- Section 4: Storage Info -->
      <n-collapse-item name="storage" :title="t('settings.storage.title')">
        <FooterStorageInfo />
      </n-collapse-item>

      <!-- Section 5: Logger -->
      <n-collapse-item name="logger" :title="t('settings.logger.title')">
        <n-space vertical>
          <!-- Log Level Selector -->
          <n-space justify="space-between" align="center">
            <n-text depth="2" strong>{{ t('settings.logger.level') }}</n-text>
            <n-select
              :value="appSettings.logLevel"
              :options="logLevelOptions"
              style="width: 120px"
              @update:value="onLogLevelChange"
            />
          </n-space>

          <n-divider style="margin: 4px 0" />

          <FooterLogViewer />
        </n-space>
      </n-collapse-item>

      <!-- Section 6: About -->
      <n-collapse-item name="about" :title="t('settings.about.title')">
        <n-space vertical>
          <n-space justify="space-between">
            <n-text depth="3">NineCMD</n-text>
            <n-text depth="3" style="font-family: monospace">v0.1.0-ts</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">{{ t('settings.about.build') }}</n-text>
            <n-text depth="3">TypeScript + Vue 3</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text depth="3">{{ t('settings.about.ui') }}</n-text>
            <n-text depth="3">Naive UI</n-text>
          </n-space>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NText,
  NDivider,
  NSelect,
  NSwitch,
  NTag,
  NCollapse,
  NCollapseItem
} from 'naive-ui'
import { useAppSettingsStore } from '../../stores/appSettings'
import { useConfigURLStore } from '../../stores/configURL'
import { POLL_INTERVAL_OPTIONS, CONFIG_i18n_LANGUAGES } from '@/utilities/constants'
import type { LogLevel } from '../../types/logger'
import FooterStorageInfo from './FooterStorageInfo.vue'
import FooterLogViewer from './FooterLogViewer.vue'

const { t } = useI18n()

const appSettings = useAppSettingsStore()
const configURL = useConfigURLStore()

/** Language options - synced with PlaceholderMenuLeft (uses CONFIG_i18n_LANGUAGES) */
const langOptions = CONFIG_i18n_LANGUAGES.map((lang) => ({
  label: lang.label,
  value: lang.lang
}))

const pollIntervalOptions = computed(() =>
  POLL_INTERVAL_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value
  }))
)

const logLevelOptions = [
  { label: 'Debug', value: 'debug' },
  { label: 'Info', value: 'info' },
  { label: 'Warn', value: 'warn' },
  { label: 'Error', value: 'error' }
]

const activeEndpoints = computed(() => configURL.getActiveEndpoints(appSettings.selectedPlanet))

function onDarkModeToggle(val: boolean): void {
  appSettings.setDarkMode(val)
}

function onLangChange(val: string): void {
  appSettings.setLang(val)
}

function onIntervalChange(val: number): void {
  appSettings.setPollInterval(val)
}

function onPollingToggle(val: boolean): void {
  appSettings.setIsPolling(val)
}

function onLogLevelChange(val: LogLevel): void {
  appSettings.setLogLevel(val)
}
</script>
