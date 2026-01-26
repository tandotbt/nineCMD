/**
 * @file stores/useSettingsStore.ts
 * @description Pinia store for user-customizable game and notification settings.
 * Persists data to IndexedDB settings table for Service Worker access.
 */

import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { db } from '@/db'
import { CHARACTER_LOGIC_CONSTANTS, STORAGE_KEYS } from '@/constants'

export const useSettingsStore = defineStore('settings', () => {
  const { NOTIFICATION, AP } = CHARACTER_LOGIC_CONSTANTS

  const checkIntervalBlocks = ref<number>(NOTIFICATION.CHECK_INTERVAL_BLOCKS)
  const apDailyRefillInterval = ref<number>(AP.DAILY_REFILL_INTERVAL)
  const patrolInterval = ref<number>(AP.PATROL_REFILL_INTERVAL)
  const isNotificationEnabled = ref<boolean>(NOTIFICATION.DEFAULT_ENABLED)
  const isAutomationEnabled = ref<boolean>(false)
  const automationFeatures = ref({
    refill_ap: false,
  })
  const apRefillThreshold = ref<number>(0) // 0 means use apCost
  const maxNotificationRepeats = ref<number>(NOTIFICATION.MAX_REPEATS) // Initial backoff factor
  const agentAddress = ref('')
  const avatarAddress = ref('')

  // Load settings from DB on initialization
  const loadSettings = async () => {
    const interval = await db.settings.get(STORAGE_KEYS.SETTING_CHECK_INTERVAL_BLOCKS)
    if (interval) checkIntervalBlocks.value = interval.value as number

    const apRefill = await db.settings.get(STORAGE_KEYS.SETTING_AP_REFILL_INTERVAL)
    if (apRefill) apDailyRefillInterval.value = apRefill.value as number

    const patrol = await db.settings.get(STORAGE_KEYS.SETTING_PATROL_INTERVAL)
    if (patrol) patrolInterval.value = patrol.value as number

    const enabled = await db.settings.get(STORAGE_KEYS.SETTING_NOTIF_ENABLED)
    if (enabled) isNotificationEnabled.value = enabled.value as boolean

    const autoEnabled = await db.settings.get(STORAGE_KEYS.SETTING_AUTO_ENABLED)
    if (autoEnabled) isAutomationEnabled.value = autoEnabled.value as boolean

    const features = await db.settings.get(STORAGE_KEYS.SETTING_AUTOMATION_FEATURES)
    if (features) automationFeatures.value = features.value as typeof automationFeatures.value

    const threshold = await db.settings.get(STORAGE_KEYS.SETTING_AP_REFILL_THRESHOLD)
    if (threshold) apRefillThreshold.value = threshold.value as number

    const repeats = await db.settings.get(STORAGE_KEYS.SETTING_MAX_NOTIFICATION_REPEATS)
    if (repeats) maxNotificationRepeats.value = repeats.value as number

    const agent = await db.settings.get(STORAGE_KEYS.SETTING_AGENT_ADDRESS)
    if (agent) agentAddress.value = agent.value as string

    const avatar = await db.settings.get(STORAGE_KEYS.SETTING_AVATAR_ADDRESS)
    if (avatar) avatarAddress.value = avatar.value as string
  }

  // Persist settings to DB whenever they change
  watch(checkIntervalBlocks, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_CHECK_INTERVAL_BLOCKS, value: val })
  })

  watch(apDailyRefillInterval, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_AP_REFILL_INTERVAL, value: val })
  })

  watch(patrolInterval, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_PATROL_INTERVAL, value: val })
  })

  watch(isNotificationEnabled, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_NOTIF_ENABLED, value: val })
  })

  watch(isAutomationEnabled, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_AUTO_ENABLED, value: val })
  })

  watch(
    automationFeatures,
    async (val) => {
      await db.settings.put({ key: STORAGE_KEYS.SETTING_AUTOMATION_FEATURES, value: { ...val } })
    },
    { deep: true },
  )

  watch(apRefillThreshold, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_AP_REFILL_THRESHOLD, value: val })
  })

  watch(maxNotificationRepeats, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_MAX_NOTIFICATION_REPEATS, value: val })
  })

  watch(agentAddress, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_AGENT_ADDRESS, value: val })
  })

  watch(avatarAddress, async (val) => {
    await db.settings.put({ key: STORAGE_KEYS.SETTING_AVATAR_ADDRESS, value: val })
  })

  const isLoggedIn = computed(() => !!agentAddress.value && !!avatarAddress.value)

  const logout = async () => {
    agentAddress.value = ''
    avatarAddress.value = ''
    await db.settings.delete(STORAGE_KEYS.SETTING_AGENT_ADDRESS)
    await db.settings.delete(STORAGE_KEYS.SETTING_AVATAR_ADDRESS)
  }

  return {
    checkIntervalBlocks,
    apDailyRefillInterval,
    patrolInterval,
    isNotificationEnabled,
    isAutomationEnabled,
    automationFeatures,
    apRefillThreshold,
    maxNotificationRepeats,
    agentAddress,
    avatarAddress,
    isLoggedIn,
    loadSettings,
    logout,
  }
})
