/**
 * arenaLookup Types – Type definitions for Arena Leaderboard lookup feature
 *
 * Includes:
 * - arena.gql REST response types (seasons + leaderboard)
 * - Mimir GraphQL response types (agent + avatar)
 * - Internal types for Pinia store arenaLookup
 *
 * Ref:
 * - .REF/python-tool/constants.py link_planet() – arena.gql + mimir URLs
 * - src-ts/stores/configURL.ts – dynamic URL fetching
 * - src-ts/stores/blockPolling.ts – block index polling
 */

// ============================================================
// arena.gql REST response types
// ============================================================

/** Battle ticket policy in season */
export interface ArenaBattleTicketPolicy {
  defaultTicketsPerRound: number
  maxPurchasableTicketsPerRound: number
  purchasePrices: Array<unknown>
}

/** Refresh ticket policy in season */
export interface ArenaRefreshTicketPolicy {
  defaultTicketsPerRound: number
  maxPurchasableTicketsPerRound: number
  purchasePrices: Array<unknown>
}

/** 1 round in season */
export interface ArenaSeasonRound {
  id: number
  startBlockIndex: number
  endBlockIndex: number
}

/** 1 season from arena.gql */
export interface ArenaSeason {
  id: number
  seasonGroupId: number
  arenaType: 'OFF_SEASON' | 'CHAMPIONSHIP' | string
  startBlockIndex: number
  endBlockIndex: number
  roundInterval: number
  requiredMedalCount: number
  rounds: ArenaSeasonRound[]
  battleTicketPolicy: ArenaBattleTicketPolicy
  refreshTicketPolicy: ArenaRefreshTicketPolicy
}

/** Response from GET /seasons */
export interface ArenaSeasonsResponse {
  pageNumber: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  seasons: ArenaSeason[]
}

/** 1 row in leaderboard */
export interface ArenaLeaderboardRow {
  rank: number
  agentAddress: string
  avatarAddress: string
  level: number
  nameWithHash: string
  score: number
  totalWin: number
  totalLose: number
}

/** Response from GET /leaderboard/completed */
export interface ArenaLeaderboardResponse {
  leaderboard: ArenaLeaderboardRow[]
}

// ============================================================
// Mimir GraphQL response types
// ============================================================

/**
 * 1 entry in agent.avatarAddresses
 *
 * Note (after verifying actual response from Mimir):
 * - `key` = **index** as number (0, 1, 2, ...)
 * - `value` = **address** as string (0x...)
 *
 * NOT `key` = address, `value` = name as in the old plan.
 * To get the list of addresses, use `entry.value`.
 */
export interface AgentAvatarAddress {
  key: number
  value: string
}

/** Response from query GetAgent */
export interface AgentInfo {
  address: string
  monsterCollectionRound: number
  version: string | null
  avatarAddresses: AgentAvatarAddress[]
}

/** Response from query GetAvatar (for 1 avatar) */
export interface AvatarInfo {
  address: string
  agentAddress: string
  characterId: number | null
  exp: number
  level: number
  name: string
}

// ============================================================
// Internal types for arenaLookup store
// ============================================================

/**
 * Item displayed in <n-select> (shared for leaderboard + agent lookup + avatar lookup)
 * Key convention matches legacy JS to avoid <n-select> binding changes
 */
export interface ArenaAvatarOption {
  avataraddress: string
  avatarname: string
  agentAddress: string
  level?: number
  score?: number
  totalWin?: number
  totalLose?: number
  characterId?: number | null
  /** Source of option - used for debug + filter */
  source: 'leaderboard' | 'agent-lookup' | 'avatar-lookup'
}

/** Cache entry for leaderboard per planet */
export interface CachedLeaderboard {
  list: ArenaAvatarOption[]
  seasonId: number | null
  fetchedAt: number
}
