/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AUTOMATION_LOGIC, CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import { evaluateAutomation, checkAPRefillCondition } from '@/logic/decision'
import type { AvatarDetailHeadless, AvatarData } from '@/types/character'
import fs from 'fs'
import path from 'path'

/**
 * AutomationDecision.test.ts
 * Test logic quyết định automation sử dụng dữ liệu thật từ fixture.
 */

describe('Automation Decision Logic with Real Data', () => {
  let realData: { agent: unknown; avatar: AvatarDetailHeadless }

  beforeEach(() => {
    setActivePinia(createPinia())
    const fixturePath = path.resolve(__dirname, 'fixtures/real_avatar_data.json')
    if (!fs.existsSync(fixturePath)) {
      throw new Error('Real data fixture not found. Run RealDataConsistency.test.ts first.')
    }
    realData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
  })

  it('should evaluate AP refill condition correctly with real data', () => {
    const { avatar } = realData

    const { AP } = CHARACTER_LOGIC_CONSTANTS
    // Giả lập AvatarData từ AvatarDetailHeadless
    const mockAvatarData: Partial<AvatarData> = {
      address: avatar.address,
      ap: 50, // Giả lập AP thấp
      apCost: AP.COST_DEFAULT,
      timeRefill: AP.DAILY_REFILL_INTERVAL + 1, // Giả lập đã đến lúc refill
      timeRefillReal: 0,
      dailyRewardInterval: AP.DAILY_REFILL_INTERVAL,
    }

    const decision = checkAPRefillCondition(mockAvatarData as AvatarData, 60)

    expect(decision).not.toBeNull()
    expect(decision?.action).toBe(AUTOMATION_LOGIC.ACTIONS.REFILL_AP)
    expect(decision?.reason).toContain('AP (50) is below threshold (60)')
  })

  it('should return IDLE when conditions are not met', () => {
    const { avatar } = realData
    const { AP } = CHARACTER_LOGIC_CONSTANTS

    const mockAvatarData: Partial<AvatarData> = {
      address: avatar.address,
      ap: 100,
      apCost: AP.COST_DEFAULT,
      timeRefill: 100, // Chưa đến lúc refill
      timeRefillReal: AP.DAILY_REFILL_INTERVAL - 100,
      dailyRewardInterval: AP.DAILY_REFILL_INTERVAL,
    }

    const result = evaluateAutomation(
      mockAvatarData as AvatarData,
      10000000,
      { [AUTOMATION_LOGIC.IDS.REFILL_AP]: true },
      { apRefillThreshold: 60 },
      [],
    )

    expect(result.action).toBe(AUTOMATION_LOGIC.ACTIONS.IDLE)
  })

  it('should handle priority correctly when multiple conditions are met', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    const mockAvatarData: Partial<AvatarData> = {
      address: '0x123',
      ap: 10,
      apCost: AP.COST_DEFAULT,
      timeRefill: AP.DAILY_REFILL_INTERVAL + 1,
      dailyRewardInterval: AP.DAILY_REFILL_INTERVAL,
    }

    const result = evaluateAutomation(
      mockAvatarData as AvatarData,
      10000000,
      { [AUTOMATION_LOGIC.IDS.REFILL_AP]: true },
      { apRefillThreshold: 60 },
    )

    expect(result.action).toBe(AUTOMATION_LOGIC.ACTIONS.REFILL_AP)
    expect(result.priority).toBe(AUTOMATION_LOGIC.PRIORITY.HIGH)
  })
})
