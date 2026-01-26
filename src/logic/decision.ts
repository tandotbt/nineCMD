/**
 * @file logic/decision.ts
 * @description Centralized decision logic for automation.
 * Follows the Fetch -> Store -> Diff -> Decision -> Action rule.
 */

import { AUTOMATION_LOGIC, CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import type { AvatarData } from '@/types/character'
import type { StateChange } from './diff'

export interface DecisionResult {
  action: string
  reason: string
  priority: number
}

export interface ConditionMetric {
  label: string
  value: string | number
  threshold: string | number
  isMet: boolean
  percentage: number
}

export interface AutomationMetric {
  id: string
  label: string
  metrics: ConditionMetric[]
  isReady: boolean
}

/**
 * Checks if the character needs an AP refill.
 * Based on current AP, AP threshold, and refill timer.
 */
export function checkAPRefillCondition(
  character: AvatarData,
  threshold: number = 0,
  dailyRewardIntervalOverride?: number,
): DecisionResult | null {
  const { AP } = CHARACTER_LOGIC_CONSTANTS
  const dailyRewardInterval =
    dailyRewardIntervalOverride || character.dailyRewardInterval || AP.DAILY_REFILL_INTERVAL

  const canRefill = character.timeRefill >= dailyRewardInterval || character.timeRefillReal === 1
  const effectiveThreshold = threshold > 0 ? threshold : character.apCost
  const needsAP = character.ap < effectiveThreshold

  if (needsAP && canRefill) {
    return {
      action: AUTOMATION_LOGIC.ACTIONS.REFILL_AP,
      reason: `AP (${character.ap}) is below threshold (${effectiveThreshold}) and refill is available.`,
      priority: AUTOMATION_LOGIC.PRIORITY.HIGH,
    }
  }

  return null
}

/**
 * Provides metrics for AP Refill for UI display.
 */
export function getAPRefillMetrics(
  character: AvatarData | null,
  customThreshold: number = 0,
): AutomationMetric {
  const { AP } = CHARACTER_LOGIC_CONSTANTS
  const dailyRewardInterval = character?.dailyRewardInterval || AP.DAILY_REFILL_INTERVAL

  if (!character) {
    return {
      id: AUTOMATION_LOGIC.IDS.REFILL_AP,
      label: AUTOMATION_LOGIC.LABELS.REFILL_AP,
      isReady: false,
      metrics: [],
    }
  }

  const effectiveThreshold = customThreshold > 0 ? customThreshold : character.apCost

  const apMetric: ConditionMetric = {
    label: AUTOMATION_LOGIC.LABELS.AP_LEVEL,
    value: character.ap,
    threshold: effectiveThreshold,
    isMet: character.ap < effectiveThreshold,
    percentage: Math.min(100, (character.ap / effectiveThreshold) * 100),
  }

  const refillMetric: ConditionMetric = {
    label: AUTOMATION_LOGIC.LABELS.REFILL_TIMER,
    value: character.timeRefill,
    threshold: dailyRewardInterval,
    isMet: character.timeRefill >= dailyRewardInterval || character.timeRefillReal === 1,
    percentage: Math.min(100, (character.timeRefill / dailyRewardInterval) * 100),
  }

  return {
    id: AUTOMATION_LOGIC.IDS.REFILL_AP,
    label: AUTOMATION_LOGIC.LABELS.REFILL_AP,
    isReady: apMetric.isMet && refillMetric.isMet,
    metrics: [apMetric, refillMetric],
  }
}

/**
 * Type for automation check functions.
 */
type AutomationCheck = (
  character: AvatarData,
  currentBlock: number,
  settings: Record<string, unknown>,
  changes: StateChange[],
) => DecisionResult | null

/**
 * List of all active automation checks.
 */
const AUTOMATION_CHECKS: Record<string, AutomationCheck> = {
  [AUTOMATION_LOGIC.IDS.REFILL_AP]: (char, _, settings) =>
    checkAPRefillCondition(
      char,
      (settings.apRefillThreshold as number) || 0,
      settings.dailyRewardInterval as number,
    ),
}

/**
 * Evaluates enabled conditions and returns the best action.
 */
export function evaluateAutomation(
  character: AvatarData | null,
  currentBlock: number,
  enabledFeatures: Record<string, boolean> = {},
  extraSettings: Record<string, unknown> = {},
  changes: StateChange[] = [],
): DecisionResult {
  // Ensure we only log keys that are actually true
  const activeFeatures = Object.keys(enabledFeatures).filter((k) => enabledFeatures[k])
  console.log(`[Decision] Evaluating for ${character?.name}. Enabled:`, activeFeatures)
  if (!character) {
    return {
      action: AUTOMATION_LOGIC.ACTIONS.IDLE,
      reason: 'No character data available',
      priority: AUTOMATION_LOGIC.PRIORITY.LOW,
    }
  }

  const decisions: DecisionResult[] = []

  for (const [featureId, check] of Object.entries(AUTOMATION_CHECKS)) {
    if (enabledFeatures[featureId]) {
      try {
        const result = check(character, currentBlock, extraSettings, changes)
        if (result) {
          console.log(`[Decision] Feature ${featureId} produced action: ${result.action}`)
          decisions.push(result)
        }
      } catch (err) {
        console.error(`Error in automation check [${featureId}]:`, err)
      }
    }
  }

  // Sort by priority and return the highest
  if (decisions.length > 0) {
    const sorted = decisions.sort((a, b) => b.priority - a.priority)
    return sorted[0] as DecisionResult
  }

  return {
    action: AUTOMATION_LOGIC.ACTIONS.IDLE,
    reason: 'No actions required or enabled',
    priority: AUTOMATION_LOGIC.PRIORITY.LOW,
  }
}

/**
 * Estimates the current block index when offline.
 */
export function estimateVirtualBlock(
  lastKnownBlock: number,
  lastKnownTimestamp: number,
  averageBlockTimeMs: number,
): number {
  const now = Date.now()
  const elapsedMs = now - lastKnownTimestamp
  if (elapsedMs <= 0 || averageBlockTimeMs <= 0) return lastKnownBlock

  const blocksPassed = Math.floor(elapsedMs / averageBlockTimeMs)
  return lastKnownBlock + blocksPassed
}
