<template>
  <div class="tooltip-header" :style="headerStyle">
    <img :src="bgUrl" class="header-bg" draggable="false" alt="Grade Background" />
    <div class="header-content">
      <div class="title-section">
        <div v-if="id" class="item-preview">
          <ItemImage
            :id="id"
            :type="(type as ItemType) || 'equipment'"
            :image-url="(props as any).imageUrl"
            :size="100"
          />
        </div>
        <GradeBar :grade="grade" height="24px" />
        <n-h4 class="item-title">
          <n-ellipsis :line-clamp="1">
            {{ name }}
          </n-ellipsis>
        </n-h4>
      </div>
      <n-avatar
        v-if="elementUrl"
        :src="elementUrl"
        size="small"
        :bordered="false"
        class="element-icon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NH4 as nH4, NEllipsis as nEllipsis, NAvatar as nAvatar } from 'naive-ui'
import { getTooltipGradeBgUrl, resolveAssetUrl } from '@/logic/assets'
import GradeBar from '../atoms/GradeBar.vue'
import ItemImage from '../atoms/ItemImage.vue'
import type { ItemType } from '@/types/item'

const props = defineProps<{
  id?: number | string
  type?: ItemType
  grade: number
  name: string
  elementalType?: string
  imageUrl?: string | null
}>()

const bgUrl = computed(() => getTooltipGradeBgUrl(props.grade))
const elementUrl = computed(() => {
  if (props.elementalType) {
    return resolveAssetUrl({ element: props.elementalType })
  }
  return null
})

const headerStyle = computed(() => ({
  position: 'relative' as const,
  overflow: 'hidden',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
}))
</script>

<style scoped>
.tooltip-header {
  border-radius: 4px 4px 0 0;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.header-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 4px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.2) 100%);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-preview {
  width: 32px;
  height: 32px;
  position: relative;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-title {
  margin: 0 !important;
  color: #fff !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.element-icon {
  background: rgba(0, 0, 0, 0.4);
  padding: 2px;
  flex-shrink: 0;
}
</style>
