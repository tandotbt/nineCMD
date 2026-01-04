import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBlockStore } from '../stores/useBlockStore'
import { db } from '../db'
import { STORAGE_KEYS } from '../constants'

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

  it('should set notification marker correctly', async () => {
    const mockBlock = {
      id: 'b1',
      object: {
        index: 100,
        timestamp: new Date().toISOString(),
        hash: 'h1',
        miner: 'm1',
        stateRootHash: 'r1',
        txCount: 0,
      },
    }

    await db.blocks.put(mockBlock)
    await db.settings.put({ key: STORAGE_KEYS.NOTIF_START_BLOCK, value: 100 })

    const setting = await db.settings.get(STORAGE_KEYS.NOTIF_START_BLOCK)
    expect(setting?.value).toBe(100)
  })

  it('should calculate tracked blocks count', async () => {
    const store = useBlockStore()
    expect(store.blocksTracked).toBe(0)
  })
})
