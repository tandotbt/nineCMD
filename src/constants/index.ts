/**
 * @file constants/index.ts
 * @description Centralized constants for the Nine CMD project.
 * All hardcoded values should be defined here for maintainability.
 */

import { enUS, dateEnUS, viVN, dateViVN } from 'naive-ui'
import type { PlanetName, PlanetConfig } from '../types/planet'

// API URLs
export const API_URLS = {
  API_9CMD: [
    // 'http://127.0.0.1:8000',
    'https://api.9cmd.top',
    'https://steep-carolee-9cmd-701971d5.koyeb.app',
  ],
  SEASON_PASS: ['https://seasonpass.9c.gg'],
  SCAN_ITEM_NAME: ['https://9cscan.com/item_name.csv'],
  PLANET_RAW: ['https://planets.nine-chronicles.com/planets/'],
} as const

/**
 * Configuration for CSV Sheets to be fetched from 9capi
 */
export interface SheetConfig {
  keyMain: string
  unique?: boolean
}

export const CSV_SHEET_CONFIG: Record<string, SheetConfig> = {
  ArenaSheet: { keyMain: 'start_block_index' },
  GameConfigSheet: { keyMain: 'key' },
  ItemRequirementSheet: { keyMain: 'item_id' },
  CostumeStatSheet: { keyMain: 'costume_id', unique: true },
  RuneListSheet: { keyMain: 'id' },
  RuneSheet: { keyMain: 'c' },
  CostumeItemSheet: { keyMain: 'id' },
  WorldUnlockSheet: { keyMain: 'world_id_to_unlock' },
  WorldSheet: { keyMain: 'id' },
  PatrolRewardSheet: { keyMain: 'id' },
  EquipmentItemRecipeSheet: { keyMain: 'id' },
  SummonSheet: { keyMain: 'groupID' },
  ClaimableGiftsSheet: { keyMain: 'id' },
  EventScheduleSheet: { keyMain: 'id' },
  WorldBossListSheet: { keyMain: 'id' },
} as const

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

export const STAGE_WORLD_1 = 50
export const DEFAULT_PLANET: PlanetName = 'odin'
export const PLANET_STORAGE_KEY = 'nine-cmd-planet'
export const PLANET_RAW_DATA_KEY = 'nine-cmd-raw-planets'
export const NODE_INDEX_STORAGE_KEY = 'nine-cmd-node-index'
export const MIMIR_INDEX_STORAGE_KEY = 'nine-cmd-mimir-index'
export const ARENA_INDEX_STORAGE_KEY = 'nine-cmd-arena-index'
export const MARKET_INDEX_STORAGE_KEY = 'nine-cmd-market-index'
export const WORLD_BOSS_INDEX_STORAGE_KEY = 'nine-cmd-world-boss-index'
export const API_9CMD_INDEX_STORAGE_KEY = 'nine-cmd-api-9cmd-index'
export const SEASON_PASS_INDEX_STORAGE_KEY = 'nine-cmd-season-pass-index'
export const SCAN_ITEM_NAME_INDEX_STORAGE_KEY = 'nine-cmd-scan-item-name-index'
export const PLANET_RAW_INDEX_STORAGE_KEY = 'nine-cmd-planet-raw-index'
export const AVG_BLOCK_TIME_STORAGE_KEY = 'nine-cmd-avg-block-time'
export const LAST_BLOCK_TIMESTAMP_STORAGE_KEY = 'nine-cmd-last-block-timestamp'

/**
 * Item IDs that should always be checked for quantity,
 * even if they don't appear in the standard materials list.
 */
export const TRACKED_ITEM_IDS = [
  500000, // AP Potion
  600201, // Hourglass
] as const

// GraphQL Queries
/**
 * GraphQL Queries used across the application.
 * Centralized templates for consistent data fetching between app and tests.
 */
