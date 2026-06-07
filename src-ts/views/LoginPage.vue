<template>
  <n-space vertical align="center" justify="center" style="min-height: 100vh; padding: 40px 20px">
    <n-card :title="t('page.login')" style="max-width: 400px; width: 100%">
      <n-space vertical>
        <n-form label-placement="left" label-width="100">
          <n-form-item :label="t('login.agentAddress')">
            <n-input :placeholder="t('login.agentAddressPlaceholder')" clearable />
          </n-form-item>
          <n-form-item :label="t('login.password')">
            <n-input type="password" show-password-on="click" :placeholder="t('login.passwordPlaceholder')" />
          </n-form-item>
        </n-form>
        <n-button type="primary" block>
          {{ t('login.submit') }}
        </n-button>
        <n-divider />
        <n-text depth="3" style="font-size: 12px; text-align: center; display: block">
          {{ t('login.placeholderNote') }}
        </n-text>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDivider,
  NText
} from 'naive-ui'

const { t } = useI18n()
</script>
