/**
 * @file types/item.ts
 * @description Standardized interfaces for item display components.
 * Ensures Type-Safety across the character component library.
 */

import type { StatsMap } from './character'

export type ItemType = 'equipment' | 'costume' | 'material' | 'rune'

export type ItemSubType =
  | 'WEAPON'
  | 'ARMOR'
  | 'NECKLACE'
  | 'BELT'
  | 'RING'
  | 'RING1'
  | 'RING2'
  | 'AURA'
  | 'GRIMOIRE'
  | 'FULL_COSTUME'
  | 'TITLE'
  | 'CONSUMABLE'
  | 'MATERIAL'
  | 'RUNE_STAT'
  | 'RUNE_SKILL'

/**
 * Interface for a single item statistic.
 */
export interface ItemStat {
  label: string
  value: string | number
}

/**
 * Interface for an item skill.
 */
export interface ItemSkill {
  id: string
  name: string
  description?: string
  power?: number
  chance?: number
  statPowerRatio?: number
  referencedStatType?: string
}

/**
 * Unified interface for displaying any type of item in the UI.
 * This helps decouple components from raw API/GQL data structures.
 */
export interface ItemDisplayData {
  /** Template ID (Excel ID) */
  id: number
  /** Avatar address associated with this item */
  avatarAddress?: string
  /** Blockchain GUID or Hash */
  itemId?: string | number
  /** Localized name resolved from CSV */
  name: string
  /** Numeric grade (1-6) */
  grade: number
  /** Broad classification for UI logic */
  type: ItemType
  /** Enhancement level (e.g., +10) */
  level?: number
  /** Quantity (for materials/consumables) */
  count?: number
  /** Tradable quantity (for materials) */
  tradableCount?: number
  /** Whether the item is currently equipped by the avatar */
  isEquipped?: boolean
  /** Combat Power contribution */
  cp?: number
  /** Minimum character level required to use/equip */
  levelReq?: number
  /** Elemental attribute (NORMAL, FIRE, WATER, etc.) */
  elementalType?: string
  /** Formatted stats for tooltip display (Main stats like HP, ATK, DEF) */
  stats?: ItemStat[]
  /** List of skills attached to the item */
  skills?: ItemSkill[]
  /** Flag to show purple star (Skill attribute) */
  hasSkill?: boolean
  /** Count of skills for purple stars */
  skillsCount?: number
  /** List of option stat types to show yellow stars */
  optionStatTypes?: string[]
  /** Count of option stats for yellow stars */
  optionStatsCount?: number
  /** Rune ticker for asset resolution */
  tickerRune?: string
  /** Rune classification (STAT or SKILL) */
  runeType?: 'STAT' | 'SKILL'
  /** Raw stats mapping from blockchain data */
  statsMap?: StatsMap
  /** Minimum block index required (for some materials) */
  requiredBlockIndex?: number
  /** Item sub-type (e.g., WEAPON, ARMOR, RING) */
  itemSubType?: ItemSubType
  /** Pre-resolved grade color hex */
  gradeColor?: string
  /** Experience points (for equipment/costumes if applicable) */
  exp?: number
  /** Skills details for specific UI displays */
  skillsDetails?: {
    id: string
    power?: number
    chance?: number
  }[]
  /** Pre-resolved asset image URL */
  imageUrl?: string
}