export const GQL_QUERIES = {
  BLOCKS: {
    GET_LATEST: `
      query GetLatestBlock {
        blocks(skip: 0, take: 1) {
          items {
            id
            object {
              hash
              index
              miner
              stateRootHash
              timestamp
              txCount
              txIds
            }
          }
        }
      }
    `,
    GET_LIST: `
      query GetBlocks($skip: Int!, $take: Int!) {
        blocks(skip: $skip, take: $take) {
          items {
            id
            object {
              hash
              index
              miner
              stateRootHash
              timestamp
              txCount
            }
          }
        }
      }
    `,
  },
  CHARACTER: {
    FIELDS_AVATAR_BASE: `
      address
      name
      level
      exp
      dailyRewardReceivedIndex
      stageMap {
        pairs
        count
      }
      runes {
        level
        runeId
      }
    `,
    FIELDS_INVENTORY_CONTENT: `
      equipments {
        grade
        id
        itemType
        itemSubType
        elementalType
        requiredBlockIndex
        itemId
        level
        equipped
        statsMap { hP aTK dEF cRI hIT sPD }
        skills { id }
        buffSkills { id }
      }
      costumes {
        grade
        id
        itemType
        itemSubType
        elementalType
        requiredBlockIndex
        itemId
        equipped
      }
      materials {
        grade
        id
        itemType
        itemSubType
        elementalType
        requiredBlockIndex
        itemId
      }
      consumables {
        grade
        id
        itemType
        itemSubType
        elementalType
        requiredBlockIndex
        itemId
        mainStat
      }
    `,
    FIELDS_CRAFTING_AND_ITEMS: `
      itemMap {
        count
        pairs
      }
      combinationSlots {
        index
        isUnlocked
        unlockBlockIndex
        startBlockIndex
        petId
      }
    `,
    GET_AGENT_AVATARS: `
      query GetAgentAvatars($agentAddress: Address!) {
        stateQuery {
          agent(address: $agentAddress) {
            gold
            crystal
            avatarStates {
              address
              index
            }
          }
        }
      }
    `,
    GET_STAKE_STATE: `
      query GetStakeState($agentAddress: Address!) {
        stateQuery {
          stakeState(address: $agentAddress) {
            deposit
          }
        }
      }
    `,
    GET_AVATAR_MIMIR_SIMPLE: `
      query GetAvatarMimirSimple($avatarAddress: Address!, $agentAddress: Address!) {
        actionPoint(address: $avatarAddress)
        dailyRewardReceivedBlockIndex(address: $avatarAddress)
        ncg: balance(address: $agentAddress, currencyTicker: "NCG")
        myAdventureCpRanking(address: $avatarAddress) {
          rank
          userDocument {
            avatar {
              armorId
              portraitId
            }
            cp
          }
        }
        avatar(address: $avatarAddress) {
          level
          name
          exp
          stageMap {
            key
            value
          }
        }
        isHasCraftOneTime:transactions(
          filter: {
            actionTypeId: "combination_equipment17"
            avatarAddress: $avatarAddress
          }
          skip: 0
          take: 1
        ) {
          items { id }
        }
        isClaimPatrolRewardOneTime:transactions(
          filter: {
            actionTypeId: "claim_patrol_reward"
            avatarAddress: $avatarAddress
          }
          skip: 0
          take: 1
        ) {
          items { id }
        }
      }
    `,
    GET_AVATAR_INVENTORY_EQUIPMENTS: `
      query GetAvatarInventoryEquipments($avatarAddress: Address!) {
        stateQuery {
          avatar(avatarAddress: $avatarAddress) {
            inventory {
              equipments {
                id
                itemId
                equipped
                statsMap { hP aTK dEF cRI hIT sPD }
                skills { id }
              }
            }
          }
        }
      }
    `,
  },
  TRANSACTION: {
    STAGE_TRANSACTION: `
      mutation StageTransaction($payload: String!) {
        stageTransaction(payload: $payload)
      }
    `,
    GET_STATUS: `
      query GetTransactionStatus($txHash: String!) {
        transaction(txId: $txHash) {
          object {
            txStatus
          }
        }
      }
    `,
  },
} as const

// REST API Configuration (9cmd API)
export const REST_API_CONFIG = {
  CODE_GETS: {
    ADVENTURE_CP: 'other_lookupAdventureCp',
    RUNE_SET_ADVENTURE: 'lookupRuneSetMuti_type_Adventure',
    ITEM_SET_ADVENTURE: 'lookupItemSetMuti_type_Adventure',
    CLAIMED_GIFT_IDS: 'other_lookupClaimedGiftIds',
    PATROL_REWARD: 'other_lookupPatrolReward',
    ARENA_INFO: 'lookupArenaInfo',
    EVENT_DUNGEON_INFO: (dungeonId: string | number) =>
      `lookupEventDungeonInfo_dungeonId_${dungeonId}0001`,
    WORLD_BOSS_TOTAL: (raidId: string | number) =>
      `other_lookupWorldBossInfoTotal_idRaid_${raidId}`,
    WORLD_BOSS_AVATAR: (raidId: string | number) => `lookupWorldBossInfoAvatar_idRaid_${raidId}`,
  },
  TIMEOUT_MS: 60000,
} as const

/**
 * Default codeGet parameters for character data fetching.
 * Centralized here to ensure consistency between app and test scripts.
 */
export const CHARACTER_CODE_GETS = [
  REST_API_CONFIG.CODE_GETS.ADVENTURE_CP,
  REST_API_CONFIG.CODE_GETS.RUNE_SET_ADVENTURE,
  REST_API_CONFIG.CODE_GETS.ITEM_SET_ADVENTURE,
  REST_API_CONFIG.CODE_GETS.CLAIMED_GIFT_IDS,
  REST_API_CONFIG.CODE_GETS.PATROL_REWARD,
] as const

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 10,
  DELAY_MS: 1000,
  BACKOFF_FACTOR: 1.5,
} as const

// Block Configuration
export const BLOCK_CONFIG = {
  FETCH_INTERVAL_MS: 15000,
  MAX_BLOCKS_CACHE: 100,
  DEFAULT_AVERAGE_BLOCK_TIME_MS: 10000, // Fallback if no data
  DEFAULT_NOTIFICATION_THRESHOLD: 100,
  SANITY_CHECK_INTERVAL_MS: 600000, // 10 minutes
  VIRTUAL_ID_PREFIX: 'virtual-',
  VIRTUAL_HASH_PREFIX: 'virtual-hash-',
} as const

