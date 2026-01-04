import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { PLANET_CONFIGS } from '../constants'
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
      const odinConfig = PLANET_CONFIGS['odin']
      const url = odinConfig?.rpcEndpoints['mimir.gql']?.[0]
      if (!url) {
        throw new Error(
          'RPC URL is undefined. Please check PLANET_CONFIGS for "odin" in src/constants/index.ts',
        )
      }
      const response = await axios.post<GetBlocksResponse>(url, {
        query,
      })
      console.log('API URL', url)
      console.log('API Response Status:', response.status)
      console.log('API Response Data:', JSON.stringify(response.data, null, 2))

      expect(response.status).toBe(200)
      const data = response.data as GetBlocksResponse
      expect(data).toBeDefined()
      expect(data.data).toBeDefined()
      expect(data.data.blocks).toBeDefined()

      const items = data.data.blocks.items
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      const block = items[0]
      if (!block || !block.object) throw new Error('No block found in response')

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
