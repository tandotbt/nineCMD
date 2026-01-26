<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useMessage } from 'naive-ui'
import { Person24Regular as PersonIcon, ArrowRight24Regular as ArrowIcon } from '@vicons/fluent'

const { t } = useI18n()
const router = useRouter()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()
const message = useMessage()

const currentStep = ref(1)
const agentAddressInput = ref('')
const selectedAvatar = ref('')

const isFetchingAvatars = ref(false)

const avatars = computed(() => characterStore.characters)

async function handleFetchAvatars() {
  if (!agentAddressInput.value || !agentAddressInput.value.startsWith('0x')) {
    message.error(t('login_error_invalid_agent'))
    return
  }

  isFetchingAvatars.value = true
  try {
    await characterStore.fetchAllAvatars(agentAddressInput.value)
    if (avatars.value.length > 0) {
      currentStep.value = 2
    } else {
      message.warning(t('login_error_no_avatars'))
    }
  } catch (err) {
    console.error('Fetch avatars failed:', err)
    message.error(t('login_error_fetch_failed'))
  } finally {
    isFetchingAvatars.value = false
  }
}

function handleLogin() {
  if (!selectedAvatar.value) {
    message.error(t('login_error_select_avatar'))
    return
  }

  settingsStore.agentAddress = agentAddressInput.value
  settingsStore.avatarAddress = selectedAvatar.value

  message.success(t('login_success'))
  router.push('/')
}

function goBack() {
  currentStep.value = 1
}
</script>

<template>
  <div class="login-container">
    <n-card :title="t('login_title')" class="login-card">
      <n-steps :current="currentStep" :status="'process'">
        <n-step :title="t('login_step_agent')" />
        <n-step :title="t('login_step_avatar')" />
      </n-steps>

      <div class="step-content">
        <div v-if="currentStep === 1">
          <n-form-item :label="t('login_label_agent_address')">
            <n-input
              v-model:value="agentAddressInput"
              placeholder="0x..."
              @keyup.enter="handleFetchAvatars"
            />
          </n-form-item>
          <n-button type="primary" block :loading="isFetchingAvatars" @click="handleFetchAvatars">
            {{ t('login_btn_next') }}
            <template #icon>
              <n-icon><arrow-icon /></n-icon>
            </template>
          </n-button>
        </div>

        <div v-else-if="currentStep === 2">
          <n-alert type="info" class="mb-4">
            {{ t('login_select_avatar_hint') }}
          </n-alert>

          <n-list hoverable clickable class="avatar-list">
            <n-list-item
              v-for="avatar in avatars"
              :key="avatar.address"
              :class="{ 'is-selected': selectedAvatar === avatar.address }"
              @click="selectedAvatar = avatar.address"
            >
              <template #prefix>
                <n-avatar round size="large">
                  <n-icon><person-icon /></n-icon>
                </n-avatar>
              </template>
              <n-thing :title="avatar.name">
                <template #description>
                  <n-space size="small">
                    <n-tag size="small" type="success">Lv.{{ avatar.level }}</n-tag>
                    <n-tag size="small" type="info">Stage {{ avatar.stage }}</n-tag>
                  </n-space>
                </template>
                <div class="address-text">{{ avatar.address }}</div>
              </n-thing>
            </n-list-item>
          </n-list>

          <n-space vertical class="mt-4">
            <n-button type="primary" block :disabled="!selectedAvatar" @click="handleLogin">
              {{ t('login_btn_finish') }}
            </n-button>
            <n-button ghost block @click="goBack">
              {{ t('login_btn_back') }}
            </n-button>
          </n-space>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  max-width: 500px;
  width: 100%;
}

.step-content {
  margin-top: 32px;
}

.avatar-list {
  max-height: 400px;
  overflow-y: auto;
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

.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
