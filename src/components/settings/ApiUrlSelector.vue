<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{
  title: string
  endpoints: readonly string[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:selectedIndex', value: number): void
}>()

const options = computed(() =>
  props.endpoints.map((url, idx) => ({
    label: url,
    value: idx,
  })),
)
</script>

<template>
  <n-card :title="title" size="small" hoverable>
    <div v-if="endpoints.length > 0">
      <n-select
        :value="selectedIndex"
        :options="options"
        @update:value="(val) => emit('update:selectedIndex', val)"
      />
    </div>
    <n-text v-else type="error" italic> {{ t('api_no_endpoints') }} </n-text>
  </n-card>
</template>
