import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLoginLogic } from '../useLoginLogic'
import { db } from '@/db'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock dependent hooks
vi.mock('../useAgentLookup', () => ({
  useAgentLookup: () => ({
    isFetching: { value: false },
    error: { value: null },
    lookup: vi.fn().mockImplementation((addr) => {
      if (!addr || addr === 'invalid') {
        return Promise.resolve([])
      }
      return Promise.resolve([{ address: '0x123', name: 'Hero', level: 10, stage: 1 }])
    }),
  }),
}))

vi.mock('../useAvatarLookup', () => ({
  useAvatarLookup: () => ({
    isFetching: { value: false },
    error: { value: null },
    lookup: vi.fn().mockResolvedValue({ agentAddress: '0xAgent' }),
  }),
}))

vi.mock('@/stores/useAvatarSelectionStore', () => ({
  useAvatarSelectionStore: () => ({
    isFetching: false,
    isLoading: false,
    discoveredAvatars: [],
  }),
}))

// Mock naive-ui
vi.mock('naive-ui', () => ({
  enUS: {},
  dateEnUS: {},
  viVN: {},
  dateViVN: {},
  useMessage: () => ({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
  NListItem: {},
  NThing: {},
  NAvatar: {},
  NTag: {},
  NSpace: {},
  NIcon: {},
  NCard: {},
  NSteps: {},
  NStep: {},
  NTabs: {},
  NTabPane: {},
  NAlert: {},
  NInput: {},
  NFormItem: {},
  NList: {},
  NButton: {},
  NSelect: {},
  NText: {},
}))

describe('useLoginLogic', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.character_history.clear()
  })

  it('should initialize with default values', () => {
    const logic = useLoginLogic()
    expect(logic.currentStep.value).toBe(1)
    expect(logic.loginMethod.value).toBe('avatar')
    expect(logic.isFetching.value).toBe(false)
    expect(logic.agentAddressInput.value).toBe('')
    expect(logic.avatarAddressInput.value).toBe('')
    expect(logic.selectedAvatar.value).toBe('')
  })

  it('should handle fetch avatars for valid agent address', async () => {
    const logic = useLoginLogic()
    logic.agentAddressInput.value = '0x1234567890123456789012345678901234567890'

    await logic.handleFetchAvatars()

    await vi.waitFor(() => {
      expect(logic.currentStep.value).toBe(2)
    })
  })

  it('should show error for invalid agent address', async () => {
    const logic = useLoginLogic()
    logic.agentAddressInput.value = 'invalid'
    await logic.handleFetchAvatars()
    expect(logic.currentStep.value).toBe(1)
  })

  it('should handle reverse lookup for valid avatar address', async () => {
    const logic = useLoginLogic()
    logic.avatarAddressInput.value = '0x1234567890123456789012345678901234567890'

    await logic.handleReverseLookup()

    await vi.waitFor(() => {
      expect(logic.currentStep.value).toBe(2)
      expect(logic.agentAddressInput.value).toMatch(/^0x/)
      expect(logic.selectedAvatar.value).toBe(logic.avatarAddressInput.value)
    })
  })
})
