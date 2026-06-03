<template>
  <n-space vertical>
    <n-text depth="2" strong>{{ t('settings.storage.title') }}</n-text>

    <n-space vertical :size="4">
      <n-space justify="space-between">
        <n-text depth="3" style="font-size: 12px">setting-nine-cmd</n-text>
        <n-text depth="3" style="font-size: 12px">{{ settingSize }}</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text depth="3" style="font-size: 12px">configURL-endpoints</n-text>
        <n-text depth="3" style="font-size: 12px">{{ endpointSize }}</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text depth="3" style="font-size: 12px">{{ t('settings.storage.totalKeys') }}</n-text>
        <n-text depth="3" style="font-size: 12px">{{ totalKeys }}</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text depth="3" style="font-size: 12px">{{ t('settings.storage.totalSize') }}</n-text>
        <n-text depth="3" style="font-size: 12px">{{ totalSize }}</n-text>
      </n-space>
    </n-space>

    <n-divider style="margin: 4px 0" />

    <n-popconfirm @positive-click="clearAllSettings">
      <template #trigger>
        <n-button size="small" type="error" secondary block>
          {{ t('settings.storage.clearAll') }}
        </n-button>
      </template>
      {{ t('settings.storage.clearConfirm') }}
    </n-popconfirm>
  </n-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NText,
  NDivider,
  NButton,
  NPopconfirm
} from 'naive-ui'

const { t } = useI18n()

const settingSize = ref('0 B')
const endpointSize = ref('0 B')
const totalKeys = ref(0)
const totalSize = ref('0 B')

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function calculateSizes(): void {
  try {
    const settingRaw = localStorage.getItem('setting-nine-cmd') || ''
    const endpointRaw = localStorage.getItem('configURL-endpoints') || ''

    settingSize.value = formatBytes(new Blob([settingRaw]).size)
    endpointSize.value = formatBytes(new Blob([endpointRaw]).size)

    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const val = localStorage.getItem(key) || ''
        total += new Blob([val]).size
      }
    }
    totalKeys.value = localStorage.length
    totalSize.value = formatBytes(total)
  } catch {
    // localStorage not available
  }
}

function clearAllSettings(): void {
  localStorage.removeItem('setting-nine-cmd')
  localStorage.removeItem('configURL-endpoints')
  calculateSizes()
  // Reload to reset all stores
  window.location.reload()
}

onMounted(() => {
  calculateSizes()
})
</script>
