import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { usePlanetStore } from '@/stores/usePlanetStore'

describe('Login Workflow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should find agent address by avatar address (Reverse Lookup - Odin)', async () => {
    const characterStore = useCharacterStore()
    // Real avatar address from odin/headless.json
    const avatarAddr = '0x79BB6e025762A76C8C85F73581e8c49b68FcaB0C'

    const agentAddr = await characterStore.findAgentByAvatarAddress(avatarAddr)

    // Should match agentAddress in odin/CHARACTER_GET_AGENT_BY_AVATAR.json
    expect(agentAddr).toBe('0x6374FE5F54CdeD72Ff334d09980270c61BC95186')
  })

  it('should find agent address by avatar address (Reverse Lookup - Heimdall)', async () => {
    const characterStore = useCharacterStore()
    const planetStore = usePlanetStore()

    // Switch to Heimdall
    planetStore.setPlanet('heimdall')

    // Real avatar address from heimdall/headless.json
    const avatarAddr = '0x79BB6e025762A76C8C85F73581e8c49b68FcaB0C'

    const agentAddr = await characterStore.findAgentByAvatarAddress(avatarAddr)

    // Should match agentAddress in heimdall/CHARACTER_GET_AGENT_BY_AVATAR.json
    expect(agentAddr).toBe('0x6374FE5F54CdeD72Ff334d09980270c61BC95186')
  })

  it('should reset character data and fetch new ones when planet changes', async () => {
    const planetStore = usePlanetStore()
    const characterStore = useCharacterStore()

    // 1. Start with Odin
    planetStore.setPlanet('odin')
    await characterStore.fetchAllAvatars('0x6374FE5F54CdeD72Ff334d09980270c61BC95186')

    expect(characterStore.characters.length).toBeGreaterThan(0)
    expect(characterStore.characters[0]!.name).toBe('shoppe02') // from odin/headless.json

    // 2. Change planet to Heimdall
    planetStore.setPlanet('heimdall')

    // Store should reset due to watcher (async)
    await vi.waitFor(() => {
      expect(characterStore.characters.length).toBe(0)
    })

    // 3. Fetch again for Heimdall
    await characterStore.fetchAllAvatars('0x6374FE5F54CdeD72Ff334d09980270c61BC95186')
    expect(characterStore.characters.length).toBeGreaterThan(0)
    expect(characterStore.characters[0]!.name).toBe('vnNineChronicles') // from heimdall/headless.json
  })

  it('should clear selection state when going back in login view', async () => {
    const characterStore = useCharacterStore()
    const planetStore = usePlanetStore()

    planetStore.setPlanet('odin')
    await characterStore.fetchAllAvatars('0x6374FE5F54CdeD72Ff334d09980270c61BC95186')

    expect(characterStore.characters.length).toBeGreaterThan(0)

    characterStore.reset()

    expect(characterStore.characters.length).toBe(0)
    expect(characterStore.currentAvatarDetail).toBeNull()
  })
})
