<template>
  <!--
    Overlay: che phủ hoàn toàn trang web, chỉ hiện khi dữ liệu chưa load xong.
    KHÔNG dùng Teleport to="body" – giữ trong component tree
    để naive-ui dark theme từ n-config-provider hoạt động đúng.
  -->
  <Transition name="fade-overlay">
    <div v-if="!allLoaded || csvData.isPlanetSwitching" class="first-loading-overlay">
      <div class="first-loading-card" :class="{ dark: isDark }">
        <!-- Title -->
        <n-text strong style="font-size: 20px; margin-bottom: 16px">
          {{ t('@--App.title') }}
        </n-text>

        <!-- Planet Switching State (after initial load) -->
        <template v-if="csvData.isPlanetSwitching && allLoaded">
          <n-spin size="large" />
          <n-text strong style="font-size: 16px; margin-top: 16px">
            {{ t('firstLoading.switchingPlanet') }}
          </n-text>
          <n-text depth="3" style="font-size: 13px; margin-top: 8px; opacity: 0.7">
            {{ currentPlanetLabel }}
          </n-text>
          <n-text v-if="loadingStatusText" depth="3" style="font-size: 12px; margin-top: 4px; opacity: 0.5">
            {{ t(loadingStatusText) }}
          </n-text>
        </template>

        <!-- Initial Loading State -->
        <template v-else-if="isAnyLoading">
          <n-spin size="large" />
          <n-text depth="2" style="margin-top: 16px; font-size: 15px">
            {{ t('firstLoading.loading') }}
          </n-text>
          <n-text v-if="loadingStatusText" depth="3" style="font-size: 13px; margin-top: 8px; opacity: 0.7">
            {{ t(loadingStatusText) }}
          </n-text>
          <!-- CSV progress -->
          <n-text v-if="csvData.isLoaded" depth="3" style="font-size: 12px; margin-top: 4px; opacity: 0.5">
            ✓ CSV ({{ csvData.loadedSheetCount }}/{{ csvData.totalSheetCount }})
          </n-text>
        </template>

        <!-- Error State (chưa countdown) – hiển thị lỗi riêng cho planet và CSV -->
        <template v-else-if="hasError && !countdownActive">
          <n-space vertical style="width: 100%">
            <!-- Planet Error -->
            <n-alert v-if="configURL.error" type="error" :title="t('firstLoading.planetErrorTitle')">
              <n-text depth="2" style="font-size: 13px">
                {{ configURL.error }}
              </n-text>
              <n-button
                type="primary"
                size="small"
                style="margin-top: 8px"
                :loading="configURL.isLoading"
                @click="handleRetryPlanet"
              >
                {{ t('firstLoading.retry') }}
              </n-button>
            </n-alert>

            <!-- CSV Error -->
            <n-alert v-if="csvData.error" type="error" :title="t('firstLoading.csvErrorTitle')">
              <n-text depth="2" style="font-size: 13px">
                {{ csvData.error }}
              </n-text>
              <n-space vertical align="start" style="width: 100%; margin-top: 8px">
                <!-- URL Selector -->
                <n-select
                  v-model:value="selectedApiIndex"
                  :options="apiUrlOptions"
                  size="small"
                  style="width: 100%"
                />
                <n-button
                  type="primary"
                  size="small"
                  :loading="csvData.isLoading"
                  @click="handleRetryCsv"
                >
                  {{ t('firstLoading.retry') }}
                </n-button>
              </n-space>
            </n-alert>

            <!-- Planet loaded success hint -->
            <n-alert
              v-if="configURL.isLoaded && !configURL.error"
              type="success"
              :title="t('firstLoading.planetLoadedTitle')"
            >
              <n-text depth="3" style="font-size: 12px">
                ✓ {{ configURL.planets?.length }} planets loaded
              </n-text>
            </n-alert>

            <!-- CSV loaded success hint -->
            <n-alert
              v-if="csvData.isLoaded && !csvData.error"
              type="success"
              :title="t('firstLoading.csvLoadedTitle')"
            >
              <n-text depth="3" style="font-size: 12px">
                ✓ {{ csvData.loadedSheetCount }}/{{ csvData.totalSheetCount }} sheets loaded
              </n-text>
            </n-alert>
          </n-space>
        </template>

        <!-- Error State + countdown (đang đếm trước khi vào) -->
        <template v-else-if="hasError && countdownActive">
          <n-result
            status="warning"
            :title="t('firstLoading.warningTitle')"
            :description="errorText"
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
        <template v-else-if="allLoaded">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NSpin,
  NText,
  NResult,
  NButton,
  NAlert,
  NSelect
} from 'naive-ui'
import { useConfigURLStore } from '../stores/configURL'
import { useAppSettingsStore } from '../stores/appSettings'
import { useCsvDataStore } from '../stores/csvData'
import { useGlobalCsvStore } from '../stores/globalCsv'
import { useBannerStore } from '../stores/banner'
import { LIST_API_NINECMD } from '../utilities/constants'
import { createLogger } from '../utilities/logger'

