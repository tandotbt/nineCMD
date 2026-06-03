/**
 * blockPolling Store – Pinia store poll block theo chu kỳ bằng GraphQL
 *
 * Thay thế WebSocket (đã ngưng hoạt động) bằng cách gọi GraphQL endpoint
 * Python get_block_now() trong .REF/python-tool/utils.py
 *
 * Tính năng:
 * - Poll block index từ Mimir GraphQL endpoint
 * - Tính avg block time từ sự khác biệt block index giữa các lần poll
 * - Tự động poll theo chu kỳ (cấu hình từ appSettings store)
 * - Hỗ trợ chuyển đổi planet
 * - Cung cấp dữ liệu cho Block Monitor tab
 *
 * Ref:
 * - .REF/python-tool/utils.py: get_block_now()
 * - .REF/python-tool/constants.py: LIST_URL_PLANET, URL_MIMIR
 * - src/stores/webSocketBlock.js: calculateAVG logic (cũ)
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  type PlanetName,
  PLANET_CONFIGS,
  AVG_BLOCK_FALLBACK,
  QUERY_GET_BLOCK_NOW
} from '../utilities/constants'
import { useAppSettingsStore } from './appSettings'
import { useConfigURLStore } from './configURL'

// ============================================================
// GraphQL request helper (mirror Python send_request_QUERY)
// ============================================================
async function sendRequestQuery(url: string, query: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// ============================================================
// Block poll history entry
// ============================================================
interface BlockPollEntry {
  blockIndex: number
  polledAt: number // Date.now() in ms
}

// ============================================================
// Store
// ============================================================
export const useBlockPollingStore = defineStore('blockPolling', () => {
  // Reference to appSettings store
  const appSettings = useAppSettingsStore()
  // Reference to configURL store for dynamic planet URLs
  const configURL = useConfigURLStore()

  // ============================================================
  // State
  // ============================================================
  const currentBlockIndex = ref<number>(0)
  const blockHistory = ref<BlockPollEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastPollTime = ref<number>(0)
  const pollCount = ref<number>(0)
  const successCount = ref<number>(0)
  const failCount = ref<number>(0)
  const isPolling = ref<boolean>(false)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  // ============================================================
  // Computed
  // ============================================================

  /** Current planet from appSettings */
  const selectedPlanet = computed<PlanetName>(() => appSettings.selectedPlanet)

  /** Poll interval from appSettings */
  const pollIntervalMs = computed(() => appSettings.pollIntervalMs)

  /** Planet display label */
  const planetLabel = computed(
    () => PLANET_CONFIGS[selectedPlanet.value]?.label ?? selectedPlanet.value
  )

  /** Avg block time in seconds (calculated from history) */
  const avgBlockTime = computed(() => {
    const history = blockHistory.value
    if (history.length < 2) return AVG_BLOCK_FALLBACK

    let totalTimeMs = 0
    let totalBlocks = 0

    for (let i = 1; i < history.length; i++) {
      const timeDiffMs = history[i].polledAt - history[i - 1].polledAt
      const blockDiff = history[i].blockIndex - history[i - 1].blockIndex

      if (blockDiff > 0 && timeDiffMs > 0) {
        totalTimeMs += timeDiffMs
        totalBlocks += blockDiff
      }
    }

    if (totalBlocks === 0) return AVG_BLOCK_FALLBACK
    return parseFloat((totalTimeMs / totalBlocks / 1000).toFixed(2))
  })

  /** Success rate percentage */
  const successRate = computed(() =>
    pollCount.value > 0
      ? `${Math.round((successCount.value / pollCount.value) * 100)}%`
      : '0%'
  )

  /** History length */
  const historyLength = computed(() => blockHistory.value.length)

  // ============================================================
  // Internal helpers
  // ============================================================

  /**
   * Get mimir URL –优先使用 dynamic URL từ configURL store,
   * fallback về PLANET_CONFIGS static.
   * Ref: .REF/python-tool/constants.py link_planet() – URL_MIMIR
   */
  function getMimirUrl(planet: PlanetName): string {
    const dynamicUrl = configURL.getMimirUrl(planet)
    if (dynamicUrl) return dynamicUrl
    return PLANET_CONFIGS[planet]?.mimirUrl ?? ''
  }

  /**
   * Fetch current block index from Mimir GraphQL endpoint.
   * Exact mirror of Python get_block_now():
   *   response["data"]["blocks"]["items"][0]["object"]["index"]
   */
  async function fetchCurrentBlock(planet: PlanetName): Promise<number> {
    const mimirUrl = getMimirUrl(planet)
    if (!mimirUrl) {
      throw new Error(`Planet "${planet}" không có Mimir endpoint`)
    }

    const response = await sendRequestQuery(mimirUrl, QUERY_GET_BLOCK_NOW)

    // Python: response["data"]["blocks"]["items"][0]["object"]["index"]
    const data = response['data'] as Record<string, unknown> | undefined
    const blocks = data?.['blocks'] as Record<string, unknown> | undefined
    const items = blocks?.['items'] as Array<{ object: { index: number } }> | undefined

    if (!items || items.length === 0 || !items[0]?.object) {
      throw new Error('Không nhận được block data từ Mimir')
    }

    return items[0].object.index
  }

  /**
   * Poll once: fetch block index, update history
   */
  async function pollOnce(): Promise<void> {
    isLoading.value = true
    error.value = null
    pollCount.value++
    lastPollTime.value = Date.now()

    try {
      const blockIndex = await fetchCurrentBlock(selectedPlanet.value)

      if (blockIndex <= 0) {
        error.value = 'Block index không hợp lệ'
        failCount.value++
        return
      }

      currentBlockIndex.value = blockIndex
      successCount.value++

      // Add to history (max 200 entries)
      const newEntry: BlockPollEntry = { blockIndex, polledAt: Date.now() }
      const updated = [...blockHistory.value, newEntry]
      blockHistory.value = updated.length > 200 ? updated.slice(-200) : updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      failCount.value++
      console.error('[blockPolling] Poll error:', e)
    } finally {
      isLoading.value = false
    }
  }

  function clearPollTimer(): void {
    if (pollTimer !== null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startPollTimer(): void {
    clearPollTimer()
    pollTimer = setInterval(() => {
      pollOnce()
    }, pollIntervalMs.value)
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Start polling: immediate fetch + interval */
  function startPolling(): void {
    clearPollTimer()
    pollOnce()
    startPollTimer()
    isPolling.value = true
  }

  /** Stop polling */
  function stopPolling(): void {
    clearPollTimer()
    isPolling.value = false
  }

  /** Restart polling (e.g. after interval change) */
  function restartPolling(): void {
    clearPollTimer()
    pollOnce()
    startPollTimer()
    isPolling.value = true
  }

  /** Force refresh now */
  function refresh(): Promise<void> {
    return pollOnce()
  }

  /** Switch planet */
  function switchPlanet(planet: PlanetName): void {
    appSettings.setPlanet(planet)
  }

  /** Change poll interval */
  function setPollInterval(ms: number): void {
    appSettings.setPollInterval(ms)
  }

  // ============================================================
  // Watchers: react to appSettings changes
  // ============================================================

  // Planet changed → clear history, re-poll
  watch(
    () => appSettings.selectedPlanet,
    () => {
      blockHistory.value = []
      currentBlockIndex.value = 0
      pollOnce()
    }
  )

  // Interval changed → restart polling
  watch(
    () => appSettings.pollIntervalMs,
    () => {
      if (isPolling.value) {
        startPollTimer()
      }
    }
  )

  // ============================================================
  // Public API
  // ============================================================

  return {
    // State
    currentBlockIndex,
    blockHistory,
    isLoading,
    error,
    lastPollTime,
    pollCount,
    successCount,
    failCount,
    isPolling,

    // Computed
    selectedPlanet,
    pollIntervalMs,
    planetLabel,
    avgBlockTime,
    successRate,
    historyLength,

    // Actions
    startPolling,
    stopPolling,
    restartPolling,
    refresh,
    switchPlanet,
    setPollInterval
  }
})
