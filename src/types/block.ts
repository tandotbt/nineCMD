/**
 * @file types/block.ts
 * @description TypeScript definitions for Block data and GraphQL responses.
 */

export interface BlockObject {
  hash: string
  index: number
  miner: string
  stateRootHash: string
  timestamp: string
  txCount: number
  txIds?: string[]
}

export interface Block {
  id: string
  object: BlockObject
}

export interface GetBlocksResponse {
  data: {
    blocks: {
      items: Block[]
    }
  }
}

export interface BlockManagerState {
  blocks: Block[]
  isOnline: boolean
  averageBlockTimeMs: number
  lastFetchedIndex: number
}
