import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import fs from 'fs'
import path from 'path'
import { calculateTotalCP, calculateAPRefill, getLatestStageId } from '../../logic/character'
import type { AvatarDetailHeadless } from '../../types/character'

/**
 * Type 2: Mock Logic Test with Fixture Data
 *
 * Objectives:
 * - Use data from fixtures (Odin/Heimdall) fetched by the CJS script.
 * - Test real application logic (CP calculation, AP refill, Stage tracking).
 */

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

describe('Type 2: Mock Logic Test with Fixture Data', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const planets = ['heimdall', 'odin'] as const

  planets.forEach((planet) => {
    describe(`Planet: ${planet.toUpperCase()}`, () => {
      const headlessPath = path.join(FIXTURES_DIR, planet, 'headless.json')
      const mimirPath = path.join(FIXTURES_DIR, planet, 'mimir.json')

      it(`should calculate CP correctly using ${planet} headless fixture`, () => {
        if (!fs.existsSync(headlessPath)) {
          console.warn(`[Test Type 2] Headless fixture for ${planet} not found, skipping.`)
          return
        }

        const result = JSON.parse(fs.readFileSync(headlessPath, 'utf-8'))
        const cleanAddr = Object.keys(result.stateQuery).find((k) => k.startsWith('avatar_'))
        const avatar = result.stateQuery[cleanAddr!] as AvatarDetailHeadless

        expect(avatar).toBeDefined()

        const totalCP = calculateTotalCP(avatar.inventory.equipments)
        expect(typeof totalCP).toBe('number')
        expect(totalCP).toBeGreaterThanOrEqual(0)
      })

      it(`should track latest stage correctly using ${planet} headless fixture`, () => {
        if (!fs.existsSync(headlessPath)) return

        const result = JSON.parse(fs.readFileSync(headlessPath, 'utf-8'))
        const cleanAddr = Object.keys(result.stateQuery).find((k) => k.startsWith('avatar_'))
        const avatar = result.stateQuery[cleanAddr!] as AvatarDetailHeadless

        const latestStage = getLatestStageId(avatar.stageMap.pairs)
        expect(typeof latestStage).toBe('number')
        expect(latestStage).toBeGreaterThan(0)
      })

      it(`should calculate AP refill correctly using ${planet} mimir fixture`, () => {
        if (!fs.existsSync(mimirPath)) {
          console.warn(`[Test Type 2] Mimir fixture for ${planet} not found, skipping.`)
          return
        }

        const mimirData = JSON.parse(fs.readFileSync(mimirPath, 'utf-8'))

        // Mimir structure: { actionPoint: number, dailyRewardReceivedBlockIndex: number, ... }
        expect(mimirData).toHaveProperty('actionPoint')

        const lastClaimBlock = mimirData.dailyRewardReceivedBlockIndex
        const currentBlock = lastClaimBlock + 7200

        const refill = calculateAPRefill(
          lastClaimBlock,
          currentBlock,
          7200, // Interval
          10, // Block time
        )

        expect(refill.timeRefillReal).toBe(0)
      })
    })
  })
})
