<template>
  <div class="item-count">
    <n-gradient-text :size="size" :gradient="{ from: '#dcdcdc', to: '#ffffff' }" strong>
      {{ formattedCount }}
    </n-gradient-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NGradientText } from 'naive-ui'

const props = defineProps<{
  count: number
  size: number
}>()

const formattedCount = computed(() => props.count.toLocaleString())
</script>

<style scoped>
.item-count {
  position: absolute;
  bottom: 2px;
  right: 4px;
  z-index: 4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  pointer-events: none;
}
</style>
