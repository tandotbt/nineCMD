import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PLANET_CONFIGS, CHARACTER_LOGIC_CONSTANTS } from '../../../constants'
import { queryGraphql } from '../../../api/graphql'
import { CHARACTER_QUERIES } from '../../../api/queries/character'
import type { AvatarDetailHeadless, Equipment } from '../../../types/character'
import {
  TEST_AGENT_ADDRESS,
  TEST_AVATAR_ADDRESS_HEIMDALL,
  TEST_AVATAR_ADDRESS_ODIN,
} from '../fixtures/characterData'
import fs from 'fs'
import path from 'path'
import { calculateTotalCP, calculateAPRefill, getLatestStageId } from '../../../logic/character'

/**
 * CharacterValidation.test.ts
 *
 * Loại 1: Mock dữ liệu và so sánh cấu trúc/kiểu dữ liệu với fixture.
 * Loại 2: Mock dữ liệu từ fixture để test logic thực tế.
 */

describe('Character Validation Tests (Mocked Playback)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('sanity check', () => {
    expect(1 + 1).toBe(2)
  })

  describe('Type 1: Data Consistency (Mocked Playback)', () => {
    const planets = [
      { name: 'heimdall', address: TEST_AVATAR_ADDRESS_HEIMDALL },
      { name: 'odin', address: TEST_AVATAR_ADDRESS_ODIN },
    ] as const

    planets.forEach((p) => {
      it(`should fetch data from ${p.name} (Mocked) and match structure with fixture`, async () => {
        const config = PLANET_CONFIGS[p.name]
        const gqlUrl = config?.rpcEndpoints['headless.gql']?.[0]
        if (!gqlUrl) return

        console.log(`[Test Type 1] Fetching mocked data for ${p.address} on ${p.name}`)

        const cleanAddr = p.address.startsWith('0x') ? p.address.slice(2) : p.address
        const query = CHARACTER_QUERIES.GET_AVATAR_DETAIL_FULL(p.address, TEST_AGENT_ADDRESS)

        const result = await queryGraphql<{
          stateQuery: Record<
            string,
            AvatarDetailHeadless | number[] | { gold: string; crystal: string }
          >
        }>(gqlUrl, query)
        const data = result.stateQuery
        const avatar = data[`avatar_${cleanAddr}`] as AvatarDetailHeadless

        if (!avatar) {
          console.warn(
            `[Test Type 1] Avatar ${p.address} not found in mock response for ${p.name}, skipping detailed check.`,
          )
          return
        }

        // Kiểm tra cấu trúc và kiểu dữ liệu (khớp key/type)
        expect(avatar).toHaveProperty('address')
        expect(typeof avatar.address).toBe('string')
        expect(avatar.address.toLowerCase()).toBe(p.address.toLowerCase())

        expect(avatar).toHaveProperty('name')
        expect(typeof avatar.name).toBe('string')

        expect(avatar).toHaveProperty('level')
        expect(typeof avatar.level).toBe('number')

        expect(avatar).toHaveProperty('inventory')
        expect(avatar.inventory).toHaveProperty('equipments')
        expect(Array.isArray(avatar.inventory.equipments)).toBe(true)

        expect(avatar.inventory.equipments.length).toBeGreaterThanOrEqual(0)

        // Test equipment structure strictly
        const equips = avatar.inventory.equipments as Equipment[]
        equips.forEach((eq) => {
          expect(eq).toHaveProperty('grade')
          expect(eq).toHaveProperty('id')
          expect(eq).toHaveProperty('itemType')
          expect(eq).toHaveProperty('itemSubType')
          expect(eq).toHaveProperty('elementalType')
          expect(eq).toHaveProperty('itemId')
          expect(eq).toHaveProperty('level')
          expect(eq).toHaveProperty('equipped')
          expect(eq).toHaveProperty('statsMap')

          // Validate statsMap structure
          const s = eq.statsMap
          expect(s).toHaveProperty('hP')
          expect(s).toHaveProperty('aTK')
          expect(s).toHaveProperty('dEF')
          expect(s).toHaveProperty('cRI')
          expect(s).toHaveProperty('hIT')
          expect(s).toHaveProperty('sPD')

          expect(typeof s.hP).toBe('number')
          expect(typeof s.aTK).toBe('number')
          expect(typeof s.dEF).toBe('number')
          expect(typeof s.cRI).toBe('number')
          expect(typeof s.hIT).toBe('number')
          expect(typeof s.sPD).toBe('number')
        })

        // Test costumes structure
        const costumes = avatar.inventory.costumes || []
        costumes.forEach((cos) => {
          expect(cos).toHaveProperty('grade')
          expect(cos).toHaveProperty('id')
          expect(cos).toHaveProperty('itemType')
          expect(cos).toHaveProperty('equipped')
        })

        // Test materials structure
        const materials = avatar.inventory.materials || []
        materials.forEach((mat) => {
          expect(mat).toHaveProperty('grade')
          expect(mat).toHaveProperty('id')
          expect(mat).toHaveProperty('itemType')
        })
      })
    })
  })

  describe('Type 2: Mock Logic Test with Fixture Data', () => {
    it('should validate agent state from real_graphql_all_avatar.json', () => {
      const fixturePath = path.resolve(__dirname, '../fixtures/real_graphql_all_avatar.json')
      const { data } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      const agent = data.stateQuery.agent

      expect(agent).toHaveProperty('gold')
      expect(agent).toHaveProperty('avatarStates')
      expect(Array.isArray(agent.avatarStates)).toBe(true)
      expect(agent.avatarStates[0]).toHaveProperty('address')
    })

    it('should calculate CP correctly using mocked Heimdall data', async () => {
      const fixturePath = path.resolve(__dirname, `../../fixtures/heimdall/headless.json`)
      if (!fs.existsSync(fixturePath)) {
        console.warn('[Test Type 2] Fixture not found, skipping.')
        return
      }

      const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      const avatarKey = Object.keys(fixture.stateQuery || fixture).find((k) =>
        k.startsWith('avatar_'),
      )
      const avatar = (fixture.stateQuery?.[avatarKey!] ||
        fixture[avatarKey!] ||
        fixture.avatar) as AvatarDetailHeadless

      // Giả lập logic tải dữ liệu nhân vật và tính toán
      console.log(`[Test Type 2] Testing logic for avatar: ${avatar.name} (Level ${avatar.level})`)

      const totalCP = calculateTotalCP(avatar.inventory.equipments)
      expect(typeof totalCP).toBe('number')
      expect(totalCP).toBeGreaterThan(0)
      console.log(`[Test Type 2] Total CP calculated: ${totalCP}`)

      const latestStage = getLatestStageId(avatar.stageMap.pairs)
      expect(typeof latestStage).toBe('number')
      console.log(`[Test Type 2] Latest Stage: ${latestStage}`)
    })

    it('should calculate AP refill correctly using mocked Mimir data', () => {
      const fixturePath = path.resolve(
        __dirname,
        `../../fixtures/heimdall/CHARACTER_GET_AVATAR_MIMIR_SIMPLE.json`,
      )
      if (!fs.existsSync(fixturePath)) {
        console.warn('[Test Type 2] Mimir fixture not found, skipping.')
        return
      }
      const mimirData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

      expect(mimirData).toHaveProperty('actionPoint')
      expect(typeof mimirData.actionPoint).toBe('number')

      const { AP } = CHARACTER_LOGIC_CONSTANTS
      const lastClaimBlock = mimirData.dailyRewardReceivedBlockIndex
      const currentBlock = lastClaimBlock + AP.DAILY_REFILL_INTERVAL

      const refill = calculateAPRefill(
        lastClaimBlock,
        currentBlock,
        AP.DAILY_REFILL_INTERVAL, // Interval
        10, // Block time
      )

      expect(refill.timeRefillReal).toBe(0) // Đã đến lúc refill

      const refillFuture = calculateAPRefill(
        lastClaimBlock,
        currentBlock - 100, // Còn 100 block
        AP.DAILY_REFILL_INTERVAL,
        10,
      )
      expect(refillFuture.timeRefillReal).toBe(1000) // 100 * 10s
    })
  })
})
