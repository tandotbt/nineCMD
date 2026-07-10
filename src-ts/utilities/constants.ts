import { enUS, dateEnUS, viVN, dateViVN, type NLocale, type NDateLocale } from 'naive-ui'

// ============================================================
// i18n Constants
// ============================================================

export const DEFAULT_LOCALE = 'en'
export const FALLBACK_LOCALE = 'en'

export interface I18nLanguageConfig {
  lang: string
  label: string
  description: string
  png: string
  uiConfig: NLocale
  uiConfigDate: NDateLocale
}

export const CONFIG_i18n_LANGUAGES: I18nLanguageConfig[] = [
  {
    lang: 'vi',
    label: 'Tiếng Việt',
    description: 'Xin chào Nine Chronicles 👋',
    png: 'https://flagcdn.com/w320/vn.png',
    uiConfig: viVN,
    uiConfigDate: dateViVN
  },
  {
    lang: 'en',
    label: 'English',
    description: 'Hello Nine Chronicles 👋',
    png: 'https://flagcdn.com/w320/us.png',
    uiConfig: enUS,
    uiConfigDate: dateEnUS
  }
]

// ============================================================
// Planet / Block Constants
// ============================================================

/** Planet name type */
export type PlanetName = 'odin' | 'heimdall' | 'thor'

/** Planet configuration interface (fallback / static) */
export interface PlanetConfig {
  id: PlanetName
  label: string
  mimirUrl: string
  /** Headless RPC GraphQL endpoint (fallback) */
  headlessGql: string
}

// ============================================================
// URL_ALL_PLANET – Dynamic planet data from Nine Chronicles API
// ============================================================

/** URL to fetch all available planets */
export const URL_ALL_PLANET = 'https://planets.nine-chronicles.com/planets/'

/**
 * RPC endpoints for a planet (from URL_ALL_PLANET response)
 * Ref: .REF/python-tool/constants.py link_planet() – planet["rpcEndpoints"]
 */
export interface PlanetRpcEndpoints {
  'dp.gql'?: string[]
  '9cscan.rest'?: string[]
  'headless.gql'?: string[]
  'headless.grpc'?: string[]
  'market.rest'?: string[]
  'world-boss.rest'?: string[]
  'patrol-reward.gql'?: string[]
  'guild.rest'?: string[]
  'arena.gql'?: string[]
  'mimir.gql'?: string[]
  [key: string]: string[] | undefined
}

/**
 * Single planet entry from URL_ALL_PLANET response
 * Ref: .REF/python-tool/constants.py link_planet()
 */
export interface PlanetData {
  id: string
  name: string
  genesisHash: string
  genesisUri?: string
  guildIconBucket?: string
  '9cscanUrl'?: string
  rpcEndpoints: PlanetRpcEndpoints
  bridges?: Record<string, { agent: string; avatar: string }>
}

/** Default poll interval for block polling (ms) */
export const DEFAULT_POLL_INTERVAL_MS = 10000
/** Poll interval options for UI (in seconds) */
export const POLL_INTERVAL_OPTIONS = [
  { label: '5s', value: 5000 },
  { label: '8s', value: 8000 },
  { label: '10s', value: 10000 },
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '60s', value: 60000 }
]
/** Default avg block time (seconds) – fallback when no data */
export const AVG_BLOCK_FALLBACK = 8
/** Default avg transactions per block – fallback when no data */
export const AVG_TRANS_FALLBACK = 100

/**
 * Planet configurations
 * - mimirUrl: used for GraphQL queries like get_block_now()
 * - headlessGql: used for state queries (agent, avatar, etc.)
 *
 * Ref: .REF/python-tool/constants.py LIST_URL_PLANET
 */
export const PLANET_CONFIGS: Record<PlanetName, PlanetConfig> = {
  odin: {
    id: 'odin',
    label: 'Odin',
    mimirUrl: 'https://odin-mimir.9c.gg/graphql',
    headlessGql: 'https://odin-rpc-2.nine-chronicles.com/graphql'
  },
  heimdall: {
    id: 'heimdall',
    label: 'Heimdall',
    mimirUrl: 'https://heimdall-mimir.9c.gg/graphql',
    headlessGql: 'https://heimdall-rpc-2.nine-chronicles.com/graphql'
  },
  thor: {
    id: 'thor',
    label: 'Thor',
    mimirUrl: '', // thor has no mimir endpoint
    headlessGql: 'https://thor-rpc-1.nine-chronicles.com/graphql'
  }
}

