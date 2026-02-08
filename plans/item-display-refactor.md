# Plan: Refactoring Character Item Components

## 1. Type Standardization

Define a comprehensive interface `ItemDisplayData` in `src/types/item.ts` that includes all necessary fields after CSV enrichment:

```typescript
export type ItemType = 'equipment' | 'costume' | 'material' | 'rune'

export interface ItemStat {
  label: string
  value: string | number
}

export interface ItemSkill {
  id: string
  name?: string
  description?: string
}

export interface ItemDisplayData {
  /** Template ID (Excel ID) */
  id: number
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
  /** Whether the item is currently equipped by the avatar */
  isEquipped?: boolean
  /** Combat Power contribution */
  cp?: number
  /** Minimum character level required to use/equip (from ItemRequirementSheet) */
  levelReq?: number
  /** Elemental attribute (NORMAL, FIRE, WATER, etc.) */
  elementalType?: string
  /** Formatted stats for tooltip display */
  stats?: ItemStat[]
  /** List of skills attached to the item */
  skills?: ItemSkill[]
  /** Flag to show purple star */
  hasSkill?: boolean
  /** List of option stat types to show yellow stars */
  optionStatTypes?: string[]
  /** Rune ticker for asset resolution */
  tickerRune?: string
  /** Raw stats mapping from blockchain data */
  statsMap?: Record<string, number>
  /** Minimum block index required (for some materials) */
  requiredBlockIndex?: number
  /** Item sub-type (e.g., WEAPON, ARMOR, RING) */
  itemSubType?: string
  /** Pre-resolved grade color hex */
  gradeColor?: string
}
```

## 2. Atoms Implementation (`src/components/character/atoms/`)

- `GradeBackground.vue`: Frame based on grade.
- `ItemImage.vue`: Main icon logic.
- `StarIcon.vue`: Single star (gold/purple).
- `EquipTag.vue`: Equipped status icon.
- `StatRow.vue`: Key-value pair for stats.

## 3. Molecules Implementation (`src/components/character/molecules/`)

- `StarSystem.vue`: Star background + ordered stars (Purple first, then Gold).
- `ItemTooltip.vue`: Structured detail view for Popover.

## 4. Organism Implementation

- `ItemIcon.vue`: Combined component with optimized computed properties and strict props.

## 5. Table Updates

- Refactor `EquipmentTable.vue`, `MaterialTable.vue`, and `RuneTable.vue` to use the new `ItemIcon` and proper types.

## 6. CSS Optimization

- Standardize z-index layers.
- Apply grade-based coloring using constants.
