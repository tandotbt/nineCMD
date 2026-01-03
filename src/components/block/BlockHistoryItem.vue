<script setup lang="ts">
defineProps<{
  index: number | string
  hash: string
  timestamp: number | string
  isVirtual: boolean
  labelIndex: string
  labelHash: string
  labelVirtual: string
}>()

const formatTime = (ts: number | string) => {
  return new Date(ts).toLocaleTimeString()
}
</script>

<template>
  <div class="block-history-item">
    <n-space justify="space-between">
      <span>
        {{ labelIndex }}: <b>{{ index }}</b>
      </span>
      <n-tag v-if="isVirtual" size="small" type="warning">
        {{ labelVirtual }}
      </n-tag>
      <span class="timestamp">{{ formatTime(timestamp) }}</span>
    </n-space>
    <div class="hash-container">{{ labelHash }}: {{ hash }}</div>
  </div>
</template>

<style scoped>
.block-history-item {
  border-bottom: 1px solid #333;
  padding: 8px 0;
}

.timestamp {
  color: #666;
}

.hash-container {
  font-size: 0.8rem;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
