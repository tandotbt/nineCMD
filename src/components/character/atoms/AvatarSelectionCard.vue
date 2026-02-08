<script setup lang="ts">
import { NListItem, NThing, NAvatar, NTag, NSpace, NIcon } from 'naive-ui'
import { Person24Regular as PersonIcon } from '@vicons/fluent'
import type { AvatarData, CharacterSuggestion } from '@/types/character'

interface Props {
  avatar: AvatarData | CharacterSuggestion
  isSelected?: boolean
}

defineProps<Props>()
defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <n-list-item
    :class="{ 'is-selected': isSelected }"
    class="avatar-selection-card"
    @click="$emit('click')"
  >
    <template #prefix>
      <n-avatar round size="large" :src="avatar.portraitUrl">
        <n-icon v-if="!avatar.portraitUrl"><person-icon /></n-icon>
      </n-avatar>
    </template>
    <n-thing :title="avatar.name">
      <template #description>
        <n-space size="small">
          <n-tag size="small" type="success">Lv.{{ avatar.level }}</n-tag>
          <n-tag v-if="'worldId' in avatar" size="small" type="info"
            >W{{ avatar.worldId }}-S{{ avatar.stage }}</n-tag
          >
          <n-tag v-else-if="'planet' in avatar" size="small" type="warning">{{
            avatar.planet
          }}</n-tag>
        </n-space>
      </template>
      <div class="address-text">{{ avatar.address }}</div>
    </n-thing>
  </n-list-item>
</template>

<style scoped>
.avatar-selection-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.is-selected {
  background-color: var(--n-merged-color-hover);
  border-left: 4px solid var(--n-type-primary-color);
}

.address-text {
  font-size: 12px;
  color: var(--n-text-color-3);
  word-break: break-all;
}
</style>
