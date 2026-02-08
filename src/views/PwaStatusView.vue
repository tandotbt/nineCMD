<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { db, type CharacterHistory } from '@/db'
import { format } from 'date-fns'
import type { Block } from '@/types/block'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { usePlanetStore } from '@/stores/usePlanetStore'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const planetStore = usePlanetStore()
const swStatus = ref('Checking...')
const dbStatus = ref('Connected')
const lastBlock = ref<Block | null>(null)
const avgTime = ref(0)
const lastCheckBlock = ref(0)
const cachedAvatars = ref<(CharacterHistory & { diff?: string[] | null })[]>([])
const showAllHistory = ref(false)

const getDiff = (
  current: Record<string, unknown>,
  previous: Record<string, unknown> | undefined,
) => {
  if (!previous) return null
  const diffs: string[] = []
  const keys = ['level', 'ap', 'ncg', 'crystal', 'stage', 'cp', 'dailyRewardReceivedBlockIndex']
  keys.forEach((key) => {
    const currVal = current[key]
    const prevVal = previous[key]
    if (currVal !== prevVal) {
      diffs.push(`${key}: ${prevVal} -> ${currVal}`)
    }
  })
  return diffs.length > 0 ? diffs : null
}

const refreshData = async () => {
  // SW Status
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    swStatus.value = registration
      ? registration.active
        ? 'Active'
        : 'Installed/Waiting'
      : 'Not found'
  } else {
    swStatus.value = 'Not supported'
  }

  // DB Data
  const block = await db.blocks.orderBy('object.index').last()
  lastBlock.value = block || null

  const avgSetting = await db.settings.get('nine-cmd-avg-block-time')
  avgTime.value = (avgSetting?.value as number) || 0

  const lastCheckSetting = await db.settings.get('sw-last-notif-check-block')
  lastCheckBlock.value = (lastCheckSetting?.value as number) || 0

  const history = await db.character_history
    .where('planet')
    .equals(planetStore.currentPlanetName)
    .reverse()
    .toArray()

  // Clean and process history entries
  const processedHistory = history.map((h) => {
    let data = h.data as Record<string, unknown>
    const customData = data._custom as { value: Record<string, unknown> } | undefined
    if (customData?.value) {
      data = customData.value
    }
    return { ...h, data }
  })

  // Enrich with diff information
  const enrichedHistory = processedHistory.map((h, index) => {
    // Find previous entry for the same avatar (it's further down in the reversed history)
    const previous = processedHistory
      .slice(index + 1)
      .find((p) => p.avatarAddress === h.avatarAddress)
    const diff = getDiff(h.data, previous?.data)
    return { ...h, diff }
  })

  // Filter by current planet and exclude current selected avatar
  const filteredByPlanetAndAvatar = enrichedHistory.filter(
    (h) => h.avatarAddress.toLowerCase() !== settingsStore.avatarAddress.toLowerCase(),
  )

  if (showAllHistory.value) {
    cachedAvatars.value = filteredByPlanetAndAvatar.slice(0, 50)
  } else {
    // Filter to show only entries where there is an actual diff
    const filtered = filteredByPlanetAndAvatar.filter((h) => h.diff !== null)
    cachedAvatars.value = filtered.slice(0, 50)
  }
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  refreshData()
  timer = setInterval(refreshData, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="pwa-status">
    <n-space vertical size="large">
      <n-grid :cols="2" :x-gap="12" :y-gap="12">
        <n-gi>
          <n-card :title="t('pwa_sw_status')">
            <n-tag :type="swStatus === 'Active' ? 'success' : 'warning'">
              {{ swStatus }}
            </n-tag>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card :title="t('pwa_db_status')">
            <n-tag type="success">{{ dbStatus }}</n-tag>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card :title="t('pwa_status_title')">
        <n-descriptions bordered label-placement="left" :column="2">
          <n-descriptions-item :label="t('pwa_last_block')">
            #{{ lastBlock?.object?.index || 'N/A' }}
            <n-text depth="3" v-if="lastBlock">
              ({{ format(new Date(lastBlock.object.timestamp), 'yyyy-MM-dd HH:mm:ss') }})
            </n-text>
          </n-descriptions-item>
          <n-descriptions-item :label="t('pwa_avg_time')">
            {{ (avgTime / 1000).toFixed(2) }}s
          </n-descriptions-item>
          <n-descriptions-item :label="t('settings_notification_label')">
            <n-tag :type="settingsStore.isNotificationEnabled ? 'success' : 'error'" size="small">
              {{ settingsStore.isNotificationEnabled ? 'ON' : 'OFF' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="t('breadcrumb_automation')">
            <n-tag :type="settingsStore.isAutomationEnabled ? 'success' : 'error'" size="small">
              {{ settingsStore.isAutomationEnabled ? 'ON' : 'OFF' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item :label="t('pwa_last_check')">
            #{{ lastCheckBlock }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('settings_check_interval_label')">
            {{ settingsStore.checkIntervalBlocks }} {{ t('home_form_suffix_blocks') }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <n-card :title="t('pwa_cached_avatars')">
        <template #header-extra>
          <n-space align="center">
            <n-text depth="3">{{
              showAllHistory ? t('pwa_show_all_history') : t('pwa_show_changes_only')
            }}</n-text>
            <n-switch v-model:value="showAllHistory" @update:value="refreshData" />
          </n-space>
        </template>
        <n-table :single-line="false">
          <thead>
            <tr>
              <th style="width: 120px">{{ t('pwa_table_name') }}</th>
              <th style="width: 100px">{{ t('pwa_table_last_update') }}</th>
              <th>{{ t('planet_raw_data') }} Changes</th>
              <th style="width: 150px">{{ t('pwa_table_address') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, index) in cachedAvatars" :key="index">
              <td>
                <n-text strong>{{ (h.data as any).name }}</n-text>
              </td>
              <td>{{ format(h.timestamp, 'HH:mm:ss') }}</td>
              <td>
                <div v-if="(h as any).diff">
                  <n-tag
                    v-for="(d, i) in (h as any).diff"
                    :key="i"
                    size="tiny"
                    type="primary"
                    style="margin-right: 4px; margin-bottom: 4px"
                  >
                    {{ d }}
                  </n-tag>
                </div>
                <n-text depth="3" v-else italic size="small">No major changes</n-text>
              </td>
              <td>
                <n-ellipsis style="max-width: 140px" code>{{ h.avatarAddress }}</n-ellipsis>
              </td>
            </tr>
            <tr v-if="cachedAvatars.length === 0">
              <td colspan="4" style="text-align: center; padding: 20px">{{ t('csv_no_data') }}</td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.pwa-status {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
