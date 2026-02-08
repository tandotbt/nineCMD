<template>
  <div class="stat-row">
    <n-text depth="3" class="stat-label">{{ label }}</n-text>
    <n-text strong class="stat-value">{{ value }}</n-text>
  </div>
</template>

<script setup lang="ts">
import { NText } from 'naive-ui'

defineProps<{
  label: string
  value: string | number
}>()
</script>

<style scoped>
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  line-height: 1.8;
  padding: 0 4px;
}

.stat-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5) !important;
  font-family: 'Kanit', sans-serif;
  font-size: 11px;
}

.stat-value {
  color: #fff !important;
  font-family: 'NotoMono-Regular', monospace;
}
</style>
