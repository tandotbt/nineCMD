<template>
  <n-space vertical align="center" style="padding: 40px 20px">
    <n-card :title="t('page.home')" style="max-width: 500px; width: 100%">
      <n-text depth="3">
        {{ t('@--App.description') }}
      </n-text>
      <n-divider />
      <n-text style="font-size: 12px; color: rgba(128, 128, 128, 1)">
        🏠 Home Page - Placeholder
      </n-text>
      <n-divider />
      <n-text depth="3" style="font-size: 12px">
        {{ t('@--App.devNote') }}
      </n-text>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NSpace, NCard, NText, NDivider } from 'naive-ui'

const { t } = useI18n()
</script>
