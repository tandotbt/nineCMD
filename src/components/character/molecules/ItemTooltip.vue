<template>
  <n-card size="small" :bordered="false" class="item-tooltip-card" :style="cardStyle">
    <template #header>
      <TooltipHeader
        :id="item.id"
        :type="item.type"
        :grade="item.grade"
        :name="item.name"
        :elemental-type="item.elementalType"
        :image-url="item.imageUrl"
      />
    </template>

    <n-space vertical size="small" class="tooltip-body">
      <n-flex justify="space-between" align="center" style="margin-bottom: 4px">
        <div class="cp-container">
          <img :src="GAME_ASSETS.ITEMS.CP_BG" class="cp-bg" alt="CP Background" />
          <span class="cp-label">CP</span>
          <span class="cp-value">
            <n-number-animation :from="0" :to="item.cp || 0" />
          </span>
        </div>
        <n-flex vertical align="flex-end" :size="0">
          <n-text depth="3" v-if="item.levelReq && item.levelReq > 0" class="req-level">
            Req. Lv.{{ item.levelReq }}
          </n-text>
          <n-text v-if="item.itemSubType" depth="3" class="sub-type">
            {{ item.itemSubType }}
          </n-text>
        </n-flex>
      </n-flex>

      <!-- Professional Grade Bar (Always show as visual separator) -->
      <div class="professional-grade-bar-wrapper">
        <GradeBar :grade="item.grade" height="4px" horizontal class="w-full" />
      </div>

      <!-- Stats List (Main & Options) -->
      <StatList v-if="hasStats" :stats="item.stats || []" :option-stats="optionStats" />

      <!-- Star Display for Tooltip (Horizontal) -->
      <div v-if="item.hasSkill || (item.optionStatsCount ?? 0) > 0" class="tooltip-stars-wrapper">
        <StarSystem
          :grade="item.grade"
          :has-skill="item.hasSkill"
          :skills-count="item.skillsCount"
          :option-stats-count="item.optionStatsCount"
          is-tooltip
        />
      </div>

      <!-- Skills Section -->
      <div v-if="item.skills && item.skills.length > 0" class="skills-section">
        <n-divider title-placement="left" style="margin: 8px 0 12px 0">
          <span class="divider-text">Skills</span>
        </n-divider>
        <SkillList :skills="item.skills" />
      </div>

      <div class="footer-info">
        <n-text depth="3" class="footer-text"> ITEM ID: {{ item.id }} </n-text>
        <n-text v-if="item.requiredBlockIndex" depth="3" class="footer-text">
          MIN BLOCK: {{ item.requiredBlockIndex }}
        </n-text>
      </div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NText, NFlex, NSpace, NDivider, NNumberAnimation } from 'naive-ui'
import type { ItemDisplayData, ItemStat } from '@/types/item'
import type { StatValue } from '@/types/character'
import { getTooltipGradeBgUrl } from '@/logic/assets'
import TooltipHeader from './TooltipHeader.vue'
import StatList from './StatList.vue'
import SkillList from './SkillList.vue'
import StarSystem from './StarSystem.vue'
import GradeBar from '../atoms/GradeBar.vue'
import { GAME_ASSETS } from '@/constants'

const props = defineProps<{
  item: ItemDisplayData
}>()

const cardStyle = computed(() => {
  const color = props.item.gradeColor || '#ffffff'
  return {
    backgroundColor: '#141414',
    border: `1.5px solid ${color}66`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.9), 0 0 15px ${color}15`,
    backgroundImage: `url(${getTooltipGradeBgUrl(props.item.grade)})`,
    backgroundSize: 'cover',
    backgroundBlendMode: 'overlay',
  }
})

const hasStats = computed(
  () => (props.item.stats?.length || 0) > 0 || (optionStats.value?.length || 0) > 0,
)

const optionStats = computed((): ItemStat[] => {
  if (!props.item.optionStatTypes || !props.item.statsMap) return []
  return props.item.optionStatTypes
    .map((type) => {
      const val = props.item.statsMap![type]
      let displayValue: number = 0
      if (typeof val === 'number') {
        displayValue = val
      } else if (val && typeof val === 'object') {
        const statVal = val as StatValue
        displayValue = statVal.additionalValue || statVal.baseValue || 0
      }
      return {
        label: type,
        value: displayValue,
      }
    })
    .filter((s) => s.value > 0)
})
</script>

<style scoped>
.item-tooltip-card {
  min-width: 280px;
  transition: border-color 0.3s ease;
}

:deep(.n-card-header) {
  padding: 0 !important;
}

.tooltip-body {
  padding: 12px;
}

.cp-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px 16px;
  min-width: 120px;
  height: 32px;
}

.cp-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 0;
}

.cp-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 900;
  color: #f2c97d;
  margin-right: 12px;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  font-family: 'Kanit', sans-serif;
}

.cp-value {
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  font-family: 'Kanit', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.5px;
}

.req-level {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: bold;
  color: #f2c97d !important;
}

.sub-type {
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5) !important;
}

.professional-grade-bar-wrapper {
  margin: 4px 0;
  width: 100%;
}

.tooltip-stars-wrapper {
  margin: 8px 0;
}

.skills-section {
  margin-top: 8px;
}

.divider-text {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
}

.footer-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

.footer-text {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3) !important;
  font-family: monospace;
}
</style>
