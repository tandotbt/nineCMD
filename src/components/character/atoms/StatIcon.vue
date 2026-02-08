<template>
  <img
    :src="iconUrl"
    :class="rootClasses"
    :style="rootStyle"
    draggable="false"
    :alt="`${type} ${variant}`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getOptionIconUrl } from '@/logic/assets'

interface Props {
  /** 'stat' for Yellow (Stats), 'skill' for Purple (Skills) */
  type: 'stat' | 'skill'
  /** Size in pixels. Default is 14. */
  size?: number
  /** Visual variant: 'icon' for lists, 'star' for StarSystem */
  variant?: 'icon' | 'star'
  /** Enable glow effect. Defaults to true if variant is 'star'. */
  glow?: boolean
  /** Enable hover animation. Defaults to true if variant is 'star'. */
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 14,
  variant: 'icon',
  glow: undefined,
  animated: undefined,
})

const iconUrl = computed(() => getOptionIconUrl(props.type))

const isGlowEnabled = computed(() =>
  props.glow !== undefined ? props.glow : props.variant === 'star',
)
const isAnimatedEnabled = computed(() =>
  props.animated !== undefined ? props.animated : props.variant === 'star',
)

const rootClasses = computed(() => [
  'game-stat-icon',
  props.type,
  props.variant,
  {
    'has-glow': isGlowEnabled.value,
    'is-animated': isAnimatedEnabled.value,
  },
])

const rootStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<style scoped>
.game-stat-icon {
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

/* Base glow effect */
.has-glow {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
}

/* Specific glow colors */
.has-glow.stat {
  filter: drop-shadow(0 0 3px rgba(242, 201, 125, 0.6));
}

.has-glow.skill {
  filter: drop-shadow(0 0 3px rgba(171, 66, 183, 0.6));
}

/* Variant: Star specific styles */
.star {
  /* Stars usually need a more pronounced shadow to pop out from backgrounds */
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
}

.star.has-glow.stat {
  filter: drop-shadow(0 0 4px rgba(242, 201, 125, 0.8));
}

.star.has-glow.skill {
  filter: drop-shadow(0 0 4px rgba(171, 66, 183, 0.8));
}

/* Animations */
.is-animated {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.is-animated:hover {
  transform: scale(1.25);
  z-index: 1;
}

/* Legacy hue-rotate fix if needed, but getOptionIconUrl should return correct colored asset */
/* .skill.icon { filter: hue-rotate(260deg) brightness(1.2); } */
</style>
