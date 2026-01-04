/**
 * @file constants/index.ts
 * @description Centralized constants for the Nine CMD project.
 * All hardcoded values should be defined here for maintainability.
 */

import type { PlanetName, PlanetConfig } from '../types/planet'

// API URLs
export const API_URLS = {
  LOCAL_9CMD: 'http://127.0.0.1:8000',
  SEASON_PASS: 'https://seasonpass.9c.gg',
} as const

// Planet info
export const PLANET_RAW_URL = 'https://planets.nine-chronicles.com/planets/' as const

// Planet RPC Nodes Mapping
export const PLANET_CONFIGS: Record<PlanetName, PlanetConfig> = {
  odin: {
    id: '0x000000000000',
    name: 'odin',
    genesisHash: '4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce',
    '9cscanUrl': 'https://9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://odin-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api.9cscan.com'],
      'headless.gql': [
        'https://odin-rpc-1.nine-chronicles.com/graphql',
        'https://odin-rpc-2.nine-chronicles.com/graphql',
      ],
      'headless.grpc': [
        'http://odin-rpc-1.nine-chronicles.com:31238',
        'http://odin-rpc-2.nine-chronicles.com:31238',
      ],
      'market.rest': ['https://api.9capi.com/marketProviderOdin'],
      'world-boss.rest': ['https://odin-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://odin-patrol.9c.gg/graphql'],
      'arena.rest': ['https://odin-arena.9c.gg'],
      'arena.gql': ['https://odin-arena.9c.gg'],
      'mimir.gql': ['https://odin-mimir.9c.gg/graphql'],
    },
  },
  heimdall: {
    id: '0x000000000001',
    name: 'heimdall',
    genesisHash: '729fa26958648a35b53e8e3905d11ec53b1b4929bf5f499884aed7df616f5913',
    '9cscanUrl': 'https://heimdall.9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://heimdall-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api-heimdall.9cscan.com'],
      'headless.gql': [
        'https://heimdall-rpc-1.nine-chronicles.com/graphql',
        'https://heimdall-rpc-2.nine-chronicles.com/graphql',
      ],
      'headless.grpc': [
        'http://heimdall-rpc-1.nine-chronicles.com:31238',
        'http://heimdall-rpc-2.nine-chronicles.com:31238',
      ],
      'market.rest': ['https://api.9capi.com/marketProviderHeimdall'],
      'world-boss.rest': ['http://heimdall-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://heimdall-patrol.9c.gg/graphql'],
      'arena.rest': ['https://heimdall-arena.9c.gg'],
      'arena.gql': ['https://heimdall-arena.9c.gg'],
      'mimir.gql': ['https://heimdall-mimir.9c.gg/graphql'],
    },
  },
  thor: {
    id: '0x000000000003',
    name: 'thor',
    genesisHash: '7eacf897e54eb4ba5e1b99050e77aaa74d514b98b0eaab2eee25189e8c801228',
    '9cscanUrl': 'https://thor.9cscan.com',
    rpcEndpoints: {
      'headless.gql': ['https://thor-rpc-1.nine-chronicles.com/graphql'],
      'headless.grpc': ['http://thor-rpc-1.nine-chronicles.com:31238'],
      'market.rest': ['https://api.9capi.com/marketProviderThor'],
      'arena.rest': ['https://thor-arena.9c.gg'],
      'arena.gql': ['https://thor-arena.9c.gg'],
      'mimir.gql': ['https://thor-mimir.9c.gg/graphql'],
    },
  },
}

// Planet IDs
export const PLANET_IDS: Record<PlanetName, string> = {
  odin: '0x000000000000',
  heimdall: '0x000000000001',
  thor: '0x000000000003',
}

export const DEFAULT_PLANET: PlanetName = 'odin'
export const PLANET_STORAGE_KEY = 'nine-cmd-planet'
export const PLANET_RAW_DATA_KEY = 'nine-cmd-raw-planets'
export const NODE_INDEX_STORAGE_KEY = 'nine-cmd-node-index'
export const MIMIR_INDEX_STORAGE_KEY = 'nine-cmd-mimir-index'
export const MARKET_INDEX_STORAGE_KEY = 'nine-cmd-market-index'
export const ARENA_INDEX_STORAGE_KEY = 'nine-cmd-arena-index'

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
  RAW_PLANETS: 'raw-planets',
  CACHED_BLOCKS: 'cached-blocks',
  NOTIF_START_BLOCK: 'notification-start-block',
  NOTIF_THRESHOLD: 'notification-threshold',
  PLANET: 'planet',
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
