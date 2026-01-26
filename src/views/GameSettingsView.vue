<script setup lang="ts">
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { NotificationService } from '@/logic/NotificationService'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const characterStore = useCharacterStore()
const message = useMessage()

onMounted(async () => {
  await settingsStore.loadSettings()
})

const testNotification = async () => {
  console.log('[GameSettingsView] testNotification clicked')

  if (!('Notification' in window)) {
    message.error(t('settings_notif_unsupported'))
    return
  }

  if (Notification.permission === 'default') {
    message.info(t('settings_notif_permission_prompt'))
  }

  const granted = await NotificationService.requestPermission()
  console.log('[GameSettingsView] Permission granted:', granted)

  if (granted) {
    message.success(t('settings_notif_permission_granted'))
    NotificationService.show(t('settings_test_notif_title'), {
      body: t('settings_test_notif_body'),
    })

    // Also test postMessage if service worker is active
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('[GameSettingsView] Sending NOTIFICATION message to Service Worker')
      navigator.serviceWorker.controller.postMessage({
        type: 'NOTIFICATION',
        title: t('settings_test_notif_title') + ' (SW Test)',
        body: t('settings_test_notif_body'),
      })
    } else {
      console.warn('[GameSettingsView] Service Worker controller not found')
    }
  } else {
    console.error('[GameSettingsView] Notification permission denied')
  }
}
</script>

<template>
  <div class="game-settings">
    <n-space vertical size="large">
      <n-card :title="t('settings_game_title')">
        <n-form label-placement="left" label-width="200">
          <n-form-item :label="t('settings_notification_label')">
            <n-switch v-model:value="settingsStore.isNotificationEnabled" />
            <template #feedback>
              {{ t('settings_notification_help') }}
            </template>
          </n-form-item>

          <n-form-item :label="t('settings_check_interval_label')">
            <n-input-number v-model:value="settingsStore.checkIntervalBlocks" :min="1" :max="100" />
            <template #feedback>
              {{ t('settings_check_interval_help') }}
            </template>
          </n-form-item>

          <n-form-item :label="t('settings_ap_refill_label')">
            <n-input-number
              :value="
                characterStore.info?.dailyRewardInterval || settingsStore.apDailyRefillInterval
              "
              disabled
            />
            <template #feedback>
              {{ t('settings_ap_refill_help') }}
            </template>
          </n-form-item>

          <n-form-item :label="t('settings_patrol_interval_label')">
            <n-input-number v-model:value="settingsStore.patrolInterval" :min="1" :step="10" />
            <template #feedback>
              {{ t('settings_patrol_interval_help') }}
            </template>
          </n-form-item>

          <n-form-item :label="t('settings_backoff_label')">
            <n-input-number
              v-model:value="settingsStore.maxNotificationRepeats"
              :min="1"
              :max="100"
            />
            <template #feedback>
              {{ t('settings_backoff_help') }}
            </template>
          </n-form-item>

          <n-form-item :label="t('settings_test_notif_label')">
            <n-button type="primary" @click="testNotification">
              {{ t('settings_btn_test_notif') }}
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.game-settings {
  max-width: 800px;
  margin: 0 auto;
}
</style>
