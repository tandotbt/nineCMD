/**
 * @file types/character.ts
 * @description Centralized type definitions for character-related data.
 */

export interface StatValue {
  baseValue: number
  additionalValue: number
}

export interface StatsMap {
  hP: number | StatValue
  aTK: number | StatValue
  dEF: number | StatValue
  cRI: number | StatValue
  hIT: number | StatValue
  sPD: number | StatValue
  [key: string]: number | StatValue
}

export interface Equipment {
  id: number | string // Template ID (numeric) or GUID
  itemId: number | string // GUID or Template ID
  level: number
  equipped: boolean
  grade: string | number
  itemType: string
  itemSubType: string
  elementalType: string
  name?: string
  levelReq?: number
  statsMap: StatsMap
  skills: {
    id: string
    power?: number
    chance?: number
    statPowerRatio?: number
    referencedStatType?: string
  }[]
  buffSkills: { id: string }[]
  CP: number
  index?: number
  imageUrl?: string
  requiredBlockIndex?: number
}

export interface Costume {
  id: number | string // Template ID (numeric) or GUID
  itemId: number | string // GUID or Template ID
  equipped: boolean
  grade: string | number
  itemType: string
  itemSubType: string
  elementalType: string
  name?: string
  levelReq?: number
  statsMap?: StatsMap
  CP: number
  index?: number
  imageUrl?: string
}

export interface RuneSlot {
  index: number
  runeId: number | null
  isLock: boolean
  level?: number
  name?: string
  imageUrl?: string
}

export interface RuneInfo {
  runeId: number
  level: number
  name?: string
  runeType?: string
  requiredLevel?: number
  tickerRune?: string
  index?: number
  imageUrl?: string
}

export interface Material {
  id: number
  count: number
  name?: string
  tradableCount?: number
  grade?: string | number
  itemType?: string
  itemSubType?: string
  elementalType?: string
  requiredBlockIndex?: number
}

export interface CraftingSlot {
  index: number
  isUnlocked: boolean
  unlockBlockIndex?: number
  startBlockIndex?: number
  petId?: string
}

export interface AvatarDetailHeadless {
  address: string
  name: string
  level: number
  exp: number
  dailyRewardReceivedIndex: number
  stageMap: {
    pairs: [number, number][]
    count: number
  }
  runes: {
    level: number
    runeId: number
  }[]
  inventory: {
    equipments: Equipment[]
    all?: Equipment[]
    costumes: Costume[]
    materials?: {
      grade: string | number
      id: number // Excel ID
      itemType: string
      itemSubType: string
      elementalType: string
      requiredBlockIndex: number
      itemId: string // Blockchain hash
    }[]
    consumables?: {
      grade: string | number
      id: number // Excel ID
      itemType: string
      itemSubType: string
      elementalType: string
      requiredBlockIndex: number
      itemId: string // Blockchain hash
      mainStat: string
    }[]
    [key: string]: unknown
  }
  itemMap: {
    count: number
    pairs: [number, number][]
  }
  combinationSlots: CraftingSlot[]
}

export interface MimirDetailResponse {
  actionPoint: number
  dailyRewardReceivedBlockIndex: number
  myAdventureCpRanking?: {
    rank: number
    userDocument: {
      avatar: { portraitId: number }
      cp: number
    }
  }
}

export interface RestApiResponse {
  data: {
    other_lookupAdventureCp?: number
    lookupRuneSetMuti_Adventure?: {
      index: number
      runeId: number | null
      isLock: boolean
    }[]
    other_lookupClaimedGiftIds?: unknown[]
    [key: string]: unknown
  }
}

export interface RawAvatarDetail {
  headless: {
    stateQuery: {
      agent: { gold: string; crystal: string }
      unlockedWorldIds: number[]
      avatar: AvatarDetailHeadless
      stakeState: { deposit: string }
    }
  }
  mimir:
    | (MimirDetailResponse & {
        isHasCraftOneTime: { items: { id: string }[] }
        isClaimPatrolRewardOneTime: { items: { id: string }[] }
      })
    | null
  rest: RestApiResponse['data'] | null
  seasonPass: unknown[] | Record<string, unknown> | null
  timestamp: number
}

