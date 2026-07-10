<template>
  <n-card :title="t('avatarData.title')" size="small">
    <n-form label-placement="left" label-width="120">
      <n-form-item :label="t('avatarData.form.agentAddress')">
        <n-input
          v-model:value="agentAddr"
          :placeholder="t('avatarData.form.agentPlaceholder')"
          clearable
        />
      </n-form-item>
      <n-form-item :label="t('avatarData.form.avatarAddress')">
        <n-input
          v-model:value="avatarAddr"
          :placeholder="t('avatarData.form.avatarPlaceholder')"
          clearable
        />
      </n-form-item>
      <n-space align="center">
        <n-button
          type="primary"
          :loading="store.isLoading"
          :disabled="!agentAddr || !avatarAddr"
          @click="onFetch"
        >
          {{ t('avatarData.form.fetch') }}
        </n-button>
        <n-button @click="onReset">
          {{ t('avatarData.form.reset') }}
        </n-button>
        <n-tag :bordered="false" type="info" size="small">
          {{ t('avatarData.form.planet') }}: {{ store.selectedPlanet }}
        </n-tag>
      </n-space>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NTag } from 'naive-ui'
import { LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR } from '@/utilities/constants'
import { useAvatarDataDisplayStore } from '../../stores/avatarDataDisplay'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()

const agentAddr = ref('')
const avatarAddr = ref('')

function onFetch(): void {
  if (agentAddr.value && avatarAddr.value) {
    store.fetchAvatarData(agentAddr.value, avatarAddr.value)
  }
}

function onReset(): void {
  agentAddr.value = ''
  avatarAddr.value = ''
  store.reset()
}

// Read prefill from localStorage (set by LoginPage.onSubmit)
// and auto-fetch if both addresses are present
onMounted(() => {
  try {
    const prefillAgent = localStorage.getItem(LOGIN_PREFILL_AGENT)
    const prefillAvatar = localStorage.getItem(LOGIN_PREFILL_AVATAR)
    if (prefillAgent) {
      agentAddr.value = prefillAgent
      localStorage.removeItem(LOGIN_PREFILL_AGENT)
    }
    if (prefillAvatar) {
      avatarAddr.value = prefillAvatar
      localStorage.removeItem(LOGIN_PREFILL_AVATAR)
    }
    // Auto-fetch if both addresses were provided
    if (agentAddr.value && avatarAddr.value) {
      store.fetchAvatarData(agentAddr.value, avatarAddr.value)
    }
  } catch {
    // ignore
  }
})
</script>
