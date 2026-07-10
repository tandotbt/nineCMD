import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  graphqlQuery,
  getAgent,
  getAvatars,
  getAvatar
} from '../utilities/mimirGraphql'

describe('mimirGraphql', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================
  // graphqlQuery (helper)
  // ============================================================
  describe('graphqlQuery', () => {
    it('returns data when OK', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { foo: 1 } })
      })
      const result = await graphqlQuery('https://m', 'query { foo }')
      expect(result).toEqual({ foo: 1 })
    })

    it('returns null when response has no data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      })
      const result = await graphqlQuery('https://m', 'query { foo }')
      expect(result).toBeNull()
    })

    it('throws when response has errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ errors: [{ message: 'Server error' }] })
      })
      await expect(graphqlQuery('https://m', 'q')).rejects.toThrow('Server error')
    })

    it('joins multiple errors into 1 string', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          errors: [{ message: 'Err1' }, { message: 'Err2' }]
        })
      })
      await expect(graphqlQuery('https://m', 'q')).rejects.toThrow('Err1; Err2')
    })

    it('throws on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      await expect(graphqlQuery('https://m', 'q')).rejects.toThrow('HTTP 500')
    })

    it('sends POST with Content-Type json', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} })
      })
      global.fetch = mockFetch
      await graphqlQuery('https://m', 'q', { a: 1 })
      expect(mockFetch).toHaveBeenCalledWith('https://m', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'q', variables: { a: 1 } })
      })
    })
  })

  // ============================================================
  // getAvatars (dynamic query build)
  // ============================================================
  describe('getAvatars', () => {
    it('builds query with 0 avatar → returns [] (no fetch called)', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch
      const result = await getAvatars('https://mimir', [])
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('builds query with 1 avatar → only avatar_0, inline address', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { avatar_0: { address: '0xaaa', name: 'Test', level: 100, agentAddress: '0xbbb' } }
        })
      })
      const result = await getAvatars('https://mimir', ['0xaaa'])
      expect(result).toHaveLength(1)
      expect(result[0]?.address).toBe('0xaaa')
      const mockFetch = vi.mocked(global.fetch)
      const calledBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
      // Inline address directly into query (no variables used)
      expect(calledBody.query).toContain('avatar_0: avatar(address: "0xaaa")')
      expect(calledBody.variables).toEqual({})
    })

    it('builds query with 3 avatars → has avatar_0, avatar_1, avatar_2, inline address', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            avatar_0: { address: '0x1', name: 'A' },
            avatar_1: { address: '0x2', name: 'B' },
            avatar_2: { address: '0x3', name: 'C' }
          }
        })
      })
      await getAvatars('https://mimir', ['0x1', '0x2', '0x3'])
      const mockFetch = vi.mocked(global.fetch)
      const calledBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
      expect(calledBody.query).toContain('avatar_0: avatar(address: "0x1")')
      expect(calledBody.query).toContain('avatar_1: avatar(address: "0x2")')
      expect(calledBody.query).toContain('avatar_2: avatar(address: "0x3")')
      expect(calledBody.variables).toEqual({})
    })

    it('filters out null/undefined items', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            avatar_0: { address: '0x1', name: 'A' },
            avatar_1: null
          }
        })
      })
      const result = await getAvatars('https://mimir', ['0x1', '0x2'])
      expect(result).toHaveLength(1)
      expect(result[0]?.address).toBe('0x1')
    })

    it('returns [] when data is null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: null })
      })
      const result = await getAvatars('https://mimir', ['0x1'])
      expect(result).toEqual([])
    })
  })

  // ============================================================
  // getAgent
  // ============================================================
  describe('getAgent', () => {
    it('returns null when agent does not exist', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { agent: null } })
      })
      const result = await getAgent('https://mimir', '0x' + 'a'.repeat(40))
      expect(result).toBeNull()
    })

    it('returns AgentInfo when OK', async () => {
      // Note: key = index (number), value = address (0x...)
      const agent = {
        address: '0xaaa',
        monsterCollectionRound: 0,
        version: null,
        avatarAddresses: [{ key: 0, value: '0xav1' }]
      }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { agent } })
      })
      const result = await getAgent('https://mimir', '0xaaa')
      expect(result?.address).toBe('0xaaa')
      expect(result?.avatarAddresses).toHaveLength(1)
    })

    it('throws when there are errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ errors: [{ message: 'Bad query' }] })
      })
      await expect(getAgent('https://mimir', '0xaaa')).rejects.toThrow('Bad query')
    })
  })

  // ============================================================
  // getAvatar (single)
  // ============================================================
  describe('getAvatar (single)', () => {
    it('returns avatar_0', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { avatar_0: { address: '0x1', agentAddress: '0x2' } }
        })
      })
      const result = await getAvatar('https://mimir', '0x1')
      expect(result?.agentAddress).toBe('0x2')
    })

    it('returns null when not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { avatar_0: null } })
      })
      expect(await getAvatar('https://mimir', '0xinvalid')).toBeNull()
    })

    it('throws on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
      await expect(getAvatar('https://mimir', '0x1')).rejects.toThrow('HTTP 503')
    })
  })
})
