import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db'
import { STORAGE_KEYS } from '@/constants'
import type { Block } from '@/types/block'

describe('Dexie Database (Dexie)', () => {
  beforeEach(async () => {
    await db.blocks.clear()
    await db.settings.clear()
  })

  const mockBlock: Block = {
    id: 'test-block-1',
    object: {
      hash: 'hash-1',
      index: 100,
      miner: 'miner-1',
      stateRootHash: 'root-1',
      timestamp: new Date().toISOString(),
      txCount: 5,
    },
  }

  it('should store and retrieve blocks', async () => {
    await db.blocks.put(mockBlock)
    const retrieved = await db.blocks.get(mockBlock.id)
    expect(retrieved).toEqual(mockBlock)
  })

  it('should maintain settings correctly', async () => {
    await db.settings.put({ key: STORAGE_KEYS.NOTIF_THRESHOLD, value: 50 })
    const setting = await db.settings.get(STORAGE_KEYS.NOTIF_THRESHOLD)
    expect(setting?.value).toBe(50)
  })

  it('should query blocks ordered by index', async () => {
    const b1 = { ...mockBlock, id: 'b1', object: { ...mockBlock.object, index: 100 } }
    const b2 = { ...mockBlock, id: 'b2', object: { ...mockBlock.object, index: 102 } }
    const b3 = { ...mockBlock, id: 'b3', object: { ...mockBlock.object, index: 101 } }

    await db.blocks.bulkPut([b1, b2, b3])

    const results = await db.blocks.orderBy('object.index').reverse().toArray()
    expect(results[0]?.object.index).toBe(102)
    expect(results[1]?.object.index).toBe(101)
    expect(results[2]?.object.index).toBe(100)
  })
})
