import { describe, it, expect, vi, beforeEach } from 'vitest'
import { evaluateAutomation, estimateVirtualBlock } from '@/logic/decision'
import { aggregateAvatarData } from '@/logic/character'
import { AUTOMATION_LOGIC, CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import type { RawAvatarDetail } from '@/types/character'

// Import Odin fixtures
import headlessFixture from '../fixtures/odin/headless.json'
import mimirFixture from '../fixtures/odin/mimir.json'
import restFixture from '../fixtures/odin/9cmd.json'

describe('Automation Decision Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  interface TestHeadlessFixture {
    stateQuery: {
      agent: { gold: string; crystal: string }
      stakeState: { deposit: string }
      [key: string]: unknown
    }
  }

  /**
   * Helper to create AvatarData using production aggregation logic and real fixtures.
   */
  const getRealAvatarData = (overrides: { ap?: number; currentBlock?: number } = {}) => {
    const address = '79BB6e025762A76C8C85F73581e8c49b68FcaB0C'
    const timestamp = 1700000000 // Mock timestamp

    const headless = headlessFixture as unknown as TestHeadlessFixture

    // Normalize headless fixture (handle dynamic keys from Odin API)
    const normalizedHeadless = {
      stateQuery: {
        agent: headless.stateQuery.agent,
        unlockedWorldIds: headless.stateQuery[`unlockedWorldIds_${address}`] as number[],
        avatar: headless.stateQuery[
          `avatar_${address}`
        ] as RawAvatarDetail['headless']['stateQuery']['avatar'],
        stakeState: headless.stateQuery.stakeState,
      },
    }

    const raw: RawAvatarDetail = {
      headless: normalizedHeadless as RawAvatarDetail['headless'],
      mimir: {
        ...mimirFixture,
        actionPoint: overrides.ap ?? mimirFixture.actionPoint,
      } as unknown as RawAvatarDetail['mimir'],
      rest: restFixture as unknown as RawAvatarDetail['rest'],
      seasonPass: [],
      timestamp,
    }

    // Use production aggregation logic
    // We pass empty sheets for now as decision logic mostly relies on numeric values
    // calculated during aggregation (ap, timeRefill, apCost).
    return aggregateAvatarData(raw, {}, 'en', 10, overrides.currentBlock)
  }

  describe('evaluateAutomation', () => {
    it('should return IDLE when no conditions are met', () => {
      // AP is full (120), refill not available
      const avatar = getRealAvatarData({
        ap: 120,
        currentBlock: mimirFixture.dailyRewardReceivedBlockIndex + 10,
      })

      const result = evaluateAutomation(avatar, 10000, {
        [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
      })
      expect(result.action).toBe('IDLE')
    })

    it('should return REFILL_AP when AP is low and refill is available', () => {
      const { AP } = CHARACTER_LOGIC_CONSTANTS
      // Set AP below threshold (apCost is 5 for this avatar due to 5000 NCG stake)
      // Set currentBlock so that timeRefill >= dailyRewardInterval
      const avatar = getRealAvatarData({
        ap: 2,
        currentBlock: mimirFixture.dailyRewardReceivedBlockIndex + AP.DAILY_REFILL_INTERVAL + 1,
      })

      const result = evaluateAutomation(avatar, 10000, {
        [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
      })
      expect(result.action).toBe(AUTOMATION_LOGIC.ACTIONS.REFILL_AP)
      expect(result.priority).toBe(AUTOMATION_LOGIC.PRIORITY.HIGH)
    })

    it('should return IDLE when feature is disabled', () => {
      const { AP } = CHARACTER_LOGIC_CONSTANTS
      const avatar = getRealAvatarData({
        ap: 2,
        currentBlock: mimirFixture.dailyRewardReceivedBlockIndex + AP.DAILY_REFILL_INTERVAL + 1,
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
