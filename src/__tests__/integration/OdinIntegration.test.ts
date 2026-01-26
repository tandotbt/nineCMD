import { describe, it, expect } from 'vitest'
import { PLANET_CONFIGS, GQL_QUERIES } from '../../constants'
import { queryGraphql } from '../../api/graphql'
import type { GetBlocksResponse } from '../../types/block'

/**
 * OdinIntegration.test.ts
 * Test integration sử dụng MSW để mock dữ liệu thật từ Odin Mimir.
 * Đảm bảo logic queryGraphql hoạt động chính xác với layer mạng bị chặn.
 */
describe('Odin Server Integration (Mocked via MSW)', () => {
  it('should fetch block data from Odin Mimir (Mocked) and match the expected structure', async () => {
    const odinConfig = PLANET_CONFIGS['odin']
    const url = odinConfig?.rpcEndpoints['mimir.gql']?.[0]

    if (!url) {
      throw new Error(
        'RPC URL is undefined. Please check PLANET_CONFIGS for "odin" in src/constants/index.ts',
      )
    }

    // Sử dụng logic thật của dự án: queryGraphql
    // MSW sẽ chặn request này và trả về dữ liệu từ fixture
    const data = await queryGraphql<GetBlocksResponse['data']>(url, GQL_QUERIES.BLOCKS.GET_LATEST)

    expect(data).toBeDefined()
    expect(data.blocks).toBeDefined()

    const items = data.blocks.items
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    const block = items[0]
    if (!block || !block.object) throw new Error('No block found in response')

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
