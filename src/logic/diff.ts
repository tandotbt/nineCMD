/**
 * @file logic/diff.ts
 * @description State diffing logic for character data and automation.
 * Uses microdiff for efficient object comparison.
 */

import diff from 'microdiff'
import type { AvatarData } from '@/types/character'

export interface StateChange {
  path: (string | number)[]
  type: 'CREATE' | 'REMOVE' | 'CHANGE'
  value?: unknown
  oldValue?: unknown
}

/**
 * Compares two character states and returns significant changes.
 * Significant changes are those that might trigger or affect automation.
 */
export function getSignificantChanges(
  oldState: AvatarData | null,
  newState: AvatarData,
): StateChange[] {
  if (!oldState) return []

  const allChanges = diff(oldState, newState)

  // Filter for significant changes to avoid noise
  // We care about: level, stage, ap, cp, ncg, crystal, inventory counts
  const significantPaths = [
    'level',
    'stage',
    'ap',
    'cp',
    'ncg',
    'crystal',
    'dailyRewardReceivedIndex',
    'inventory',
  ]

  return allChanges
    .filter((change) => {
      const rootPath = change.path[0] as string
      return significantPaths.includes(rootPath)
    })
    .map((change) => {
      const base: StateChange = {
        path: change.path,
        type: change.type as 'CREATE' | 'REMOVE' | 'CHANGE',
      }
      if (change.type === 'CHANGE' || change.type === 'CREATE') {
        const c = change as { value: unknown; oldValue?: unknown }
        return { ...base, value: c.value, oldValue: c.oldValue }
      }
      return base
    })
}

/**
 * Specifically checks for level up.
 */
export function checkLevelUp(changes: StateChange[]): number | null {
  const levelChange = changes.find((c) => c.path.length === 1 && c.path[0] === 'level')
  if (levelChange && levelChange.type === 'CHANGE') {
    return levelChange.value as number
  }
  return null
}

/**
 * Checks if any new items were added to inventory.
 */
export function getNewItems(changes: StateChange[]): StateChange[] {
  return changes.filter(
    (c) =>
      c.path[0] === 'inventory' &&
      (c.path[1] === 'equipments' || c.path[1] === 'materials' || c.path[1] === 'costumes') &&
      c.type === 'CREATE',
  )
}
