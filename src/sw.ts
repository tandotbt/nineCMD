/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { db } from './db'
import {
  BLOCK_CONFIG,
  PWA_CONFIG,
  STORAGE_KEYS,
  PLANET_CONFIGS,
  DEFAULT_PLANET,
  GQL_QUERIES,
  AUTOMATION_LOGIC,
  CHARACTER_LOGIC_CONSTANTS,
  APP_NAME,
} from './constants'
import type { GetBlocksResponse } from './types/block'
import type { PlanetName } from './types/planet'
import type { AvatarData } from './types/character'
import { evaluateAutomation, estimateVirtualBlock } from './logic/decision'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

precacheAndRoute(self.__WB_MANIFEST)

const PERIODIC_SYNC_TAG = PWA_CONFIG.SW_TAG_BLOCK_FETCH

interface PeriodicSyncEvent extends Event {
  tag: string
  waitUntil(promise: Promise<void>): void
}

/**
 * Interface for Character History data stored in DB
 */
interface CharacterHistoryData {
  name?: string
  dailyRewardReceivedBlockIndex: number
  blockLastClaim: number
  patrolReward?: {
    interval: number
  }
}

// Function to check character notifications
async function checkCharacterNotifications(currentBlock: number) {
  try {
    console.log(`[SW] Starting notification check for block #${currentBlock}`)

    // 0. Check if automation or notification is enabled
    const notifEnabledSetting = await db.settings.get(STORAGE_KEYS.SETTING_NOTIF_ENABLED)
    const autoEnabledSetting = await db.settings.get(STORAGE_KEYS.SETTING_AUTO_ENABLED)

    const isNotifEnabled = (notifEnabledSetting?.value as boolean) ?? true
    const isAutoEnabled = (autoEnabledSetting?.value as boolean) ?? false

    console.log(`[SW] Settings - Notif: ${isNotifEnabled}, Auto: ${isAutoEnabled}`)

    // If neither is enabled, we don't need to check
    if (!isNotifEnabled && !isAutoEnabled) {
      console.log('[SW] Notifications and Automation both disabled, skipping check.')
      return
    }

    // 1. Get current active avatar from settings
    const activeAvatarSetting = await db.settings.get(STORAGE_KEYS.SETTING_AVATAR_ADDRESS)
    const activeAvatarAddress = activeAvatarSetting?.value as string
    if (!activeAvatarAddress) {
      console.log('[SW] No active avatar address found, skipping check.')
      return
    }

    // Check if we should perform the check based on interval
    const lastCheckSetting = await db.settings.get(STORAGE_KEYS.SW_LAST_NOTIF_CHECK_BLOCK)
    const lastCheckBlock = (lastCheckSetting?.value as number) ?? 0

    const intervalSetting = await db.settings.get(STORAGE_KEYS.SETTING_CHECK_INTERVAL_BLOCKS)
    const interval = (intervalSetting?.value as number) ?? 10

    console.log(
      `[SW] Check Interval: ${interval}, Blocks since last check: ${currentBlock - lastCheckBlock}`,
    )

    if (currentBlock - lastCheckBlock < interval) {
      return
    }

    // Only fetch history for the active avatar
    const history = await db.character_history
      .where('avatarAddress')
      .equals(activeAvatarAddress)
      .sortBy('timestamp')

    const latestState = history[history.length - 1]
    if (!latestState) return

    const clients = await self.clients.matchAll()

    const state = {
      timestamp: latestState.timestamp,
      data: latestState.data as unknown as CharacterHistoryData,
      avatarAddress: latestState.avatarAddress,
    }

    const data = state.data
    const avatarName = data.name || 'Avatar'
    let notified = false

    // 1. Modular Automation Evaluation
    // Map CharacterHistoryData to partial AvatarData for evaluation
    const pseudoAvatar = {
      name: avatarName,
      address: state.avatarAddress,
      ap: 0, // In SW we might not have real AP data in history yet, so we rely on block diffs
      apCost: 5,
      timeRefill: currentBlock - data.dailyRewardReceivedBlockIndex,
      timeRefillReal: 0,
      blockLastClaim: data.blockLastClaim,
    } as unknown as AvatarData

    const decision = evaluateAutomation(pseudoAvatar, currentBlock)

    if (decision.action !== AUTOMATION_LOGIC.ACTIONS.IDLE) {
      notified = true
      const title = `Nine CMD: ${avatarName}`
      const body = decision.reason

      if (isNotifEnabled) {
        console.log(`[SW] Showing ${decision.action} notification via decision logic`)
        self.registration.showNotification(title, {
          body,
          icon: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
          tag: `${decision.action.toLowerCase()}-${state.avatarAddress}`,
          renotify: true,
        } as NotificationOptions)
      }

      clients.forEach((client) =>
        client.postMessage({ type: 'NOTIFICATION', title, body, meta: state.avatarAddress }),
      )
    }

    // Update last check block every time we actually perform the check (interval reached)
    await db.settings.put({ key: STORAGE_KEYS.SW_LAST_NOTIF_CHECK_BLOCK, value: currentBlock })
    console.log(
      `[SW] Notification check completed for block #${currentBlock}. notified: ${notified}`,
    )
  } catch (err) {
    console.error('[SW] Notification Check Error:', err)
  }
}

