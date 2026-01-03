<script setup lang="ts">
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'

defineProps<{
  title: string
  locale: string
  langOptions: SelectMixedOption[]
  isOnline: boolean
  onlineText: string
  offlineText: string
}>()

const emit = defineEmits<{
  (e: 'update:locale', value: string): void
}>()

const handleUpdateValue = (value: string) => {
  emit('update:locale', value)
}
</script>

<template>
  <n-layout-header bordered style="padding: 16px">
    <n-space justify="space-between" align="center">
      <span style="font-size: 1.5rem; font-weight: bold">{{ title }}</span>
      <n-space align="center">
        <n-select
          :value="locale"
          :options="langOptions"
          style="width: 140px"
          @update:value="handleUpdateValue"
        />
        <n-tag :type="isOnline ? 'success' : 'error'">
          {{ isOnline ? onlineText : offlineText }}
        </n-tag>
      </n-space>
    </n-space>
  </n-layout-header>
</template>
