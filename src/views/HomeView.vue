<template>
  <div class="home-container">
    <n-card :title="APP_NAME" class="main-card">
      <template #header-extra>
        <n-space align="center">
          <n-icon size="20">
            <moon-icon v-if="isDark" />
            <sun-icon v-else />
          </n-icon>
          <n-switch :value="isDark" @update:value="toggleDark" />
        </n-space>
      </template>

      <div class="welcome-content">
        <n-h2>{{ t('home_welcome_title') }}</n-h2>
        <n-p>
          {{ t('home_welcome_desc') }}
        </n-p>

        <n-space vertical size="large" class="nav-buttons">
          <n-button type="primary" size="large" block @click="router.push('/blocks')">
            <template #icon>
              <n-icon><cube-icon /></n-icon>
            </template>
            {{ t('home_btn_view_blocks') }}
          </n-button>

          <n-button size="large" block @click="showConfig = !showConfig">
            <template #icon>
              <n-icon><settings-icon /></n-icon>
            </template>
            {{ showConfig ? t('home_btn_hide_config') : t('home_btn_show_config') }}
          </n-button>
        </n-space>

        <n-collapse-transition :show="showConfig">
          <div class="config-section">
            <NotificationConfigForm
              v-model:threshold="blockStore.notificationThreshold"
              :block-now="blockStore.blockNow"
              :start-block-index="blockStore.startBlockIndex"
              :label-threshold="t('home_form_label_threshold')"
              :placeholder-threshold="t('home_form_placeholder_threshold')"
              :suffix-blocks="t('home_form_suffix_blocks')"
              :btn-save-text="t('home_btn_save_config')"
              :btn-marker-text="t('home_btn_set_marker_now')"
              :info-current-block="t('home_info_current_block')"
              :info-marker="t('home_info_marker')"
              :info-remaining="
                t('home_info_remaining', {
                  n: Math.max(
                    0,
                    (blockStore.notificationThreshold ?? 0) -
                      (blockStore.blockNow - (blockStore.startBlockIndex || 0)),
                  ),
                })
              "
              @save="handleSave"
              @set-marker="blockStore.setNotificationMarker"
            />
          </div>
        </n-collapse-transition>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBlockStore } from '../stores/useBlockStore'
import { APP_NAME } from '../constants'
import { useDark, useToggle } from '@vueuse/core'
import {
  WeatherMoon24Regular as MoonIcon,
  WeatherSunny24Regular as SunIcon,
  Cube24Regular as CubeIcon,
  Settings24Regular as SettingsIcon,
} from '@vicons/fluent'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import NotificationConfigForm from '@/components/block/NotificationConfigForm.vue'

const { t } = useI18n()
const blockStore = useBlockStore()
const message = useMessage()
const router = useRouter()

const showConfig = ref(false)

// Dark mode logic
const isDark = useDark()
const toggleDark = useToggle(isDark)

const handleSave = () => {
  message.success(t('home_msg_save_success', { n: blockStore.notificationThreshold }))
}
</script>

<style scoped>
.home-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.main-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
}

.nav-buttons {
  margin: 32px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.config-section {
  margin-top: 24px;
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 24px;
}
</style>
