<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBlockStore } from '@/stores/useBlockStore'
import { useAutomationStore } from '@/stores/useAutomationStore'
import { AUTOMATION_STATUS } from '@/constants'
import {
  NCard,
  NSpace,
  NGrid,
  NGi,
  NSwitch,
  NStatistic,
  NProgress,
  NAlert,
  NButton,
  NIcon,
  NInputNumber,
  NList,
  NListItem,
  NText,
  NTag,
  NScrollbar,
  NEmpty,
} from 'naive-ui'
import {
  PlayCircleOutline,
  StopCircleOutline,
  TrashOutline,
  InformationCircleOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
} from '@vicons/ionicons5'

import { useCharacterStore } from '@/stores/useCharacterStore'
import { getAPRefillMetrics } from '@/logic/decision'

const { t, d } = useI18n()
const settingsStore = useSettingsStore()
const blockStore = useBlockStore()
const characterStore = useCharacterStore()
const automationStore = useAutomationStore()

const nextCheckIn = computed(() => {
  const current = blockStore.blockNow
  const interval = settingsStore.checkIntervalBlocks
  const elapsed = current - automationStore.lastCheckBlock
  const remaining = interval - elapsed
  return remaining > 0 ? remaining : 0
})

const getStatusType = (status: string) => {
  switch (status) {
    case AUTOMATION_STATUS.STOPPED:
      return 'default'
    case AUTOMATION_STATUS.IDLE:
      return 'info'
    case AUTOMATION_STATUS.WAITING_BLOCKS:
      return 'warning'
    case AUTOMATION_STATUS.CHECKING_CONDITIONS:
      return 'primary'
    case AUTOMATION_STATUS.NOTIFYING:
      return 'success'
    default:
      return 'default'
  }
}

const toggleAutomation = () => {
  settingsStore.isAutomationEnabled = !settingsStore.isAutomationEnabled
}

const apRefillMetrics = computed(() =>
  getAPRefillMetrics(characterStore.info, settingsStore.apRefillThreshold),
)

const getMetricLabel = (label: string) => {
  if (label === 'AP Level') return t('automation_metric_ap_level')
  if (label === 'Refill Timer') return t('automation_metric_refill_timer')
  return label
}

onMounted(async () => {
  await settingsStore.loadSettings()
  if (settingsStore.agentAddress && characterStore.characters.length === 0) {
    characterStore.fetchAllAvatars(settingsStore.agentAddress)
  }
})
</script>

