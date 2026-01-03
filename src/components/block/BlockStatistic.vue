<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  suffix?: string
}>()
</script>

<template>
  <n-statistic :label="label" :value="value">
    <template v-if="suffix" #suffix>
      {{ suffix }}
    </template>
  </n-statistic>
</template>
