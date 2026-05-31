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

/** Footer settings */
export interface FooterSettings {
  selectedPlanet?: string
  selectedNode?: string
  lastPlanet?: string
  lang?: string
  isDarkMode?: boolean
}
