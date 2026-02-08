import { describe, it, expect } from 'vitest'
import { evaluateAutomation } from '../../logic/decision'
import { createMockAvatar } from '../helpers/logicFactories'
import { AUTOMATION_LOGIC, CHARACTER_LOGIC_CONSTANTS } from '../../constants'

describe('Pure Logic: Automation Decision Engine', () => {
  it('should recommend REFILL_AP when AP is below threshold', () => {
    const { AP } = CHARACTER_LOGIC_CONSTANTS
    const avatar = createMockAvatar({
      ap: 5, // Low AP
      timeRefill: AP.DAILY_REFILL_INTERVAL + 1, // Ready to refill
      dailyRewardInterval: AP.DAILY_REFILL_INTERVAL,
      apCost: AP.COST_DEFAULT,
    })

    const settings = {
      apRefillThreshold: 10,
    }

    const enabledFeatures = {
      [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
    }

    const decision = evaluateAutomation(avatar, 0, enabledFeatures, settings)

    expect(decision.action).toBe(AUTOMATION_LOGIC.ACTIONS.REFILL_AP)
    expect(decision.reason).toContain('is below threshold')
  })

  it('should remain IDLE when AP is sufficient', () => {
    const avatar = createMockAvatar({
      ap: 50,
    })

    const settings = {
      apRefillThreshold: 10,
    }

    const enabledFeatures = {
      [AUTOMATION_LOGIC.IDS.REFILL_AP]: true,
    }

    const decision = evaluateAutomation(avatar, 0, enabledFeatures, settings)

    expect(decision.action).toBe(AUTOMATION_LOGIC.ACTIONS.IDLE)
  })
})
