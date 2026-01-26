/**
 * @file core/BlockManager.ts
 * @description Core logic for tracking blocks, calculating average block time,
 * and handling virtual block increments during offline periods.
 */

import { BLOCK_CONFIG } from '../constants'
import type { Block } from '../types/block'

export class BlockManager {
  private blocks: Block[] = []
  private isOnline: boolean = true
  private virtualTimer: ReturnType<typeof setInterval> | null = null
  private onBlockUpdate: (block: Block) => void | Promise<void>

  constructor(onBlockUpdate: (block: Block) => void | Promise<void>, initialBlocks: Block[] = []) {
    this.onBlockUpdate = onBlockUpdate
    this.blocks = [...initialBlocks].slice(0, BLOCK_CONFIG.MAX_BLOCKS_CACHE)
  }

  /**
   * Synchronizes the internal blocks cache with external data.
   * @param blocks New list of blocks
   */
  public setBlocks(blocks: Block[]): void {
    this.blocks = [...blocks].slice(0, BLOCK_CONFIG.MAX_BLOCKS_CACHE)
  }

  /**
   * Updates the online status and manages the virtual block timer.
   * @param online Current network status
   */
  public setOnlineStatus(online: boolean): void {
    this.isOnline = online
    if (!this.isOnline) {
      this.startVirtualCounter()
    } else {
      this.stopVirtualCounter()
    }
  }

  /**
   * Adds a new real block from the API.
   * @param newBlock The block data from API
   */
  public async addRealBlock(newBlock: Block): Promise<void> {
    const latestBlock = this.blocks[0]
    if (!latestBlock || latestBlock.object.index < newBlock.object.index) {
      // If we were in offline mode, real data should override any virtual blocks
      this.blocks.unshift(newBlock)

      if (this.blocks.length > BLOCK_CONFIG.MAX_BLOCKS_CACHE) {
        this.blocks.pop()
      }

      await this.onBlockUpdate(newBlock)
    }
  }

  /**
   * Calculates the average block time in milliseconds.
   * Based on the timestamps of cached blocks.
   */
  public getAverageBlockTime(): number {
    // User wants to include virtual blocks in average calculation
    if (this.blocks.length < 2) {
      return BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS
    }

    let totalIntervalMs = 0
    let validIntervalsCount = 0

    // We calculate the average of the last intervals if available
    for (let i = 0; i < this.blocks.length - 1; i++) {
      const current = this.blocks[i]
      const next = this.blocks[i + 1]

      if (current && next) {
        const currentTimestamp = new Date(current.object.timestamp).getTime()
        const nextTimestamp = new Date(next.object.timestamp).getTime()

        const interval = currentTimestamp - nextTimestamp
        // Basic sanity check: ignore intervals > threshold as they are likely due to app being closed
        if (interval > 0 && interval < BLOCK_CONFIG.SANITY_CHECK_INTERVAL_MS) {
          totalIntervalMs += interval
          validIntervalsCount++
        }
      }
    }

    return validIntervalsCount > 0
      ? totalIntervalMs / validIntervalsCount
      : BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS
  }

  /**
   * Starts a timer to increment the block index virtually when offline.
   */
  private startVirtualCounter(): void {
    if (this.virtualTimer) return

    const interval = this.getAverageBlockTime()
    this.virtualTimer = setInterval(() => {
      this.incrementVirtualBlock()
    }, interval)
  }

  private stopVirtualCounter(): void {
    if (this.virtualTimer) {
      clearInterval(this.virtualTimer)
      this.virtualTimer = null
    }
  }

  /**
   * Creates a virtual block based on the last known block.
   */
  private async incrementVirtualBlock(): Promise<void> {
    const lastBlock = this.blocks[0]
    if (!lastBlock) return

    const nextIndex = lastBlock.object.index + 1
    const virtualBlock: Block = {
      id: `${BLOCK_CONFIG.VIRTUAL_ID_PREFIX}${nextIndex}`,
      object: {
        ...lastBlock.object,
        index: nextIndex,
        timestamp: new Date().toISOString(),
        hash: `${BLOCK_CONFIG.VIRTUAL_HASH_PREFIX}${Date.now()}`,
      },
    }

    this.blocks.unshift(virtualBlock)
    if (this.blocks.length > BLOCK_CONFIG.MAX_BLOCKS_CACHE) {
      this.blocks.pop()
    }

    await this.onBlockUpdate(virtualBlock)
  }

  public getLatestBlock(): Block | null {
    return this.blocks[0] || null
  }

  public getBlocks(): Block[] {
    return [...this.blocks]
  }

  /**
   * Clears all cached blocks.
   */
  public clearBlocks(): void {
    this.blocks = []
  }
}
