/**
 * arenaLookup Types – Type definitions cho Arena Leaderboard lookup feature
 *
 * Bao gồm:
 * - arena.gql REST response types (seasons + leaderboard)
 * - Mimir GraphQL response types (agent + avatar)
 * - Internal types cho Pinia store arenaLookup
 *
 * Ref:
 * - .REF/python-tool/constants.py link_planet() – arena.gql + mimir URLs
 * - src-ts/stores/configURL.ts – dynamic URL fetching
 * - src-ts/stores/blockPolling.ts – block index polling
 */

// ============================================================
// arena.gql REST response types
// ============================================================

/** Battle ticket policy trong season */
export interface ArenaBattleTicketPolicy {
  defaultTicketsPerRound: number
  maxPurchasableTicketsPerRound: number
  purchasePrices: Array<unknown>
}

/** Refresh ticket policy trong season */
export interface ArenaRefreshTicketPolicy {
  defaultTicketsPerRound: number
  maxPurchasableTicketsPerRound: number
  purchasePrices: Array<unknown>
}

/** 1 round trong season */
export interface ArenaSeasonRound {
  id: number
  startBlockIndex: number
  endBlockIndex: number
}

/** 1 season từ arena.gql */
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

/** Response từ GET /seasons */
export interface ArenaSeasonsResponse {
  pageNumber: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  seasons: ArenaSeason[]
}

/** 1 row trong leaderboard */
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

/** Response từ GET /leaderboard/completed */
export interface ArenaLeaderboardResponse {
  leaderboard: ArenaLeaderboardRow[]
}

// ============================================================
// Mimir GraphQL response types
// ============================================================

/**
 * 1 entry trong agent.avatarAddresses
 *
 * Lưu ý (sau khi verify response thực tế từ Mimir):
 * - `key` = **index** dạng number (0, 1, 2, ...)
 * - `value` = **address** dạng string (0x...)
 *
 * KHÔNG phải `key` = address, `value` = name như plan cũ.
 * Để lấy danh sách address cần `entry.value`.
 */
export interface AgentAvatarAddress {
  key: number
  value: string
}

/** Response từ query GetAgent */
export interface AgentInfo {
  address: string
  monsterCollectionRound: number
  version: string | null
  avatarAddresses: AgentAvatarAddress[]
}

/** Response từ query GetAvatar (cho 1 avatar) */
export interface AvatarInfo {
  address: string
  agentAddress: string
  characterId: number | null
  exp: number
  level: number
  name: string
}

// ============================================================
// Internal types cho arenaLookup store
// ============================================================

/**
 * Item hiển thị trong <n-select> (dùng chung cho cả leaderboard + agent lookup + avatar lookup)
 * Convention key giống bản JS cũ để không phải sửa <n-select> binding
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
  /** Nguồn của option - dùng để debug + filter */
  source: 'leaderboard' | 'agent-lookup' | 'avatar-lookup'
}

/** Cache entry cho leaderboard per planet */
export interface CachedLeaderboard {
  list: ArenaAvatarOption[]
  seasonId: number | null
  fetchedAt: number
}
