<template>
  <n-flex vertical :size="2" class="item-name-display">
    <span class="item-name" :style="{ color: item.gradeColor }">
      {{ item.name }}
    </span>
    <n-flex v-if="showSubtitle" :size="4" align="center" class="item-subtitle">
      <n-text v-if="item.itemSubType" depth="3" class="subtitle-text">
        {{ item.itemSubType }}
      </n-text>
      <n-text v-if="item.levelReq" depth="3" class="subtitle-text"> Lv.{{ item.levelReq }} </n-text>
      <n-text v-if="showId" depth="3" class="subtitle-text id-text"> ID: {{ item.id }} </n-text>
      <n-tag
        v-if="item.runeType"
        size="tiny"
        :bordered="false"
        :type="item.runeType === 'SKILL' ? 'warning' : 'info'"
        class="rune-tag"
      >
        {{ item.runeType }}
      </n-tag>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { NFlex, NText, NTag } from 'naive-ui'
import type { ItemDisplayData } from '@/types/item'

interface Props {
  item: ItemDisplayData
  showId?: boolean
  showSubtitle?: boolean
}

withDefaults(defineProps<Props>(), {
  showId: false,
  showSubtitle: true,
})
</script>

<style scoped>
.item-name-display {
  line-height: 1.2;
}

.item-name {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  flex-wrap: nowrap;
}

.subtitle-text {
  font-size: 11px;
  white-space: nowrap;
}

.id-text {
  font-family: monospace;
}

.rune-tag {
  font-size: 10px;
  line-height: 1;
  height: 16px;
  padding: 0 4px;
}
</style>
