import { describe, it, expect } from 'vitest'
import { PLANET_CONFIGS } from '../constants'
import type { PlanetName } from '../types/planet'

describe('Planet Data Schema Validation', () => {
  const planets: PlanetName[] = ['odin', 'heimdall', 'thor']

  planets.forEach((name) => {
    it(`should have valid structure for planet: ${name}`, () => {
      const config = PLANET_CONFIGS[name]

      // Basic fields
      expect(config).toBeDefined()
      if (!config) return

      expect(config.id).toMatch(/^0x/)
      expect(config.name).toBe(name)
      expect(config.rpcEndpoints).toBeDefined()

      // Essential RPC endpoints
      const headless = config.rpcEndpoints['headless.gql']
      expect(headless).toBeInstanceOf(Array)
      expect(headless?.length).toBeGreaterThan(0)

      const mimir = config.rpcEndpoints['mimir.gql']
      expect(mimir).toBeInstanceOf(Array)
      expect(mimir?.length).toBeGreaterThan(0)

      // Optional but common endpoints
      expect(config.rpcEndpoints['market.rest']).toSatisfy(
        (val: string[] | undefined) => val === undefined || Array.isArray(val),
      )
      expect(config.rpcEndpoints['arena.rest']).toSatisfy(
        (val: string[] | undefined) => val === undefined || Array.isArray(val),
      )
    })
  })

  it('odin should have specific nodes from API dump', () => {
    const odin = PLANET_CONFIGS['odin']
    expect(odin).toBeDefined()
    if (!odin) return

    expect(odin.rpcEndpoints['headless.gql']).toContain(
      'https://odin-rpc-1.nine-chronicles.com/graphql',
    )
    expect(odin.rpcEndpoints['market.rest']).toContain('https://api.9capi.com/marketProviderOdin')
  })
})
