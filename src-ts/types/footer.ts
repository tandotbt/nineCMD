/**
 * Types for Footer components
 */

/** Footer settings – persisted to localStorage */
export interface FooterSettings {
  selectedPlanet?: string
  selectedNode?: string
  lastPlanet?: string
  pollIntervalMs?: number
  lang?: string
  isDarkMode?: boolean
}
