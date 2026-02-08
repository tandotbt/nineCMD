/**
 * @file logic/ranking.ts
 * @description Logic for fetching arena seasons and rankings to support character lookup by name.
 */

import type { ArenaSeason, ArenaRanking, ArenaRankingResponse } from '@/types/character'
import { CHARACTER_LOGIC_CONSTANTS, PLANET_IDS } from '@/constants'
import type { PlanetName } from '@/types/planet'

/**
 * Interface for the arena season list response from 9cmd API.
 */
export interface ArenaSeasonListResponse {
  seasons: ArenaSeason[]
}

/**
 * Fetches the list of arena seasons.
 * @param api9CmdUrl Base URL of the 9cmd API.
 * @param planet Planet name (e.g., 'odin').
 * @param nineChroniclesApiUrl Base URL of the Nine Chronicles API.
 * @returns Promise with the list of seasons.
 */
export async function fetchArenaSeasons(
  api9CmdUrl: string,
  planet: string,
  nineChroniclesApiUrl: string = 'https://nine-chronicles.com/api',
): Promise<ArenaSeason[]> {
  const planetId = PLANET_IDS[planet as PlanetName] || planet

  // Try nine-chronicles.com API first
  const url = `${api9CmdUrl}/get-proxy?url=${encodeURIComponent(
    `${nineChroniclesApiUrl}/arena/season?planetId=${planetId}`,
  )}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      // If data is null or empty, use fallback season
      if (!data || (Array.isArray(data) && data.length === 0)) {
        const fallbackSeason =
          CHARACTER_LOGIC_CONSTANTS.ARENA.FIRST_SEASON[
            planet as keyof typeof CHARACTER_LOGIC_CONSTANTS.ARENA.FIRST_SEASON
          ]
        if (fallbackSeason) {
          return [
            {
              championshipId: 0,
              roundId: 0,
              titleArena: decodeURIComponent(fallbackSeason),
              active: true,
              startBlockIndex: 0,
              endBlockIndex: 0,
            },
          ]
        }
      }
      // Expects the season name directly or an array of season names.
      if (Array.isArray(data)) {
        return data.map((s: string) => ({
          championshipId: 0,
          roundId: 0,
          titleArena: s,
          active: true,
          startBlockIndex: 0,
          endBlockIndex: 0,
        }))
      }
    }
  } catch (err) {
    console.warn('Failed to fetch seasons from primary API, falling back', err)
  }

  // Fallback to api-check if primary fails
  const fallbackUrl = `${api9CmdUrl}/get-proxy?url=${encodeURIComponent(
    `https://api-check.nine-chronicles.com/api/arena/season-list?network=${planet}`,
  )}`

  const response = await fetch(fallbackUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch arena seasons: ${response.statusText}`)
  }

  const data: ArenaSeasonListResponse = await response.json()
  return data.seasons || []
}

/**
 * Fetches rankings for a specific arena season.
 */
export async function fetchArenaRankings(
  api9CmdUrl: string,
  planet: string,
  championshipId: number,
  roundId: number,
  offset: number = 0,
  limit: number = 100,
  seasonName?: string,
  nineChroniclesApiUrl: string = 'https://nine-chronicles.com/api',
): Promise<ArenaRankingResponse> {
  const planetId = PLANET_IDS[planet as PlanetName] || planet

  // If seasonName is provided, use the nine-chronicles.com API format
  if (seasonName) {
    const url = `${api9CmdUrl}/get-proxy?url=${encodeURIComponent(
      `${nineChroniclesApiUrl}/arena?planetId=${planetId}&season=${encodeURIComponent(seasonName)}&userSet=1`,
    )}`
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      // Returns an array of ranking objects
      return {
        ranks: data,
        totalCount: Array.isArray(data) ? data.length : 0,
      }
    }
  }

  // Fallback to api-check format
  const url = `${api9CmdUrl}/get-proxy?url=${encodeURIComponent(
    `https://api-check.nine-chronicles.com/api/arena/ranking?network=${planet}&championshipId=${championshipId}&roundId=${roundId}&offset=${offset}&limit=${limit}`,
  )}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch arena rankings: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Searches for characters by name in the latest arena season.
 */
export async function searchCharactersByRanking(
  api9CmdUrl: string,
  planet: string,
  name: string,
  nineChroniclesApiUrl?: string,
): Promise<ArenaRanking[]> {
  const seasons = await fetchArenaSeasons(api9CmdUrl, planet, nineChroniclesApiUrl)
  if (seasons.length === 0) return []

  const sortedSeasons = [...seasons].sort((a, b) => {
    if (a.championshipId !== b.championshipId) {
      return b.championshipId - a.championshipId
    }
    return b.roundId - a.roundId
  })

  const latestSeason = sortedSeasons[0]
  if (!latestSeason) return []

  const rankingRes = await fetchArenaRankings(
    api9CmdUrl,
    planet,
    latestSeason.championshipId,
    latestSeason.roundId,
    0,
    1000,
    latestSeason.titleArena,
    nineChroniclesApiUrl,
  )

  return (rankingRes.ranks || []).filter((r) => r.Name.toLowerCase().includes(name.toLowerCase()))
}

/**
 * Enhanced search that tries multiple recent seasons if needed.
 */
export async function searchCharactersByRankingAdvanced(
  api9CmdUrl: string,
  planet: string,
  name: string,
  nineChroniclesApiUrl?: string,
): Promise<ArenaRanking[]> {
  const seasons = await fetchArenaSeasons(api9CmdUrl, planet, nineChroniclesApiUrl)
  if (seasons.length === 0) return []

  const sortedSeasons = [...seasons].sort((a, b) => {
    if (a.championshipId !== b.championshipId) {
      return b.championshipId - a.championshipId
    }
    return b.roundId - a.roundId
  })

  for (const season of sortedSeasons.slice(0, 3)) {
    try {
      const rankingRes = await fetchArenaRankings(
        api9CmdUrl,
        planet,
        season.championshipId,
        season.roundId,
        0,
        1000,
        season.titleArena,
        nineChroniclesApiUrl,
      )
      const matches = (rankingRes.ranks || []).filter((r) =>
        r.Name.toLowerCase().includes(name.toLowerCase()),
      )
      if (matches.length > 0) return matches
    } catch (err) {
      console.warn(
        `Failed to fetch rankings for season ${season.championshipId}-${season.roundId}`,
        err,
      )
    }
  }

  return []
}
