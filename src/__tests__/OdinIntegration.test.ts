import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { API_URLS } from '../constants'
import type { GetBlocksResponse } from '../types/block'

describe('Odin Server Integration', () => {
  it('should fetch real block data from Odin Mimir and match the expected structure', async () => {
    const query = `
      query GetLatestBlock {
        blocks(skip: 0, take: 1) {
          items {
            id
            object {
              hash
              index
              miner
              stateRootHash
              timestamp
              txCount
            }
          }
        }
      }
    `

    try {
      const response = await axios.post<GetBlocksResponse>(API_URLS.ODIN_MIMIR, { query })

      expect(response.status).toBe(200)
      expect(response.data.data).toBeDefined()
      expect(response.data.data.blocks).toBeDefined()

      const items = response.data.data.blocks.items
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      const block = items[0]
      if (!block) throw new Error('No block found in response')

      console.log('Real Odin Block Sample:', JSON.stringify(block, null, 2))

      // Validate structure
      expect(block.id).toBeDefined()
      expect(typeof block.id).toBe('string')

      expect(block.object).toBeDefined()
      expect(typeof block.object.index).toBe('number')
      expect(typeof block.object.hash).toBe('string')
      expect(typeof block.object.timestamp).toBe('string')

      // Ensure timestamp is a valid ISO string
      expect(new Date(block.object.timestamp).getTime()).not.toBeNaN()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('API Error Response:', error.response.data)
      }
      throw error
    }
  })
})
