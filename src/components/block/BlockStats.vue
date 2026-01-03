<script setup lang="ts">
import BlockStatistic from './BlockStatistic.vue'

defineProps<{
  title: string
  latestBlock: number | string
  avgBlockTime: string | number
  isFetching: boolean
  isTracking: boolean
  isNotificationSupported: boolean
  btnFetchText: string
  btnTrackingText: string
  btnNotifyText: string
  labelLatestBlock: string
  labelAvgTime: string
  labelTracked: string
  blocksTracked: number
}>()

const emit = defineEmits<{
  (e: 'fetch'): void
  (e: 'set-marker'): void
}>()
</script>

<template>
  <n-card :title="title">
    <n-grid :cols="4" :x-gap="12">
      <n-grid-item>
        <BlockStatistic :label="labelLatestBlock" :value="latestBlock" />
      </n-grid-item>
      <n-grid-item>
        <BlockStatistic :label="labelAvgTime" :value="avgBlockTime" suffix="s" />
      </n-grid-item>
      <n-grid-item>
        <BlockStatistic :label="labelTracked" :value="blocksTracked" />
      </n-grid-item>
      <n-grid-item>
        <n-space vertical>
          <n-button :loading="isFetching" @click="emit('fetch')" type="primary" block>
            {{ btnFetchText }}
          </n-button>
          <n-button
            @click="emit('set-marker')"
            :type="isTracking ? 'success' : 'default'"
            block
            :disabled="!isNotificationSupported"
          >
            {{ isTracking ? btnTrackingText : btnNotifyText }}
          </n-button>
        </n-space>
      </n-grid-item>
    </n-grid>
  </n-card>
</template>
