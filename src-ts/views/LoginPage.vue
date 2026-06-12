<template>
  <n-space vertical align="center" justify="center" style="min-height: 100vh; padding: 40px 20px">
    <n-card :title="t('login.title')" style="max-width: 500px; width: 100%">
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="formRules"
        label-placement="top"
      >
        <!-- ====== AGENT ADDRESS ====== -->
        <n-form-item
          :label="t('login.agentAddress')"
          path="agentAddress"
        >
          <n-input
            v-model:value="formValue.agentAddress"
            type="text"
            :placeholder="t('login.agentAddressPlaceholder')"
            clearable
            :loading="arenaLookup.isLookingUpAgent"
            :disabled="arenaLookup.isLookingUpAgent"
            @blur="onAgentBlur"
            @clear="onAgentClear"
          />
        </n-form-item>
        <n-text
          v-if="arenaLookup.errorLookedUpAgent"
          type="error"
          style="font-size: 12px; display: block; margin-top: -16px; margin-bottom: 12px"
        >
          {{ arenaLookup.errorLookedUpAgent.message }}
        </n-text>

        <!-- ====== AVATAR ADDRESS (n-select) ====== -->
        <n-form-item
          :label="t('login.avatarAddress')"
          path="avatarAddress"
        >
          <n-select
            v-model:value="formValue.avatarAddress"
            filterable
            tag
            clearable
            :placeholder="t('login.avatarAddressPlaceholder')"
            :options="selectOptions"
            :loading="arenaLookup.isFetchingLeaderboard || arenaLookup.isLookingUpAgent || arenaLookup.isLookingUpAvatar"
            value-field="avataraddress"
            label-field="avatarname"
            :render-label="renderAvatarLabel"
            :disabled="arenaLookup.isLookingUpAgent || arenaLookup.isLookingUpAvatar"
            :filter="filterAvatarOptions"
            :fallback-option="false"
            @search="onSearchLeaderboard"
            @clear="onAvatarClear"
            @blur="onAvatarBlur"
            @update:value="onAvatarSelect"
          />
        </n-form-item>

        <!-- ====== HELPER TEXT (leaderboard source) ====== -->
        <n-text
          v-if="showLeaderboardHint"
          :depth="3"
          style="font-size: 80%; font-style: italic; display: block; margin-top: -8px; margin-bottom: 12px"
        >
          💡 {{ t('login.helper.leaderboardHint') }}
          <n-text v-if="arenaLookup.lastSeasonId" code>
            Season #{{ arenaLookup.lastSeasonId }}
          </n-text>
        </n-text>

        <!-- ====== SUBMIT ====== -->
        <n-button
          type="primary"
          block
          :loading="isSubmitting"
          @click="onSubmit"
        >
          {{ t('login.submit') }}
        </n-button>
      </n-form>

      <n-divider />

      <n-flex justify="space-between" align="center">
        <n-text depth="3" style="font-size: 12px">
          {{ t('login.placeholderNote') }}
        </n-text>
        <n-button text type="primary" @click="goToLookup">
          {{ t('login.goToLookup') }}
        </n-button>
      </n-flex>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed, h, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NDivider,
  NText,
  NFlex,
  type SelectOption,
  type FormInst,
  type FormRules
} from 'naive-ui'
import { useArenaLookupStore } from '../stores/arenaLookup'
import { LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR } from '@/utilities/constants'
import type { ArenaAvatarOption } from '../types/arenaLookup'

const { t } = useI18n()
const router = useRouter()
const arenaLookup = useArenaLookupStore()

// ============================================================
// Form state
// ============================================================
const formRef = ref<FormInst | null>(null)
const isSubmitting = ref<boolean>(false)

const formValue = ref<{
  agentAddress: string
  avatarAddress: string
}>({
  agentAddress: '',
  avatarAddress: ''
})

// ============================================================
// Options for <n-select>
// Priority: agentLookupOptions if agent has been looked up
// Otherwise: leaderboardOptions
// ============================================================
const selectOptions = computed<SelectOption[]>(() => {
  const options =
    arenaLookup.lookedUpAvatars.length > 0
      ? arenaLookup.agentLookupOptions
      : arenaLookup.leaderboardOptions
  return options as unknown as SelectOption[]
})

const showLeaderboardHint = computed<boolean>(
  () =>
    arenaLookup.leaderboardList.length > 0 &&
    arenaLookup.lookedUpAvatars.length === 0
)

// ============================================================
// Render label (avatar name + avatar prefix)
// ============================================================
function renderAvatarLabel(option: SelectOption) {
  const opt = option as unknown as ArenaAvatarOption
  return [
    opt.avatarname,
    h(
      'span',
      { style: { fontSize: '80%', fontStyle: 'italic', marginLeft: '4px' } },
      `(${(opt.avataraddress || '').slice(2, 6)})`
    )
  ]
}

// ============================================================
// Client-side filter (match store searchQuery logic)
// ============================================================
function filterAvatarOptions(pattern: string, option: SelectOption): boolean {
  const opt = option as unknown as ArenaAvatarOption
  if (!pattern) return true
  const p = pattern.toLowerCase()
  return (
    (opt.avatarname || '').toLowerCase().includes(p) ||
    (opt.agentAddress || '').toLowerCase().includes(p) ||
    (opt.avataraddress || '').toLowerCase().includes(p)
  )
}

