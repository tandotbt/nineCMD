import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArenaLookupStore } from '../stores/arenaLookup'
import { useBlockPollingStore } from '../stores/blockPolling'
// import { useAppSettingsStore } from '../stores/appSettings'
import { useConfigURLStore } from '../stores/configURL'
import type { PlanetData } from '@/utilities/constants'

// ============================================================
// Mock localStorage
// ============================================================
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k])
  }),
  get length() {
    return Object.keys(localStorageStore).length
  },
  key: vi.fn((i: number) => Object.keys(localStorageStore)[i] ?? null)
}

// ============================================================
// Mock planet data (cho configURL)
// ============================================================
const mockPlanets: PlanetData[] = [
  {
    id: '0x000000000000',
    name: 'odin',
    genesisHash: 'abc',
    rpcEndpoints: {
      'headless.gql': ['https://odin-rpc.nine-chronicles.com/graphql'],
      'arena.gql': ['https://odin-arena.9c.gg/graphql'],
      'mimir.gql': ['https://odin-mimir.9c.gg/graphql'],
      '9cscan.rest': ['https://api.9cscan.com']
    }
  }
]

// ============================================================
// Test Suite
// ============================================================
describe('arenaLookupStore', () => {
  beforeEach(async () => {
    vi.stubGlobal('localStorage', localStorageMock)
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k])
    vi.stubGlobal('fetch', vi.fn())
    setActivePinia(createPinia())

    // Setup configURL với mock data
    const configURL = useConfigURLStore()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlanets)
    } as unknown as Response)
    await configURL.fetchPlanets()
  })

  // ============================================================
  // isValidAddressFormat
  // ============================================================
  describe('isValidAddressFormat', () => {
    it('valid 0x + 40 hex (lowercase)', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('0x' + 'a'.repeat(40))).toBe(true)
    })

    it('valid 0x + 40 hex (uppercase)', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('0x' + 'A'.repeat(40))).toBe(true)
    })

    it('valid 0x + 40 hex (mixed case)', () => {
      const store = useArenaLookupStore()
      // 'aAbBcC' × 7 = 42 chars (không phải 40) → dùng 'aAbBcC' × 6 + 'aAb' = 38+3=41, vẫn sai
      // Dùng 'aA' × 20 = 40 chars
      expect(store.isValidAddressFormat('0x' + 'aA'.repeat(20))).toBe(true)
    })

    it('invalid thiếu 0x prefix', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('a'.repeat(40))).toBe(false)
    })

    it('invalid sai độ dài (quá ngắn)', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('0xabc')).toBe(false)
    })

    it('invalid sai độ dài (quá dài)', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('0x' + 'a'.repeat(41))).toBe(false)
    })

    it('invalid chứa ký tự không phải hex', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('0x' + 'g'.repeat(40))).toBe(false)
    })

    it('invalid null', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat(null)).toBe(false)
    })

    it('invalid undefined', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat(undefined)).toBe(false)
    })

    it('invalid empty string', () => {
      const store = useArenaLookupStore()
      expect(store.isValidAddressFormat('')).toBe(false)
    })
  })

  // ============================================================
  // URL computed
  // ============================================================
  describe('URL computed', () => {
    it('urlArenaGql lấy từ configURL', () => {
      const store = useArenaLookupStore()
      expect(store.urlArenaGql).toBe('https://odin-arena.9c.gg/graphql')
    })

    it('urlMimirGql lấy từ configURL', () => {
      const store = useArenaLookupStore()
      expect(store.urlMimirGql).toBe('https://odin-mimir.9c.gg/graphql')
    })

    it('selectedPlanet lấy từ appSettings', () => {
      const store = useArenaLookupStore()
      expect(store.selectedPlanet).toBe('odin')
    })
  })

  // ============================================================
  // fetchLeaderboard
  // ============================================================
  describe('fetchLeaderboard', () => {
    it('không fetch khi blockNow = 0', async () => {
      const store = useArenaLookupStore()
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockClear()

      await store.fetchLeaderboard()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('fetch thành công khi blockNow > 0', async () => {
      const blockStore = useBlockPollingStore()
      blockStore.stopPolling()
      // blockNow phải > endBlockIndex của season (11086780) thì mới "completed"
      blockStore.currentBlockIndex = 12000000

      const store = useArenaLookupStore()
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockClear()

      // Mock fetchSeasons
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          seasons: [{ id: 41, endBlockIndex: 11086780, startBlockIndex: 10913981 }],
          hasNextPage: false
        })
      } as unknown as Response)
      // Mock fetchLeaderboard
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          leaderboard: [{
            rank: 1, agentAddress: '0xaaa', avatarAddress: '0xbbb',
            nameWithHash: 'Test', level: 100, score: 100, totalWin: 1, totalLose: 0
          }]
        })
      } as unknown as Response)

      await store.fetchLeaderboard()
      expect(store.leaderboardList).toHaveLength(1)
      expect(store.lastSeasonId).toBe(41)
    })

    it('lỗi thì set list rỗng + error (không throw)', async () => {
      const blockStore = useBlockPollingStore()
      blockStore.stopPolling()
      blockStore.currentBlockIndex = 11000000

      const store = useArenaLookupStore()
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network'))

      await store.fetchLeaderboard()
      expect(store.leaderboardList).toEqual([])
      expect(store.errorLeaderboard).toBeTruthy()
      expect(store.errorLeaderboard?.message).toBe('Network')
    })

    it('cache hit → dùng cache (không gọi fetch)', async () => {
      // Lưu ý: watch(isBlockReady, immediate) trong store đã chạy khi store khởi tạo.
      // Khi đó blockNow=0 → không fetch. Test này verify cache hit logic bằng cách
      // 1) tạo store MỚI khi blockNow=0 (watch return ngay)
      // 2) pre-fill cache trực tiếp vào reactive ref
      // 3) set blockNow=100000, gọi fetchLeaderboard
      // 4) verify fetch KHÔNG được gọi (vì cache hit)

      const blockStore = useBlockPollingStore()
      blockStore.stopPolling()
      blockStore.currentBlockIndex = 0

      const store = useArenaLookupStore()
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockClear()

      // Pre-fill cache bằng cách mutate reactive ref trực tiếp
      // (setCachedLeaderboard là internal helper, không expose public API)
      Object.assign(store.leaderboardCache, {
        odin: {
          list: [{
            avataraddress: '0xcached', avatarname: 'Cached', agentAddress: '0xcachedAgent',
            source: 'leaderboard' as const
          }],
          seasonId: 99,
          fetchedAt: Date.now()
        }
      })

      // Verify cache đã được set
      expect(store.isLeaderboardCached('odin')).toBe(true)

      // Set blockNow > 0 để watch trigger fetchLeaderboardAction
      // → nó sẽ phát hiện cache hit cho 'odin' và return ngay
      blockStore.currentBlockIndex = 100000
      await store.fetchLeaderboard()

      // Cache vẫn còn, seasonId không bị đổi, fetch KHÔNG được gọi
      expect(store.isLeaderboardCached('odin')).toBe(true)
      expect(store.getCachedLeaderboard('odin')?.seasonId).toBe(99)
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // refreshLeaderboard
  // ============================================================
  describe('refreshLeaderboard', () => {
    it('clear cache + fetch lại', async () => {
      const blockStore = useBlockPollingStore()
      blockStore.stopPolling()
      blockStore.currentBlockIndex = 11000000

      const store = useArenaLookupStore()
      // Pre-fill cache
      store.leaderboardCache = {
        odin: { list: [], seasonId: 99, fetchedAt: Date.now() }
      }

      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ seasons: [], hasNextPage: false })
      } as unknown as Response)

      await store.refreshLeaderboard()
      expect(mockFetch).toHaveBeenCalled()
      expect(store.leaderboardCache['odin']?.seasonId).toBeNull() // cache mới (empty)
    })
  })

  // ============================================================
  // lookupAgent
  // ============================================================
  describe('lookupAgent', () => {
    it('return null + error khi format sai', async () => {
      const store = useArenaLookupStore()
      const result = await store.lookupAgent('invalid')
      expect(result).toBeNull()
      expect(store.errorLookedUpAgent?.message).toContain('format')
    })

    it('return null + error khi agent không tồn tại', async () => {
      const store = useArenaLookupStore()
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { agent: null } })
      } as unknown as Response)

      const result = await store.lookupAgent('0x' + 'a'.repeat(40))
      expect(result).toBeNull()
      expect(store.errorLookedUpAgent?.message).toContain('không tồn tại')
    })

    it('lấy danh sách avatar đầy đủ', async () => {
      const store = useArenaLookupStore()
      const mockFetch = vi.mocked(global.fetch)
      // Address phải đủ 0x + 40 hex để pass isValidAddressFormat
      const validAgent = '0x' + 'a'.repeat(40)
      const validAv1 = '0x' + 'b'.repeat(40)
      const validAv2 = '0x' + 'c'.repeat(40)

      // Mock getAgent - lưu ý: key = index (number), value = address (0x...)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            agent: {
              address: validAgent,
              monsterCollectionRound: 0,
              version: null,
              avatarAddresses: [
                { key: 0, value: validAv1 },
                { key: 1, value: validAv2 }
              ]
            }
          }
        })
      } as unknown as Response)

      // Mock getAvatars
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            avatar_0: { address: validAv1, agentAddress: validAgent, name: 'Name1' },
            avatar_1: { address: validAv2, agentAddress: validAgent, name: 'Name2' }
          }
        })
      } as unknown as Response)

      const result = await store.lookupAgent(validAgent)
      expect(result).not.toBeNull()
      expect(result).toHaveLength(2)
      expect(store.lookedUpAvatars).toHaveLength(2)
      expect(store.lookedUpAgent?.address).toBe(validAgent)
    })

    it('agent có 0 avatar → return []', async () => {
      const store = useArenaLookupStore()
      // Address phải đủ 0x + 40 hex để pass isValidAddressFormat
      const validAddr = '0x' + 'a'.repeat(40)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            agent: {
              address: validAddr,
              monsterCollectionRound: 0,
              version: null,
              avatarAddresses: []
            }
          }
        })
      } as unknown as Response)

      const result = await store.lookupAgent(validAddr)
      expect(result).toEqual([])
      expect(store.lookedUpAvatars).toEqual([])
    })
  })

  // ============================================================
  // lookupAvatar
  // ============================================================
  describe('lookupAvatar', () => {
    it('return null + error khi format sai', async () => {
      const store = useArenaLookupStore()
      const result = await store.lookupAvatar('invalid')
      expect(result).toBeNull()
      expect(store.errorLookedUpAvatar?.message).toContain('format')
    })

    it('return null + error khi avatar không tồn tại', async () => {
      const store = useArenaLookupStore()
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { avatar_0: null } })
      } as unknown as Response)

      const result = await store.lookupAvatar('0x' + 'a'.repeat(40))
      expect(result).toBeNull()
      expect(store.errorLookedUpAvatar?.message).toContain('không tồn tại')
    })

    it('trả về AvatarInfo khi OK', async () => {
      const store = useArenaLookupStore()
      // Address phải đủ 0x + 40 hex để pass isValidAddressFormat
      const validAddr = '0x' + 'a'.repeat(40)
      const validAgentAddr = '0x' + 'b'.repeat(40)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: { avatar_0: { address: validAddr, agentAddress: validAgentAddr, name: 'A' } }
        })
      } as unknown as Response)

      const result = await store.lookupAvatar(validAddr)
      expect(result?.agentAddress).toBe(validAgentAddr)
      expect(store.lookedUpAvatar?.address).toBe(validAddr)
    })
  })

  // ============================================================
  // resetManualLookup
  // ============================================================
  describe('resetManualLookup', () => {
    it('reset tất cả manual state', () => {
      const store = useArenaLookupStore()
      store.lookedUpAgent = { address: '0xaaa', monsterCollectionRound: 0, version: null, avatarAddresses: [] }
      store.lookedUpAvatars = [{ address: '0xav1', agentAddress: '0xaaa', name: 'A', level: 0, exp: 0, characterId: null }]
      store.lookedUpAvatar = { address: '0xav2', agentAddress: '0xbbb', name: 'B', level: 0, exp: 0, characterId: null }
      store.errorLookedUpAgent = new Error('e1')
      store.errorLookedUpAvatar = new Error('e2')

      store.resetManualLookup()

      expect(store.lookedUpAgent).toBeNull()
      expect(store.lookedUpAvatars).toEqual([])
      expect(store.lookedUpAvatar).toBeNull()
      expect(store.errorLookedUpAgent).toBeNull()
      expect(store.errorLookedUpAvatar).toBeNull()
    })
  })

  // ============================================================
  // computed options
  // ============================================================
  describe('computed options', () => {
    it('agentLookupOptions map từ lookedUpAvatars', () => {
      const store = useArenaLookupStore()
      store.lookedUpAvatars = [
        { address: '0xav1', agentAddress: '0xaaa', name: 'A', level: 100, exp: 0, characterId: null }
      ]
      expect(store.agentLookupOptions).toHaveLength(1)
      expect(store.agentLookupOptions[0].source).toBe('agent-lookup')
      expect(store.agentLookupOptions[0].avatarname).toBe('A')
    })

    it('leaderboardOptions map từ leaderboardList với source "leaderboard"', () => {
      const store = useArenaLookupStore()
      store.leaderboardList = [
        {
          avataraddress: '0x1', avatarname: 'A', agentAddress: '0xaaa',
          source: 'leaderboard', level: 100, score: 100, totalWin: 1, totalLose: 0
        }
      ]
      expect(store.leaderboardOptions).toHaveLength(1)
      expect(store.leaderboardOptions[0].source).toBe('leaderboard')
    })
  })

  // ============================================================
  // searchQuery / leaderboardFiltered
  // ============================================================
  describe('searchQuery + leaderboardFiltered', () => {
    it('search filter theo name (case-insensitive)', () => {
      const store = useArenaLookupStore()
      store.leaderboardList = [
        { avataraddress: '0x1', avatarname: 'Yuga', agentAddress: '0xaaa', source: 'leaderboard' },
        { avataraddress: '0x2', avatarname: 'Luna', agentAddress: '0xbbb', source: 'leaderboard' }
      ]
      store.searchQuery = 'yug'
      expect(store.leaderboardFiltered).toHaveLength(1)
      expect(store.leaderboardFiltered[0].avatarname).toBe('Yuga')
    })

    it('search filter theo agent address', () => {
      const store = useArenaLookupStore()
      store.leaderboardList = [
        { avataraddress: '0x1', avatarname: 'Yuga', agentAddress: '0xaaa', source: 'leaderboard' },
        { avataraddress: '0x2', avatarname: 'Luna', agentAddress: '0xbbb', source: 'leaderboard' }
      ]
      store.searchQuery = '0xbbb'
      expect(store.leaderboardFiltered).toHaveLength(1)
      expect(store.leaderboardFiltered[0].avatarname).toBe('Luna')
    })

    it('search rỗng → trả về tất cả', () => {
      const store = useArenaLookupStore()
      store.leaderboardList = [
        { avataraddress: '0x1', avatarname: 'Yuga', agentAddress: '0xaaa', source: 'leaderboard' },
        { avataraddress: '0x2', avatarname: 'Luna', agentAddress: '0xbbb', source: 'leaderboard' }
      ]
      store.searchQuery = ''
      expect(store.leaderboardFiltered).toHaveLength(2)
    })
  })
})
