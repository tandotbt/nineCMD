<template>
  <n-popover
    trigger="hover"
    scrollable
    :show-arrow="false"
    content-style="padding: 0;"
    style="max-height: 400px; max-width: 280px"
    placement="top"
    :delay="100"
    :duration="200"
  >
    <template #trigger>
      <div class="item-icon-container" :style="containerStyle">
        <!-- Layer 1: Grade Frame -->
        <GradeFrame :grade="displayData.grade" :show-border="true" />

        <!-- Layer 2: Main Item/Rune Image -->
        <ItemImage
          :id="displayData.id"
          :type="displayData.type"
          :ticker-rune="displayData.tickerRune"
          :image-url="displayData.imageUrl"
        />

        <!-- Layer 3: Star System -->
        <StarSystem
          v-if="shouldShowStars"
          :grade="displayData.grade"
          :has-skill="displayData.hasSkill"
          :skills-count="displayData.skillsCount"
          :option-stats-count="
            displayData.optionStatsCount ?? (displayData.optionStatTypes?.length || 0)
          "
        />

        <!-- Layer 4: Level/Count Overlay -->
        <ItemLevel v-if="hasLevel" :level="displayData.level!" :size="fontSize" />
        <ItemCount v-else-if="hasCount" :count="displayData.count!" :size="fontSize - 2" />

        <!-- Layer 5: Elemental Overlay -->
        <ElementIcon v-if="displayData.elementalType" :elemental-type="displayData.elementalType" />

        <!-- Layer 6: Equipped Status Tag -->
        <EquipTag v-if="displayData.isEquipped" />
      </div>
    </template>

    <!-- Molecule: Tooltip Content -->
    <ItemTooltip :item="displayData" />
  </n-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NPopover } from 'naive-ui'
import type { ItemDisplayData } from '@/types/item'
import { getGradeColor } from '@/logic/assets'

// Atomic components
import GradeFrame from './GradeFrame.vue'
import ItemImage from './ItemImage.vue'
import EquipTag from './EquipTag.vue'
import ItemLevel from './ItemLevel.vue'
import ItemCount from './ItemCount.vue'
import ElementIcon from './ElementIcon.vue'

// Molecular components
import StarSystem from '../molecules/StarSystem.vue'
import ItemTooltip from '../molecules/ItemTooltip.vue'

interface Props {
  item: ItemDisplayData
  /** Pixel size of the icon (default 64px) */
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 64,
})

const displayData = computed<ItemDisplayData>(() => {
  const grade = Number(props.item.grade) || 1
  return {
    ...props.item,
    grade,
    gradeColor: props.item.gradeColor || getGradeColor(grade),
  }
})

const containerStyle = computed(() => {
  const grade = displayData.value.grade
  const color = displayData.value.gradeColor
  // Stronger glow and thicker border for high grades (4+)
  const borderWidth = grade >= 4 ? '2px' : '1.5px'
  const glowOpacity = grade >= 5 ? '99' : grade >= 3 ? '66' : '33'
  const glowSize = grade >= 5 ? '10px' : '6px'

  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    border: `${borderWidth} solid ${color}aa`,
    boxShadow: `0 0 ${glowSize} ${color}${glowOpacity}`,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  }
})

const fontSize = computed(() => Math.floor(props.size / 3.2))

const shouldShowStars = computed(() => ['equipment', 'costume'].includes(displayData.value.type))

const hasLevel = computed(
  () => displayData.value.level !== undefined && displayData.value.level > 0,
)

const hasCount = computed(
  () =>
    displayData.value.count !== undefined &&
    (displayData.value.count > 1 ||
      displayData.value.type === 'material' ||
      displayData.value.type === 'rune'),
)
</script>

<style scoped>
.item-icon-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  transition:
    transform 0.1s ease-out,
    box-shadow 0.2s ease;
}

.item-icon-container:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}
</style>
