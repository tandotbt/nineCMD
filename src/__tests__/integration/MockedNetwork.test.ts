import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCharacterStore } from '../../stores/useCharacterStore'
import { setupNetworkMock } from '../helpers/mockNetwork'
import { TEST_AGENT_ADDRESS } from '../unit/fixtures/characterData'

/**
 * MockedNetwork.test.ts (Type 1/Integration)
 *
 * Mục tiêu: Kiểm tra tích hợp giữa CharacterStore và hệ thống Mock Network.
 * Đảm bảo store có thể load và process dữ liệu từ các file fixture local.
 */

// Initialize network mock
setupNetworkMock()

describe('Network-Dependent Integration: Character Loading', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should load character data from mocked network fixtures', async () => {
    const store = useCharacterStore()

    // Trigger fetch (which will be intercepted by mockNetwork)
    await store.fetchAllAvatars(TEST_AGENT_ADDRESS)

    expect(store.characters.length).toBeGreaterThan(0)

    // Check if the expected avatar exists in the loaded list
    // Use the first avatar from fixture to be flexible
    const avatar = store.characters[0]
    expect(avatar).toBeDefined()
    expect(avatar!.address).toBeDefined()
    expect(avatar!.level).toBeGreaterThan(0)

    console.log(
      `[Test] Successfully loaded avatar: ${avatar!.name} (Level ${avatar!.level}) from mock fixture`,
    )
  }, 60000) // Increased timeout for complex integration logic (Batching + Disk I/O)
})
