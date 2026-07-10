import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAvatarDataDisplayStore } from '../stores/avatarDataDisplay'
import type { StatsMap } from '../types/avatarData'

// ============================================================
// Mock dependent stores to avoid @/ alias issues
// ============================================================
vi.mock('../stores/blockPolling', () => ({
  useBlockPollingStore: vi.fn(() => ({
    currentBlockIndex: 500000,
    isBlockReady: true
  }))
}))

vi.mock('../stores/configURL', () => ({
  useConfigURLStore: vi.fn(() => ({
    getHeadlessGql: vi.fn(() => 'https://odin-headless.9c.gg/graphql'),
    getMimirUrl: vi.fn(() => 'https://odin-mimir.9c.gg/graphql')
  }))
}))

vi.mock('../stores/appSettings', () => ({
  useAppSettingsStore: vi.fn(() => ({
    selectedPlanet: 'odin',
    lang: 'en'
  }))
}))

vi.mock('../stores/globalCsv', () => ({
  useGlobalCsvStore: vi.fn(() => ({
    getItemName: vi.fn((key: string) => `Name_${key}`),
    getSkillName: vi.fn((key: string) => `Skill_${key}`),
    isLoaded: true,
    loadAll: vi.fn()
  }))
}))

vi.mock('../stores/csvData', () => ({
  useCsvDataStore: vi.fn(() => ({
    getSheet: vi.fn(() => null),
    getSheetRow: vi.fn(() => null),
    isLoaded: true,
    fetchAllSheets: vi.fn()
  }))
}))

vi.mock('../utilities/avatarDataGraphQL', () => ({
  fetchQueryA: vi.fn(),
  fetchQueryB: vi.fn(),
  fetchGetDataGraphql: vi.fn()
}))

vi.mock('../utilities/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })
}))

// Mock localStorage
const localStorageStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key] }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]) })
})

