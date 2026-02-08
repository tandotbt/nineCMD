import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchArenaSeasons,
  fetchArenaRankings,
  searchCharactersByRanking,
  searchCharactersByRankingAdvanced,
} from '../ranking'
import { CHARACTER_LOGIC_CONSTANTS } from '@/constants'

// Mock fetch globally
const fetchMock = vi.fn()

describe('Ranking Logic', () => {
  const api9CmdUrl = 'https://api.9cmd.com'
  const planet = 'odin'
  const nineChroniclesApiUrl = 'https://nine-chronicles.com/api'

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockClear()
  })

  describe('fetchArenaSeasons', () => {
    it('should fetch seasons from primary API successfully', async () => {
      const mockSeasons = ['Season 19', 'Season 20']
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeasons,
      })

      const seasons = await fetchArenaSeasons(api9CmdUrl, planet, nineChroniclesApiUrl)

      expect(seasons).toHaveLength(2)
      expect(seasons[0]?.titleArena).toBe('Season 19')
      // URL is encoded in proxy
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('arena%2Fseason'))
    })

    it('should use fallback season if primary API returns empty data', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const seasons = await fetchArenaSeasons(api9CmdUrl, planet, nineChroniclesApiUrl)

      const expectedFallback = CHARACTER_LOGIC_CONSTANTS.ARENA.FIRST_SEASON[planet as 'odin']
      expect(seasons).toHaveLength(1)
      expect(seasons[0]?.titleArena).toBe(expectedFallback)
    })

    it('should fallback to api-check if primary API fails', async () => {
      // First call fails
      fetchMock.mockResolvedValueOnce({ ok: false })
      // Second call (fallback) succeeds
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          seasons: [{ championshipId: 1, roundId: 1, titleArena: 'Fallback Season', active: true }],
        }),
      })

      const seasons = await fetchArenaSeasons(api9CmdUrl, planet, nineChroniclesApiUrl)

      expect(seasons).toHaveLength(1)
      expect(seasons[0]?.titleArena).toBe('Fallback Season')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetchArenaRankings', () => {
    it('should fetch rankings with seasonName (primary API style)', async () => {
      const mockRankings = [
        { Name: 'Alice', AvatarAddress: '0x1', Score: 1000, Rank: 1, PortraitId: 10200000 },
      ]
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRankings,
      })

      const result = await fetchArenaRankings(api9CmdUrl, planet, 1, 1, 0, 100, 'Season 19')

      expect(result.ranks).toEqual(mockRankings)
      expect(result.totalCount).toBe(1)
      // Check for double encoded season name (Season 19 -> Season%2019 -> Season%252019)
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('Season%252019'))
    })

    it('should fetch rankings via fallback (api-check style)', async () => {
      const mockResponse = {
        ranks: [{ Name: 'Bob', AvatarAddress: '0x2', Score: 900, Rank: 2, PortraitId: 10200000 }],
        totalCount: 1,
      }
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await fetchArenaRankings(api9CmdUrl, planet, 1, 1)

      expect(result).toEqual(mockResponse)
      // Check for encoded fallback URL (ranking?network=odin -> ranking%3Fnetwork%3Dodin)
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('ranking%3Fnetwork%3Dodin'))
    })

    it('should throw error if ranking fetch fails', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' })

      await expect(fetchArenaRankings(api9CmdUrl, planet, 1, 1)).rejects.toThrow(
        'Failed to fetch arena rankings',
      )
    })
  })

  describe('searchCharactersByRanking', () => {
    it('should return matching characters from the latest season', async () => {
      // Mock seasons
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ['Season 19'],
      })
      // Mock rankings (Primary API returns array)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { Name: 'Alice', AvatarAddress: '0x1' },
          { Name: 'Bob', AvatarAddress: '0x2' },
        ],
      })

      const results = await searchCharactersByRanking(api9CmdUrl, planet, 'Ali')

      expect(results).toHaveLength(1)
      expect(results[0]?.Name).toBe('Alice')
    })
  })

  describe('searchCharactersByRankingAdvanced', () => {
    it('should try multiple seasons until matches are found', async () => {
      // Mock seasons
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ['Season 20', 'Season 19'],
      })
      // Mock rankings for Season 20 (no matches) - Primary API returns array
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ Name: 'Charlie' }],
      })
      // Mock rankings for Season 19 (match) - Primary API returns array
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ Name: 'Alice', AvatarAddress: '0x1' }],
      })

      const results = await searchCharactersByRankingAdvanced(api9CmdUrl, planet, 'Ali')

      expect(results).toHaveLength(1)
      expect(results[0]?.Name).toBe('Alice')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })
  })
})
