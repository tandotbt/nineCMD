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
      ap: 50,
      apCost: 5,
      timeRefill: 0,
      timeRefillReal: 0,
      dailyRewardReceivedBlockIndex: 0,
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
