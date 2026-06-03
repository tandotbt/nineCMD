/**
 * appSettings Store – Pinia store quản lý settings chung của app
 *
 * Bao gồm:
 * - Dark mode state
 * - Planet selection (odin / heimdall / thor)
 * - Poll interval for block polling
 * - Language
 * - Polling enabled state (isPolling)
 * - Logger level (logLevel)
 *
 * Tất cả settings được persist vào localStorage.
 *
 * Ref:
 * - src-ts/App.vue: toggleTheme, changeLang logic (cũ)
 * - src/components/other/tabSettingNinecmd.vue
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { type PlanetName, DEFAULT_POLL_INTERVAL_MS, PLANET_CONFIGS } from '../utilities/constants'
import { useConfigURLStore } from './configURL'
import { createLogger, type LogLevel } from '../utilities/logger'

/** localStorage key */
const STORAGE_KEY = 'setting-nine-cmd'

/** Persisted settings shape */
interface PersistedSettings {
  isDarkMode?: boolean
  lang?: string
  lastPlanet?: string
  pollIntervalMs?: number
  isPolling?: boolean
  logLevel?: LogLevel
}

function loadFromStorage(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorage(data: PersistedSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function normalizePlanet(val: string | undefined): PlanetName {
  if (val && val.toLowerCase() in PLANET_CONFIGS) {
    return val.toLowerCase() as PlanetName
  }
  return 'odin'
}

export const useAppSettingsStore = defineStore('appSettings', () => {
  // ============================================================
  // Logger
  // ============================================================
  const logger = createLogger({ module: 'appSettings' })

  // ============================================================
  // Load initial state from localStorage
  // ============================================================
  const persisted = loadFromStorage()
  const configURL = useConfigURLStore()

  // ============================================================
  // Reactive state
  // ============================================================

  /** Dark mode enabled */
  const isDarkMode = ref<boolean>(persisted.isDarkMode ?? false)

  /** Current language code */
  const lang = ref<string>(persisted.lang ?? 'en')

  /** Current planet selection */
  const selectedPlanet = ref<PlanetName>(normalizePlanet(persisted.lastPlanet))

  /** Block polling interval in ms */
  const pollIntervalMs = ref<number>(
    persisted.pollIntervalMs && persisted.pollIntervalMs >= 1000
      ? persisted.pollIntervalMs
      : DEFAULT_POLL_INTERVAL_MS
  )

  /** Planet display label */
  const planetLabel = ref<string>(
    PLANET_CONFIGS[selectedPlanet.value]?.label ?? selectedPlanet.value
  )

  /** Whether block polling is enabled (persisted) */
  const isPolling = ref<boolean>(persisted.isPolling ?? false)

  /** Logger level for UI display and config */
  const logLevel = ref<LogLevel>(persisted.logLevel ?? 'debug')

  // ============================================================
  // Internal: persist all settings to localStorage
  // ============================================================

  function persist(): void {
    saveToStorage({
      isDarkMode: isDarkMode.value,
      lang: lang.value,
      lastPlanet: selectedPlanet.value,
      pollIntervalMs: pollIntervalMs.value,
      isPolling: isPolling.value,
      logLevel: logLevel.value
    })
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Toggle dark mode */
  function toggleDarkMode(): void {
    isDarkMode.value = !isDarkMode.value
    persist()
    logger.info('Dark mode toggled:', isDarkMode.value)
  }

  /** Set dark mode explicitly */
  function setDarkMode(value: boolean): void {
    isDarkMode.value = value
    persist()
    logger.info('Dark mode set:', value)
  }

  /** Change language */
  function setLang(newLang: string): void {
    lang.value = newLang
    persist()
    logger.info('Language changed:', newLang)
  }

  /** Switch planet – only allows available planets */
  function setPlanet(planet: PlanetName): void {
    if (planet === selectedPlanet.value) return
    // Validate against available planets from URL_ALL_PLANET
    if (!configURL.isPlanetAvailable(planet)) {
      logger.warn(`Planet "${planet}" is not available, skipping`)
      return
    }
    selectedPlanet.value = planet
    planetLabel.value = PLANET_CONFIGS[planet]?.label ?? planet
    persist()
    logger.info('Planet changed:', planet)
  }

  /**
   * Validate selected planet against available planets.
   * If current planet is not available, fallback to first available planet.
   * Called after configURL.fetchPlanets() completes.
   */
  function validatePlanetAvailability(): void {
    if (!configURL.isPlanetAvailable(selectedPlanet.value)) {
      const available = configURL.availablePlanetNames
      if (available.length > 0) {
        const fallback = available[0]
        logger.warn(
          `Current planet "${selectedPlanet.value}" not available, ` +
          `falling back to "${fallback}"`
        )
        selectedPlanet.value = fallback
        planetLabel.value = PLANET_CONFIGS[fallback]?.label ?? fallback
        persist()
      }
    }
  }

  /** Set poll interval (ms) */
  function setPollInterval(ms: number): void {
    if (ms < 1000) return
    pollIntervalMs.value = ms
    persist()
    logger.info('Poll interval changed:', ms, 'ms')
  }

  /** Set polling enabled state */
  function setIsPolling(value: boolean): void {
    isPolling.value = value
    persist()
    logger.info('Polling state changed:', value)
  }

  /** Set logger level */
  function setLogLevel(level: LogLevel): void {
    logLevel.value = level
    persist()
    logger.info('Log level changed:', level)
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    isDarkMode,
    lang,
    selectedPlanet,
    planetLabel,
    pollIntervalMs,
    isPolling,
    logLevel,

    // Actions
    toggleDarkMode,
    setDarkMode,
    setLang,
    setPlanet,
    setPollInterval,
    setIsPolling,
    setLogLevel,
    validatePlanetAvailability
  }
})
