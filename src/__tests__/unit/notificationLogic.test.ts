import { describe, it, expect, vi, beforeEach } from 'vitest'
import { evaluateAutomation, estimateVirtualBlock } from '@/logic/decision'
import { AUTOMATION_LOGIC, CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import type { AvatarData } from '@/stores/useCharacterStore'

describe('Automation Decision Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  const mockAvatar = (overrides: Partial<AvatarData> = {}): AvatarData =>
    ({
      name: 'Test Avatar',
      address: '0x123',
      level: 1,
      exp: 0,
      ncg: 0,
      crystal: 0,
      stage: 1,
      worldId: 1,
      ap: 50,
      maxAp: 120,
      cp: 0,
      adventureCp: 0,
      portraitId: 0,
      rank: 0,
      dailyRewardReceivedIndex: 0,
      dailyRewardReceivedBlockIndex: 0,
      timeRefill: 0,
      timeRefillReal: 0,
      dailyRewardInterval: CHARACTER_LOGIC_CONSTANTS.AP.DAILY_REFILL_INTERVAL,
      apCost: 5,
      inventory: {
        equipments: [],
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
      eventDungeonInfo: {
        roundReset: 0,
        ticket: 0,
        ticketBuyed: 0,
        stageIdUnlocked: 0,
        currentTurn: 0,
        totalTurns: 0,
        currentRoundStartBlock: 0,
        currentRoundEndBlock: 0,
      },
      worldBossInfoTotal: null,
      worldBossInfoAvatar: null,
      materialList: {},
      timestamp: Date.now(),
      ...overrides,
    }) as AvatarData

  describe('evaluateAutomation', () => {
    it('should return IDLE when no conditions are met', () => {
      const avatar = mockAvatar({
        ap: 100,
        timeRefill: 1000,
      })
      const result = evaluateAutomation(avatar, 10000, {
        [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
      })
      expect(result.action).toBe('IDLE')
    })

    it('should return REFILL_AP when AP is low and refill is available', () => {
      const { AP } = CHARACTER_LOGIC_CONSTANTS
      const avatar = mockAvatar({
        ap: 2,
        apCost: AP.COST_DEFAULT,
        timeRefill: AP.DAILY_REFILL_INTERVAL + 1,
      })
      const result = evaluateAutomation(avatar, 10000, {
        [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
      })
      expect(result.action).toBe(AUTOMATION_LOGIC.ACTIONS.REFILL_AP)
      expect(result.priority).toBe(AUTOMATION_LOGIC.PRIORITY.HIGH)
    })

    it('should return IDLE when feature is disabled', () => {
      const { AP } = CHARACTER_LOGIC_CONSTANTS
      const avatar = mockAvatar({
        ap: 2,
        apCost: AP.COST_DEFAULT,
        timeRefill: AP.DAILY_REFILL_INTERVAL + 1,
      })
      const result = evaluateAutomation(avatar, 10000, {
        [AUTOMATION_LOGIC.IDS.REFILL_AP]: false,
      })
      expect(result.action).toBe('IDLE')
    })
  })

  describe('estimateVirtualBlock', () => {
    it('should correctly estimate virtual blocks passed', () => {
      const lastKnownBlock = 100
      const lastKnownTimestamp = Date.now()
      const averageBlockTimeMs = 10000 // 10s per block

      // Advance time by 35 seconds
      vi.advanceTimersByTime(35000)

      const virtualBlock = estimateVirtualBlock(
        lastKnownBlock,
        lastKnownTimestamp,
        averageBlockTimeMs,
      )

      expect(virtualBlock).toBe(103) // 100 + floor(35/10)
    })
  })
})
