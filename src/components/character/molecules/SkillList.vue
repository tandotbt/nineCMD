<template>
  <div class="skill-list">
    <div v-for="skill in skills" :key="skill.id" class="skill-item">
      <div class="skill-header">
        <StatIcon type="skill" />
        <span class="skill-name">{{ skill.name || 'Unknown Skill' }}</span>
      </div>
      <div class="skill-details" v-if="hasDetails(skill)">
        <div v-if="skill.power" class="detail-row">
          Power: <span class="highlight">{{ skill.power }}</span>
          <span v-if="skill.referencedStatType"> {{ skill.referencedStatType }}</span>
        </div>
        <div v-if="skill.statPowerRatio" class="detail-row">
          Effect: <span class="highlight">{{ skill.statPowerRatio }}%</span>
          <span v-if="skill.referencedStatType"> {{ skill.referencedStatType }}</span>
        </div>
        <div v-if="skill.chance" class="detail-row">
          Chance: <span class="highlight">{{ skill.chance }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemSkill } from '@/types/item'
import StatIcon from '../atoms/StatIcon.vue'

defineProps<{
  skills: ItemSkill[]
}>()

function hasDetails(skill: ItemSkill) {
  return skill.power || skill.statPowerRatio || skill.chance
}
</script>

<style scoped>
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.skill-name {
  font-weight: bold;
  color: #fff;
  font-size: 13px;
}

.skill-details {
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-row {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.highlight {
  color: #f2c97d;
}
</style>