// Application Constants
export const APP_NAME = 'Nine CMD'

/**
 * Character and Game Logic Constants
 */
export const CHARACTER_LOGIC_CONSTANTS = {
  STAGE: {
    WORLD_1_END: 50,
    EVENT_THRESHOLD: 1000,
    DEFAULT_WORLD_ID: 1,
    ERROR_WORLD_ID: -1,
  },
  AP: {
    MAX: 120,
    DAILY_REFILL_INTERVAL: 7200,
    STAKE_THRESHOLD_TIER_1: 500000,
    STAKE_THRESHOLD_TIER_2: 5000,
    COST_TIER_1: 3,
    COST_TIER_2: 4,
    COST_DEFAULT: 5,
    PATROL_REFILL_INTERVAL: 200,
  },
  CP: {
    HP: 0.7,
    ATK: 10.5,
    DEF: 10.5,
    SPD: 3,
    HIT: 2.3,
    SKILL_BUFF: 1.15,
  },
  ITEM_ID: {
    AP_POTION: 500000,
    HOURGLASS: 600201,
  },
  NOTIFICATION: {
    CHECK_INTERVAL_BLOCKS: 10,
    DEFAULT_ICON: '/icon/favicon.ico',
    DEFAULT_ENABLED: true,
    MAX_REPEATS: 3,
  },
  LANG: {
    VI: 'Vietnam',
    EN: 'English',
  },
  SHEETS: {
    ITEM_NAME: 'ItemNameSheet',
  },
} as const

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'nine-cmd-settings',
  RAW_PLANETS: 'raw-planets',
  CACHED_BLOCKS: 'cached-blocks',
  NOTIF_START_BLOCK: 'notification-start-block',
  NOTIF_THRESHOLD: 'notification-threshold',
  PLANET: 'planet',
  AVG_BLOCK_TIME: 'nine-cmd-avg-block-time',
  LAST_BLOCK_TIMESTAMP: 'nine-cmd-last-block-timestamp',
  AUTOMATION_STATE: 'automation-state',
  LAST_AUTOMATION_CHECK_BLOCK: 'last-automation-check-block',
  SETTING_NOTIF_ENABLED: 'setting-notification-enabled',
  SETTING_AUTO_ENABLED: 'setting-automation-enabled',
  SETTING_AGENT_ADDRESS: 'setting-agent-address',
  SETTING_AVATAR_ADDRESS: 'setting-avatar-address',
  SETTING_CHECK_INTERVAL_BLOCKS: 'setting-check-interval-blocks',
  SETTING_AP_REFILL_INTERVAL: 'setting-ap-refill-interval',
  SETTING_PATROL_INTERVAL: 'setting-patrol-interval',
  SETTING_AUTOMATION_FEATURES: 'setting-automation-features',
  SETTING_AP_REFILL_THRESHOLD: 'setting-ap-refill-threshold',
  SETTING_MAX_NOTIFICATION_REPEATS: 'setting-max-notification-repeats',
  SW_LAST_NOTIF_CHECK_BLOCK: 'sw-last-notif-check-block',
} as const

// Automation States
export const AUTOMATION_STATUS = {
  STOPPED: 'STOPPED',
  IDLE: 'IDLE',
  WAITING_BLOCKS: 'WAITING_BLOCKS',
  CHECKING_CONDITIONS: 'CHECKING_CONDITIONS',
  EXECUTING_ACTION: 'EXECUTING_ACTION',
  NOTIFYING: 'NOTIFYING',
} as const

export type AutomationStatus = (typeof AUTOMATION_STATUS)[keyof typeof AUTOMATION_STATUS]

// Automation Logic Constants
export const AUTOMATION_LOGIC = {
  ACTIONS: {
    IDLE: 'IDLE',
    REFILL_AP: 'REFILL_AP',
  },
  PRIORITY: {
    HIGH: 10,
    NORMAL: 5,
    LOW: 0,
  },
  IDS: {
    REFILL_AP: 'refill_ap',
  },
  LABELS: {
    REFILL_AP: 'Auto Refill AP',
    AP_LEVEL: 'AP Level',
    REFILL_TIMER: 'Refill Timer',
  },
  MAX_LOGS: 50,
} as const

// Diff Logic Constants
export const DIFF_LOGIC = {
  SIGNIFICANT_PATHS: [
    'level',
    'stage',
    'ap',
    'cp',
    'ncg',
    'crystal',
    'dailyRewardReceivedIndex',
    'inventory',
  ],
  INVENTORY_SUB_PATHS: ['equipments', 'materials', 'costumes'],
} as const

// Database Configuration
export const DB_CONFIG = {
  NAME: 'NineCmdDatabase',
  VERSION: 2,
} as const

// PWA Configuration
export const PWA_CONFIG = {
  SW_TAG_BLOCK_FETCH: 'fetch-latest-block',
  SW_FETCH_INTERVAL_MIN: 15, // Minutes
} as const

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
