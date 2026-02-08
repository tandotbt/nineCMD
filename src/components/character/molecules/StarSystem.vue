<template>
  <div v-if="showOptions" class="star-system-container" :class="{ 'is-tooltip': isTooltip }">
    <img :src="optionBgUrl" class="option-bg" draggable="false" alt="Star Container Background" />
    <div class="stars-list">
      <StatIcon
        v-for="(star, idx) in starTypes"
        :key="idx"
        :type="star"
        variant="star"
        :size="isTooltip ? 16 : 14"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getGradeOptionBackgroundUrl } from '@/logic/assets'
import StatIcon from '../atoms/StatIcon.vue'

const props = defineProps<{
  grade: number
  /** Flag for purple star */
  hasSkill?: boolean
  /** Count of skills for purple stars */
  skillsCount?: number
  /** Count of option stats for yellow stars */
  optionStatsCount?: number
  /** Whether displayed in tooltip (horizontal layout) */
  isTooltip?: boolean
}>()

const showOptions = computed(
  () => props.hasSkill || (props.skillsCount ?? 0) > 0 || (props.optionStatsCount ?? 0) > 0,
)
const optionBgUrl = computed(() => getGradeOptionBackgroundUrl(props.grade))

/**
 * Logic sorted star types: Skills (purple) first, then Stats (yellow).
 * Logic for star ordering and max display.
 */
const starTypes = computed((): ('skill' | 'stat')[] => {
  const result: ('skill' | 'stat')[] = []

  // 1. Purple stars (skill/hasSkill) come first
  const sCount = props.skillsCount ?? (props.hasSkill ? 1 : 0)
  for (let i = 0; i < sCount; i++) {
    result.push('skill')
  }

  // 2. Yellow stars (option stats) follow
  const statCount = props.optionStatsCount ?? 0
  for (let i = 0; i < statCount; i++) {
    result.push('stat')
  }

  // Standard Nine Chronicles UI shows stars based on total count, max 4
  return result.slice(0, 4)
})
</script>

<style scoped>
.star-system-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 30%;
  height: 100%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.option-bg {
  position: absolute;
  left: -12%;
  top: 10%;
  height: 80%;
  object-fit: contain;
  opacity: 0.95;
}

.stars-list {
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: -3px;
  padding-left: 2px;
}

/* Tooltip Horizontal Layout */
.star-system-container.is-tooltip {
  position: relative;
  width: 100%;
  height: 32px;
  flex-direction: row;
  justify-content: flex-start;
  margin: 4px 0;
}

.star-system-container.is-tooltip .option-bg {
  left: 0;
  top: 0;
  height: 100%;
  width: auto;
}

.star-system-container.is-tooltip .stars-list {
  position: relative;
  flex-direction: row;
  left: 8px;
  top: 0;
  height: 100%;
  width: auto;
  gap: 2px;
  padding-left: 0;
}
</style>
