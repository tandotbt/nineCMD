/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PLANET_CONFIGS, API_URLS, CHARACTER_CODE_GETS } from '../../constants'
import { queryGraphql } from '../../api/graphql'
import { build9cmdApiParams } from '../../api/rest'
import { CHARACTER_QUERIES } from '../../api/queries/character'
import { useFetch } from '@vueuse/core'
import fs from 'fs'
import path from 'path'
import { validateStructure } from '../helpers/structureValidator'
import { TEST_AGENT_ADDRESS, TEST_AVATAR_ADDRESS } from '../unit/fixtures/characterData'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

const TEST_CONFIGS = [
  {
    name: 'Heimdall',
    planet: 'heimdall' as const,
    agentAddress: TEST_AGENT_ADDRESS,
    avatarAddress: TEST_AVATAR_ADDRESS,
  },
  {
    name: 'Odin',
    planet: 'odin' as const,
    agentAddress: TEST_AGENT_ADDRESS,
    avatarAddress: TEST_AVATAR_ADDRESS,
  },
]

describe('Type 1: Data Consistency (Mocked Playback)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  TEST_CONFIGS.forEach((config) => {
    describe(`Planet: ${config.name}`, () => {
      const planetConfig = PLANET_CONFIGS[config.planet]
      const planetDir = path.join(FIXTURES_DIR, config.planet)

      const fixtures = {
        headless: path.join(planetDir, 'headless.json'),
        mimir: path.join(planetDir, 'mimir.json'),
        api9cmd: path.join(planetDir, '9cmd.json'),
        season: path.join(planetDir, 'season.json'),
      }

      it(`should match Headless GQL structure`, async () => {
        const gqlUrl = planetConfig?.rpcEndpoints['headless.gql']?.[0]
        if (!gqlUrl) return

        const query = CHARACTER_QUERIES.GET_AVATAR_DETAIL_FULL(
          config.avatarAddress,
          config.agentAddress,
        )
        const result = await queryGraphql<Record<string, unknown>>(gqlUrl, query)

        expect(result).toBeDefined()
        const fixture = JSON.parse(fs.readFileSync(fixtures.headless, 'utf-8'))
        validateStructure(result, fixture)
      })

      it(`should match Mimir GQL structure`, async () => {
        const mimirUrl = planetConfig?.rpcEndpoints['mimir.gql']?.[0]
        if (!mimirUrl) return

        const result = await queryGraphql<Record<string, unknown>>(
          mimirUrl,
          CHARACTER_QUERIES.GET_AVATAR_MIMIR_FULL,
          {
            avatarAddress: config.avatarAddress,
            agentAddress: config.agentAddress,
          },
        )

        expect(result).toBeDefined()
        const fixture = JSON.parse(fs.readFileSync(fixtures.mimir, 'utf-8'))
        validateStructure(result, fixture)
      })

      it(`should match 9cmd API structure`, async () => {
        const api9cmdUrl = API_URLS.API_9CMD[1]
        const params = build9cmdApiParams(config.avatarAddress, config.planet, CHARACTER_CODE_GETS)

        const url = `${api9cmdUrl}/getDataGraphql?${params.toString()}`
        const { data } = await useFetch(url).get().json<{ data: unknown }>()

        expect(data.value).toBeDefined()
        if (data.value && data.value.data) {
          const result = data.value.data
          const fixture = JSON.parse(fs.readFileSync(fixtures.api9cmd, 'utf-8'))
          validateStructure(result, fixture)
        }
      })

      it(`should match Season Pass API structure`, async () => {
        const seasonUrl = API_URLS.SEASON_PASS[0]
        const url = `${seasonUrl}/api/user/status/all?avatar_addr=${config.avatarAddress}&agent_addr=${config.agentAddress}&planet_id=${planetConfig!.id}`

        const { data } = await useFetch(url).get().json<unknown>()
        expect(data.value).toBeDefined()
        if (data.value) {
          const fixture = JSON.parse(fs.readFileSync(fixtures.season, 'utf-8'))
          validateStructure(data.value, fixture)
        }
      })
    })
  })
})