// Function to fetch and save block
async function fetchAndSaveBlock() {
  try {
    const storedSetting = await db.settings.get(STORAGE_KEYS.PLANET)
    const storedPlanet = storedSetting?.value
    const planetName = (
      typeof storedPlanet === 'string' ? storedPlanet.replace(/\"/g, '') : DEFAULT_PLANET
    ) as PlanetName
    const mimirUrl =
      PLANET_CONFIGS[planetName]?.rpcEndpoints['mimir.gql']?.[0] ||
      PLANET_CONFIGS[DEFAULT_PLANET]?.rpcEndpoints['mimir.gql']?.[0] ||
      ''

    const response = await fetch(mimirUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GQL_QUERIES.BLOCKS.GET_LATEST }),
    })

    const result: GetBlocksResponse = await response.json()
    const newBlock = result.data.blocks.items[0]

    if (newBlock) {
      const lastBlock = await db.blocks.orderBy('object.index').last()
      if (!lastBlock || newBlock.object.index > lastBlock.object.index) {
        await db.blocks.put(newBlock)
        await db.settings.put({
          key: STORAGE_KEYS.LAST_BLOCK_TIMESTAMP,
          value: newBlock.object.timestamp,
        })

        // 1. Check for threshold notifications
        const startBlockSetting = await db.settings.get(STORAGE_KEYS.NOTIF_START_BLOCK)
        const thresholdSetting = await db.settings.get(STORAGE_KEYS.NOTIF_THRESHOLD)
        const startBlock = (startBlockSetting?.value as number) ?? null
        const threshold =
          (thresholdSetting?.value as number) ?? BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD

        if (startBlock !== null) {
          const diff = newBlock.object.index - startBlock
          if (diff >= threshold) {
            self.registration.showNotification(`${APP_NAME}: Threshold Reached!`, {
              body: `Tracked ${diff} blocks. Target reached at #${newBlock.object.index}`,
              icon: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
            })
          }
        }

        // 2. Check for character-specific notifications
        await checkCharacterNotifications(newBlock.object.index)
      }
    }
  } catch (error) {
    console.error('[SW] Fetch Error:', error)
    // Offline estimation
    const lastTimestampSetting = await db.settings.get(STORAGE_KEYS.LAST_BLOCK_TIMESTAMP)
    const avgTimeSetting = await db.settings.get(STORAGE_KEYS.AVG_BLOCK_TIME)
    const lastBlock = await db.blocks.orderBy('object.index').last()

    if (lastBlock && lastTimestampSetting && avgTimeSetting) {
      const virtualBlock = estimateVirtualBlock(
        lastBlock.object.index,
        new Date(lastTimestampSetting.value as string).getTime(),
        avgTimeSetting.value as number,
      )
      if (virtualBlock > lastBlock.object.index) {
        await checkCharacterNotifications(virtualBlock)
      }
    }
  }
}

// Background Sync
self.addEventListener('periodicsync', (event: Event) => {
  const syncEvent = event as PeriodicSyncEvent
  if (syncEvent.tag === PERIODIC_SYNC_TAG) {
    syncEvent.waitUntil(fetchAndSaveBlock())
  }
})

// Fallback message listener for manual triggers from UI
self.addEventListener('message', (event) => {
  if (!event.data) return

  console.log('[SW] Message received:', event.data.type)

  if (event.data.type === 'FETCH_BLOCK') {
    fetchAndSaveBlock()
  } else if (event.data.type === 'CHECK_NOTIFICATIONS') {
    const { index } = event.data
    if (index) {
      checkCharacterNotifications(index)
    }
  } else if (event.data.type === 'NOTIFICATION') {
    const { title, body } = event.data
    self.registration.showNotification(title || APP_NAME, {
      body: body || '',
      icon: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
      badge: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
    })
  }
})
