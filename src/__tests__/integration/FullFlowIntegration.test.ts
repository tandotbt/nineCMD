import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFetch } from '@vueuse/core'
import { PLANET_CONFIGS, GQL_QUERIES, CHARACTER_LOGIC_CONSTANTS, API_URLS } from '../../constants'
import { CHARACTER_QUERIES } from '../../api/queries/character'
import { queryGraphql } from '../../api/graphql'
import { calculateEquipmentCP, calculateAPRefill } from '../../logic/character'
import type { AvatarDetailHeadless, MimirDetailResponse } from '../../types/character'
import type { GetBlocksResponse } from '../../types/block'
import {
  TEST_AGENT_ADDRESS,
  TEST_AVATAR_ADDRESS,
  TEST_BLOCK_NOW,
} from '../unit/fixtures/characterData'

/**
 * @vitest-environment node
 */

/**
 * FullFlowIntegration.test.ts
 * Kiểm thử tích hợp toàn diện:
 * 1. Tải dữ liệu thật từ Blockchain (Heimdall & Odin).
 * 2. Kiểm tra kiểu dữ liệu (Schema Validation).
 * 3. Sử dụng dữ liệu thật + mã xử lý thật để kiểm tra logic (CP, AP).
 * 4. Liên kết dữ liệu thật với CSV thực tế.
 */

const TEST_CONFIG = {
  agentAddress: TEST_AGENT_ADDRESS,
  avatarAddress: TEST_AVATAR_ADDRESS,
  planetHeimdall: 'heimdall' as const,
  planetOdin: 'odin' as const,
}

interface EquipmentData {
  id: number
  itemId: string
  equipped: boolean
  statsMap: {
    hP: number
    aTK: number
    dEF: number
    cRI: number
    hIT: number
    sPD: number
  }
  skills: { id: string }[]
}