/** Ordered list of planets for UI selection */
export const PLANET_OPTIONS: PlanetConfig[] = [
  PLANET_CONFIGS.odin,
  PLANET_CONFIGS.heimdall,
  PLANET_CONFIGS.thor
]

/**
 * GraphQL query to get the current block index.
 * Exact match of Python get_block_now() in .REF/python-tool/utils.py:
 *
 *   query {
 *       blocks(take: 1) {
 *           items {
 *               object {
 *                   index
 *               }
 *           }
 *       }
 *   }
 *
 * Endpoint: {mimirUrl} (e.g. https://odin-mimir.9c.gg/graphql)
 * Response: response["data"]["blocks"]["items"][0]["object"]["index"]
 */
export const QUERY_GET_BLOCK_NOW = `{
  blocks(take: 1) {
    items {
      object {
        index
      }
    }
  }
}`

// ============================================================
// 9CMD API – CSV Data Constants
// ============================================================

import type { CsvSheetName, CsvSheetMeta } from '../types/csvData'

/**
 * List of 9CMD API URLs – random or manually selected
 * Ref: src/utilities/constants.js LIST_API_NINECMD
 */
export const LIST_API_NINECMD: string[] = [
  // 'https://steep-carolee-9cmd-701971d5.koyeb.app',
  // 'https://ineapi-tandotbt6668-zt8p2j3s.leapcell.dev',
  // 'https://api-nf.9cmd.top',
  'http://127.0.0.1:8000'
]

/**
 * Endpoint path for fetching CSV sheet data
 */
export const CSV_ENDPOINT_PATH = '/getGraphqlCSV'

/**
 * List of all CSV sheets to fetch, with metadata
 * - keyColumn: column used as primary key
 * - unique: if true → key is not unique (use ${key}_${rowIndex})
 * - description: short description
 *
 * Ref:
 * - .REF/vue3-tool/src/components/initializeData.vue: graphQlSheetConfig
 * - .REF/python-tool/constants.py: CSV_SHEET_NAMES
 */
export const CSV_SHEET_CONFIG: Record<CsvSheetName, CsvSheetMeta> = {
  GameConfigSheet: { keyColumn: 'key', description: 'Game config key-value' },
  ItemRequirementSheet: { keyColumn: 'item_id', description: 'Level requirement for equipment' },
  CostumeStatSheet: { keyColumn: 'costume_id', unique: true, description: 'Costume stats' },
  RuneListSheet: { keyColumn: 'id', description: 'Rune list' },
  RuneSheet: { keyColumn: 'c', description: 'Rune options (9cmd api)' },
  CostumeItemSheet: { keyColumn: 'id', description: 'Costume item list' },
  WorldUnlockSheet: { keyColumn: 'world_id_to_unlock', description: 'World unlock requirements' },
  WorldSheet: { keyColumn: 'id', description: 'World list' },
  PatrolRewardSheet: { keyColumn: 'id', description: 'Patrol rewards' },
  EquipmentItemRecipeSheet: { keyColumn: 'id', description: 'Equipment craft recipes' },
  SummonSheet: { keyColumn: 'groupID', description: 'Summon list' },
  ClaimableGiftsSheet: { keyColumn: 'id', description: 'Claimable gifts' },
  EventScheduleSheet: { keyColumn: 'id', description: 'Event schedule' },
  WorldBossListSheet: { keyColumn: 'id', description: 'World boss list' },
  EquipmentItemSubRecipeSheetV2: { keyColumn: 'id', description: 'Equipment sub recipes' },
  CrystalHammerPointSheet: { keyColumn: 'recipe_ID', description: 'Crystal hammer points' },
  StageSheet: { keyColumn: 'id', description: 'Stage list' },
  CharacterLevelSheet: { keyColumn: 'level', description: 'Character level requirements' },
  CrystalMaterialCostSheet: { keyColumn: 'item_id', description: 'Crystal material costs' },
  ConsumableItemSheet: { keyColumn: 'id', description: 'Consumable item list' },
  ConsumableItemRecipeSheet: { keyColumn: 'id', description: 'Consumable craft recipes' }
}

