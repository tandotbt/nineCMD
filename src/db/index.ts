import Dexie, { type Table } from 'dexie'
import { DB_CONFIG } from '@/constants'
import type { Block } from '@/types/block'

export interface AppSetting {
  key: string
  value: unknown
}

export class NineCmdDatabase extends Dexie {
  blocks!: Table<Block>
  settings!: Table<AppSetting>

  constructor() {
    super(DB_CONFIG.NAME)
    this.version(DB_CONFIG.VERSION).stores({
      blocks: 'id, object.index, object.timestamp', // Primary key and indexes
      settings: 'key',
    })
  }
}

export const db = new NineCmdDatabase()
