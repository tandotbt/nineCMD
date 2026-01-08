import { describe, it, expect } from 'vitest'
import { PLANET_CONFIGS, GQL_QUERIES } from '../constants'
import { queryGraphql } from '../api/graphql'
import type { GetBlocksResponse } from '../types/block'

/**
 * OdinIntegration.test.ts
 * Test integration sử dụng hàm logic queryGraphql của dự án để fetch dữ liệu thật.
 */
describe('Odin Server Integration', () => {
  it('should fetch real block data from Odin Mimir and match the expected structure', async () => {
    const odinConfig = PLANET_CONFIGS['odin']
    const url = odinConfig?.rpcEndpoints['mimir.gql']?.[0]

    if (!url) {
      throw new Error(
        'RPC URL is undefined. Please check PLANET_CONFIGS for "odin" in src/constants/index.ts',
      )
    }

    console.log('Testing with API URL:', url)

    // Sử dụng logic thật của dự án: queryGraphql
    const data = await queryGraphql<GetBlocksResponse['data']>(url, GQL_QUERIES.GET_LATEST_BLOCK)

    expect(data).toBeDefined()
    expect(data.blocks).toBeDefined()

    const items = data.blocks.items
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
  })
})
