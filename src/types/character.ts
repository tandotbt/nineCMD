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
  id: string
  itemId: number
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
}

export interface Costume {
  id: string
  itemId: number
  equipped: boolean
  grade: string | number
  itemType: string
  itemSubType: string
  elementalType: string
  name?: string
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

export interface AvatarData {
  address: string
  name: string
  level: number
  exp: number
  ncg: number
  crystal: number
  stage: number
  worldId: number
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
  seasonPass?: Record<string, unknown> | null
  isHasCraftOneTime: boolean
  claimedGifts: unknown[]
  eventDungeonInfo?: Record<string, unknown> | null
  worldBossInfoTotal?: Record<string, unknown> | null
  worldBossInfoAvatar?: Record<string, unknown> | null
  timestamp: number
}
