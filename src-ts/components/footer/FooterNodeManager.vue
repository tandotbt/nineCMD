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
            {{ t('footer.makeWith') }}
          </n-text>
        </n-flex>
      </template>
      <n-tabs type="bar" trigger="hover" animated>
        <!-- ====== Tab 1: Block Monitor ====== -->
        <n-tab-pane name="blockMonitor" :tab="t('blockMonitor.tab')">
          <n-space vertical>
            <!-- Planet Selection -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('blockMonitor.planet') }}</n-text>
              <n-select
                :value="appSettings.selectedPlanet"
                :options="planetOptions"
                :placeholder="t('blockMonitor.selectPlanet')"
                @update:value="onPlanetChange"
              />
            </n-space>

            <!-- Poll Interval Setting -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('blockMonitor.pollInterval') }}</n-text>
              <n-select
                :value="appSettings.pollIntervalMs"
                :options="pollIntervalOptions"
                :placeholder="t('blockMonitor.selectInterval')"
                @update:value="onIntervalChange"
              />
            </n-space>

            <n-divider />

            <!-- Block Info -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('blockMonitor.blockInfo') }}</n-text>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.currentBlock') }}</n-text>
                <n-text strong>#{{ blockPolling.currentBlockIndex }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.avgBlockTime') }}</n-text>
                <n-text strong>{{ blockPolling.avgBlockTime }}s</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.planetLabel') }}</n-text>
                <n-text strong>{{ blockPolling.planetLabel }}</n-text>
              </n-space>
            </n-space>

            <n-divider />

            <!-- Poll Stats -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('blockMonitor.pollStats') }}</n-text>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.totalPolls') }}</n-text>
                <n-text strong>{{ blockPolling.pollCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.success') }}</n-text>
                <n-text strong style="color: #18a058">{{ blockPolling.successCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.failed') }}</n-text>
                <n-text strong style="color: #d4380d">{{ blockPolling.failCount }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.successRate') }}</n-text>
                <n-text strong>{{ blockPolling.successRate }}</n-text>
              </n-space>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.history') }}</n-text>
                <n-text strong>{{ blockPolling.historyLength }} {{ t('blockMonitor.entries') }}</n-text>
              </n-space>
            </n-space>

            <n-divider />

            <!-- Status -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('blockMonitor.status') }}</n-text>
              <n-space>
                <n-text depth="3">{{ t('blockMonitor.polling') }}</n-text>
                <n-tag :type="blockPolling.isPolling ? 'success' : 'error'" size="small">
                  {{ blockPolling.isPolling ? t('blockMonitor.pollingRunning') : t('blockMonitor.pollingStopped') }}
                </n-tag>
              </n-space>
              <n-space v-if="blockPolling.error">
                <n-text depth="3" style="color: #d4380d">{{ t('blockMonitor.error') }} {{ blockPolling.error }}</n-text>
              </n-space>
              <n-space>
                <n-button size="small" @click="blockPolling.refresh()">{{ t('blockMonitor.refreshNow') }}</n-button>
                <n-button size="small" @click="handleTogglePoll">
                  {{ blockPolling.isPolling ? t('blockMonitor.stop') : t('blockMonitor.start') }}
                </n-button>
              </n-space>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- ====== Tab 2: Settings ====== -->
        <n-tab-pane name="setting" :tab="t('settings.tab')">
          <n-space vertical>
            <!-- Dark Mode Toggle -->
            <n-space justify="space-between" align="center">
              <n-text depth="2" strong>{{ t('settings.darkMode') }}</n-text>
              <n-switch :value="appSettings.isDarkMode" @update:value="onDarkModeToggle" />
            </n-space>

            <n-divider />

            <!-- Language -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('settings.language') }}</n-text>
              <n-select
                :value="appSettings.lang"
                :options="langOptions"
                :placeholder="t('settings.selectLanguage')"
                @update:value="onLangChange"
              />
            </n-space>

            <n-divider />

            <!-- Planet (quick access) -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('settings.currentPlanet') }}</n-text>
              <n-text depth="3">{{ appSettings.planetLabel }}</n-text>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- ====== Tab 3: Endpoints ====== -->
        <n-tab-pane name="endpoints" :tab="t('endpoints.tab')">
          <n-space vertical style="width: 100%">
            <!-- Planet info -->
            <n-space vertical>
              <n-text depth="2" strong>{{ t('endpoints.planet') }}</n-text>
              <n-text depth="3">{{ appSettings.planetLabel }}</n-text>
            </n-space>

            <n-divider />

            <!-- Endpoint list -->
            <n-text depth="2" strong>{{ t('endpoints.activeEndpoints') }}</n-text>
            <n-card
              v-for="(url, key) in activeEndpoints"
              :key="key"
              size="small"
              style="margin-top: 8px"
            >
              <n-space vertical :size="4">
                <!-- Endpoint name -->
                <n-text depth="3" style="font-size: 11px; font-weight: 600">
                  {{ key }}
                </n-text>
                <!-- Current URL -->
                <n-text
                  style="font-size: 11px; word-break: break-all; font-family: monospace"
                >
                  {{ url || 'N/A' }}
                </n-text>
                <!-- Mode selector -->
                <n-space align="center" :size="8">
                  <n-text depth="3" style="font-size: 11px">
                    {{ t('endpoints.mode') }}:
                  </n-text>
                  <n-radio-group
                    :value="configURL.getEndpointMode(appSettings.selectedPlanet, String(key))"
                    size="small"
                    @update:value="(val: string) => onEndpointModeChange(String(key), val as 'random' | 'manual')"
                  >
                    <n-radio-button value="random" size="small">
                      {{ t('endpoints.random') }}
                    </n-radio-button>
                    <n-radio-button value="manual" size="small">
                      {{ t('endpoints.manual') }}
                    </n-radio-button>
                  </n-radio-group>
                </n-space>
                <!-- Manual URL selection -->
                <n-select
                  v-if="configURL.getEndpointMode(appSettings.selectedPlanet, String(key)) === 'manual'"
                  :value="url"
                  :options="getEndpointOptions(String(key))"
                  size="small"
                  :placeholder="t('endpoints.selectUrl')"
                  @update:value="(val: string) => onEndpointUrlSelect(String(key), val)"
                />
              </n-space>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- ====== Tab 4: Actions ====== -->
        <n-tab-pane name="actions" :tab="t('actions.tab')">
          <n-space vertical>
            <n-text depth="3">{{ t('actions.placeholder') }}</n-text>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
  NSwitch,
  NCard,
  NRadioGroup,
  NRadioButton
} from 'naive-ui'
import {
  FullscreenRound as onFull,
  FullscreenExitRound as offFull
} from '@vicons/material'
import FooterInfoBlock from './FooterInfoBlock.vue'
import { useBlockPollingStore } from '../../stores/blockPolling'
import { useAppSettingsStore } from '../../stores/appSettings'
import { useConfigURLStore } from '../../stores/configURL'
import { PLANET_OPTIONS, POLL_INTERVAL_OPTIONS, type PlanetName } from '../../utilities/constants'

