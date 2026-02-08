<template>
  <div v-if="elementUrl" class="element-icon-container">
    <img :src="elementUrl" class="element-icon" draggable="false" alt="Element" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveAssetUrl } from '@/logic/assets'

const props = defineProps<{
  elementalType: string
}>()

const elementUrl = computed(() => {
  if (props.elementalType && props.elementalType !== 'NORMAL') {
    return resolveAssetUrl({ element: props.elementalType })
  }
  return null
})
</script>

<style scoped>
.element-icon-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 35%;
  height: 35%;
  z-index: 4;
  pointer-events: none;
}

.element-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8));
}
</style>
