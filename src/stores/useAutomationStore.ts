/**
 * @file stores/useAutomationStore.ts
 * @description Pinia store for automation engine.
 * Manages the state machine for the block-based automation loop.
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  AUTOMATION_STATUS,
  type AutomationStatus,
  STORAGE_KEYS,
  AUTOMATION_LOGIC,
} from '@/constants'
import { useBlockStore } from './useBlockStore'
import { useCharacterStore } from './useCharacterStore'
import { useSettingsStore } from './useSettingsStore'
import { evaluateAutomation } from '@/logic/decision'
import { getSignificantChanges } from '@/logic/diff'
import { NotificationService } from '@/logic/NotificationService'
import { db } from '@/db'
import { i18n } from '@/i18n'
import type { AvatarData } from '@/types/character'

export interface AutomationLog {
  timestamp: number
  status: AutomationStatus
  message: string
  data?: unknown
}

export const useAutomationStore = defineStore('automation', () => {
  const blockStore = useBlockStore()
  const characterStore = useCharacterStore()
  const settingsStore = useSettingsStore()

  // State
  const status = ref<AutomationStatus>(AUTOMATION_STATUS.STOPPED)
  const logs = ref<AutomationLog[]>([])
  const lastCheckBlock = ref(0)
  const isProcessing = ref(false)
  const notificationBackoff = ref<Record<string, number>>({}) // Track backoff for each action reason

  // Load initial state from DB
  db.settings
    .get(STORAGE_KEYS.LAST_AUTOMATION_CHECK_BLOCK)
    .then((s) => {
      if (s) lastCheckBlock.value = s.value as number
    })
    .catch((err) => {
      console.error('[AutomationStore] Failed to load lastCheckBlock:', err)
    })

  const addLog = (message: string, data?: unknown) => {
    logs.value.unshift({
      timestamp: Date.now(),
      status: status.value,
      message,
      data,
    })
    if (logs.value.length > AUTOMATION_LOGIC.MAX_LOGS) logs.value.pop()
  }

  const checkInterval = computed(() => settingsStore.checkIntervalBlocks)
  const blocksSinceLastCheck = computed(() => {
    if (blockStore.blockNow <= 0 || lastCheckBlock.value <= 0) return 0
    return Math.max(0, blockStore.blockNow - lastCheckBlock.value)
  })

  /**
   * Main Automation Loop
   * Follows the flow: IDLE -> Wait X blocks -> CHECKING_CONDITIONS -> NOTIFYING (if needed) -> IDLE
   */
  const processLoop = async (currentBlock: number) => {
    if (!settingsStore.isAutomationEnabled || isProcessing.value) return

    isProcessing.value = true

    try {
      // Initialize if just started
      if (status.value === AUTOMATION_STATUS.STOPPED) {
        status.value = AUTOMATION_STATUS.IDLE
      }

      // 1. Check if enough blocks passed
      const diff = currentBlock - lastCheckBlock.value
      if (diff < checkInterval.value) {
        status.value = AUTOMATION_STATUS.WAITING_BLOCKS
        return
      }

      // 2. CHECKING_CONDITIONS
      status.value = AUTOMATION_STATUS.CHECKING_CONDITIONS
      addLog(`Cycle started at block #${currentBlock}`)

      // Fetch latest character data for evaluation
      if (settingsStore.agentAddress && settingsStore.avatarAddress) {
        await characterStore.fetchAvatarDetail()
      }

      const changes = getSignificantChanges(
        characterStore.previousAvatarDetail
          ? (characterStore.previousAvatarDetail as unknown as AvatarData)
          : null,
        characterStore.info!,
      )

      const decision = evaluateAutomation(
        characterStore.info,
        currentBlock,
        settingsStore.automationFeatures,
        {
          apRefillThreshold: settingsStore.apRefillThreshold,
          dailyRewardInterval: characterStore.info?.dailyRewardInterval,
        },
        changes,
      )
      addLog(`Decision: ${decision.action}`, { reason: decision.reason })

      // 3. NOTIFYING (if action is not IDLE)
      if (decision.action !== AUTOMATION_LOGIC.ACTIONS.IDLE) {
        status.value = AUTOMATION_STATUS.NOTIFYING

        const reasonKey = `${decision.action}:${decision.reason}`
        const backoffCount = notificationBackoff.value[reasonKey] || 0

        // Duplicate check logic with exponential backoff
        const lastLog = logs.value[0]
        const isDuplicate =
          !!lastLog &&
          lastLog.message.includes(decision.action) &&
          (lastLog.data as Record<string, unknown>)?.reason === decision.reason

        let shouldNotify = !isDuplicate

        if (isDuplicate) {
          notificationBackoff.value[reasonKey] = backoffCount + 1
          const currentBackoff = notificationBackoff.value[reasonKey]

          const backoffLimit =
            settingsStore.maxNotificationRepeats *
            Math.pow(
              2,
              Math.max(
                0,
                Math.floor(Math.log2(currentBackoff / settingsStore.maxNotificationRepeats)),
              ),
            )

          if (currentBackoff === backoffLimit) {
            shouldNotify = true
            addLog(`Backoff milestone reached (${currentBackoff}), re-notifying ${decision.action}`)
          }
        } else {
          // Reset backoff if action/reason changes
          notificationBackoff.value[reasonKey] = 0
        }

        if (shouldNotify) {
          // Specific notification logic for AP Refill
          if (decision.action === AUTOMATION_LOGIC.ACTIONS.REFILL_AP) {
            NotificationService.show(i18n.global.t('automation_notif_ap_refill_title'), {
              body: i18n.global.t('automation_notif_ap_refill_body', {
                name: characterStore.info?.name || 'Avatar',
                block: currentBlock,
              }),
            })
          } else {
            // Fallback for other modular actions
            NotificationService.show(`Nine CMD: ${decision.action}`, {
              body: decision.reason,
            })
          }

          addLog(`Notification sent for ${decision.action}`, {
            reason: decision.reason,
            backoff: notificationBackoff.value[reasonKey],
          })
        } else {
          addLog(
            `Skipped duplicate notification for ${decision.action} (Backoff: ${notificationBackoff.value[reasonKey]})`,
          )
        }
      } else {
        // Clear backoff when IDLE
        notificationBackoff.value = {}
      }

      // 4. RETURN TO IDLE
      lastCheckBlock.value = currentBlock
      await db.settings.put({
        key: STORAGE_KEYS.LAST_AUTOMATION_CHECK_BLOCK,
        value: currentBlock,
      })
      status.value = AUTOMATION_STATUS.IDLE
      addLog('Cycle finished, returning to IDLE')
    } catch (err) {
      addLog('Error in automation loop', err)
      status.value = AUTOMATION_STATUS.IDLE
    } finally {
      isProcessing.value = false
    }
  }

  // Watch for block updates
  watch(
    () => blockStore.blockNow,
    (newBlock) => {
      if (newBlock > 0 && settingsStore.isAutomationEnabled) {
        processLoop(newBlock).catch((err) => {
          console.error('[AutomationStore] Watcher failed to process loop:', err)
        })
      }
    },
  )

  // Watch for toggle
  watch(
    () => settingsStore.isAutomationEnabled,
    (enabled) => {
      if (enabled) {
        status.value = AUTOMATION_STATUS.IDLE
        addLog('Automation started')
      } else {
        status.value = AUTOMATION_STATUS.STOPPED
        addLog('Automation stopped')
      }
    },
  )

  return {
    status,
    logs,
    lastCheckBlock,
    blocksSinceLastCheck,
    checkInterval,
    addLog,
    clearLogs: () => (logs.value = []),
  }
})
