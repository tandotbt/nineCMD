<template>
  <n-text depth="3" style="font-size: 12px">
    #{{ blockPolling.currentBlockIndex }}
  </n-text>
  <n-divider vertical />
  <n-text depth="3" style="font-size: 12px">
    {{ blockPolling.avgBlockTime }}s
  </n-text>
  <n-divider vertical />
  <n-text depth="3" style="font-size: 12px">
    {{ blockPolling.planetLabel }}
  </n-text>
  <template v-if="blockPolling.isLoading">
    <n-divider vertical />
    <n-spin :size="10" />
  </template>
  <template v-else-if="blockPolling.error">
    <n-divider vertical />
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-text depth="3" style="font-size: 12px; color: #d4380d">⚠</n-text>
      </template>
      {{ blockPolling.error }}
    </n-tooltip>
  </template>
</template>

<script setup lang="ts">
import { NText, NDivider, NSpin, NTooltip } from 'naive-ui'
import { useBlockPollingStore } from '../../stores/blockPolling'

const blockPolling = useBlockPollingStore()
</script>
