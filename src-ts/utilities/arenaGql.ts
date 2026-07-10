/**
 * arenaGql Utility – Helper functions for arena.gql REST API
 *
 * Arena.gql provides:
 * - GET /seasons → list of seasons
 * - GET /leaderboard/completed?seasonId=<id> → leaderboard of completed season
 *
 * URL from useConfigURLStore.getArenaGql(planet) - prefer dynamic from API,
 * fallback to PLANET_CONFIGS hardcode.
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
 * Fetch season list from arena.gql
 * GET <arenaGqlBase>/seasons?pageNumber=1&pageSize=100
 *
 * @throws Error if HTTP error
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
 * Find most recently completed season relative to blockNow
 * - Filter: endBlockIndex < blockNow (completed)
 * - Sort: endBlockIndex descending
 * - Returns null if none found
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
 * Fetch leaderboard for a completed season
 * GET <arenaGqlBase>/leaderboard/completed?seasonId=<id>
 *
 * @throws Error if HTTP error
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
 * Map a leaderboard row → ArenaAvatarOption for <n-select>
 * Auto-strip HTML/BBCode from nameWithHash (e.g. "<size=80%><color=...>...</color></size>")
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
 * Strip HTML/BBCode tags from nameWithHash
 * Input:  "Yuga <size=80%><color=#A68F7E>#321C</color></size>"
 * Output: "Yuga #321C"
 *
 * Also handles:
 *   "<size=80%>Yuga</size> <color=#fff>B</color>" → "Yuga B"
 *   "Yuga #321C" → "Yuga #321C" (unchanged)
 */
export function stripHtmlTags(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]+>/g, '') // remove all <...>
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}
