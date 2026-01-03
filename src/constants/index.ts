/**
 * @file constants/index.ts
 * @description Centralized constants for the Nine CMD project.
 * All hardcoded values should be defined here for maintainability.
 */

// API URLs
export const API_URLS = {
  ODIN_GRAPHQL: 'https://odin-rpc-1.nine-chronicles.com/graphql',
  ODIN_MIMIR: 'https://odin-mimir.9c.gg/graphql',
  LOCAL_9CMD: 'http://127.0.0.1:8000',
  SEASON_PASS: 'https://seasonpass.9c.gg',
} as const

// Planet IDs
export const PLANET_IDS = {
  ODIN: '0x000000000000',
  HEIMDALL: '0x000000000001',
  THOR: '0x000000000003',
} as const

// Block Configuration
export const BLOCK_CONFIG = {
  FETCH_INTERVAL_MS: 15000,
  MAX_BLOCKS_CACHE: 100,
  DEFAULT_AVERAGE_BLOCK_TIME_MS: 10000, // Fallback if no data
  DEFAULT_NOTIFICATION_THRESHOLD: 100,
} as const

// Application Constants
export const APP_NAME = 'Nine CMD'
export const STAGE_WORLD_1_END = 50

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'nine-cmd-settings',
  CACHED_BLOCKS: 'cached-blocks',
  NOTIF_START_BLOCK: 'notification-start-block',
  NOTIF_THRESHOLD: 'notification-threshold',
} as const

// Database Configuration
export const DB_CONFIG = {
  NAME: 'NineCmdDatabase',
  VERSION: 1,
} as const

// PWA Configuration
export const PWA_CONFIG = {
  SW_TAG_BLOCK_FETCH: 'fetch-latest-block',
  SW_FETCH_INTERVAL_MIN: 15, // Minutes
} as const

// i18n Configuration
import { enUS, dateEnUS, viVN, dateViVN } from 'naive-ui'

export const DEFAULT_LOCALE = 'en'
export const FALLBACK_LOCALE = 'en'

export const CONFIG_i18n_LANGUAGES = [
  {
    lang: 'en',
    label: 'English',
    description: 'English',
    png: 'https://flagpedia.net/data/flags/w580/us.png',
    uiConfig: enUS,
    uiConfigDate: dateEnUS,
  },
  {
    lang: 'vi',
    label: 'Tiếng Việt',
    description: 'Vietnamese',
    png: 'https://flagpedia.net/data/flags/w580/vn.png',
    uiConfig: viVN,
    uiConfigDate: dateViVN,
  },
] as const