const { t } = useI18n()

const showDrawer = ref(false)
const drawerSize = ref<string>('70%')
const iconFull = shallowRef<typeof onFull>(onFull)
const pngLoading = '' // Placeholder

const DRAWER_SIZE = '70%'
const DRAWER_SIZE_MAX = '100%'

// Pinia stores
const blockPolling = useBlockPollingStore()
const appSettings = useAppSettingsStore()
const configURL = useConfigURLStore()

// Options for selects – disable planets not available from URL_ALL_PLANET
const planetOptions = computed(() =>
  PLANET_OPTIONS.map((p) => ({
    label: p.label,
    value: p.id,
    disabled: !configURL.isPlanetAvailable(p.id)
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

/** Active endpoints for current planet */
const activeEndpoints = computed(() => configURL.getActiveEndpoints(appSettings.selectedPlanet))

/** Get endpoint options for select dropdown */
function getEndpointOptions(endpointKey: string): Array<{ label: string; value: string }> {
  const urls = configURL.getAvailableEndpoints(appSettings.selectedPlanet, endpointKey)
  return urls.map((url) => ({
    label: url.length > 60 ? url.substring(0, 57) + '...' : url,
    value: url
  }))
}

// Event handlers
function onPlanetChange(val: PlanetName): void {
  blockPolling.switchPlanet(val)
}

function onIntervalChange(val: number): void {
  blockPolling.setPollInterval(val)
}

function onDarkModeToggle(val: boolean): void {
  appSettings.setDarkMode(val)
}

function onLangChange(val: string): void {
  appSettings.setLang(val)
}

function onEndpointModeChange(endpointKey: string, mode: 'random' | 'manual'): void {
  configURL.setEndpointMode(appSettings.selectedPlanet, endpointKey, mode)
}

function onEndpointUrlSelect(endpointKey: string, url: string): void {
  configURL.setEndpointSelection(appSettings.selectedPlanet, endpointKey, url)
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
