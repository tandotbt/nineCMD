<template>
  <n-badge :value="0" style="cursor: pointer" @click="showDrawer = !showDrawer">
    <n-avatar size="medium" :src="pngLoading" />
  </n-badge>

  <n-drawer v-model:show="showDrawer" placement="bottom" :height="drawerSize">
    <n-drawer-content :native-scrollbar="false" :default-height="100" closable>
      <template #header>
        <n-space justify="baseline">
          <FooterInfoBlock />
          <n-button quaternary size="small" @click="toggleDrawerSize">
            <template #icon>
              <n-icon :component="iconFull" />
            </template>
          </n-button>
        </n-space>
      </template>
      <template #footer>
        <n-flex justify="end">
          <n-text depth="3" style="font-size: 12px">
            Make with ❤️ by tanbt ©2024
          </n-text>
        </n-flex>
      </template>
      <n-tabs type="bar" trigger="hover" animated>
        <!-- Block Monitor Tab -->
        <n-tab-pane name="blockMonitor" tab="Block Monitor">
          <n-space vertical>
            <!-- Planet Selection -->
            <n-space vertical>
              <n-text depth="2" strong>Planet</n-text>
              <n-select
                :value="appSettings.selectedPlanet"
                :options="planetOptions"
                placeholder="Chọn planet"
                @update:value="onPlanetChange"
              />
            </n-space>

            <!-- Poll Interval Setting -->
            <n-space vertical>
              <n-text depth="2" strong>Chu kỳ Poll (giây)</n-text>
              <n-select
                :value="appSettings.pollIntervalMs"
                :options="pollIntervalOptions"
                placeholder="Chọn chu kỳ"
                @update:value="onIntervalChange"
              />
            </n-space>

            <n-divider />

            <!-- Block Info -->
            <n-space vertical>
              <n-text depth="2" strong>Thông tin Block</n-text>
              <n-space>
                <n-text depth="3">Block hiện tại:</n-text>
                <n-text strong>#{{ blockPolling.currentBlockIndex }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Avg block time:</n-text>
                <n-text strong>{{ blockPolling.avgBlockTime }}s</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Planet:</n-text>
                <n-text strong>{{ blockPolling.planetLabel }}</n-text>
              </n-space>
            </n-space>

            <n-divider />

            <!-- Poll Stats -->
            <n-space vertical>
              <n-text depth="2" strong>Thống kê Poll</n-text>
              <n-space>
                <n-text depth="3">Tổng lần poll:</n-text>
                <n-text strong>{{ blockPolling.pollCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Thành công:</n-text>
                <n-text strong style="color: #18a058">{{ blockPolling.successCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Thất bại:</n-text>
                <n-text strong style="color: #d4380d">{{ blockPolling.failCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Tỷ lệ thành công:</n-text>
                <n-text strong>{{ blockPolling.successRate }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">Lịch sử:</n-text>
                <n-text strong>{{ blockPolling.historyLength }} entries</n-text>
              </n-space>
            </n-space>

            <n-divider />

            <!-- Status -->
            <n-space vertical>
              <n-text depth="2" strong>Trạng thái</n-text>
              <n-space>
                <n-text depth="3">Đang poll:</n-text>
                <n-tag :type="blockPolling.isPolling ? 'success' : 'error'" size="small">
                  {{ blockPolling.isPolling ? 'Đang chạy' : 'Đã dừng' }}
                </n-tag>
              </n-space>
              <n-space v-if="blockPolling.error">
                <n-text depth="3" style="color: #d4380d">Lỗi: {{ blockPolling.error }}</n-text>
              </n-space>
              <n-space>
                <n-button size="small" @click="blockPolling.refresh()">Refresh ngay</n-button>
                <n-button size="small" @click="handleTogglePoll">
                  {{ blockPolling.isPolling ? 'Dừng' : 'Bắt đầu' }}
                </n-button>
              </n-space>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- Settings Tab -->
        <n-tab-pane name="setting" tab="Setting">
          <n-space vertical>
            <!-- Dark Mode Toggle -->
            <n-space justify="space-between" align="center">
              <n-text depth="2" strong>Dark Mode</n-text>
              <n-switch :value="appSettings.isDarkMode" @update:value="onDarkModeToggle" />
            </n-space>

            <n-divider />

            <!-- Language -->
            <n-space vertical>
              <n-text depth="2" strong>Ngôn ngữ</n-text>
              <n-select
                :value="appSettings.lang"
                :options="langOptions"
                placeholder="Chọn ngôn ngữ"
                @update:value="onLangChange"
              />
            </n-space>

            <n-divider />

            <!-- Planet (quick access) -->
            <n-space vertical>
              <n-text depth="2" strong>Planet hiện tại</n-text>
              <n-text depth="3">{{ appSettings.planetLabel }}</n-text>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- Actions Tab -->
        <n-tab-pane name="actions" tab="Actions">
          <n-space vertical>
            <n-text depth="3">Actions placeholder - sẽ điền logic sau</n-text>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import {
  NBadge,
  NAvatar,
  NDrawer,
  NDrawerContent,
  NSpace,
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NText,
  NFlex,
  NDivider,
  NSelect,
  NTag,
  NSwitch
} from 'naive-ui'
import {
  FullscreenRound as onFull,
  FullscreenExitRound as offFull
} from '@vicons/material'
import FooterInfoBlock from './FooterInfoBlock.vue'
import { useBlockPollingStore } from '../../stores/blockPolling'
import { useAppSettingsStore } from '../../stores/appSettings'
import { PLANET_OPTIONS, POLL_INTERVAL_OPTIONS, type PlanetName } from '../../utilities/constants'

const showDrawer = ref(false)
const drawerSize = ref<string>('70%')
const iconFull = shallowRef<typeof onFull>(onFull)
const pngLoading = '' // Placeholder

const DRAWER_SIZE = '70%'
const DRAWER_SIZE_MAX = '100%'

// Pinia stores
const blockPolling = useBlockPollingStore()
const appSettings = useAppSettingsStore()

// Options for selects
const planetOptions = computed(() =>
  PLANET_OPTIONS.map((p) => ({
    label: p.label,
    value: p.id
  }))
)

const pollIntervalOptions = computed(() =>
  POLL_INTERVAL_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value
  }))
)

const langOptions = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' }
]

// Event handlers
function onPlanetChange(val: PlanetName): void {
  blockPolling.switchPlanet(val)
}

function onIntervalChange(val: number): void {
  blockPolling.setPollInterval(val)
}

function onDarkModeToggle(val: boolean): void {
  appSettings.setDarkMode(val)
  // Trigger theme change via provide/inject
  // The App.vue will watch isDarkMode from the store
}

function onLangChange(val: string): void {
  appSettings.setLang(val)
}

function handleTogglePoll(): void {
  if (blockPolling.isPolling) {
    blockPolling.stopPolling()
  } else {
    blockPolling.startPolling()
  }
}

function toggleDrawerSize(): void {
  if (drawerSize.value === DRAWER_SIZE) {
    drawerSize.value = DRAWER_SIZE_MAX
    iconFull.value = offFull
  } else {
    drawerSize.value = DRAWER_SIZE
    iconFull.value = onFull
  }
}
</script>
