<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RpcConfig } from '@/types/planet'

const { t } = useI18n()
const props = defineProps<{
  rpcKey: keyof RpcConfig
  endpoints: string[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:selectedIndex', value: number): void
}>()

const options = computed(() =>
  props.endpoints.map((url, idx) => ({
    label: `Node ${idx + 1}: ${url}`,
    value: idx,
  })),
)
</script>

<template>
  <n-card :title="String(rpcKey).replace('.', ' ').toUpperCase()" size="small" hoverable>
    <div v-if="endpoints.length > 0">
      <n-select
        :value="selectedIndex"
        :options="options"
        @update:value="(val) => emit('update:selectedIndex', val)"
      />
    </div>
    <n-text v-else type="error" italic> {{ t('planet_no_endpoints') }} </n-text>
  </n-card>
</template>
