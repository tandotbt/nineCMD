<template>
  <n-space vertical>
    <n-text depth="3">{{ t('actions.placeholder') }}</n-text>
  </n-space>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NSpace, NText } from 'naive-ui'

const { t } = useI18n()
</script>
