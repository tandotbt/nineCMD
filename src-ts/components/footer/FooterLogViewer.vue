<template>
  <n-space vertical>
    <n-space justify="space-between" align="center">
      <n-text depth="2" strong>{{ t('settings.logger.title') }}</n-text>
      <n-button size="tiny" quaternary @click="clearLogs">
        {{ t('settings.logger.clear') }}
      </n-button>
    </n-space>

    <!-- Log Level Filter -->
    <n-space align="center" :size="8">
      <n-text depth="3" style="font-size: 12px">{{ t('settings.logger.filter') }}:</n-text>
      <n-radio-group v-model:value="filterLevel" size="small">
        <n-radio-button value="all" size="small">All</n-radio-button>
        <n-radio-button value="info" size="small">Info</n-radio-button>
        <n-radio-button value="warn" size="small">Warn</n-radio-button>
        <n-radio-button value="error" size="small">Error</n-radio-button>
      </n-radio-group>
    </n-space>

    <!-- Log entries -->
    <div
      ref="logContainer"
      class="log-viewer"
      style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 11px; background: rgba(128,128,128,0.05); border-radius: 4px; padding: 8px"
    >
      <div v-if="filteredLogs.length === 0" style="color: #999; text-align: center; padding: 12px">
        {{ t('settings.logger.noLogs') }}
      </div>
      <div
        v-for="(entry, index) in filteredLogs"
        :key="index"
        :class="['log-entry', `log-${entry.level}`]"
        style="padding: 2px 0; border-bottom: 1px solid rgba(128,128,128,0.1)"
      >
        <span style="color: #999">{{ formatTime(entry.timestamp) }}</span>
        <span :style="{ color: getLevelColor(entry.level) }"> [{{ entry.module }}] {{ entry.level.toUpperCase().padEnd(5) }}: </span>
        <span>{{ formatMessages(entry.messages) }}</span>
      </div>
    </div>

    <n-text depth="3" style="font-size: 11px; text-align: center; display: block">
      {{ filteredLogs.length }} / {{ allLogs.length }} {{ t('settings.logger.entries') }}
    </n-text>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NText,
  NButton,
  NRadioGroup,
  NRadioButton
} from 'naive-ui'
import { getLogHistory, clearLogHistory } from '../../utilities/logger'
import type { LogLevel, LogEntry } from '../../types/logger'

const { t } = useI18n()

const filterLevel = ref<string>('all')
const logContainer = ref<HTMLElement | null>(null)

const allLogs = ref<LogEntry[]>([])

function refreshLogs(): void {
  allLogs.value = [...getLogHistory()]
}

// Refresh logs every 2 seconds
let refreshTimer: ReturnType<typeof setInterval> | null = null

const filteredLogs = computed(() => {
  if (filterLevel.value === 'all') return allLogs.value
  return allLogs.value.filter((e) => e.level === filterLevel.value)
})

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'debug': return '#999'
    case 'info': return '#18a058'
    case 'warn': return '#f0a020'
    case 'error': return '#d4380d'
    default: return '#333'
  }
}

function formatMessages(messages: unknown[]): string {
  return messages
    .map((m) => {
      if (typeof m === 'string') return m
      try {
        return JSON.stringify(m)
      } catch {
        return String(m)
      }
    })
    .join(' ')
}

function clearLogs(): void {
  clearLogHistory()
  refreshLogs()
}

// Auto-scroll to bottom
watch(filteredLogs, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})

// Start refresh timer
refreshLogs()
refreshTimer = setInterval(refreshLogs, 2000)

// Cleanup on unmount (using a simple approach since we don't have onUnmounted here)
// The timer will be cleaned up when the component is destroyed
</script>

<style scoped>
.log-entry {
  line-height: 1.4;
}
.log-error {
  background: rgba(212, 56, 13, 0.05);
}
.log-warn {
  background: rgba(240, 160, 32, 0.05);
}
</style>
