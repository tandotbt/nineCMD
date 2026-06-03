<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NText,
  NDivider,
  NCard,
  NRadioGroup,
  NRadioButton,
  NSelect
} from 'naive-ui'
import { useAppSettingsStore } from '../../stores/appSettings'
import { useConfigURLStore } from '../../stores/configURL'

const { t } = useI18n()

const appSettings = useAppSettingsStore()
const configURL = useConfigURLStore()

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

function onEndpointModeChange(endpointKey: string, mode: 'random' | 'manual'): void {
  configURL.setEndpointMode(appSettings.selectedPlanet, endpointKey, mode)
}

function onEndpointUrlSelect(endpointKey: string, url: string): void {
  configURL.setEndpointSelection(appSettings.selectedPlanet, endpointKey, url)
}
</script>
