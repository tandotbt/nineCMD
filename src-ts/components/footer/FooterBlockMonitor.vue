<template>
  <n-space vertical>
    <!-- Planet Selection -->
    <n-space vertical>
      <n-text depth="2" strong>{{ t('blockMonitor.planet') }}</n-text>
      <n-select
        :value="appSettings.selectedPlanet"
        :options="planetOptions"
        :placeholder="t('blockMonitor.selectPlanet')"
        @update:value="onPlanetChange"
      />
    </n-space>

    <!-- Poll Interval Setting -->
    <n-space vertical>
      <n-text depth="2" strong>{{ t('blockMonitor.pollInterval') }}</n-text>
      <n-select
        :value="appSettings.pollIntervalMs"
        :options="pollIntervalOptions"
        :placeholder="t('blockMonitor.selectInterval')"
        @update:value="onIntervalChange"
      />
    </n-space>

    <n-divider />

    <!-- Block Info -->
    <n-space vertical>
      <n-text depth="2" strong>{{ t('blockMonitor.blockInfo') }}</n-text>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.currentBlock') }}</n-text>
        <n-text strong>#{{ blockPolling.currentBlockIndex }}</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.avgBlockTime') }}</n-text>
        <n-text strong>{{ blockPolling.avgBlockTime }}s</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.planetLabel') }}</n-text>
        <n-text strong>{{ blockPolling.planetLabel }}</n-text>
      </n-space>
    </n-space>

    <n-divider />

    <!-- Poll Stats -->
    <n-space vertical>
      <n-text depth="2" strong>{{ t('blockMonitor.pollStats') }}</n-text>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.totalPolls') }}</n-text>
        <n-text strong>{{ blockPolling.pollCount }}</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.success') }}</n-text>
        <n-text strong style="color: #18a058">{{ blockPolling.successCount }}</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.failed') }}</n-text>
        <n-text strong style="color: #d4380d">{{ blockPolling.failCount }}</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.successRate') }}</n-text>
        <n-text strong>{{ blockPolling.successRate }}</n-text>
      </n-space>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.history') }}</n-text>
        <n-text strong>{{ blockPolling.historyLength }} {{ t('blockMonitor.entries') }}</n-text>
      </n-space>
    </n-space>

    <n-divider />

    <!-- Status -->
    <n-space vertical>
      <n-text depth="2" strong>{{ t('blockMonitor.status') }}</n-text>
      <n-space>
        <n-text depth="3">{{ t('blockMonitor.polling') }}</n-text>
        <n-tag :type="blockPolling.isPolling ? 'success' : 'error'" size="small">
          {{ blockPolling.isPolling ? t('blockMonitor.pollingRunning') : t('blockMonitor.pollingStopped') }}
        </n-tag>
      </n-space>
      <n-space v-if="blockPolling.error">
        <n-text depth="3" style="color: #d4380d">{{ t('blockMonitor.error') }} {{ blockPolling.error }}</n-text>
      </n-space>
      <n-space>
        <n-button size="small" @click="blockPolling.refresh()">{{ t('blockMonitor.refreshNow') }}</n-button>
        <n-button size="small" @click="handleTogglePoll">
          {{ blockPolling.isPolling ? t('blockMonitor.stop') : t('blockMonitor.start') }}
        </n-button>
      </n-space>
    </n-space>
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
  NTag,
  NButton
} from 'naive-ui'
import { useBlockPollingStore } from '../../stores/blockPolling'
import { useAppSettingsStore } from '../../stores/appSettings'
import { useConfigURLStore } from '../../stores/configURL'
import { PLANET_OPTIONS, POLL_INTERVAL_OPTIONS, type PlanetName } from '../../utilities/constants'

const { t } = useI18n()

const blockPolling = useBlockPollingStore()
const appSettings = useAppSettingsStore()
const configURL = useConfigURLStore()

const planetOptions = computed(() =>
  PLANET_OPTIONS.map((p) => ({
    label: p.label,
    value: p.id,
    disabled: !configURL.isPlanetAvailable(p.id)
  }))
)

const pollIntervalOptions = computed(() =>
  POLL_INTERVAL_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value
  }))
)

function onPlanetChange(val: PlanetName): void {
  blockPolling.switchPlanet(val)
}

function onIntervalChange(val: number): void {
  blockPolling.setPollInterval(val)
}

function handleTogglePoll(): void {
  if (blockPolling.isPolling) {
    blockPolling.stopPolling()
  } else {
    blockPolling.startPolling()
  }
}
</script>
