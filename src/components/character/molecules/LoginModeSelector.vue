<script setup lang="ts">
import { NTabs, NTabPane, NIcon } from 'naive-ui'
import { ContactCard24Regular as AgentIcon, PersonTag24Regular as AvatarIcon } from '@vicons/fluent'
import { useI18n } from 'vue-i18n'
import type { LoginMethod } from '@/logic/useLoginLogic'

interface Props {
  value: LoginMethod
}

defineProps<Props>()
defineEmits<{
  (e: 'update:value', val: LoginMethod): void
}>()

const { t } = useI18n()
</script>

<template>
  <n-tabs
    :value="value"
    type="segment"
    animated
    class="login-mode-selector"
    @update:value="(val) => $emit('update:value', val as LoginMethod)"
  >
    <n-tab-pane name="agent">
      <template #tab>
        <n-icon class="mr-1"><agent-icon /></n-icon>
        {{ t('login_method_agent') }}
      </template>
      <slot name="agent"></slot>
    </n-tab-pane>

    <n-tab-pane name="avatar">
      <template #tab>
        <n-icon class="mr-1"><avatar-icon /></n-icon>
        {{ t('login_method_avatar') }}
      </template>
      <slot name="avatar"></slot>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
.mr-1 {
  margin-right: 4px;
}
</style>
