<template>
  <n-space vertical align="center" style="padding: 60px 20px">
    <n-result status="404" :title="t('page.notFound')" :description="t('page-notFound.detail')">
      <template #footer>
        <router-link :to="{ name: 'home' }">
          <n-button>{{ t('page.home') }}</n-button>
        </router-link>
      </template>
    </n-result>
  </n-space>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NSpace, NResult, NButton } from 'naive-ui'

const { t } = useI18n()
</script>