// ============================================================
// GitHub Constants (for i18n CSV + Banner)
// Ref: src/utilities/constants.js V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles
// ============================================================

/** GitHub branch for NineChronicles source code (item_name.csv, skill_name.csv) */
export const V_GITHUB_NINECHRONICLES = 'development'

/** Base raw GitHub URL for NineChronicles source code */
export const URL_GITHUB_NineChronicles =
  `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}`

/** Base raw GitHub URL for NineChronicles.LiveAssets (banner, image...) */
export const URL_GITHUB_LIVEASSETS =
  'https://raw.githubusercontent.com/planetarium/NineChronicles.LiveAssets/main'

/** URL for Event.json – banner list */
export const LINK_BANNER = `${URL_GITHUB_LIVEASSETS}/Assets/Json/Event-test.json`

// ============================================================
// Localized CSV (i18n names for item + skill)
// Ref: src/stores/configURL.js urlItemNameSheet, urlSkillNameSheet
// ============================================================

import type { LocalizedSheetName } from '../types/i18nCsv'

/** Localized CSV paths (relative to NineChronicles repo) */
export const LOCALIZED_CSV_PATHS: Record<LocalizedSheetName, string> = {
  ItemNameSheet: '/nekoyume/Assets/StreamingAssets/Localization/item_name.csv',
  SkillNameSheet: '/nekoyume/Assets/StreamingAssets/Localization/skill_name.csv'
}

/** Locale columns in localized CSV (alphabetical order) */
export const LOCALIZED_CSV_LOCALES = ['English', 'Vietnamese', 'Korean', 'Japanese'] as const

/** Type guard: check if a string is a locale column in CSV */
export function isLocalizedCsvLocale(locale: string): locale is typeof LOCALIZED_CSV_LOCALES[number] {
  return (LOCALIZED_CSV_LOCALES as readonly string[]).includes(locale)
}

/**
 * Map app locale (from appSettings.lang) → column name in CSV
 * - 'vi' → 'Vietnamese'
 * - 'en' → 'English'
 * - 'ko' → 'Korean'
 * - 'ja' → 'Japanese'
 * - other locale → fallback 'English'
 */
export const LOCALE_TO_CSV_COLUMN: Record<string, string> = {
  en: 'English',
  vi: 'Vietnamese',
  ko: 'Korean',
  ja: 'Japanese'
}

/** Key column for ItemNameSheet and SkillNameSheet (case-insensitive) */
export const LOCALIZED_CSV_KEY_COLUMN = 'Key'

// ============================================================
// RemoteCsv (3rd CSV - planet-independent, loaded once)
// Ref: NineChronicles.LiveAssets/Assets/Csv/RemoteCsv.csv
// ============================================================

/** URL for RemoteCsv - remote config CSV */
export const REMOTE_CSV_URL = `${URL_GITHUB_LIVEASSETS}/Assets/Csv/RemoteCsv.csv`

/** Key column for RemoteCsv (case-insensitive) */
export const REMOTE_CSV_KEY_COLUMN = 'Key'

/** All sheet names (keys from CSV_SHEET_CONFIG) */
export const ALL_CSV_SHEET_NAMES: CsvSheetName[] = Object.keys(CSV_SHEET_CONFIG) as CsvSheetName[]

// ============================================================
// Theme / UI Constants
// ============================================================

/** Naive UI responsive breakpoints */
export const THEME_BREAKPOINTS = {
  xs: 320,
  s: 470,
  m: 660,
  l: 1280,
  xl: 1536,
  xxl: 1920
} as const

