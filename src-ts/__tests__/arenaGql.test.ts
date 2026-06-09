import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  fetchSeasons,
  findMostRecentCompletedSeason,
  fetchLeaderboard,
  mapLeaderboardToAvatarOption,
  stripHtmlTags
} from '../utilities/arenaGql'
import type { ArenaSeason, ArenaLeaderboardRow } from '../types/arenaLookup'

describe('arenaGql', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================
  // findMostRecentCompletedSeason
  // ============================================================
  describe('findMostRecentCompletedSeason', () => {
    it('returns null khi blockNow = 0', () => {
      const seasons = [{ id: 1, endBlockIndex: 100 } as ArenaSeason]
      expect(findMostRecentCompletedSeason(seasons, 0)).toBeNull()
    })

    it('returns null khi seasons undefined/null', () => {
      expect(findMostRecentCompletedSeason(undefined, 1000)).toBeNull()
      expect(findMostRecentCompletedSeason(null, 1000)).toBeNull()
    })

    it('returns null khi không có season nào kết thúc', () => {
      const seasons = [{ id: 1, endBlockIndex: 100 } as ArenaSeason]
      expect(findMostRecentCompletedSeason(seasons, 50)).toBeNull()
    })

    it('trả về season gần nhất đã kết thúc', () => {
      const seasons = [
        { id: 1, endBlockIndex: 100 } as ArenaSeason,
        { id: 2, endBlockIndex: 200 } as ArenaSeason,
        { id: 3, endBlockIndex: 150 } as ArenaSeason
      ]
      expect(findMostRecentCompletedSeason(seasons, 250)?.id).toBe(2)
    })

    it('không bao gồm season đang chạy (endBlockIndex >= blockNow)', () => {
      const seasons = [
        { id: 1, endBlockIndex: 100 } as ArenaSeason,
        { id: 2, endBlockIndex: 200 } as ArenaSeason
      ]
      expect(findMostRecentCompletedSeason(seasons, 200)?.id).toBe(1)
    })

    it('handle array rỗng', () => {
      expect(findMostRecentCompletedSeason([], 1000)).toBeNull()
    })
  })

  // ============================================================
  // mapLeaderboardToAvatarOption
  // ============================================================
  describe('mapLeaderboardToAvatarOption', () => {
    it('map đầy đủ các field + stripHtml', () => {
      const row: ArenaLeaderboardRow = {
        rank: 1,
        agentAddress: '0xaaa',
        avatarAddress: '0xbbb',
        nameWithHash: 'Yuga <size=80%><color=#A68F7E>#321C</color></size>',
        level: 465,
        score: 3231,
        totalWin: 100,
        totalLose: 5
      }
      const item = mapLeaderboardToAvatarOption(row)
      expect(item.avataraddress).toBe('0xbbb')
      expect(item.avatarname).toBe('Yuga #321C')
      expect(item.agentAddress).toBe('0xaaa')
      expect(item.level).toBe(465)
      expect(item.score).toBe(3231)
      expect(item.totalWin).toBe(100)
      expect(item.totalLose).toBe(5)
      expect(item.source).toBe('leaderboard')
    })

    it('handle nameWithHash rỗng', () => {
      const row: ArenaLeaderboardRow = {
        rank: 1,
        agentAddress: '0xaaa',
        avatarAddress: '0xbbb',
        nameWithHash: '',
        level: 1,
        score: 0,
        totalWin: 0,
        totalLose: 0
      }
      expect(mapLeaderboardToAvatarOption(row).avatarname).toBe('')
    })
  })

  // ============================================================
  // stripHtmlTags
  // ============================================================
  describe('stripHtmlTags', () => {
    it('loại bỏ tất cả thẻ HTML/BBCode', () => {
      expect(stripHtmlTags('Yuga <size=80%><color=#A68F7E>#321C</color></size>'))
        .toBe('Yuga #321C')
    })

    it('handle input rỗng', () => {
      expect(stripHtmlTags('')).toBe('')
      expect(stripHtmlTags(null)).toBe('')
      expect(stripHtmlTags(undefined)).toBe('')
    })

    it('handle không có tag', () => {
      expect(stripHtmlTags('SimpleName')).toBe('SimpleName')
    })

    it('gộp nhiều space thành 1', () => {
      expect(stripHtmlTags('<size=80%>A</size>   <color=#fff>B</color>'))
        .toBe('A B')
    })
  })

  // ============================================================
  // fetchSeasons
  // ============================================================
  describe('fetchSeasons', () => {
    it('throws khi HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      await expect(fetchSeasons('https://test')).rejects.toThrow('HTTP 500')
    })

    it('returns json khi OK', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ seasons: [], hasNextPage: false })
      })
      const res = await fetchSeasons('https://test')
      expect(res.seasons).toEqual([])
    })

    it('build URL đúng với pageNumber/pageSize mặc định', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ seasons: [] })
      })
      await fetchSeasons('https://arena')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://arena/seasons?pageNumber=1&pageSize=100',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('build URL đúng với pageNumber/pageSize custom', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ seasons: [] })
      })
      await fetchSeasons('https://arena', 2, 50)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://arena/seasons?pageNumber=2&pageSize=50',
        expect.objectContaining({ method: 'GET' })
      )
    })
  })

  // ============================================================
  // fetchLeaderboard
  // ============================================================
  describe('fetchLeaderboard', () => {
    it('build đúng URL với seasonId', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ leaderboard: [] })
      })
      await fetchLeaderboard('https://arena', 41)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://arena/leaderboard/completed?seasonId=41',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('accepts string seasonId', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ leaderboard: [] })
      })
      await fetchLeaderboard('https://arena', 'season-uuid')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://arena/leaderboard/completed?seasonId=season-uuid',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('throws khi HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
      await expect(fetchLeaderboard('https://arena', 41)).rejects.toThrow('HTTP 404')
    })

    it('returns json khi OK', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          leaderboard: [{
            rank: 1, agentAddress: '0xaaa', avatarAddress: '0xbbb',
            nameWithHash: 'A', level: 100, score: 100, totalWin: 1, totalLose: 0
          }]
        })
      })
      const res = await fetchLeaderboard('https://arena', 41)
      expect(res.leaderboard).toHaveLength(1)
      expect(res.leaderboard[0].agentAddress).toBe('0xaaa')
    })
  })
})
