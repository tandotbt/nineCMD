import Dexie, { type Table } from 'dexie'
import { DB_CONFIG } from '@/constants'
import type { Block } from '@/types/block'

export interface AppSetting {
  key: string
  value: unknown
}

export interface CharacterHistory {
  id?: number
  agentAddress: string
  avatarAddress: string
  timestamp: number
  planet: string
  data: Record<string, unknown>
}

export class NineCmdDatabase extends Dexie {
  blocks!: Table<Block>
  settings!: Table<AppSetting>
  character_history!: Table<CharacterHistory>

  constructor() {
    super(DB_CONFIG.NAME)
    this.version(1).stores({
      blocks: 'id, object.index, object.timestamp', // Primary key and indexes
      settings: 'key',
    })
    this.version(2).stores({
      character_history: '++id, agentAddress, avatarAddress, timestamp',
    })
    this.version(3).stores({
      character_history: '++id, agentAddress, avatarAddress, timestamp, planet',
    })
  }
}

export const db = new NineCmdDatabase()
