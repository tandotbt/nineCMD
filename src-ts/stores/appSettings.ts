/**
 * appSettings Store – Pinia store quản lý settings chung của app
 *
 * Bao gồm:
 * - Dark mode state
 * - Planet selection (odin / heimdall / thor)
 * - Poll interval for block polling
 * - Language
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

/** localStorage key */
const STORAGE_KEY = 'setting-nine-cmd'

/** Persisted settings shape */
interface PersistedSettings {
  isDarkMode?: boolean
  lang?: string
  lastPlanet?: string
  pollIntervalMs?: number
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

  // ============================================================
  // Internal: persist all settings to localStorage
  // ============================================================

  function persist(): void {
    saveToStorage({
      isDarkMode: isDarkMode.value,
      lang: lang.value,
      lastPlanet: selectedPlanet.value,
      pollIntervalMs: pollIntervalMs.value
    })
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Toggle dark mode */
  function toggleDarkMode(): void {
    isDarkMode.value = !isDarkMode.value
    persist()
  }

  /** Set dark mode explicitly */
  function setDarkMode(value: boolean): void {
    isDarkMode.value = value
    persist()
  }

  /** Change language */
  function setLang(newLang: string): void {
    lang.value = newLang
    persist()
  }

  /** Switch planet – only allows available planets */
  function setPlanet(planet: PlanetName): void {
    if (planet === selectedPlanet.value) return
    // Validate against available planets from URL_ALL_PLANET
    if (!configURL.isPlanetAvailable(planet)) {
      console.warn(`[appSettings] Planet "${planet}" is not available, skipping`)
      return
    }
    selectedPlanet.value = planet
    planetLabel.value = PLANET_CONFIGS[planet]?.label ?? planet
    persist()
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
        console.warn(
          `[appSettings] Current planet "${selectedPlanet.value}" not available, ` +
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

    // Actions
    toggleDarkMode,
    setDarkMode,
    setLang,
    setPlanet,
    setPollInterval,
    validatePlanetAvailability
  }
})
