<template>
  <div class="item-level">
    <n-gradient-text type="warning" :size="size" strong> +{{ level }} </n-gradient-text>
  </div>
</template>

<script setup lang="ts">
import { NGradientText } from 'naive-ui'

defineProps<{
  level: number
  size: number
}>()
</script>

<style scoped>
.item-level {
  position: absolute;
  bottom: 2px;
  right: 4px;
  z-index: 4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  pointer-events: none;
}
</style>