describe('Full Flow Integration Test (Mocked Playback)', () => {
  const heimdallConfig = PLANET_CONFIGS[TEST_CONFIG.planetHeimdall]
  const odinConfig = PLANET_CONFIGS[TEST_CONFIG.planetOdin]

  const heimdallGqlUrl = heimdallConfig?.rpcEndpoints['headless.gql']?.[0]
  const heimdallMimirUrl = heimdallConfig?.rpcEndpoints['mimir.gql']?.[0]
  const odinMimirUrl = odinConfig?.rpcEndpoints['mimir.gql']?.[0]

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --- 1. Kiểm tra kiểu dữ liệu (Schema Validation) ---
  it('should fetch avatar data from Heimdall (Mocked) and match schema types', async () => {
    if (!heimdallGqlUrl) throw new Error('Heimdall GQL URL not found')

    const query = CHARACTER_QUERIES.GET_AVATAR_DETAIL_FULL(
      TEST_CONFIG.avatarAddress,
      TEST_CONFIG.agentAddress,
    )

    const result = await queryGraphql<{
      stateQuery: Record<string, unknown>
    }>(heimdallGqlUrl, query, {
      avatarAddress: TEST_CONFIG.avatarAddress,
      agentAddress: TEST_CONFIG.agentAddress,
    })

    const cleanAddr = TEST_CONFIG.avatarAddress.startsWith('0x')
      ? TEST_CONFIG.avatarAddress.slice(2)
      : TEST_CONFIG.avatarAddress
    const avatar = (result.stateQuery[`avatar_${cleanAddr}`] ||
      result.stateQuery.avatar) as AvatarDetailHeadless

    expect(avatar).toBeDefined()
    expect(avatar.address.toLowerCase()).toBe(TEST_CONFIG.avatarAddress.toLowerCase())
    expect(typeof avatar.name).toBe('string')
    expect(typeof avatar.level).toBe('number')
    expect(Array.isArray(avatar.inventory.equipments)).toBe(true)

    // Kiểm tra Agent data
    const agent = result.stateQuery.agent as { gold: string }
    expect(agent).toBeDefined()
    expect(typeof agent.gold).toBe('string')
  })

  // --- 2. Sử dụng dữ liệu playback + mã xử lý thật để test ---
  it('should calculate CP and AP Refill correctly using mocked fixtures', async () => {
    if (!heimdallGqlUrl || !heimdallMimirUrl) throw new Error('Heimdall RPC URLs not found')

    // Fetch CP related data
    const cpResult = await queryGraphql<{
      stateQuery: {
        avatar: {
          inventory: {
            equipments: EquipmentData[]
          }
        }
      }
    }>(heimdallGqlUrl, GQL_QUERIES.CHARACTER.GET_AVATAR_INVENTORY_EQUIPMENTS, {
      avatarAddress: TEST_CONFIG.avatarAddress,
    })

    const avatarData = (cpResult.stateQuery.avatar || cpResult.stateQuery) as Record<
      string,
      unknown
    >
    const inventory = (avatarData.inventory ||
      (avatarData.avatar as Record<string, unknown>)?.inventory) as Record<string, unknown>
    const equipments = (inventory?.equipments || []) as EquipmentData[]
    expect(Array.isArray(equipments)).toBe(true)

    const equippedItems = equipments.filter((e) => e.equipped)
    expect(equippedItems.length).toBeGreaterThan(0)

    const item = equippedItems[0]
    expect(item).toBeDefined()
    const cp = calculateEquipmentCP(item!.statsMap, (item!.skills?.length || 0) > 0)
    expect(typeof cp).toBe('number')
    expect(cp).toBeGreaterThan(0)

    // Fetch AP related data from Mimir
    const mimirData = await queryGraphql<MimirDetailResponse>(
      heimdallMimirUrl,
      GQL_QUERIES.CHARACTER.GET_AVATAR_MIMIR_SIMPLE,
      { avatarAddress: TEST_CONFIG.avatarAddress, agentAddress: TEST_CONFIG.agentAddress },
    )

    const currentBlock = TEST_BLOCK_NOW // Giả định block hiện tại
    const refill = calculateAPRefill(
      mimirData.dailyRewardReceivedBlockIndex,
      currentBlock,
      CHARACTER_LOGIC_CONSTANTS.AP.DAILY_REFILL_INTERVAL,
      10,
    )

    expect(refill).toHaveProperty('timeRefill')
    expect(typeof refill.timeRefill).toBe('number')
  })

  // --- 3. Kiểm tra dữ liệu Block từ Odin ---
  it('should fetch latest block from Odin (Mocked) and validate structure', async () => {
    if (!odinMimirUrl) throw new Error('Odin Mimir URL not found')

    const data = await queryGraphql<GetBlocksResponse['data']>(
      odinMimirUrl,
      GQL_QUERIES.BLOCKS.GET_LATEST,
    )

    expect(data.blocks.items).toBeDefined()
    const block = data.blocks.items[0]
    expect(block).toBeDefined()
    expect(typeof block!.object.index).toBe('number')
    expect(typeof block!.object.hash).toBe('string')
    expect(new Date(block!.object.timestamp).getTime()).not.toBeNaN()
  })

  // --- 4. Tích hợp CSV: Dùng dữ liệu playback để xử lý ---
  it('should link mocked avatar itemIds with mocked item_name.csv data', async () => {
    if (!heimdallGqlUrl) throw new Error('Heimdall GQL URL not found')

    // 1. Fetch real equipment from avatar
    const result = await queryGraphql<{
      stateQuery: { avatar: { inventory: { equipments: { id: number; itemId: string }[] } } }
    }>(heimdallGqlUrl, GQL_QUERIES.CHARACTER.GET_AVATAR_INVENTORY_EQUIPMENTS, {
      avatarAddress: TEST_CONFIG.avatarAddress,
    })

    const avatarData = (result.stateQuery.avatar || result.stateQuery) as Record<string, unknown>
    const inventory = (avatarData.inventory ||
      (avatarData.avatar as Record<string, unknown>)?.inventory) as Record<string, unknown>
    const equipments = (inventory?.equipments || []) as { id: number; itemId: string }[]
    expect(equipments.length).toBeGreaterThan(0)

    // 2. Fetch live CSV data (Intercepted by MSW)
    const csvUrl = API_URLS.SCAN_ITEM_NAME[0]
    const { data: csvData, error } = await useFetch(csvUrl).text()

    if (error.value) throw new Error(`Failed to fetch CSV: ${error.value}`)
    expect(csvData.value).toBeDefined()

    // 3. Verify link
    let found = false
    let foundId = 0
    for (const eq of equipments) {
      const excelId = eq.id // In headless GQL, 'id' is the Excel ID (number)
      const searchKey = `ITEM_NAME_${excelId}`
      if (csvData.value?.includes(searchKey)) {
        found = true
        foundId = excelId
        break
      }
    }

    expect(
      found,
      `At least one item from avatar should exist in mocked CSV. Checked ${equipments.length} items.`,
    ).toBe(true)
    console.log(`Verified Item ID ${foundId} exists in mocked CSV data.`)
  })
})
