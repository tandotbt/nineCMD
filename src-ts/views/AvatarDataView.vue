<template>
  <n-space vertical style="padding: 16px; max-width: 1200px; margin: 0 auto">
    <!-- Form -->
    <AvatarDataForm />

    <!-- Loading -->
    <n-spin v-if="store.isLoading" size="large" style="display: block; text-align: center; padding: 40px">
      <n-text depth="2">{{ t('avatarData.loading') }}</n-text>
    </n-spin>

    <!-- Error -->
    <n-alert v-else-if="store.error" type="error" :title="t('avatarData.error')">
      {{ store.error }}
    </n-alert>

    <!-- No data -->
    <n-empty v-else-if="!store.isReady" :description="t('avatarData.noData')" />

    <!-- Results -->
    <template v-else>
      <AvatarDataInfoTable />
      <AvatarDataInventoryTable />
      <AvatarDataMaterialTable />
      <AvatarDataGraphqlTable />
    </template>
  </n-space>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NSpace, NSpin, NText, NAlert, NEmpty } from 'naive-ui'
import { useAvatarDataDisplayStore } from '../stores/avatarDataDisplay'
import AvatarDataForm from '../components/avatarData/AvatarDataForm.vue'
import AvatarDataInfoTable from '../components/avatarData/AvatarDataInfoTable.vue'
import AvatarDataInventoryTable from '../components/avatarData/AvatarDataInventoryTable.vue'
import AvatarDataMaterialTable from '../components/avatarData/AvatarDataMaterialTable.vue'
import AvatarDataGraphqlTable from '../components/avatarData/AvatarDataGraphqlTable.vue'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()
</script>
