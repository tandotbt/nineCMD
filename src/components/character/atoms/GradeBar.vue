<template>
  <div class="grade-bar" :class="{ horizontal }" :style="barStyle"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getGradeColor } from '@/logic/assets'

const props = defineProps<{
  grade: number
  height?: string
  horizontal?: boolean
}>()

const barStyle = computed(() => {
  const color = getGradeColor(props.grade)
  return {
    backgroundColor: color,
    height: props.height || (props.horizontal ? '4px' : '100%'),
    width: props.horizontal ? '100%' : '4px',
    boxShadow: `0 0 8px ${color}80`,
  }
})
</script>

<style scoped>
.grade-bar {
  border-radius: 2px;
  transition: all 0.3s ease;
}
</style>
