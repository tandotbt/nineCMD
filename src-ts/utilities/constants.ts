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
    mimirUrl: '', // thor không có mimir endpoint
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
