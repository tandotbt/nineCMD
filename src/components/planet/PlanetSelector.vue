<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PlanetName } from '@/types/planet'

defineProps<{
  modelValue: PlanetName
  options: { label: string; value: PlanetName }[]
  planetId: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: PlanetName): void
}>()

const { t } = useI18n()
</script>

<template>
  <n-card :title="t('planet_label_select')" size="small">
    <n-space vertical>
      <n-select
        :value="modelValue"
        :options="options"
        @update:value="(val) => emit('update:modelValue', val)"
      />
      <n-text depth="3" size="small"> ID: {{ planetId }} </n-text>
    </n-space>
  </n-card>
</template>
