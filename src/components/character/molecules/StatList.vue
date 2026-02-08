<template>
  <div class="stat-list">
    <StatRow v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" />
    <div v-if="optionStats && optionStats.length > 0" class="option-stats">
      <div v-for="opt in optionStats" :key="opt.label" class="option-row">
        <StatIcon type="stat" />
        <span class="option-label">{{ opt.label }}</span>
        <span class="option-value">+{{ opt.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemStat } from '@/types/item'
import StatRow from '../atoms/StatRow.vue'
import StatIcon from '../atoms/StatIcon.vue'

defineProps<{
  stats: ItemStat[]
  optionStats?: ItemStat[]
}>()
</script>

<style scoped>
.stat-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-stats {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.option-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
}

.option-label {
  color: rgba(255, 255, 255, 0.7);
}

.option-value {
  font-weight: bold;
  color: #f2c97d; /* Warning color for options */
}
</style>
