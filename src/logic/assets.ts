/**
 * @file logic/assets.ts
 * @description Standardized logic for resolving asset URLs (images, icons).
 */

import { ASSET_BASE_URL, GAME_ASSETS } from '@/constants'

export interface AssetParams {
  portraitId?: string | number | null
  element?: string | null
  tickerRune?: string | null
}

/**
 * Resolves the full URL for a game asset based on its type and ID.
 */
export function resolveAssetUrl({ portraitId, element, tickerRune }: AssetParams): string {
  // 1. Resolve Item / Portrait Icons
  if (portraitId !== undefined && portraitId !== null && portraitId !== '') {
    return `${ASSET_BASE_URL}/Icons/Item/${portraitId}.png`
  }

  // 2. Resolve Elemental Type Icons
  if (element !== undefined && element !== null && element !== '') {
    const el = element.toUpperCase()
    const eleString = el === 'NORMAL' ? 'element' : 'elemental'
    return `${ASSET_BASE_URL}/Icons/ElementalType/icon_${eleString}_${element.toLowerCase()}.png`
  }

  // 3. Resolve Fungible Asset / Rune Icons
  if (tickerRune !== undefined && tickerRune !== null && tickerRune !== '') {
    return `${ASSET_BASE_URL}/Icons/FungibleAssetValue/${tickerRune}.png`
  }

  return ''
}

/**
 * Helper to resolve Avatar portrait URL
 */
export function resolveAvatarUrl(portraitId: number | string): string {
  return resolveAssetUrl({ portraitId })
}

/**
 * Helper to resolve Equipment/Item icon URL
 */
export function resolveItemUrl(itemId: number | string): string {
  return resolveAssetUrl({ portraitId: itemId })
}

/**
 * Helper to resolve Costume icon URL
 */
export function resolveCostumeUrl(itemId: number | string): string {
  return resolveAssetUrl({ portraitId: itemId })
}

/**
 * Helper to resolve Rune icon URL
 */
export function resolveRuneUrl(tickerRune: string): string {
  return resolveAssetUrl({ tickerRune })
}

/**
 * Standardized grade colors.
 */
export const GRADE_COLORS: Record<number, string> = {
  1: '#83726d', // Normal
  2: '#3eab5a', // Uncommon
  3: '#4263b7', // Rare
  4: '#b79442', // Epic
  5: '#ab42b7', // Legendary
  6: '#ad1217', // Mythical
  7: '#008785',
}

/**
 * Gets the hex color associated with a grade.
 */
export function getGradeColor(grade: string | number | undefined): string {
  const g = Number(grade) || 1
  const color = GRADE_COLORS[g]
  if (color === undefined) {
    return GRADE_COLORS[1] || '#83726d'
  }
  return color
}

/**
 * Gets the local asset URL for a grade background (Item Icon background).
 */
export function getGradeBackgroundUrl(grade: string | number | undefined): string {
  const g = Number(grade) || 1
  return GAME_ASSETS.ITEMS.GRADE_BG(g)
}

/**
 * Gets the local asset URL for a grade option background (Star area background).
 */
export function getGradeOptionBackgroundUrl(grade: string | number | undefined): string {
  const g = Number(grade) || 1
  return GAME_ASSETS.ITEMS.GRADE_OPTION_BG(g)
}

/**
 * Gets the local asset URL for option icons (stat/skill stars).
 */
export function getOptionIconUrl(type: 'stat' | 'skill'): string {
  return type === 'stat' ? GAME_ASSETS.ITEMS.OPTION_STAT : GAME_ASSETS.ITEMS.OPTION_SKILL
}

/**
 * Gets the local asset URL for the equip icon.
 */
export function getEquipIconUrl(): string {
  return GAME_ASSETS.ITEMS.EQUIP_ICON
}

/**
 * Gets the local asset URL for the tooltip grade bar background (Tooltip cover).
 */
export function getTooltipGradeBgUrl(grade: string | number | undefined): string {
  const g = Number(grade) || 1
  return GAME_ASSETS.ITEMS.GRADE_TOOLTIP_BG(g)
}

/**
 * Gets the local asset URL for the tooltip cover image (decorative background).
 */
export function getTooltipCoverUrl(grade: string | number | undefined): string {
  const g = Number(grade) || 1
  return GAME_ASSETS.ITEMS.GRADE_TOOLTIP_BG(g)
}