function onSearchLeaderboard(value: string): void {
  arenaLookup.searchQuery = value
}

// ============================================================
// Validator
// ============================================================
const formRules = computed<FormRules>(() => ({
  agentAddress: [
    {
      required: true,
      message: t('login.rules.agent.required'),
      trigger: 'blur'
    },
    {
      validator(_: unknown, value: string) {
        if (!arenaLookup.isValidAddressFormat(value)) {
          return new Error(t('login.rules.agent.invalidFormat'))
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  avatarAddress: [
    {
      required: true,
      message: t('login.rules.avatar.required'),
      trigger: 'change'
    }
  ]
}))

// ============================================================
// When user leaves agent field → call lookupAgent
// ============================================================
async function onAgentBlur(): Promise<void> {
  const addr = formValue.value.agentAddress.trim()
  if (!addr) {
    // If empty → reset manual lookup so selectOptions revert to leaderboard
    arenaLookup.resetManualLookup()
    return
  }
  if (!arenaLookup.isValidAddressFormat(addr)) return // validator will show error

  await arenaLookup.lookupAgent(addr)
  // Auto-select first avatar if available
  if (arenaLookup.lookedUpAvatars.length > 0) {
    formValue.value.avatarAddress = arenaLookup.lookedUpAvatars[0].address
  }
}

/**
 * When user clicks clear (×) button on agent field:
 * - Reset manual lookup state
 * - Reset avatarAddress so user can choose another input method (leaderboard or manual)
 */
function onAgentClear(): void {
  arenaLookup.resetManualLookup()
  formValue.value.avatarAddress = ''
}

/**
 * When user clicks clear (×) button on avatar field:
 * - Reset avatarAddress to empty
 * - Reset manual lookup
 */
function onAvatarClear(): void {
  arenaLookup.resetManualLookup()
  formValue.value.avatarAddress = ''
}

/**
 * When user leaves avatar field:
 * - If value is valid 0x+40hex AND not already in current options
 *   → call lookupAvatar to reverse-query agentAddress
 *   → auto-fill formValue.agentAddress
 * - If value is empty or already in options → skip (don't call API)
 */
async function onAvatarBlur(): Promise<void> {
  const addr = (formValue.value.avatarAddress || '').trim()
  if (!addr) return
  // Validate format 0x + 40 hex
  if (!arenaLookup.isValidAddressFormat(addr)) return // validator will show error
  // If already in options (selected from select) → skip
  const isInOptions = selectOptions.value.some(
    (opt) => (opt as unknown as ArenaAvatarOption).avataraddress === addr
  )
  if (isInOptions) return

  // Reverse-query to get agentAddress
  const avatarInfo = await arenaLookup.lookupAvatar(addr)
  if (avatarInfo) {
    formValue.value.agentAddress = avatarInfo.agentAddress
  }
}

/**
 * When user selects avatar from dropdown (leaderboard or agent lookup):
 * - If option has agentAddress (leaderboardOptions always have) → auto-fill agentAddress
 * - Reset searchQuery to clear search field
 */
function onAvatarSelect(value: string): void {
  if (!value) return
  
  // Find the selected option
  const selectedOption = selectOptions.value.find(
    (opt) => (opt as unknown as ArenaAvatarOption).avataraddress === value
  ) as unknown as ArenaAvatarOption | undefined
  
  if (selectedOption?.agentAddress) {
    formValue.value.agentAddress = selectedOption.agentAddress
  }
  
  // Reset search query to clear search field
  arenaLookup.searchQuery = ''
}

// ============================================================
// Submit form
// ============================================================
async function onSubmit(): Promise<void> {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return // validation errors already shown by Naive UI
  }

  isSubmitting.value = true
  try {
    // TODO: call actual login action (blockchain connection, ...)
  } finally {
    isSubmitting.value = false
  }
}

// ============================================================
// Navigate to Arena Lookup page
// ============================================================
function goToLookup(): void {
  router.push({ name: 'arena-lookup' })
}

// ============================================================
// Lifecycle
// ============================================================

// When planet changes → reset form
watch(
  () => arenaLookup.selectedPlanet,
  () => {
    formValue.value.agentAddress = ''
    formValue.value.avatarAddress = ''
    arenaLookup.resetManualLookup()
  }
)

// Read prefill from localStorage (when user clicks "Use for Login" in ArenaLookupPage)
onMounted(() => {
  try {
    const prefillAgent = localStorage.getItem(LOGIN_PREFILL_AGENT)
    const prefillAvatar = localStorage.getItem(LOGIN_PREFILL_AVATAR)
    if (prefillAgent) formValue.value.agentAddress = prefillAgent
    if (prefillAvatar) formValue.value.avatarAddress = prefillAvatar
    // Clear after use
    localStorage.removeItem(LOGIN_PREFILL_AGENT)
    localStorage.removeItem(LOGIN_PREFILL_AVATAR)
  } catch {
    // ignore
  }
})
</script>
