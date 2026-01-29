/**
 * @file types/character.ts
 * @description Centralized type definitions for character-related data.
 */

export interface StatsMap {
  hP: number
  aTK: number
  dEF: number
  cRI: number
  hIT: number
  sPD: number
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
  skills: { id: string }[]
  buffSkills: { id: string }[]
  CP: number
  index?: number
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
  CP?: number
  index?: number
}

export interface RuneSlot {
  index: number
  runeId: number | null
  isLock: boolean
  level?: number
  name?: string
}

export interface RuneInfo {
  runeId: number
  level: number
  name?: string
  runeType?: string
  requiredLevel?: number
  tickerRune?: string
  index?: number
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
  seasonPass: Record<string, unknown> | null
  timestamp: number
}

export interface PatrolRewardInfo {
  blockLastClaim: number
  infoPatrolReward: Record<string, unknown> | null
  isCanClaim: boolean
  diffBlock: number
  interval: number
}

export interface SeasonPassInfo {
  [passType: string]: {
    level: number
    last_normal_claim: number
    last_premium_claim: number
    isCanClaim: {
      isCanClaimNormal: boolean
      isCanClaimPremium: boolean
    }
    isInTimeClaim: boolean
    claim_limit_timestamp?: string
    [key: string]: unknown
  }
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
}

export interface SummonInfo {
  groupID: number
  itemSummons: [number, number, string | number, number][] // [id, ratio, img, is_equipment]
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
  claimedGifts: unknown[]
  patrolReward?: PatrolRewardInfo
  eventDungeonInfo: EventDungeonInfo
  worldBossInfoTotal: Record<string, unknown> | null
  worldBossInfoAvatar: Record<string, unknown> | null
  agentAddress?: string
  materialList: Record<number, number>
  timestamp: number
}
