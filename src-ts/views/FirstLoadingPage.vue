<template>
  <!--
    Overlay: covers the entire page, only shown when data hasn't loaded yet.
    Does NOT use Teleport to="body" – kept in component tree
    so naive-ui dark theme from n-config-provider works correctly.
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

        <!-- Error State (no countdown yet) – show errors for planet and CSV separately -->
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

        <!-- Error State + countdown (counting down before entering) -->
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

        <!-- Success State – countdown before redirect -->
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
import { LIST_API_NINECMD } from '@/utilities/constants'
import { createLogger } from '../utilities/logger'

const { t } = useI18n()
const configURL = useConfigURLStore()
const appSettings = useAppSettingsStore()
const csvData = useCsvDataStore()
const globalCsvStore = useGlobalCsvStore()
const bannerStore = useBannerStore()
const logger = createLogger({ module: 'firstLoading' })

/**
 * Overlay is inside <n-config-provider> in App.vue,
 * so naive-ui components automatically receive dark theme.
 * Only need to read appSettings.isDarkMode for custom card CSS.
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

/** Options for NSelect – list of 9CMD API URLs */
const apiUrlOptions = computed(() =>
  LIST_API_NINECMD.map((url, index) => ({
    label: url.replace('https://', '').replace('http://', ''),
    value: index
  }))
)

/** Watch csvData.currentApiIndex to sync with select */
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
 * Step 3 (global - not required):
 * - Load globalCsv (ItemName + SkillName + RemoteCsv) – if fail, log warning, skip
 * - Load banner from Event.json – if fail, log warning, skip
 * - Use Promise.allSettled so 1 failure doesn't affect the other
 * - Does NOT block redirect → if only global fails, still enters home normally
 */
onMounted(async () => {
  const planet = appSettings.selectedPlanet || 'odin'

  // Fetch planets + main CSV (game data) in parallel
  const [planetSuccess, csvSuccess] = await Promise.all([
    configURL.fetchPlanets(),
    csvData.fetchAllSheets(planet)
  ])

  // Step 3: load global data (CSV i18n + banner) – best-effort, not required
  // Use allSettled: if 1 fails, the other still runs
  // Important: does NOT await block redirect – runs in background
  void Promise.allSettled([
    globalCsvStore.loadAll(),
    bannerStore.loadBanners()
  ]).then((results) => {
    // Log warning if any fail, but don't block UI
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
 * Retry planet data only
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
 * Retry CSV data with selected API URL
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
  /* Semi-transparent backdrop – covers entirely, blurs the page behind */
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
