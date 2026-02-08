import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BlockManager } from '@/core/BlockManager'
import type { Block } from '@/types/block'

describe('BlockManager', () => {
  let blockManager: BlockManager
  const mockOnUpdate = vi.fn()

  const createMockBlock = (index: number, timestamp: string): Block => ({
    id: `block-${index}`,
    object: {
      hash: `hash-${index}`,
      index,
      miner: 'miner',
      stateRootHash: 'root',
      timestamp,
      txCount: 0,
    },
  })

  beforeEach(() => {
    vi.useFakeTimers()
    mockOnUpdate.mockClear()
    blockManager = new BlockManager(mockOnUpdate)
  })

  it('should initialize with provided blocks', () => {
    const b1 = createMockBlock(101, new Date().toISOString())
    const b2 = createMockBlock(100, new Date(Date.now() - 10000).toISOString())
    const manager = new BlockManager(mockOnUpdate, [b1, b2])

    expect(manager.getBlocks().length).toBe(2)
    expect(manager.getLatestBlock()?.object.index).toBe(101)
    expect(manager.getAverageBlockTime()).toBe(10000)
  })

  afterEach(() => {
    blockManager.setOnlineStatus(true) // Stop any active timers
    vi.clearAllTimers()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should add real blocks and update state', async () => {
    const block = createMockBlock(100, new Date().toISOString())
    await blockManager.addRealBlock(block)

    expect(blockManager.getLatestBlock()?.object.index).toBe(100)
    expect(mockOnUpdate).toHaveBeenCalledWith(block)
  })

  it('should calculate average block time correctly', async () => {
    const now = Date.now()
    const b1 = createMockBlock(102, new Date(now).toISOString())
    const b2 = createMockBlock(101, new Date(now - 10000).toISOString()) // 10s difference
    const b3 = createMockBlock(100, new Date(now - 22000).toISOString()) // 12s difference

    await blockManager.addRealBlock(b3)
    await blockManager.addRealBlock(b2)
    await blockManager.addRealBlock(b1)

    // Avg = (10 + 12) / 2 = 11s = 11000ms
    expect(blockManager.getAverageBlockTime()).toBe(11000)
  })

  it('should increment virtual blocks when offline using actual average time', async () => {
    const now = Date.now()
    // Create 8s interval blocks
    const b1 = createMockBlock(101, new Date(now).toISOString())
    const b2 = createMockBlock(100, new Date(now - 8000).toISOString())

    await blockManager.addRealBlock(b2)
    await blockManager.addRealBlock(b1)

    expect(blockManager.getAverageBlockTime()).toBe(8000)

    // Set offline
    blockManager.setOnlineStatus(false)

    // Should NOT increment at 5s
    await vi.advanceTimersByTimeAsync(5000)
    expect(blockManager.getLatestBlock()?.object.index).toBe(101)

    // Should increment at 8s
    await vi.advanceTimersByTimeAsync(3000)
    expect(blockManager.getLatestBlock()?.object.index).toBe(102)
    expect(blockManager.getLatestBlock()?.id).toContain('virtual')
  })

  it('should not use virtual blocks to calculate average time', async () => {
    const now = Date.now()
    const b1 = createMockBlock(101, new Date(now).toISOString())
    const b2 = createMockBlock(100, new Date(now - 8000).toISOString())

    await blockManager.addRealBlock(b2)
    await blockManager.addRealBlock(b1)

    blockManager.setOnlineStatus(false)
    await vi.advanceTimersByTimeAsync(8000) // Adds virtual block index 102

    // Average should still be 8000, not affected by virtual block
    expect(blockManager.getAverageBlockTime()).toBe(8000)
  })

  it('should stop virtual counter when back online', async () => {
    const block = createMockBlock(100, new Date().toISOString())
    await blockManager.addRealBlock(block)

    blockManager.setOnlineStatus(false)
    await vi.advanceTimersByTimeAsync(10000) // Index 101

    blockManager.setOnlineStatus(true)
    await vi.advanceTimersByTimeAsync(10000)

    // Should still be 101 because timer stopped
    expect(blockManager.getLatestBlock()?.object.index).toBe(101)
  })

  it('should ignore intervals > 10 minutes in average calculation', async () => {
    const now = Date.now()
    const b1 = createMockBlock(102, new Date(now).toISOString())
    const b2 = createMockBlock(101, new Date(now - 601000).toISOString()) // 10m 1s difference
    const b3 = createMockBlock(100, new Date(now - 611000).toISOString()) // 10s difference between b2 and b3

    await blockManager.addRealBlock(b3)
    await blockManager.addRealBlock(b2)
    await blockManager.addRealBlock(b1)

    // Should only count interval between b2 and b3 (10s)
    // Interval between b1 and b2 is > 10m, so it should be ignored
    expect(blockManager.getAverageBlockTime()).toBe(10000)
  })

  it('should allow manual block cache update with setBlocks', () => {
    const b1 = createMockBlock(100, new Date().toISOString())
    blockManager.setBlocks([b1])

    expect(blockManager.getBlocks().length).toBe(1)
    expect(blockManager.getLatestBlock()?.object.index).toBe(100)
  })

  it('should limit blocks to MAX_BLOCKS_CACHE', async () => {
    // Fill manager with blocks
    for (let i = 1; i <= 150; i++) {
      await blockManager.addRealBlock(
        createMockBlock(i, new Date(Date.now() + i * 10000).toISOString()),
      )
    }

    expect(blockManager.getBlocks().length).toBe(100) // MAX_BLOCKS_CACHE from constants
    expect(blockManager.getLatestBlock()?.object.index).toBe(150)
  })
})
