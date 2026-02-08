import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { usePlanetStore } from '@/stores/usePlanetStore'
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAgentLookup } from './useAgentLookup'
import { useAvatarLookup } from './useAvatarLookup'
import { useAvatarSelectionStore } from '@/stores/useAvatarSelectionStore'

export type LoginMethod = 'agent' | 'avatar'

export function useLoginLogic() {
  const { t } = useI18n()
  const router = useRouter()
  const characterStore = useCharacterStore()
  const settingsStore = useSettingsStore()
  const planetStore = usePlanetStore()
  const message = useMessage()

  // UI State
  const currentStep = ref(1)
  const loginMethod = ref<LoginMethod>('avatar')

  // Lookup Hooks
  const agentLookup = useAgentLookup()
  const avatarLookup = useAvatarLookup()
  const avatarSelection = useAvatarSelectionStore()

  // Input Models
  const agentAddressInput = ref('')
  const avatarAddressInput = ref('')
  const selectedAvatar = ref('')

  // Computed State
  const isFetching = computed(
    () =>
      agentLookup.isFetching.value ||
      avatarLookup.isFetching.value ||
      avatarSelection.isFetching ||
      avatarSelection.isLoading,
  )

  const avatars = computed(() => characterStore.characters)

  const discoveredAvatars = computed(() => avatarSelection.discoveredAvatars)

  const discoveryOptions = computed(() => {
    return discoveredAvatars.value.map((a) => ({
      label: a.name,
      value: a.address,
      avatar: a,
    }))
  })

  // Methods
  const resetState = () => {
    currentStep.value = 1
    selectedAvatar.value = ''
    characterStore.reset()
  }

  const handleFetchAvatars = async () => {
    const result = await agentLookup.lookup(agentAddressInput.value)
    if (agentLookup.error.value) {
      message.error(t(`login_error_${agentLookup.error.value}`))
      return
    }

    if (result.length > 0) {
      currentStep.value = 2
    } else {
      message.warning(t('login_error_no_avatars'))
    }
  }

  const handleReverseLookup = async (addressOverride?: string, agentOverride?: string) => {
    const addr = addressOverride || avatarAddressInput.value

    // If we already have the agent address (from discovery list), use it directly
    if (agentOverride) {
      agentAddressInput.value = agentOverride
      const result = await agentLookup.lookup(agentOverride)
      if (result.length > 0) {
        selectedAvatar.value = addr
        currentStep.value = 2
        message.success(t('login_reverse_success'))
      } else {
        message.error(t('login_error_fetch_failed'))
      }
      return
    }

    const result = await avatarLookup.lookup(addr)
    if (avatarLookup.error.value) {
      message.error(t(`login_error_${avatarLookup.error.value}`))
      return
    }

    if (result) {
      agentAddressInput.value = result.agentAddress
      selectedAvatar.value = addr
      currentStep.value = 2
      message.success(t('login_reverse_success'))
    }
  }

  const handleLogin = () => {
    if (!selectedAvatar.value) {
      message.error(t('login_error_select_avatar'))
      return
    }

    settingsStore.agentAddress = agentAddressInput.value
    settingsStore.avatarAddress = selectedAvatar.value

    message.success(t('login_success'))
    router.push('/')
  }

  const goBack = () => {
    currentStep.value = 1
    characterStore.reset()
  }

  // Watchers
  watch(
    () => planetStore.currentPlanetName,
    () => {
      resetState()
      agentAddressInput.value = ''
      avatarAddressInput.value = ''
    },
  )

  return {
    currentStep,
    loginMethod,
    isFetching,
    agentAddressInput,
    avatarAddressInput,
    selectedAvatar,
    avatars,
    discoveryOptions,
    discoveredAvatars,
    handleFetchAvatars,
    handleReverseLookup,
    handleLogin,
    goBack,
  }
}
