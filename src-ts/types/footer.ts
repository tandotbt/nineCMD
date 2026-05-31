/**
 * Types cho Footer components
 */

/** Block info data */
export interface BlockInfo {
  blockNow: number
  avgBlockNow: number
  avgTransNow: number
  selectedPlanet: string
}

/** Node config */
export interface NodeConfig {
  url: string
  label: string
  isActive: boolean
}

/** Footer settings – persisted to localStorage */
export interface FooterSettings {
  selectedPlanet?: string
  selectedNode?: string
  lastPlanet?: string
  pollIntervalMs?: number
  lang?: string
  isDarkMode?: boolean
}

/**
 * Block poll history entry (internal to useBlockPolling composable)
 * Tracks block index + timestamp for avg block time calculation
 */
export interface BlockPollEntry {
  blockIndex: number
  polledAt: number
}

/** Computed block averages */
export interface BlockAverages {
  blockNow: number
  avgBlockTime: number
}