const { t } = useI18n()
// const router = useRouter()
const configURL = useConfigURLStore()
const appSettings = useAppSettingsStore()
const csvData = useCsvDataStore()
const globalCsvStore = useGlobalCsvStore()
const bannerStore = useBannerStore()
const logger = createLogger({ module: 'firstLoading' })

/**
 * Overlay nằm trong <n-config-provider> ở App.vue,
 * nên naive-ui components tự động nhận dark theme.
 * Chỉ cần đọc appSettings.isDarkMode cho custom CSS của card.
 */
const isDark = computed(() => appSettings.isDarkMode)

/** Current planet label for switching overlay */
const currentPlanetLabel = computed(() => {
  const planet = appSettings.selectedPlanet
  if (!planet) return ''
  return planet.charAt(0).toUpperCase() + planet.slice(1)
})

/** Whether any store is currently loading (initial load only) */
const isAnyLoading = computed(() => configURL.isLoading || csvData.isLoading)

/** Whether all data is loaded successfully */
const allLoaded = computed(() => configURL.isLoaded && csvData.isLoaded)

/** Whether any store has an error */
const hasError = computed(() => !!configURL.error || !!csvData.error)

/** Combined error text from both stores */
const errorText = computed(() => {
  const errors: string[] = []
  if (configURL.error) errors.push(`Planets: ${configURL.error}`)
  if (csvData.error) errors.push(`CSV: ${csvData.error}`)
  return errors.join('\n') || 'Unknown error'
})

/** Loading status text – show the most relevant status */
const loadingStatusText = computed(() => {
  if (configURL.isLoading) return configURL.loadingStatus
  if (csvData.isLoading) return csvData.loadingStatus
  return ''
})

// ============================================================
// API URL Selector cho CSV retry
// ============================================================

/** Selected API index in csvData store */
const selectedApiIndex = ref(csvData.currentApiIndex)

/** Options for NSelect – danh sách 9CMD API URLs */
const apiUrlOptions = computed(() =>
  LIST_API_NINECMD.map((url, index) => ({
    label: url.replace('https://', '').replace('http://', ''),
    value: index
  }))
)

/** Watch csvData.currentApiIndex để sync với select */
watch(
  () => csvData.currentApiIndex,
  (newIndex) => {
    selectedApiIndex.value = newIndex
  }
)

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
 * Fetch planet data + CSV data on mount (parallel).
 * If both successful → countdown 3s → redirect to home.
 * If any failed → show error with retry buttons.
 *
 * Bước 3 (global - không bắt buộc):
 * - Load globalCsv (ItemName + SkillName + RemoteCsv) – nếu fail, log warning, bỏ qua
 * - Load banner từ Event.json – nếu fail, log warning, bỏ qua
 * - Dùng Promise.allSettled để 1 cái fail không ảnh hưởng cái kia
 * - KHÔNG block redirect → nếu chỉ fail global thì vẫn vào home bình thường
 */
onMounted(async () => {
  const planet = appSettings.selectedPlanet || 'odin'

  // Fetch planets + CSV chính (game data) song song
  const [planetSuccess, csvSuccess] = await Promise.all([
    configURL.fetchPlanets(),
    csvData.fetchAllSheets(planet)
  ])

  // Bước 3: load global data (CSV i18n + banner) – best-effort, không bắt buộc
  // Dùng allSettled: nếu 1 cái fail, cái kia vẫn chạy
  // Quan trọng: KHÔNG await block redirect – chạy ngầm
  void Promise.allSettled([
    globalCsvStore.loadAll(),
    bannerStore.loadBanners()
  ]).then((results) => {
    // Log warning nếu có fail, nhưng không block UI
    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        const source = idx === 0 ? 'globalCsv' : 'banner'
        logger.warn(`${source} failed (skipped):`, r.reason)
      }
    })
  })

  if (planetSuccess && csvSuccess) {
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
  // Hide planet switching overlay
  csvData.isPlanetSwitching = false
}

/**
 * Retry chỉ planet data
 */
async function handleRetryPlanet(): Promise<void> {
  clearCountdownTimer()
  countdown.value = 3
  countdownActive.value = false

  const success = await configURL.retry()
  const csvReady = csvData.isLoaded

  if (success && csvReady) {
    appSettings.validatePlanetAvailability()
    startCountdown()
  }
}

/**
 * Retry CSV data với API URL đã chọn
 */
async function handleRetryCsv(): Promise<void> {
  clearCountdownTimer()
  countdown.value = 3
  countdownActive.value = false

  // Set API index theo selection
  csvData.currentApiIndex = selectedApiIndex.value

  const planet = appSettings.selectedPlanet || 'odin'
  const success = await csvData.fetchAllSheets(planet)
  const planetReady = configURL.isLoaded

  if (success && planetReady) {
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