<template>
  <div class="automation-view">
    <n-space vertical size="large">
      <n-card :title="t('automation_title')">
        <template #header-extra>
          <n-button
            :type="settingsStore.isAutomationEnabled ? 'error' : 'primary'"
            @click="toggleAutomation"
            secondary
          >
            <template #icon>
              <n-icon>
                <PlayCircleOutline v-if="!settingsStore.isAutomationEnabled" />
                <StopCircleOutline v-else />
              </n-icon>
            </template>
            {{
              settingsStore.isAutomationEnabled
                ? t('automation_btn_stop')
                : t('automation_btn_start')
            }}
          </n-button>
        </template>

        <n-space vertical>
          <n-alert
            :type="settingsStore.isAutomationEnabled ? 'success' : 'info'"
            :title="
              settingsStore.isAutomationEnabled
                ? t('automation_status_running')
                : t('automation_status_stopped')
            "
          >
            <template #icon>
              <n-icon>
                <InformationCircleOutline />
              </n-icon>
            </template>
            {{
              settingsStore.isAutomationEnabled
                ? `Hệ thống sẽ kiểm tra điều kiện mỗi ${settingsStore.checkIntervalBlocks} blocks.`
                : 'Hệ thống đang tạm dừng. Các thông báo định kỳ sẽ không được gửi.'
            }}
          </n-alert>

          <n-grid :cols="2" :x-gap="12">
            <n-gi>
              <n-card embedded :bordered="false">
                <n-statistic
                  :label="t('automation_last_check')"
                  :value="automationStore.lastCheckBlock"
                >
                  <template #prefix> # </template>
                </n-statistic>
              </n-card>
            </n-gi>
            <n-gi>
              <n-card embedded :bordered="false">
                <n-statistic :label="t('automation_next_check', { n: nextCheckIn })">
                  <n-progress
                    type="line"
                    :percentage="
                      Math.min(
                        100,
                        Math.max(
                          0,
                          ((settingsStore.checkIntervalBlocks - nextCheckIn) /
                            settingsStore.checkIntervalBlocks) *
                            100,
                        ),
                      )
                    "
                    :show-indicator="false"
                    status="success"
                    processing
                  />
                </n-statistic>
              </n-card>
            </n-gi>
          </n-grid>

          <div class="status-indicator">
            <n-text depth="3">Trạng thái hiện tại: </n-text>
            <n-tag :type="getStatusType(automationStore.status)" round>
              {{ automationStore.status }}
            </n-tag>
          </div>
        </n-space>
      </n-card>

      <n-grid :cols="1" :y-gap="12" :x-gap="12" item-responsive responsive="screen">
        <n-gi span="m:1">
          <n-card title="Automation Logs">
            <template #header-extra>
              <n-button size="small" @click="automationStore.clearLogs" quaternary circle>
                <template #icon>
                  <n-icon><TrashOutline /></n-icon>
                </template>
              </n-button>
            </template>
            <n-scrollbar style="max-height: 300px">
              <n-list v-if="automationStore.logs.length > 0" hoverable clickable>
                <n-list-item v-for="(log, index) in automationStore.logs" :key="index">
                  <n-space justify="space-between">
                    <n-space align="center">
                      <n-tag size="small" :type="getStatusType(log.status)">{{ log.status }}</n-tag>
                      <n-text>{{ log.message }}</n-text>
                    </n-space>
                    <n-text depth="3" style="font-size: 12px">
                      {{ d(log.timestamp, 'short') }}
                    </n-text>
                  </n-space>
                  <div v-if="log.data" style="margin-top: 4px; font-size: 11px; color: #888">
                    <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
                  </div>
                </n-list-item>
              </n-list>
              <n-empty v-else description="No logs yet" />
            </n-scrollbar>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card :title="t('automation_features_title')">
        <n-list bordered separator=" ">
          <n-list-item>
            <n-space vertical size="medium">
              <n-space justify="space-between" align="center">
                <n-space align="center">
                  <n-icon size="20" color="#18a058">
                    <CheckmarkCircleOutline v-if="settingsStore.automationFeatures.refill_ap" />
                    <CloseCircleOutline v-else color="#d03050" />
                  </n-icon>
                  <div>
                    <div style="font-weight: 500; font-size: 16px">
                      {{ t('automation_feature_refill_ap_label') }}
                    </div>
                    <div style="font-size: 12px; color: #666">
                      {{ t('automation_feature_refill_ap_help') }}
                    </div>
                  </div>
                </n-space>
                <n-switch v-model:value="settingsStore.automationFeatures.refill_ap" />
              </n-space>

              <!-- AP Threshold Adjustment -->
              <n-card
                v-if="settingsStore.automationFeatures.refill_ap"
                embedded
                :bordered="false"
                size="small"
              >
                <n-space vertical size="small">
                  <n-space justify="space-between" align="center">
                    <n-text depth="3" style="font-size: 13px">
                      {{ t('automation_threshold_label') }}
                    </n-text>
                    <n-input-number
                      v-model:value="settingsStore.apRefillThreshold"
                      :min="0"
                      :max="120"
                      size="small"
                      style="width: 100px"
                    />
                  </n-space>
                </n-space>
              </n-card>

              <!-- Metrics Display -->
              <n-card embedded :bordered="false" size="small">
                <n-space vertical size="small">
                  <div v-for="metric in apRefillMetrics.metrics" :key="metric.label">
                    <n-space justify="space-between" align="center">
                      <n-text depth="3" style="font-size: 12px">
                        {{ getMetricLabel(metric.label) }}
                      </n-text>
                      <n-space size="small" align="center">
                        <n-text
                          :type="metric.isMet ? 'success' : 'warning'"
                          style="font-size: 12px; font-weight: 500"
                        >
                          {{ metric.value }} / {{ metric.threshold }}
                        </n-text>
                        <n-tag v-if="metric.isMet" size="tiny" type="success" round>
                          {{ t('automation_status_met') }}
                        </n-tag>
                      </n-space>
                    </n-space>
                    <n-progress
                      type="line"
                      :percentage="metric.percentage"
                      :status="metric.isMet ? 'success' : 'warning'"
                      :show-indicator="false"
                      :height="4"
                      :border-radius="2"
                    />
                  </div>
                </n-space>
              </n-card>
            </n-space>
          </n-list-item>
        </n-list>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.automation-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 4px;
}
</style>
