import { describe, it, expect } from 'vitest'
import * as constants from '../../constants/index'

describe('Constants Unit Tests', () => {
  describe('API_URLS', () => {
    it('should have correct structure', () => {
      expect(constants.API_URLS).toBeDefined()
      expect(Array.isArray(constants.API_URLS.API_9CMD)).toBe(true)
      expect(Array.isArray(constants.API_URLS.SEASON_PASS)).toBe(true)
      expect(Array.isArray(constants.API_URLS.SCAN_ITEM_NAME)).toBe(true)
    })
  })

  describe('PLANET_CONFIGS', () => {
    it('should contain configurations for odin, heimdall, and thor', () => {
      expect(constants.PLANET_CONFIGS.odin).toBeDefined()
      expect(constants.PLANET_CONFIGS.heimdall).toBeDefined()
      expect(constants.PLANET_CONFIGS.thor).toBeDefined()
    })

    it('should have valid RPC endpoints for each planet', () => {
      for (const planet of Object.values(constants.PLANET_CONFIGS)) {
        expect(planet.rpcEndpoints).toBeDefined()
        expect(planet.rpcEndpoints['headless.gql']).toBeDefined()
        expect(planet.rpcEndpoints['mimir.gql']).toBeDefined()
      }
    })
  })

  describe('GQL_QUERIES', () => {
    it('should have BLOCKS queries', () => {
      expect(constants.GQL_QUERIES.BLOCKS.GET_LATEST).toContain('query GetLatestBlock')
      expect(constants.GQL_QUERIES.BLOCKS.GET_LIST).toContain('query GetBlocks')
    })

    it('should have CHARACTER fields and queries', () => {
      expect(constants.GQL_QUERIES.CHARACTER.FIELDS_AVATAR_BASE).toContain('address')
      expect(constants.GQL_QUERIES.CHARACTER.FIELDS_INVENTORY_CONTENT).toContain('equipments')
      expect(constants.GQL_QUERIES.CHARACTER.GET_AGENT_AVATARS).toContain('query GetAgentAvatars')
      expect(constants.GQL_QUERIES.CHARACTER.GET_AVATAR_MIMIR_SIMPLE).toContain('actionPoint')
    })

    it('should have TRANSACTION mutations and queries', () => {
      expect(constants.GQL_QUERIES.TRANSACTION.STAGE_TRANSACTION).toContain(
        'mutation StageTransaction',
      )
      expect(constants.GQL_QUERIES.TRANSACTION.GET_STATUS).toContain('query GetTransactionStatus')
    })
  })

  describe('CHARACTER_LOGIC_CONSTANTS', () => {
    it('should have CP coefficients', () => {
      const { CP } = constants.CHARACTER_LOGIC_CONSTANTS
      expect(CP.HP).toBe(0.7)
      expect(CP.ATK).toBe(10.5)
      expect(CP.DEF).toBe(10.5)
    })

    it('should have AP constants', () => {
      const { AP } = constants.CHARACTER_LOGIC_CONSTANTS
      expect(AP.MAX).toBe(120)
      expect(AP.DAILY_REFILL_INTERVAL).toBe(7200)
    })
  })

  describe('STORAGE_KEYS', () => {
    it('should be unique', () => {
      const keys = Object.values(constants.STORAGE_KEYS)
      const uniqueKeys = new Set(keys)
      expect(keys.length).toBe(uniqueKeys.size)
    })
  })
})
