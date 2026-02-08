<template>
  <img
    :src="displayUrl"
    class="item-image"
    :style="imageStyle"
    draggable="false"
    @error="handleError"
    alt="Item Icon"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { resolveItemUrl, resolveRuneUrl } from '@/logic/assets'
import type { ItemType } from '@/types/item'

const props = defineProps<{
  id: number | string
  type: ItemType
  tickerRune?: string | null
  imageUrl?: string | null
  /** Percentage size relative to container (default 70% as per UI standard) */
  size?: number
}>()

const isError = ref(false)

const iconUrl = computed(() => {
  if (props.imageUrl) {
    return props.imageUrl
  }
  if (props.type === 'rune' && props.tickerRune) {
    return resolveRuneUrl(props.tickerRune)
  }
  // If it's a material or equipment, we use the ID
  return resolveItemUrl(props.id)
})

const displayUrl = computed(() => {
  if (isError.value || !iconUrl.value) {
    // Fallback to a placeholder icon if asset fails to load
    return '/icons/UI_main_icon_box.png'
  }
  return iconUrl.value
})

watch(
  () => props.id,
  () => {
    isError.value = false
  },
)

function handleError() {
  isError.value = true
}

const imageStyle = computed(() => ({
  width: props.size ? `${props.size}%` : '70%',
  height: props.size ? `${props.size}%` : '70%',
}))
</script>

<style scoped>
.item-image {
  position: absolute;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
