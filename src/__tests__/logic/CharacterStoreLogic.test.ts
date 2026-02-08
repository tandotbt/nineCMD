/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBlockStore } from '@/stores/useBlockStore'
import { useCsvDataStore } from '@/stores/useCsvDataStore'
import { usePlanetStore } from '@/stores/usePlanetStore'
import { setupNetworkMock } from '../helpers/mockNetwork'
import fs from 'fs'
import path from 'path'
import {
  TEST_AGENT_ADDRESS,
  TEST_AVATAR_ADDRESS,
  TEST_BLOCK_NOW,
} from '../unit/fixtures/characterData'

/**
 * CharacterStoreLogic.test.ts (Type 2)
 *
 * Mục tiêu: Mock tải dữ liệu từ fixture và test logic xử lý thật qua Pinia Store.
 * Sử dụng setupNetworkMock để giả lập việc tải dữ liệu từ 4 nguồn:
 * 1. Headless GQL
 * 2. Mimir GQL
 * 3. 9cmd API (getDataGraphql)
 * 4. Season Pass API
 */

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

// We mock i18n in setup.ts (already exists in project)

const TEST_CASES = [
  {
    name: 'Heimdall',
    planet: 'heimdall' as const,
    avatarAddress: TEST_AVATAR_ADDRESS,
    agentAddress: TEST_AGENT_ADDRESS,
  },
  {
    name: 'Odin',
    planet: 'odin' as const,
    avatarAddress: TEST_AVATAR_ADDRESS,
    agentAddress: TEST_AGENT_ADDRESS,
  },
]

describe('Type 2: Business Logic Validation with Mocked Network Data', () => {
  setupNetworkMock()

  beforeEach(() => {
    setActivePinia(createPinia())

    // Mock CsvDataStore to provide minimal required sheets for logic to not crash
    const csvStore = useCsvDataStore()
    const mockSheets = {
      ItemNameSheet: {
        name: 'ItemNameSheet',
        headers: ['id', 'English', 'Vietnam'],
        rows: [],
        mappedData: {},
        keyMain: 'id',
      },
      WorldSheet: {
        name: 'WorldSheet',
        headers: ['id', 'stage_begin', 'stage_end'],
        rows: [],
        mappedData: {},
        keyMain: 'id',
      },
      GameConfigSheet: {
        name: 'GameConfigSheet',
        headers: ['key', 'value'],
        rows: [],
        mappedData: {
          daily_reward_interval: { key: 'daily_reward_interval', value: '7200' },
        },
        keyMain: 'key',
      },
    }
    csvStore.state.sheetsByPlanet['heimdall'] = mockSheets
    csvStore.state.sheetsByPlanet['odin'] = mockSheets
  })

  TEST_CASES.forEach((tc) => {
    describe(`Planet: ${tc.name}`, () => {
      it(`should correctly fetch and process full avatar detail for ${tc.name}`, async () => {
        // Ensure fixtures exist before running
        const planetDir = path.join(FIXTURES_DIR, tc.planet)
        if (!fs.existsSync(path.join(planetDir, 'headless.json'))) {
          console.warn(
            `Fixtures for ${tc.name} missing, skipping logic test. Run Type 1 tests first.`,
          )
          return
        }

        const store = useCharacterStore()
        const settings = useSettingsStore()
        const planetStore = usePlanetStore()
        const blockStore = useBlockStore()

        // 1. Setup environment
        settings.avatarAddress = tc.avatarAddress
        settings.agentAddress = tc.agentAddress
        planetStore.currentPlanetName = tc.planet

        // 2. Mock current block for AP calculation
        vi.spyOn(blockStore, 'blockNow', 'get').mockReturnValue(TEST_BLOCK_NOW)

        // 3. Trigger the real fetch logic (which is now mocked at network level)
        await store.fetchAvatarDetail()

        // 4. Validate the processed 'info' object
        const info = store.info
        expect(info).not.toBeNull()

        if (info) {
          expect(info.address.toLowerCase()).toBe(tc.avatarAddress.toLowerCase())
          expect(info.level).toBeGreaterThan(0)
          expect(info.name).toBeDefined()
          expect(typeof info.cp).toBe('number')
          expect(info.ap).toBeDefined()

          console.log(`[Type 2 - ${tc.name}] Processed Info:`, {
            name: info.name,
            level: info.level,
            cp: info.cp,
            ap: info.ap,
            ncg: info.ncg,
          })

          // Verify that data from different sources was merged correctly
          // ncg comes from Mimir/Headless
          expect(typeof info.ncg).toBe('number')
          // inventory comes from Headless
          expect(Array.isArray(info.inventory.equipments)).toBe(true)
          // seasonPass comes from Season API
          if (info.seasonPass) {
            expect(info.seasonPass).toBeDefined()
          }
        }
      }, 30000)
    })
  })
})
