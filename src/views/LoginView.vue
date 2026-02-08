<script setup lang="ts">
import { h } from 'vue'
import { useLoginLogic } from '@/logic/useLoginLogic'
import { useI18n } from 'vue-i18n'
import {
  NCard,
  NSteps,
  NStep,
  NAlert,
  NFormItem,
  NList,
  NListItem,
  NSpace,
  NButton,
  NIcon,
  NText,
  NSelect,
} from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import {
  ArrowRight24Regular as ArrowIcon,
  Search24Regular as SearchIcon,
  ContactCard24Regular as AgentIcon,
  PersonTag24Regular as AvatarIcon,
} from '@vicons/fluent'
import type { CharacterSuggestion } from '@/types/character'
import AvatarSelectionCard from '@/components/character/atoms/AvatarSelectionCard.vue'
import LoginInputGroup from '@/components/character/molecules/LoginInputGroup.vue'
import LoginModeSelector from '@/components/character/molecules/LoginModeSelector.vue'

const { t } = useI18n()
const {
  currentStep,
  loginMethod,
  isFetching,
  agentAddressInput,
  avatarAddressInput,
  selectedAvatar,
  avatars,
  discoveryOptions,
  discoveredAvatars,
  handleFetchAvatars,
  handleReverseLookup,
  handleLogin,
  goBack,
} = useLoginLogic()

/**
 * Custom label renderer for the avatar selection dropdown.
 * Matches the style of showing name and a preview of the address.
 */
const renderAvatarLabel = (option: SelectOption & { avatar?: CharacterSuggestion }) => {
  return h(
    NSpace,
    { align: 'center', size: 'small' },
    {
      default: () => [
        h(NText, { strong: !!option.avatar }, { default: () => option.label as string }),
        option.avatar
          ? h(
              NText,
              { depth: 3, style: 'font-size: 12px; font-style: italic' },
              {
                default: () => `(${String(option.value).slice(0, 8)}...)`,
              },
            )
          : null,
      ],
    },
  )
}

/**
 * Handles selection or manual entry in the avatar select component.
 */
const onAvatarUpdate = (val: string | null) => {
  if (!val) return
  avatarAddressInput.value = val
  if (val.startsWith('0x') && val.length === 42) {
    // Check if it's a known discovered avatar
    const discovered = discoveredAvatars.value.find((a) => a.address === val)
    handleReverseLookup(val, discovered?.agentAddress)
  }
}
</script>

<template>
  <div class="login-container">
    <n-card :title="t('login_title')" class="login-card">
      <n-steps :current="currentStep" :status="'process'" class="mb-8">
        <n-step :title="t('login_step_identify')" />
        <n-step :title="t('login_step_avatar')" />
      </n-steps>

      <div class="step-content">
        <div v-if="currentStep === 1">
          <LoginModeSelector v-model:value="loginMethod">
            <template #agent>
              <LoginInputGroup
                v-model:modelValue="agentAddressInput"
                :label="t('login_label_agent_address')"
                placeholder="0x..."
                :loading="isFetching"
                :buttonText="t('login_btn_next')"
                @submit="handleFetchAvatars"
              >
                <template #prefix>
                  <n-icon><agent-icon /></n-icon>
                </template>
                <template #button-icon>
                  <n-icon><arrow-icon /></n-icon>
                </template>
              </LoginInputGroup>
            </template>

            <template #avatar>
              <div class="method-content">
                <n-form-item :label="t('login_label_avatar_address')">
                  <n-select
                    :value="avatarAddressInput"
                    filterable
                    tag
                    :options="discoveryOptions"
                    placeholder="0x..."
                    :loading="isFetching"
                    :render-label="renderAvatarLabel"
                    @update:value="onAvatarUpdate"
                  >
                    <template #arrow>
                      <n-icon><avatar-icon /></n-icon>
                    </template>
                  </n-select>
                </n-form-item>

                <n-alert type="info" class="mb-4" size="small">
                  {{
                    t('login_discovery_hint') ||
                    'Select from active avatars or enter address manually.'
                  }}
                </n-alert>

                <n-list hoverable clickable class="discovery-list mb-4">
                  <n-list-item v-if="discoveredAvatars.length > 0">
                    <n-text depth="3" style="font-size: 12px; margin-bottom: 8px; display: block">
                      {{ t('login_top_ranked') || 'Top Ranked Avatars' }}
                    </n-text>
                  </n-list-item>
                  <AvatarSelectionCard
                    v-for="avatar in discoveredAvatars.slice(0, 5)"
                    :key="avatar.address"
                    :avatar="avatar"
                    :isSelected="avatarAddressInput === avatar.address"
                    @click="handleReverseLookup(avatar.address, avatar.agentAddress)"
                  />
                </n-list>

                <n-button type="primary" block :loading="isFetching" @click="handleReverseLookup()">
                  {{ t('login_btn_resolve') }}
                  <template #icon>
                    <n-icon><search-icon /></n-icon>
                  </template>
                </n-button>
              </div>
            </template>
          </LoginModeSelector>
        </div>

        <div v-else-if="currentStep === 2">
          <n-alert type="info" class="mb-4">
            {{ t('login_select_avatar_hint') }}
          </n-alert>

          <n-list hoverable clickable class="avatar-list">
            <AvatarSelectionCard
              v-for="avatar in avatars"
              :key="avatar.address"
              :avatar="avatar"
              :isSelected="selectedAvatar === avatar.address"
              @click="selectedAvatar = avatar.address"
            />
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
  max-width: 550px;
  width: 100%;
}

.mb-8 {
  margin-bottom: 32px;
}

.method-content {
  padding: 16px 0;
}

.avatar-list,
.discovery-list,
.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
