/**
 * arenaGql Utility – Helper functions gọi arena.gql REST API
 *
 * Arena.gql cung cấp:
 * - GET /seasons → danh sách season
 * - GET /leaderboard/completed?seasonId=<id> → leaderboard của season đã kết thúc
 *
 * URL lấy qua useConfigURLStore.getArenaGql(planet) - ưu tiên dynamic từ API,
 * fallback về PLANET_CONFIGS hardcode.
 */

import { createLogger } from './logger'
import type {
  ArenaSeason,
  ArenaSeasonsResponse,
  ArenaLeaderboardResponse,
  ArenaLeaderboardRow,
  ArenaAvatarOption
} from '../types/arenaLookup'

const logger = createLogger({ module: 'arenaGql' })

// ============================================================
// REST helpers
// ============================================================

/**
 * Lấy danh sách season từ arena.gql
 * GET <arenaGqlBase>/seasons?pageNumber=1&pageSize=100
 *
 * @throws Error nếu HTTP lỗi
 */
export async function fetchSeasons(
  arenaGqlBase: string,
  pageNumber = 1,
  pageSize = 100
): Promise<ArenaSeasonsResponse> {
  const url = `${arenaGqlBase}/seasons?pageNumber=${pageNumber}&pageSize=${pageSize}`
  logger.debug('GET', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) {
    throw new Error(`fetchSeasons ${url} → HTTP ${res.status}`)
  }
  return (await res.json()) as ArenaSeasonsResponse
}

/**
 * Tìm season đã kết thúc gần nhất với blockNow
 * - Filter: endBlockIndex < blockNow (đã kết thúc)
 * - Sort: endBlockIndex descending
 * - Trả về null nếu không có
 */
export function findMostRecentCompletedSeason(
  seasons: ArenaSeason[] | undefined | null,
  blockNow: number
): ArenaSeason | null {
  if (!Array.isArray(seasons) || blockNow <= 0) return null
  return (
    seasons
      .filter((s) => s.endBlockIndex < blockNow)
      .sort((a, b) => b.endBlockIndex - a.endBlockIndex)[0] || null
  )
}

/**
 * Lấy leaderboard của 1 season đã hoàn thành
 * GET <arenaGqlBase>/leaderboard/completed?seasonId=<id>
 *
 * @throws Error nếu HTTP lỗi
 */
export async function fetchLeaderboard(
  arenaGqlBase: string,
  seasonId: number | string
): Promise<ArenaLeaderboardResponse> {
  const url = `${arenaGqlBase}/leaderboard/completed?seasonId=${seasonId}`
  logger.debug('GET', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) {
    throw new Error(`fetchLeaderboard ${url} → HTTP ${res.status}`)
  }
  return (await res.json()) as ArenaLeaderboardResponse
}

// ============================================================
// Mapping helpers
// ============================================================

/**
 * Map 1 leaderboard row → ArenaAvatarOption cho <n-select>
 * Tự động strip HTML/BBCode từ nameWithHash (VD: "<size=80%><color=...>...</color></size>")
 */
export function mapLeaderboardToAvatarOption(
  row: ArenaLeaderboardRow
): ArenaAvatarOption {
  return {
    avataraddress: row.avatarAddress,
    avatarname: stripHtmlTags(row.nameWithHash),
    agentAddress: row.agentAddress,
    level: row.level,
    score: row.score,
    totalWin: row.totalWin,
    totalLose: row.totalLose,
    source: 'leaderboard'
  }
}

/**
 * Strip HTML/BBCode tags từ nameWithHash
 * Input:  "Yuga <size=80%><color=#A68F7E>#321C</color></size>"
 * Output: "Yuga #321C"
 *
 * Cũng handle:
 *   "<size=80%>Yuga</size> <color=#fff>B</color>" → "Yuga B"
 *   "Yuga #321C" → "Yuga #321C" (giữ nguyên)
 */
export function stripHtmlTags(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]+>/g, '') // bỏ tất cả <...>
    .replace(/\s+/g, ' ') // gộp nhiều space
    .trim()
}
