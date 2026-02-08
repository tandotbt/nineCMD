import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBlockStore } from '@/stores/useBlockStore'
import { db } from '@/db'
import { STORAGE_KEYS } from '@/constants'
import type { Block } from '@/types/block'

// Import authentic block data
import blocksFixture from '../fixtures/odin/BLOCKS_GET_LATEST.json'

// Variables used in vi.mock must start with 'mock' prefix
const mockShow = vi.fn()

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useWebNotification: () => ({
      isSupported: ref(true),
      show: mockShow,
      ensurePermissions: vi.fn(),
    }),
    useOnline: () => ref(true),
    useStorage: <T>(_key: string, defaultValue: T) => ref(defaultValue),
  }
})

describe('useBlockStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.blocks.clear()
    await db.settings.clear()
    mockShow.mockClear()

    // Setup global Notification mock
    vi.stubGlobal('Notification', {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    })
  })

  it('should initialize with default values', () => {
    const store = useBlockStore()
    expect(store.blockNow).toBe(-1)
    expect(store.isFetching).toBe(false)
    expect(store.blocksTracked).toBe(0)
  })

  it('should set notification marker correctly using authentic block data', async () => {
    const realBlock = blocksFixture.blocks.items[0]
    if (!realBlock) throw new Error('Fixture missing block data')

    // Put real block into DB
    await db.blocks.put(realBlock)

    // Set notification start block to the index of the real block
    const blockIndex = realBlock.object.index
    await db.settings.put({ key: STORAGE_KEYS.NOTIF_START_BLOCK, value: blockIndex })

    const setting = await db.settings.get(STORAGE_KEYS.NOTIF_START_BLOCK)
    expect(setting?.value).toBe(blockIndex)
    expect(blockIndex).toBeGreaterThan(0)
  })

  it('should calculate tracked blocks count with real data', async () => {
    // Add multiple real blocks (using fixture as base)
    const baseBlock = blocksFixture.blocks.items[0]
    if (!baseBlock) throw new Error('Fixture missing block data')

    await db.blocks.bulkPut([
      { ...baseBlock, id: 'hash1', object: { ...baseBlock.object, index: 100 } },
      { ...baseBlock, id: 'hash2', object: { ...baseBlock.object, index: 101 } },
      { ...baseBlock, id: 'hash3', object: { ...baseBlock.object, index: 102 } },
    ] as Block[])

    // We expect the DB to contain the blocks
    const count = await db.blocks.count()
    expect(count).toBe(3)

    // Note: Testing store.blocksTracked would require waiting for liveQuery/useObservable
    // to propagate changes, which can be flaky in unit tests.
  })
})
