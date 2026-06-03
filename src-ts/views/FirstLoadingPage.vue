<template>
  <!--
    Overlay: che phủ hoàn toàn trang web, chỉ hiện khi dữ liệu chưa load xong.
    KHÔNG dùng Teleport to="body" – giữ trong component tree
    để naive-ui dark theme từ n-config-provider hoạt động đúng.
  -->
  <Transition name="fade-overlay">
    <div v-if="!configURL.isLoaded" class="first-loading-overlay">
      <div class="first-loading-card" :class="{ dark: isDark }">
        <!-- Title -->
        <n-text strong style="font-size: 20px; margin-bottom: 16px">
          {{ t('@--App.title') }}
        </n-text>

        <!-- Loading State -->
        <template v-if="configURL.isLoading">
          <n-spin size="large" />
          <n-text depth="2" style="margin-top: 16px; font-size: 15px">
            {{ t('firstLoading.loading') }}
          </n-text>
          <n-text depth="3" style="font-size: 13px; margin-top: 8px; opacity: 0.7">
            {{ t(configURL.loadingStatus) }}
          </n-text>
        </template>

        <!-- Error State (chưa countdown) -->
        <template v-else-if="configURL.error && !countdownActive">
          <n-result
            status="error"
            :title="t('firstLoading.errorTitle')"
            :description="configURL.error"
          >
            <template #footer>
              <n-space vertical align="center">
                <n-button
                  type="primary"
                  size="large"
                  :loading="configURL.isLoading"
                  @click="handleRetry"
                >
                  {{ t('firstLoading.retry') }}
                </n-button>
                <n-text depth="3" style="font-size: 12px">
                  {{ t('firstLoading.usingFallback') }}
                </n-text>
              </n-space>
            </template>
          </n-result>
        </template>

        <!-- Error State + countdown (dùng fallback, đang đếm trước khi vào) -->
        <template v-else-if="configURL.error && countdownActive">
          <n-result
            status="warning"
            :title="t('firstLoading.warningTitle')"
            :description="configURL.error"
          >
            <template #footer>
              <n-space vertical align="center">
                <n-text depth="3" style="font-size: 14px">
                  {{ redirectMessage }}
                </n-text>
                <n-button type="primary" @click="goHome">
                  {{ t('firstLoading.goHome') }}
                </n-button>
              </n-space>
            </template>
          </n-result>
        </template>

        <!-- Success State – countdown trước khi chuyển -->
        <template v-else-if="configURL.isLoaded">
          <n-result
            status="success"
            :title="t('firstLoading.successTitle')"
            :description="t('firstLoading.successDescription')"
          >
            <template #footer>
              <n-space vertical align="center">
                <n-text depth="3" style="font-size: 14px">
                  {{ redirectMessage }}
                </n-text>
                <n-button type="primary" @click="goHome">
                  {{ t('firstLoading.goHome') }}
                </n-button>
              </n-space>
            </template>
          </n-result>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NSpin,
  NText,
  NResult,
  NButton
} from 'naive-ui'
import { useConfigURLStore } from '../stores/configURL'
import { useAppSettingsStore } from '../stores/appSettings'

const { t } = useI18n()
const router = useRouter()
const configURL = useConfigURLStore()
const appSettings = useAppSettingsStore()

/**
 * Overlay nằm trong <n-config-provider> ở App.vue,
 * nên naive-ui components tự động nhận dark theme.
 * Chỉ cần đọc appSettings.isDarkMode cho custom CSS của card.
 */
const isDark = computed(() => appSettings.isDarkMode)

/** Countdown seconds before redirect */
const countdown = ref(3)
/** Whether countdown is active */
const countdownActive = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | null = null

/** Computed redirect message with countdown */
const redirectMessage = computed(() => {
  const msg = t('firstLoading.redirectIn') as string
  return msg.replace('{seconds}', String(countdown.value))
})

/**
 * Fetch planet data on mount.
 * If successful → countdown 3s → redirect to home.
 * If failed → show error with retry button.
 */
onMounted(async () => {
  const success = await configURL.fetchPlanets()
  if (success) {
    appSettings.validatePlanetAvailability()
    startCountdown()
  }
})

onUnmounted(() => {
  clearCountdownTimer()
})

function startCountdown(): void {
  countdown.value = 3
  countdownActive.value = true
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearCountdownTimer()
      goHome()
    }
  }, 1000)
}

function clearCountdownTimer(): void {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function goHome(): void {
  clearCountdownTimer()
  countdownActive.value = false
}

async function handleRetry(): Promise<void> {
  clearCountdownTimer()
  countdown.value = 3
  countdownActive.value = false
  const success = await configURL.retry()
  if (success) {
    appSettings.validatePlanetAvailability()
    startCountdown()
  }
}
</script>

<style scoped>
.first-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  /* Semi-transparent backdrop – che phủ hoàn toàn, làm mờ web đằng sau */
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* Flex center */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.first-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  width: 90%;
  padding: 40px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.first-loading-card.dark {
  background: #1e1e24;
  color: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
}

/* Fade transition */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.4s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