export interface PatrolRewardInfo {
  blockLastClaim: number
  infoPatrolReward: Record<string, unknown> | null
  isCanClaim: boolean
  diffBlock: number
  interval: number
}

export interface SeasonPassStatus {
  level: number
  exp: number
  is_premium: boolean
  last_normal_claim: number
  last_premium_claim: number
  isCanClaim: {
    isCanClaimNormal: boolean
    isCanClaimPremium: boolean
  }
  isInTimeClaim: boolean
  claim_limit_timestamp?: string
  season_pass: {
    id: number
    season_index: number
    pass_type: string | number
  }
}

export interface SeasonPassInfo {
  [passType: string]: SeasonPassStatus
}

export interface EventDungeonInfo {
  roundReset: number
  ticket: number
  ticketBuyed: number
  stageIdUnlocked: number
  currentTurn: number
  totalTurns: number
  currentRoundStartBlock: number
  currentRoundEndBlock: number
}

export interface WorldBossInfo {
  hasOngoingEvent: boolean
  listIdOngoingWorldBoss: number[]
  totalTurns: number
  currentTurn: number
  tickets_reset_interval_block_range: number
  currentRoundStartBlock: number
  currentRoundEndBlock: number
}

export interface GiftInfo {
  id: number
  isCanClaim: boolean
  giftItems: [number, number, boolean][] // [id, quantity, tradable]
  imageUrl?: string
  name?: string
}

export interface SummonInfo {
  groupID: number
  itemSummons: [number, number, string | number, number, string?][] // [id, ratio, img, is_equipment, imageUrl?]
  name?: string
}

export interface WorldBossTotal {
  event_id: number
  boss_id: number
  boss_level: number
  total_hp: string
  current_hp: string
  start_block_index: number
  end_block_index: number
  [key: string]: unknown
}

export interface WorldBossAvatar {
  event_id: number
  boss_id: number
  ticket: number
  ticket_buyed: number
  accumulated_damage: string
  [key: string]: unknown
}

export interface AvatarData {
  address: string
  name: string
  level: number
  exp: number
  ncg: number
  crystal: number
  stage: number
  worldId: number
  worldName?: string
  ap: number
  maxAp: number
  cp: number
  adventureCp: number
  portraitId: number
  portraitUrl?: string
  rank: number
  dailyRewardReceivedIndex: number
  dailyRewardReceivedBlockIndex: number
  timeRefill: number
  timeRefillReal: number
  dailyRewardInterval: number
  apCost: number
  inventory: {
    equipments: Equipment[]
    costumes: Costume[]
    materials: Material[]
  }
  runeSlots: RuneSlot[]
  runes: RuneInfo[]
  craftingSlots: CraftingSlot[]
  stakeNCG: number
  seasonPass?: SeasonPassInfo | null
  isHasCraftOneTime: boolean
  isClaimPatrolRewardOneTime: boolean
  /** IDs of gifts already claimed by the avatar */
  claimedGifts: number[]
  /** Active gifts currently available to be claimed (filtered by claimedGifts) */
  gifts: GiftInfo[]
  /** Available summon groups and their item pools */
  summons: SummonInfo[]
  patrolReward?: PatrolRewardInfo
  eventDungeonInfo: EventDungeonInfo
  worldBossInfoTotal: WorldBossTotal | null
  worldBossInfoAvatar: WorldBossAvatar | null
  agentAddress?: string
  materialList: Record<number, number>
  timestamp: number
}

export interface CharacterSuggestion {
  address: string
  name: string
  level: number
  agentAddress?: string
  planet: string
  portraitUrl?: string
  timestamp?: number
}

export interface LookupState {
  isFetching: boolean
  error: string | null
}

export interface ArenaSeason {
  championshipId: number
  roundId: number
  titleArena: string
  active: boolean
  startBlockIndex: number
  endBlockIndex: number
  [key: string]: unknown
}

export interface ArenaRanking {
  AvatarAddress: string
  Name: string
  Rank: number
  Score: number
  Level?: number
  AvatarLevel?: number
  PortraitId: number
  AgentAddress?: string
}

export interface ArenaRankingResponse {
  ranks: ArenaRanking[]
  totalCount?: number
  offset?: number
  limit?: number
}
