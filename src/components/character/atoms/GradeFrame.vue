<template>
  <div class="grade-frame-container" :style="containerStyle">
    <img :src="backgroundUrl" class="grade-background" draggable="false" alt="Grade Background" />
    <div class="grade-border" :style="borderStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getGradeBackgroundUrl, getGradeColor } from '@/logic/assets'

const props = defineProps<{
  grade: number
  showBorder?: boolean
}>()

const backgroundUrl = computed(() => getGradeBackgroundUrl(props.grade))

const containerStyle = computed(() => {
  const color = getGradeColor(props.grade)
  const g = Number(props.grade) || 1
  // Add professional glow for high grades (4+)
  const glow = g >= 4 ? `0 0 15px ${color}44` : 'none'
  return {
    boxShadow: glow,
  }
})

const borderStyle = computed(() => {
  if (!props.showBorder) return {}
  const color = getGradeColor(props.grade)
  return {
    borderColor: `${color}88`,
  }
})
</script>

<style scoped>
.grade-frame-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.grade-background {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.grade-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1.5px solid transparent;
  pointer-events: none;
  border-radius: inherit;
}
</style>
