import { ref } from 'vue'
import { useCharacterStore } from '@/stores/useCharacterStore'
import type { AvatarData } from '@/types/character'

export function useAvatarLookup() {
  const characterStore = useCharacterStore()
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  const lookup = async (
    avatarAddress: string,
  ): Promise<{ agentAddress: string; avatars: AvatarData[] } | null> => {
    if (!avatarAddress || !avatarAddress.startsWith('0x')) {
      error.value = 'invalid_avatar_address'
      return null
    }

    isFetching.value = true
    error.value = null
    try {
      const agentAddress = await characterStore.findAgentByAvatarAddress(avatarAddress)
      if (agentAddress) {
        await characterStore.fetchAllAvatars(agentAddress)
        return {
          agentAddress,
          avatars: characterStore.characters,
        }
      } else {
        error.value = 'avatar_not_found'
        return null
      }
    } catch (err) {
      console.error('[useAvatarLookup] Reverse lookup failed:', err)
      error.value = 'fetch_failed'
      return null
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