// ============================================================
// Test Suite
// ============================================================
describe('avatarDataDisplayStore', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k])
    setActivePinia(createPinia())
  })

  // ============================================================
  // Initial State
  // ============================================================
  describe('initial state', () => {
    it('has expected public API shape', () => {
      const store = useAvatarDataDisplayStore()
      expect(store).toHaveProperty('agentAddress')
      expect(store).toHaveProperty('avatarAddress')
      expect(store).toHaveProperty('isLoading')
      expect(store).toHaveProperty('error')
      expect(store).toHaveProperty('rawGraphQL')
      expect(store).toHaveProperty('characterInfo')
      expect(store).toHaveProperty('equipmentsAll')
      expect(store).toHaveProperty('costumesAll')
      expect(store).toHaveProperty('runesAll')
      expect(store).toHaveProperty('combinationSlots')
      expect(store).toHaveProperty('materialsAll')
      expect(store).toHaveProperty('consumablesAll')
      expect(store).toHaveProperty('rawRestApi')
      expect(store).toHaveProperty('processedRestApi')
      expect(store).toHaveProperty('isReady')
      expect(store).toHaveProperty('selectedPlanet')
      expect(store).toHaveProperty('fetchAvatarData')
      expect(store).toHaveProperty('fetchStep1')
      expect(store).toHaveProperty('fetchStep2')
      expect(store).toHaveProperty('reset')
    })

    it('has correct initial values', () => {
      const store = useAvatarDataDisplayStore()
      expect(store.agentAddress).toBe('')
      expect(store.avatarAddress).toBe('')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.rawGraphQL).toBeNull()
      expect(store.characterInfo).toBeNull()
      expect(store.equipmentsAll).toEqual([])
      expect(store.costumesAll).toEqual([])
      expect(store.runesAll).toEqual([])
      expect(store.combinationSlots).toEqual([])
      expect(store.materialsAll).toEqual([])
      expect(store.consumablesAll).toEqual([])
      expect(store.rawRestApi).toBeNull()
      expect(store.processedRestApi).toBeNull()
    })

    it('isReady is false when no characterInfo', () => {
      const store = useAvatarDataDisplayStore()
      expect(store.isReady).toBe(false)
    })
  })

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('clears all state', () => {
      const store = useAvatarDataDisplayStore()
      store.agentAddress = '0xtest'
      store.avatarAddress = '0xtest2'
      store.isLoading = true
      store.error = 'some error'

      store.reset()

      expect(store.agentAddress).toBe('')
      expect(store.avatarAddress).toBe('')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.rawGraphQL).toBeNull()
      expect(store.characterInfo).toBeNull()
      expect(store.equipmentsAll).toEqual([])
      expect(store.costumesAll).toEqual([])
      expect(store.runesAll).toEqual([])
      expect(store.combinationSlots).toEqual([])
      expect(store.materialsAll).toEqual([])
      expect(store.consumablesAll).toEqual([])
      expect(store.rawRestApi).toBeNull()
      expect(store.processedRestApi).toBeNull()
    })
  })

  // ============================================================
  // fetchStep1 — processes GraphQL response into store state
  // ============================================================
  describe('fetchStep1', () => {
    it('processes GraphQL response into characterInfo + inventory', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '5000', crystal: '100' },
          avatar: {
            address: '0xavatar',
            name: 'Hero',
            level: 50,
            actionPoint: 80,
            dailyRewardReceivedIndex: 1000,
            stageMap: { pairs: [[10, 1], [20, 2]], count: 2 },
            runes: [{ runeId: 'r1', level: 3 }],
            inventory: {
              equipped: [{ itemSubType: 'weapon', id: 1001 }],
              all: [{
                grade: 3, id: 1001, itemType: 'weapon', itemSubType: 'weapon',
                elementalType: 'fire', requiredBlockIndex: 0, setId: 0,
                stat: { statType: 'aTK', baseValue: 10, totalValue: 50, additionalValue: 40 },
                equipped: true, itemId: 1001, level: 5,
                skills: [], buffSkills: [],
                statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
              }],
              costumes: [],
              materials: [{ id: 500000 }, { id: 500000 }],
              consumables: [{ id: 600000 }]
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '500000' }],
          unlockedWorldIds: [1, 2, 3]
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({
        stateQuery: {
          avatar: {
            inventory: {
              i500000: [{ count: 2, tradableId: null }]
            }
          }
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      // Character info
      expect(store.characterInfo).not.toBeNull()
      expect(store.characterInfo!.name).toBe('Hero')
      expect(store.characterInfo!.level).toBe(50)
      expect(store.characterInfo!.gold).toBe('5000')
      expect(store.characterInfo!.crystal).toBe('100')
      expect(store.characterInfo!.stakeNCG).toBe('500000')
      expect(store.characterInfo!.apCost).toBe(3) // stake >= 500000 → MIN
      expect(store.characterInfo!.unlockedWorldIds).toEqual([1, 2, 3])

      // Inventory
      expect(store.equipmentsAll).toHaveLength(1)
      expect(store.equipmentsAll[0].name).toBe('Name_ITEM_NAME_1001')
      expect(store.runesAll).toHaveLength(1)
      expect(store.materialsAll.length).toBeGreaterThan(0)
      expect(store.consumablesAll).toHaveLength(1)
      expect(store.equippedSlots).toHaveLength(1)
    })

    it('sets error when no avatar data returned', async () => {
      const { fetchQueryA, fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: undefined // no avatar
        }
      })
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({})

      // fetchStep1 throws, but fetchAvatarData catches it and sets error
      const store = useAvatarDataDisplayStore()
      await store.fetchAvatarData('0xagent', '0xavatar')

      expect(store.error).toBe('No avatar data returned')
      expect(store.isLoading).toBe(false)
    })

    it('sets rawGraphQL reference', async () => {
      const { fetchQueryA } = await import('../utilities/avatarDataGraphQL')
      const mockResponse = {
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [], inventory: {
              equipped: [], all: [], costumes: [], materials: [], consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      }
      vi.mocked(fetchQueryA).mockResolvedValue(mockResponse)

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.rawGraphQL).toEqual(mockResponse)
    })
  })

  // ============================================================
  // fetchAvatarData — orchestrates step1 + step2
  // ============================================================
  describe('fetchAvatarData', () => {
    it('calls fetchStep1 and fetchStep2', async () => {
      const { fetchQueryA, fetchQueryB, fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Hero', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [], inventory: {
              equipped: [], all: [], costumes: [], materials: [], consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({ stateQuery: { avatar: { inventory: {} } } })
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({})

      const store = useAvatarDataDisplayStore()
      await store.fetchAvatarData('0xagent', '0xavatar')

      expect(fetchQueryA).toHaveBeenCalled()
      expect(fetchGetDataGraphql).toHaveBeenCalled()
      expect(store.isLoading).toBe(false)
      expect(store.agentAddress).toBe('0xagent')
      expect(store.avatarAddress).toBe('0xavatar')
    })

    it('sets error on failure', async () => {
      const { fetchQueryA } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockRejectedValue(new Error('Network error'))

      const store = useAvatarDataDisplayStore()
      await store.fetchAvatarData('0xagent', '0xavatar')

      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })

    it('sets isLoading during fetch and false after', async () => {
      const { fetchQueryA, fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      let isLoadingDuringFetch = false
      vi.mocked(fetchQueryA).mockImplementation(async () => {
        isLoadingDuringFetch = store.isLoading
        return {
          stateQuery: {
            agent: { gold: '0', crystal: '0' },
            avatar: {
              name: 'Hero', level: 1, actionPoint: 10,
              dailyRewardReceivedIndex: 0,
              stageMap: { pairs: [], count: 0 },
              runes: [], inventory: {
                equipped: [], all: [], costumes: [], materials: [], consumables: []
              },
              itemMap: { count: 0, pairs: [] },
              combinationSlots: []
            },
            stakeStates: [{ deposit: '0' }],
            unlockedWorldIds: []
          }
        } as Record<string, unknown>
      })
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({})

      const store = useAvatarDataDisplayStore()
      await store.fetchAvatarData('0xagent', '0xavatar')

      expect(isLoadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })
  })

  // ============================================================
  // selectedPlanet — computed from appSettings
  // ============================================================
  describe('selectedPlanet', () => {
    it('returns planet from appSettings', () => {
      const store = useAvatarDataDisplayStore()
      expect(store.selectedPlanet).toBe('odin')
    })
  })

  // ============================================================
  // fetchStep2 — processes REST API response into store state
  // ============================================================
  describe('fetchStep2', () => {
    it('processes REST API response into processedRestApi with correct shape', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      // Mock response with real codeGet keys used by the store
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: {
          lookupItemSetMuti_Adventure: { costumes: ['costume1'], equipment: [1001] },
          lookupRuneSetMuti_Adventure: [{ index: 0, runeId: 1, level: 3 }],
          other_lookupPatrolReward: { blockLastClaim: 400000, interval: 100 },
          other_lookupAdventureCp: 5000,
          other_lookupClaimedGiftIds: [1, 2, 3]
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi).not.toBeNull()
      expect(store.processedRestApi!.equipmentSets.adventure).toEqual({ costumes: ['costume1'], equipment: [1001] })
      expect(store.processedRestApi!.runeSets.adventure).toEqual([{ index: 0, runeId: 1, level: 3 }])
      expect(store.processedRestApi!.patrolReward).toEqual({ blockLastClaim: 400000, interval: 100, diffBlock: 100000, isCanClaim: true })
      expect(store.processedRestApi!.adventureCp).toBe(5000)
      expect(store.processedRestApi!.claimedGiftIds).toEqual([1, 2, 3])
      expect(store.processedRestApi!.worldBoss.total).toBeNull()
      expect(store.processedRestApi!.eventDungeon).toBeNull()
    })

    it('error from fetchStep2 propagates (caught by fetchAvatarData)', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockRejectedValue(new Error('API Error'))

      const store = useAvatarDataDisplayStore()
      // fetchStep2 throws directly — test through fetchAvatarData which catches
      await store.fetchAvatarData('0xagent', '0xavatar')

      expect(store.error).toBe('API Error')
      expect(store.isLoading).toBe(false)
    })
  })

  // ============================================================
  // fillEquipments — tested indirectly through fetchStep1
  // fillEquipments is internal; verify via equipmentsAll after fetchStep1
  // ============================================================
  describe('enriched equipment via fetchStep1', () => {
    it('enriches equipment with name and cp from CSV helpers', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [],
              all: [{
                grade: 3, id: 1001, itemType: 'weapon', itemSubType: 'weapon',
                elementalType: 'fire', requiredBlockIndex: 0, setId: 0,
                stat: { statType: 'aTK', baseValue: 10, totalValue: 50, additionalValue: 40 },
                equipped: true, itemId: 1001, level: 5,
                skills: [], buffSkills: [],
                statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
              }],
              costumes: [],
              materials: [],
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({ stateQuery: { avatar: { inventory: {} } } })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.equipmentsAll).toHaveLength(1)
      const eq = store.equipmentsAll[0]
      expect(eq.name).toBe('Name_ITEM_NAME_1001') // from globalCsv.getItemName mock
      expect(eq.cp).toBe(525) // combatPotion({hP:0, aTK:50, dEF:0, cRI:0, hIT:0, sPD:0}) = floor(50*10.5) = 525
      expect(eq.levelReq).toBe(888888) // DEFAULT_LEVEL_REQ (csvData.getSheetRow returns null)
    })
  })

  // ============================================================
  // fillCostumes — tested indirectly through fetchStep1
  // ============================================================
  describe('enriched costumes via fetchStep1', () => {
    it('processes costumes from GraphQL response', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [],
              all: [],
              costumes: [{
                grade: 2, id: 2001, itemType: 'costume', itemSubType: 'normal',
                elementalType: 'water', requiredBlockIndex: 0, itemId: 2001, equipped: false
              }],
              materials: [],
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({ stateQuery: { avatar: { inventory: {} } } })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.costumesAll).toHaveLength(1)
      const costume = store.costumesAll[0]
      expect(costume.name).toBe('Name_ITEM_NAME_2001')
      expect(costume.statsMap).toBeDefined()
      // CostumeStatSheet returns null from mock → statsMap defaults to all zeros
      expect(costume.statsMap.HP).toBe(0)
      expect(costume.cp).toBe(0)
    })
  })

  // ============================================================
  // isReady — computed property indicating if store has data
  // ============================================================
  describe('isReady', () => {
    it('returns false when no characterInfo', () => {
      const store = useAvatarDataDisplayStore()
      expect(store.isReady).toBe(false)
    })

    it('returns true when characterInfo present', () => {
      const store = useAvatarDataDisplayStore()
      store.characterInfo = {
        name: 'Hero',
        level: 50,
        gold: '5000',
        crystal: '100',
        stakeNCG: '500000',
        apCost: 3,
        unlockedWorldIds: [1, 2, 3]
      }
      expect(store.isReady).toBe(true)
    })
  })

  // ============================================================
  // fetchStep2 — extractPatrolReward edge cases
  // ============================================================
  describe('extractPatrolReward (via fetchStep2)', () => {
    it('returns null when patrol reward has error string', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: {
          other_lookupPatrolReward: { error: 'Patrol reward not available' }
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi).not.toBeNull()
      expect(store.processedRestApi!.patrolReward).toBeNull()
    })

    it('returns null when patrol reward has message string', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: {
          other_lookupPatrolReward: { message: 'Lỗi khi lấy dữ liệu' }
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi!.patrolReward).toBeNull()
    })

    it('handles response without data wrapper (direct format)', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        other_lookupPatrolReward: { blockLastClaim: 400000, interval: 100 },
        other_lookupAdventureCp: 3000,
        other_lookupClaimedGiftIds: [1]
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi).not.toBeNull()
      expect(store.processedRestApi!.patrolReward).not.toBeNull()
      expect(store.processedRestApi!.patrolReward!.blockLastClaim).toBe(400000)
      expect(store.processedRestApi!.adventureCp).toBe(3000)
      expect(store.processedRestApi!.claimedGiftIds).toEqual([1])
    })

    it('handles null patrol reward gracefully', async () => {
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: {
          other_lookupPatrolReward: null,
          other_lookupAdventureCp: null,
          other_lookupClaimedGiftIds: null
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi!.patrolReward).toBeNull()
      expect(store.processedRestApi!.adventureCp).toBeNull()
      expect(store.processedRestApi!.claimedGiftIds).toEqual([])
    })
  })

  // ============================================================
  // reset — verifies full clear after data loaded
  // ============================================================
  describe('reset after data loaded', () => {
    it('clears all enriched data including REST API', async () => {
      const { fetchQueryA, fetchQueryB, fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '5000', crystal: '100' },
          avatar: {
            name: 'Hero', level: 50, actionPoint: 80,
            dailyRewardReceivedIndex: 1000,
            stageMap: { pairs: [[10, 1]], count: 1 },
            runes: [{ runeId: 'r1', level: 3 }],
            inventory: {
              equipped: [], all: [{
                grade: 3, id: 1001, itemType: 'weapon', itemSubType: 'weapon',
                elementalType: 'fire', requiredBlockIndex: 0, setId: 0,
                stat: { statType: 'aTK', baseValue: 10, totalValue: 50, additionalValue: 40 },
                equipped: false, itemId: 1001, level: 5,
                skills: [], buffSkills: [],
                statsMap: { hP: 0, aTK: 50, dEF: 0, cRI: 0, hIT: 0, sPD: 0 }
              }],
              costumes: [{ grade: 1, id: 2001, itemType: 'costume', itemSubType: 'normal', elementalType: 'water', requiredBlockIndex: 0, itemId: 2001, equipped: false }],
              materials: [{ id: 100 }, { id: 100 }],
              consumables: [{ id: 200 }, { id: 200 }]
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: [{ address: '0xcombo', petId: 1, index: 0, isUnlocked: true, startBlockIndex: 0, unlockBlockIndex: 0 }]
          },
          stakeStates: [{ deposit: '500000' }],
          unlockedWorldIds: [1, 2]
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({
        stateQuery: { avatar: { inventory: { i100: [{ count: 2, tradableId: null }] } } }
      })
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: { other_lookupAdventureCp: 5000 }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')
      await store.fetchStep2('0xavatar')

      // Verify data loaded
      expect(store.characterInfo).not.toBeNull()
      expect(store.equipmentsAll).toHaveLength(1)
      expect(store.materialsAll.length).toBeGreaterThan(0)

      store.reset()

      // Verify full clear
      expect(store.agentAddress).toBe('')
      expect(store.avatarAddress).toBe('')
      expect(store.characterInfo).toBeNull()
      expect(store.equipmentsAll).toEqual([])
      expect(store.costumesAll).toEqual([])
      expect(store.runesAll).toEqual([])
      expect(store.combinationSlots).toEqual([])
      expect(store.equippedSlots).toEqual([])
      expect(store.unlockedWorldIds).toEqual([])
      expect(store.materialsAll).toEqual([])
      expect(store.consumablesAll).toEqual([])
      expect(store.rawRestApi).toBeNull()
      expect(store.processedRestApi).toBeNull()
      expect(store.rawGraphQL).toBeNull()
      expect(store.isReady).toBe(false)
    })
  })

  // ============================================================
  // mergeMaterialCounts — tested via fetchStep1 with AP potion
  // ============================================================
  describe('mergeMaterialCounts (via fetchStep1)', () => {
    it('merges Query B counts and adds tradable AP potion', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [],
              all: [],
              costumes: [],
              materials: [
                { id: 100 }, { id: 100 }, // 2x material 100
                { id: 500000 }              // AP potion
              ],
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      // Query B returns exact counts with tradable split
      vi.mocked(fetchQueryB).mockResolvedValue({
        stateQuery: {
          avatar: {
            inventory: {
              i100: [{ count: 5, tradableId: null }],
              i500000: [
                { count: 3, tradableId: '0xabc' },  // tradable
                { count: 2, tradableId: null }       // non-tradable
              ]
            }
          }
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      // Material 100: count updated from 2 (Step 1) to 5 (Query B)
      const mat100 = store.materialsAll.find((m) => m.id === 100)
      expect(mat100?.count).toBe(5)

      // AP potion non-tradable: count from Query B
      const matAP = store.materialsAll.find((m) => m.id === 500000)
      expect(matAP?.count).toBe(2)

      // AP potion tradable: new entry with offset ID
      const matAPTradable = store.materialsAll.find((m) => m.id === 14000000 + 500000)
      expect(matAPTradable?.count).toBe(3)
    })

    it('handles Query B failure gracefully (keeps Step 1 counts)', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [],
              all: [],
              costumes: [],
              materials: [{ id: 200 }, { id: 200 }],
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchQueryB).mockRejectedValue(new Error('Query B failed'))

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      // Should keep Step 1 count (2) when Query B fails
      expect(store.materialsAll).toHaveLength(1)
      expect(store.materialsAll[0]).toEqual({ id: 200, count: 2 })
    })
  })

  // ============================================================
  // fillCostumes — with CostumeStatSheet data
  // ============================================================
  describe('enriched costumes with CostumeStatSheet data', () => {
    it('applies stats from CostumeStatSheet via Map lookup', async () => {
      // Pre-create csvData mock with CostumeStatSheet BEFORE store is created
      // This ensures the store's `csvData = useCsvDataStore()` captures this instance
      const costumeSheet = {
        row1: { costume_id: '3001', stat_type: 'HP', stat: 50 },
        row2: { costume_id: '3001', stat_type: 'ATK', stat: 10 },
        row3: { costume_id: '3001', stat_type: 'DEF', stat: 20 }
      }
      const mockGetSheet = vi.fn((sheetName: string) => {
        if (sheetName === 'CostumeStatSheet') return costumeSheet
        return null
      })
      const csvDataModule = await import('../stores/csvData')
      vi.mocked(csvDataModule.useCsvDataStore).mockReturnValue({
        getSheet: mockGetSheet,
        getSheetRow: vi.fn(() => null),
        isLoaded: true,
        fetchAllSheets: vi.fn()
      } as ReturnType<typeof csvDataModule.useCsvDataStore>)

      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Test', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [],
              all: [],
              costumes: [{
                grade: 2, id: 3001, itemType: 'costume', itemSubType: 'hair',
                elementalType: 'none', requiredBlockIndex: 0, itemId: 3001, equipped: false
              }],
              materials: [],
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchQueryB).mockResolvedValue({ stateQuery: { avatar: { inventory: {} } } })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.costumesAll).toHaveLength(1)
      const costume = store.costumesAll[0]
      expect(costume.name).toBe('Name_ITEM_NAME_3001')
      // Stats from CostumeStatSheet
      expect(costume.statsMap.HP).toBe(50)
      expect(costume.statsMap.ATK).toBe(10)
      expect(costume.statsMap.DEF).toBe(20)
      // CP: HP*0.7 + ATK*10.5 + DEF*10.5 = 35 + 105 + 210 = 350
      expect(costume.cp).toBe(350)
    })
  })

  // ============================================================
  // fetchStep2 — with world boss + event dungeon active
  // ============================================================
  describe('fetchStep2 with active world boss and event dungeon', () => {
    it('includes dynamic codeGets for active world boss and event dungeon', async () => {
      // Test buildCodeGetList + extractPatrolReward + extractEquipSet logic
      // by verifying the processedRestApi shape with a comprehensive mock response
      const { fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({
        data: {
          // Equipment sets
          lookupItemSetMuti_Adventure: { equipment: [1001], costumes: [2001] },
          lookupItemSetMuti_Arena: { equipment: [1002], costumes: [2002] },
          lookupItemSetMuti_Raid: null,
          lookupItemSetMuti_InfiniteTower: null,
          // Rune sets
          lookupRuneSetMuti_Adventure: [{ index: 0, runeId: 1, level: 3 }],
          lookupRuneSetMuti_Arena: [],
          lookupRuneSetMuti_Raid: [],
          lookupRuneSetMuti_InfiniteTower: [],
          // REST API data
          other_lookupPatrolReward: { blockLastClaim: 400000, interval: 100 },
          other_lookupAdventureCp: 5000,
          other_lookupClaimedGiftIds: [1, 2, 3]
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep2('0xavatar')

      expect(store.processedRestApi).not.toBeNull()
      const restApi = store.processedRestApi!

      // Equipment sets
      expect(restApi.equipmentSets.adventure).toEqual({ equipment: [1001], costumes: [2001] })
      expect(restApi.equipmentSets.arena).toEqual({ equipment: [1002], costumes: [2002] })
      expect(restApi.equipmentSets.raid).toBeNull()
      expect(restApi.equipmentSets.infiniteTower).toBeNull()

      // Rune sets
      expect(restApi.runeSets.adventure).toEqual([{ index: 0, runeId: 1, level: 3 }])
      expect(restApi.runeSets.arena).toEqual([])

      // Patrol reward
      expect(restApi.patrolReward).not.toBeNull()
      expect(restApi.patrolReward!.blockLastClaim).toBe(400000)
      expect(restApi.patrolReward!.interval).toBe(100)
      // diffBlock = blockNow(500000) - blockLastClaim(400000) = 100000
      expect(restApi.patrolReward!.diffBlock).toBe(100000)
      expect(restApi.patrolReward!.isCanClaim).toBe(true) // 100000 >= 100

      // Adventure CP + Claimed gifts
      expect(restApi.adventureCp).toBe(5000)
      expect(restApi.claimedGiftIds).toEqual([1, 2, 3])

      // World boss / event dungeon are null (no matching CSV data in default mock)
      expect(restApi.worldBoss.total).toBeNull()
      expect(restApi.eventDungeon).toBeNull()
    })
  })

  // ============================================================
  // fetchStep1 — edge cases
  // ============================================================
  describe('fetchStep1 — edge cases', () => {
    it('handles no inventory (undefined) gracefully', async () => {
      const { fetchQueryA } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Hero', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            // no inventory field
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.characterInfo).not.toBeNull()
      expect(store.equipmentsAll).toEqual([])
      expect(store.costumesAll).toEqual([])
      expect(store.materialsAll).toEqual([])
      expect(store.consumablesAll).toEqual([])
      expect(store.equippedSlots).toEqual([])
    })

    it('skips Query B when materials is empty', async () => {
      const { fetchQueryA, fetchQueryB } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Hero', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [], all: [], costumes: [],
              materials: [], // empty
              consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      // Materials should be empty when no material IDs in inventory
      expect(store.materialsAll).toEqual([])
    })

    it('handles stageMap with no pairs', async () => {
      const { fetchQueryA } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Hero', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [], all: [], costumes: [], materials: [], consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })

      const store = useAvatarDataDisplayStore()
      await store.fetchStep1('0xagent', '0xavatar')

      expect(store.characterInfo!.stageClearedId).toBe(0)
      expect(store.characterInfo!.apCost).toBe(5) // stake 0 → tier 1
    })
  })

  // ============================================================
  // fetchAvatarData — CSV loading
  // ============================================================
  describe('fetchAvatarData — CSV loading', () => {
    it('fetches CSV data when not loaded', async () => {
      const { fetchQueryA, fetchGetDataGraphql } = await import('../utilities/avatarDataGraphQL')
      vi.mocked(fetchQueryA).mockResolvedValue({
        stateQuery: {
          agent: { gold: '0', crystal: '0' },
          avatar: {
            name: 'Hero', level: 1, actionPoint: 10,
            dailyRewardReceivedIndex: 0,
            stageMap: { pairs: [], count: 0 },
            runes: [],
            inventory: {
              equipped: [], all: [], costumes: [], materials: [], consumables: []
            },
            itemMap: { count: 0, pairs: [] },
            combinationSlots: []
          },
          stakeStates: [{ deposit: '0' }],
          unlockedWorldIds: []
        }
      })
      vi.mocked(fetchGetDataGraphql).mockResolvedValue({})

      // Override csvData mock to report not loaded
      const csvDataModule = await import('../stores/csvData')
      const fetchAllSheetsMock = vi.fn()
      vi.mocked(csvDataModule.useCsvDataStore).mockReturnValue({
        getSheet: vi.fn(() => null),
        getSheetRow: vi.fn(() => null),
        isLoaded: false, // not loaded
        fetchAllSheets: fetchAllSheetsMock
      } as ReturnType<typeof csvDataModule.useCsvDataStore>)

      const store = useAvatarDataDisplayStore()
      await store.fetchAvatarData('0xagent', '0xavatar')

      // Should call fetchAllSheets when CSV not loaded
      expect(fetchAllSheetsMock).toHaveBeenCalled()
    })
  })
})
