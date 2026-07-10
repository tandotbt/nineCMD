/**
 * Avatar Data Types – Interfaces for avatar data display feature
 */

import type { CsvRow } from './csvData'

// ============================================================
// GraphQL Response Shapes (raw from API)
// ============================================================

/** Agent balance data (stateQuery.agent) */
export interface AgentBalance {
  gold: string
  crystal: string
}

/** Stake state entry (stateQuery.stakeStates[]) */
export interface StakeState {
  deposit: string
}

/** Stage map pairs (avatar.stageMap) — raw GraphQL returns [[stageId, worldId], ...] tuples */
export interface StageMap {
  pairs: Array<[number | string, number | string]>
  count: number
}

/** Rune entry (avatar.runes[]) */
export interface RuneEntry {
  runeId: string
  level: number
}

/** Equipment stat (inventory.all[].stat) */
export interface EquipmentStat {
  statType: string
  baseValue: number
  totalValue: number
  additionalValue: number
}

/** Equipment skill (inventory.all[].skills[] / buffSkills[]) */
export interface EquipmentSkill {
  id: number
  elementalType: string
  power: number
  chance: number
  statPowerRatio: number
  referencedStatType: string
}

/** Equipment stats map — from GraphQL statsMap field */
export interface StatsMap extends Record<string, number> {
  hP: number
  aTK: number
  dEF: number
  cRI: number
  hIT: number
  sPD: number
}

/** Equipment item from GraphQL (inventory.all[]) */
export interface EquipmentItem {
  grade: number
  id: number
  itemType: string
  itemSubType: string
  elementalType: string
  requiredBlockIndex: number
  setId: number
  stat: EquipmentStat
  equipped: boolean
  itemId: number
  level: number
  skills: EquipmentSkill[]
  buffSkills: EquipmentSkill[]
  statsMap: StatsMap
}

/** Equipment item with enriched data (from funcFillMoreInfo.equipment) */
export interface EnrichedEquipment extends EquipmentItem {
  indexKey: number
  title: string
  name: string
  cp: number
  skills: Array<EquipmentSkill & { name: string; dataStat: CsvRow | unknown[] }>
  statArray: StatSkillResult
  levelReq: number
}

/** Costume item from GraphQL (inventory.costumes[]) */
export interface CostumeItem {
  grade: number
  id: number
  itemType: string
  itemSubType: string
  elementalType: string
  requiredBlockIndex: number
  itemId: number
  equipped: boolean
}

/** Costume item with enriched data (from funcFillMoreInfo.costumes) */
export interface EnrichedCostume extends CostumeItem {
  indexKey: number
  title: string
  name: string
  statsMap: Record<string, number>
  cp: number
  statArray: StatSkillResult
  levelReq: number
}

/** Material item from GraphQL (inventory.materials[]) */
export interface MaterialItem {
  id: number
}

/** Consumable item from GraphQL (inventory.consumables[]) */
export interface ConsumableItem {
  id: number
}

/** Deduped consumable (from funcFillMoreInfo.consumables) */
export interface DedupedConsumable {
  id: number
  count: number
  itemIdList: number[]
  name: string
  levelReq: number
}

/** Inventory from GraphQL (avatar.inventory) */
export interface InventoryData {
  equipped: Array<{ itemSubType: string; id: number }>
  all: EquipmentItem[]
  costumes: CostumeItem[]
  materials: MaterialItem[]
  consumables: ConsumableItem[]
}

/** Combination slot (avatar.combinationSlots[]) */
export interface CombinationSlot {
  address: string
  petId: number
  index: number
  isUnlocked: boolean
  startBlockIndex: number
  unlockBlockIndex: number
}

/** Item map pairs (avatar.itemMap) */
export interface ItemMap {
  count: number
  pairs: Array<{ key: string; value: string }>
}

/** Avatar data from GraphQL (stateQuery.avatar) */
export interface AvatarGraphQL {
  address: string
  name: string
  level: number
  actionPoint: number
  dailyRewardReceivedIndex: number
  stageMap: StageMap
  runes: RuneEntry[]
  inventory: InventoryData
  itemMap: ItemMap
  combinationSlots: CombinationSlot[]
}

// ============================================================
// Processed Data (computed in store)
// ============================================================

/** Character info — processed from raw GraphQL for display */
export interface CharacterInfo {
  name: string
  level: number
  stageClearedId: number
  actionPoint: number
  apCost: number
  gold: string
  crystal: string
  stakeNCG: string
  dailyRewardReceivedIndex: number
  unlockedWorldIds: number[]
  cpData: CpRankingData | null
}

/** CP ranking data */
export interface CpRankingData {
  rank: number
  cp: number
  armorId: number
  portraitId: number
}

/** Stat and skill result — port from src/utilities/gearCombatPotion.js statAndSkillOption */
export interface StatSkillResult {
  listStat: string[]
  mainStat: Record<string, number>
  optionStat: Record<string, number>
  isHasSkill: boolean
}

// ============================================================
// REST API Shapes (Step 3 — getDataGraphql)
// ============================================================

/** Equipment set response from getDataGraphql (lookupItemSetMuti_*) */
export interface EquipmentSetResponse {
  costumes: string[]
  equipments: string[]
}

/** Rune slot entry from getDataGraphql (lookupRuneSetMuti_*) */
export interface RuneSlotEntry {
  index: number
  isLock: boolean
  runeId: number | null
  runeSlotType: string
  runeType: string
}

/** World boss total info from REST API response (other_lookupWorldBossInfoTotal_{id}) */
export interface WorldBossInfo {
  id: string
  level: number
  currentHp: number
  startedBlockIndex: number
  endedBlockIndex: number
}

/** World boss avatar info from REST API response (lookupWorldBossInfoAvatar_{id}) */
export interface WorldBossAvatarInfo {
  totalScore: number
  highScore: number
  totalChallengeCount: number
  remainChallengeCount: number
  latestRewardRank: number
  purchaseCount: number
  cp: number
  level: number
  iconId: number
  latestBossLevel: number
  claimedBlockIndex: number
  refillBlockIndex: number
  avatarAddress: string
  avatarName: string
  lastAttack: number
}

/** Event dungeon info from REST API response (lookupEventDungeonInfo_{val}) */
export interface EventDungeonInfo {
  dungeonId: number
  round: number
  [key: string]: unknown
}

/** Patrol reward info */
export interface PatrolRewardInfo {
  blockLastClaim: number
  interval: number
  diffBlock: number
  isCanClaim: boolean
}

/** getDataGraphql REST response — flexible shape from 9CMD API */
export interface GetDataGraphqlResponse {
  [key: string]: unknown
  adventureCp?: number
}

/** Processed getDataGraphql data for display */
export interface GetDataGraphqlProcessed {
  equipmentSets: {
    adventure: EquipmentSetResponse | null
    arena: EquipmentSetResponse | null
    raid: EquipmentSetResponse | null
    infiniteTower: EquipmentSetResponse | null
  }
  runeSets: {
    adventure: RuneSlotEntry[]
    arena: RuneSlotEntry[]
    raid: RuneSlotEntry[]
    infiniteTower: RuneSlotEntry[]
  }
  worldBoss: {
    total: WorldBossInfo | null
    avatar: WorldBossAvatarInfo | null
  }
  eventDungeon: EventDungeonInfo | null
  patrolReward: PatrolRewardInfo | null
  adventureCp: number | null
  claimedGiftIds: number[]
}