/** Theme overrides for light mode */
export const LIGHT_THEME_OVERRIDES = {
  Result: {
    titleTextColor: 'rgba(203, 203, 33, 1)',
    textColor: 'rgba(203, 203, 23, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
} as const

/** Theme overrides for dark mode */
export const DARK_THEME_OVERRIDES = {
  Result: {
    titleTextColor: 'rgba(60, 160, 0, 1)',
    textColor: 'rgba(40, 140, 0, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
} as const

// ============================================================
// Layout Constants
// ============================================================

/** Header height (CSS) */
export const HEADER_HEIGHT = '10vh'

/** Footer height (CSS) */
export const FOOTER_HEIGHT = '10vh'

/** Sidebar collapsed width (px) */
export const SIDEBAR_COLLAPSED_WIDTH = 0

/** Sidebar expanded width (px) */
export const SIDEBAR_EXPANDED_WIDTH = 300

/** Drawer default size */
export const DRAWER_SIZE = '70%'

/** Drawer full size */
export const DRAWER_SIZE_MAX = '100%'

// ============================================================
// localStorage Keys
// ============================================================

/** localStorage key for app settings */
export const STORAGE_KEY_APP_SETTINGS = 'setting-nine-cmd'

/** localStorage key for configURL endpoints */
export const STORAGE_KEY_ENDPOINTS = 'configURL-endpoints'

// ============================================================
// API Defaults
// ============================================================

/** Default 9CMD API URL for local development */
export const DEFAULT_API_URL = 'http://127.0.0.1:8000'

// ============================================================
// Login Prefill Keys (for arena lookup → login flow)
// ============================================================

/** localStorage key for login prefill agent address */
export const LOGIN_PREFILL_AGENT = 'login-prefill-agent'

/** localStorage key for login prefill avatar address */
export const LOGIN_PREFILL_AVATAR = 'login-prefill-avatar'

// ============================================================
// Avatar Data Constants
// ============================================================

/** AP cost by stake tiers — ordered low to high */
export const COST_AP_BY_STAKE = [
  { ncgStake: 5000, costAP: 5 },
  { ncgStake: 500000, costAP: 4 }
]

/** Minimum AP cost (when stake >= all tiers) */
export const COST_AP_BY_STAKE_MIN = 3

/** Stage ID prefix — stages starting with this prefix are special (e.g. 1000xx), filter them out when finding latest normal stage */
export const STAGE_SPECIAL_PREFIX = '100000'

/** AP Potion item ID (special handling for tradable vs non-tradable) */
export const AP_POTION_ID = 500000

/** Offset ID for tradable AP potion (14000000 + AP_POTION_ID) */
export const AP_POTION_TRADABLE_OFFSET = 14000000

/** Default level requirement when CSV data is missing (display placeholder) */
export const DEFAULT_LEVEL_REQ = 888888

/** Max purchase count for world boss (display: "X / 40") */
export const MAX_PURCHASE_COUNT = 40

/** Max challenge count for world boss (display: "X / 3") */
export const MAX_CHALLENGE_COUNT = 3

// ============================================================
// Avatar Data REST API — codeGet values
// ============================================================

/** Static codeGet values for API request (sent as &codeGet= params) */
export const AVATAR_DATA_CODE_GET_STATIC = [
  'lookupItemSetMuti_type_Adventure',
  'lookupItemSetMuti_type_Arena',
  'lookupItemSetMuti_type_Raid',
  'lookupItemSetMuti_type_InfiniteTower',
  'lookupRuneSetMuti_type_Adventure',
  'lookupRuneSetMuti_type_Arena',
  'lookupRuneSetMuti_type_Raid',
  'lookupRuneSetMuti_type_InfiniteTower',
  'other_lookupPatrolReward',
  'other_lookupAdventureCp',
  'other_lookupClaimedGiftIds'
] as const

/** Response keys for codeGet results (server strips _type_ prefix) */
export const CODE_GET_RESPONSE_KEYS = {
  itemSet: {
    adventure: 'lookupItemSetMuti_Adventure',
    arena: 'lookupItemSetMuti_Arena',
    raid: 'lookupItemSetMuti_Raid',
    infiniteTower: 'lookupItemSetMuti_InfiniteTower'
  },
  runeSet: {
    adventure: 'lookupRuneSetMuti_Adventure',
    arena: 'lookupRuneSetMuti_Arena',
    raid: 'lookupRuneSetMuti_Raid',
    infiniteTower: 'lookupRuneSetMuti_InfiniteTower'
  }
} as const
