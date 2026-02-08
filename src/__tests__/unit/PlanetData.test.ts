import { describe, it, expect } from 'vitest'
import { useFetch } from '@vueuse/core'
import { API_URLS, PLANET_IDS, PLANET_CONFIGS } from '../../constants'
import type { PlanetConfig } from '../../types/planet'

/**
 * PlanetData.test.ts
 * Kiểm tra tính nhất quán của dữ liệu Planet (Mocked via MSW).
 * Sử dụng useFetch đồng bộ với logic trong usePlanetStore.
 */
describe('Planet Data Consistency (Mocked Playback)', () => {
  it('should fetch planet data from mocked fixture and match the expected structure', async () => {
    console.log('Fetching planet data from:', API_URLS.PLANET_RAW[0])

    // Sử dụng useFetch giống như trong usePlanetStore.ts
    const { data, error } = await useFetch(API_URLS.PLANET_RAW[0]).json<PlanetConfig[]>()

    if (error.value) {
      throw new Error(`Failed to fetch planet data: ${error.value}`)
    }

    expect(data.value).toBeDefined()
    expect(Array.isArray(data.value)).toBe(true)
    expect(data.value!.length).toBeGreaterThan(0)

    const planets = data.value!
    const allDiffs: string[] = []

    // Các hành tinh bắt buộc phải có
    const requiredPlanets = ['odin', 'heimdall', 'thor'] as const

    requiredPlanets.forEach((planetName) => {
      const planet = planets.find((p) => p.name.toLowerCase() === planetName)

      if (!planet) {
        allDiffs.push(`Planet [${planetName}] is missing in API response!`)
        return
      }

      console.log(`Checking planet: ${planetName}`)

      // 1. Kiểm tra ID
      const expectedId = PLANET_IDS[planetName]
      if (planet.id !== expectedId) {
        allDiffs.push(
          `[ID Mismatch] Planet [${planetName}] expected ID ${expectedId}, but got ${planet.id}`,
        )
      }

      // 2. Kiểm tra Genesis Hash
      const staticConfig = PLANET_CONFIGS[planetName]
      if (staticConfig && planet.genesisHash !== staticConfig.genesisHash) {
        allDiffs.push(
          `[Genesis Mismatch] Planet [${planetName}] expected hash ${staticConfig.genesisHash}, but got ${planet.genesisHash}`,
        )
      }

      // 3. Kiểm tra rpcEndpoints
      if (!planet.rpcEndpoints) {
        allDiffs.push(`[RPC Missing] Planet [${planetName}] has no rpcEndpoints!`)
      } else {
        // Kiểm tra các key bắt buộc trong rpcEndpoints
        const requiredRpcKeys = ['headless.gql', 'mimir.gql']
        requiredRpcKeys.forEach((key) => {
          if (
            !planet.rpcEndpoints[key as keyof typeof planet.rpcEndpoints] ||
            !Array.isArray(planet.rpcEndpoints[key as keyof typeof planet.rpcEndpoints])
          ) {
            allDiffs.push(
              `[RPC Key Missing] Planet [${planetName}] is missing [${key}] in rpcEndpoints`,
            )
          }
        })
      }
    })

    if (allDiffs.length > 0) {
      console.warn('Found inconsistencies in Planet Data:', allDiffs)
    }

    expect(allDiffs, 'Found differences in Planet data').toEqual([])
  })

  it('should verify SEASON_PASS API is intercepted by MSW', async () => {
    console.log('Checking SEASON_PASS API:', API_URLS.SEASON_PASS[0])
    // Use a specific planet id to match the MSW handler
    const url = `${API_URLS.SEASON_PASS[0]}/api/user/status/all?planet_id=0x000000000000`
    const { data, error } = await useFetch(url).get().text()

    if (error.value) {
      console.warn('SEASON_PASS API Error:', error.value)
    }

    expect(error.value).toBeNull()
    expect(data.value).toBeDefined()
  })
})
