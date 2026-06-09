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

        <!-- ====== HELPER TEXT (nguồn leaderboard) ====== -->
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
// Options cho <n-select>
// Ưu tiên: agentLookupOptions nếu đã lookup agent
// Ngược lại: leaderboardOptions
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
// Khi user rời khỏi ô agent → gọi lookupAgent
// ============================================================
async function onAgentBlur(): Promise<void> {
  const addr = formValue.value.agentAddress.trim()
  if (!addr) {
    // Nếu rỗng → reset manual lookup để selectOptions quay về leaderboard
    arenaLookup.resetManualLookup()
    return
  }
  if (!arenaLookup.isValidAddressFormat(addr)) return // validator sẽ show lỗi

  await arenaLookup.lookupAgent(addr)
  // Auto-select avatar đầu tiên nếu có
  if (arenaLookup.lookedUpAvatars.length > 0) {
    formValue.value.avatarAddress = arenaLookup.lookedUpAvatars[0].address
  }
}

/**
 * Khi user click nút clear (×) của ô agent:
 * - Reset manual lookup state
 * - Reset avatarAddress để user chọn cách nhập liệu khác (leaderboard hoặc nhập tay)
 */
function onAgentClear(): void {
  arenaLookup.resetManualLookup()
  formValue.value.avatarAddress = ''
}

/**
 * Khi user click nút clear (×) của ô avatar:
 * - Reset avatarAddress thành rỗng
 * - Reset manual lookup
 */
function onAvatarClear(): void {
  arenaLookup.resetManualLookup()
  formValue.value.avatarAddress = ''
}

/**
 * Khi user rời khỏi ô avatar:
 * - Nếu value là 0x+40hex hợp lệ VÀ chưa có trong options hiện tại
 *   → gọi lookupAvatar để query ngược lấy agentAddress
 *   → auto-fill formValue.agentAddress
 * - Nếu value rỗng hoặc đã có trong options → bỏ qua (không gọi API)
 */
async function onAvatarBlur(): Promise<void> {
  const addr = (formValue.value.avatarAddress || '').trim()
  if (!addr) return
  // Validate format 0x + 40 hex
  if (!arenaLookup.isValidAddressFormat(addr)) return // validator sẽ show lỗi
  // Nếu đã có trong options (đã chọn từ select) → bỏ qua
  const isInOptions = selectOptions.value.some(
    (opt) => (opt as unknown as ArenaAvatarOption).avataraddress === addr
  )
  if (isInOptions) return

  // Query ngược lấy agentAddress
  const avatarInfo = await arenaLookup.lookupAvatar(addr)
  if (avatarInfo) {
    formValue.value.agentAddress = avatarInfo.agentAddress
  }
}

/**
 * Khi user chọn avatar từ dropdown (leaderboard hoặc agent lookup):
 * - Nếu option có agentAddress (leaderboardOptions luôn có) → auto-fill agentAddress
 * - Reset searchQuery để clear ô tìm kiếm
 */
function onAvatarSelect(value: string): void {
  if (!value) return
  
  // Tìm option được chọn
  const selectedOption = selectOptions.value.find(
    (opt) => (opt as unknown as ArenaAvatarOption).avataraddress === value
  ) as unknown as ArenaAvatarOption | undefined
  
  if (selectedOption?.agentAddress) {
    formValue.value.agentAddress = selectedOption.agentAddress
  }
  
  // Reset search query để clear ô tìm kiếm
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
    return // validation errors đã được Naive UI show
  }

  isSubmitting.value = true
  try {
    // TODO: gọi action login thực tế (kết nối blockchain, ...)
  } finally {
    isSubmitting.value = false
  }
}

// ============================================================
// Navigate tới trang Arena Lookup
// ============================================================
function goToLookup(): void {
  router.push({ name: 'arena-lookup' })
}

// ============================================================
// Lifecycle
// ============================================================

// Khi planet đổi → reset form
watch(
  () => arenaLookup.selectedPlanet,
  () => {
    formValue.value.agentAddress = ''
    formValue.value.avatarAddress = ''
    arenaLookup.resetManualLookup()
  }
)

// Đọc prefill từ localStorage (khi user click "Dùng để đăng nhập" ở ArenaLookupPage)
onMounted(() => {
  try {
    const prefillAgent = localStorage.getItem('login-prefill-agent')
    const prefillAvatar = localStorage.getItem('login-prefill-avatar')
    if (prefillAgent) formValue.value.agentAddress = prefillAgent
    if (prefillAvatar) formValue.value.avatarAddress = prefillAvatar
    // Xóa sau khi dùng
    localStorage.removeItem('login-prefill-agent')
    localStorage.removeItem('login-prefill-avatar')
  } catch {
    // ignore
  }
})
</script>
