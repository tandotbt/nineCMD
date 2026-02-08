/**
 * @file src/__tests__/helpers/logicFactories.ts
 * @description Factories to create mock data for pure logic tests without external dependencies.
 */

import { CHARACTER_LOGIC_CONSTANTS } from '../../constants'
import type { AvatarData } from '../../types/character'
import realAvatarFixture from '../unit/fixtures/real_avatar_data.json'

/**
 * Creates a mock AvatarData for testing.
 * Uses real avatar data from fixtures as base.
 */
export function createMockAvatar(overrides: Partial<AvatarData> = {}): AvatarData {
  const base = realAvatarFixture.avatar
  return {
    address: base.address,
    name: base.name,
    level: base.level,
    exp: base.exp,
    ncg: 100,
    crystal: 50,
    stage: 3, // From stageMap pairs [[3, 1]]
    worldId: 1,
    ap: 120,
    maxAp: 120,
    cp: 10000,
    adventureCp: 8000,
    portraitId: 10200000,
    rank: 100,
    dailyRewardReceivedIndex: base.dailyRewardReceivedIndex,
    dailyRewardReceivedBlockIndex: 0,
    timeRefill: 0,
    timeRefillReal: 0,
    dailyRewardInterval: CHARACTER_LOGIC_CONSTANTS.AP.DAILY_REFILL_INTERVAL,
    apCost: CHARACTER_LOGIC_CONSTANTS.AP.COST_DEFAULT,
    inventory: {
      equipments: (base.inventory.equipments as unknown[]).map((item) => {
        const eq = item as {
          id: number
          itemId: string
          level: number
          equipped: boolean
          statsMap: Record<string, number>
          skills?: { id: string }[]
        }
        return {
          id: String(eq.itemId),
          itemId: eq.id,
          level: eq.level,
          grade: 1,
          equipped: eq.equipped,
          itemType: 'Equipment',
          itemSubType: 'Weapon',
          elementalType: 'NORMAL',
          statsMap: eq.statsMap as unknown as AvatarData['inventory']['equipments'][0]['statsMap'],
          skills: (eq.skills || []).map((s) => ({ id: String(s.id) })),
          buffSkills: [],
          CP: 0,
        }
      }),
      costumes: [],
      materials: [],
    },
    runeSlots: [],
    runes: [],
    craftingSlots: [],
    stakeNCG: 0,
    isHasCraftOneTime: false,
    isClaimPatrolRewardOneTime: false,
    claimedGifts: [],
    gifts: [],
    summons: [],
    eventDungeonInfo: {
      roundReset: 1,
      ticket: 3,
      ticketBuyed: 0,
      stageIdUnlocked: 0,
      currentTurn: 1,
      totalTurns: 1,
      currentRoundStartBlock: 0,
      currentRoundEndBlock: 0,
    },
    worldBossInfoTotal: null,
    worldBossInfoAvatar: null,
    materialList:
      overrides.inventory?.materials?.reduce(
        (acc, m) => {
          acc[m.id] = (acc[m.id] || 0) + m.count
          return acc
        },
        {} as Record<number, number>,
      ) || {},
    timestamp: Date.now(),
    ...overrides,
  }
}

/**
 * Creates a mock inventory item (Equipment).
 */
export function createMockEquipment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    itemId: 101000,
    level: 1,
    grade: 1,
    equipped: false,
    itemType: 'Equipment',
    itemSubType: 'Weapon',
    elementalType: 'NORMAL',
    statsMap: { hP: 100, aTK: 10, dEF: 5, cRI: 1, hIT: 1, sPD: 1 },
    skills: [],
    buffSkills: [],
    CP: 0,
    ...overrides,
  }
}

/**
 * Creates mock automation settings.
 */
export function createMockAutomationSettings(overrides: Record<string, unknown> = {}) {
  return {
    enabled: true,
    checkIntervalBlocks: 10,
    notificationsEnabled: true,
    refillApEnabled: true,
    apThreshold: 10,
    ...overrides,
  }
}
