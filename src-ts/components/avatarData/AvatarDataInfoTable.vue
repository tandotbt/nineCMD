<template>
  <n-card :title="t('avatarData.info.title')" size="small">
    <n-descriptions bordered :column="2" size="small" label-placement="left">
      <n-descriptions-item :label="t('avatarData.info.name')">
        {{ info?.name ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.level')">
        {{ info?.level ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.stage')">
        {{ info?.stageClearedId ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.ap')">
        {{ info?.actionPoint ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.apCost')">
        {{ info?.apCost ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.gold')">
        {{ info?.gold ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.crystal')">
        {{ info?.crystal ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.stakeNCG')">
        {{ info?.stakeNCG ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.worldId')" :span="2">
        {{ info?.unlockedWorldIds?.join(', ') ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.adventureCP')">
        {{ adventureCp ?? '-' }}
      </n-descriptions-item>
      <n-descriptions-item :label="t('avatarData.info.rank')">
        {{ info?.cpData?.rank ?? '-' }}
      </n-descriptions-item>
    </n-descriptions>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { useAvatarDataDisplayStore } from '../../stores/avatarDataDisplay'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()
const info = computed(() => store.characterInfo)
const adventureCp = computed(() => store.processedRestApi?.adventureCp ?? null)
</script>
