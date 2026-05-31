<template>
  <n-progress
    type="line"
    :height="20"
    :percentage="item.percentage"
    :indicator-placement="'inside'"
    :border-radius="4"
    :fill-border-radius="0"
    :processing="item.processing"
    :color="item.color"
  >
    <n-ellipsis style="max-width: 15vw">
      <n-text v-if="item.text">{{ item.text }}</n-text>
      <n-text v-else depth="3">--</n-text>
    </n-ellipsis>
  </n-progress>
</template>

<script setup lang="ts">
import { NProgress, NText, NEllipsis } from 'naive-ui'
import type { HeaderProgressItem } from '../../types/header'

defineProps<{
  item: HeaderProgressItem
}>()
</script>
