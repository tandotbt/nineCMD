import { ref } from 'vue'
import { useCharacterStore } from '@/stores/useCharacterStore'
import type { AvatarData } from '@/types/character'

export function useAgentLookup() {
  const characterStore = useCharacterStore()
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  const lookup = async (agentAddress: string): Promise<AvatarData[]> => {
    if (!agentAddress || !agentAddress.startsWith('0x')) {
      error.value = 'invalid_agent_address'
      return []
    }

    isFetching.value = true
    error.value = null
    try {
      await characterStore.fetchAllAvatars(agentAddress)
      return characterStore.characters
    } catch (err) {
      console.error('[useAgentLookup] Fetch avatars failed:', err)
      error.value = 'fetch_failed'
      return []
    } finally {
      isFetching.value = false
    }
  }

  return {
    isFetching,
    error,
    lookup,
  }
}
