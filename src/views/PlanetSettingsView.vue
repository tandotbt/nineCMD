<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { usePlanetStore } from '../stores/usePlanetStore'
import { PLANET_CONFIGS } from '../constants'
import type { PlanetName, RpcConfig } from '../types/planet'
import PlanetSelector from '@/components/planet/PlanetSelector.vue'
import RpcSettingsCard from '@/components/planet/RpcSettingsCard.vue'
import RawDataDebug from '@/components/planet/RawDataDebug.vue'

const { t } = useI18n()
const planetStore = usePlanetStore()
const router = useRouter()

const planetOptions = computed(() => {
  if (planetStore.rawPlanets.length > 0) {
    return planetStore.rawPlanets.map((p) => ({
      label: p.name.toUpperCase(),
      value: p.name as PlanetName,
    }))
  }
  return Object.keys(PLANET_CONFIGS).map((key) => ({
    label: key.toUpperCase(),
    value: key as PlanetName,
  }))
})

const rpcKeys: (keyof RpcConfig)[] = [
  'headless.gql',
  'mimir.gql',
  'market.rest',
  'arena.rest',
  'world-boss.rest',
]

const getSelectedIdx = (key: keyof RpcConfig) => {
  switch (key) {
    case 'headless.gql':
      return planetStore.selectedNodeIndex
    case 'mimir.gql':
      return planetStore.selectedMimirIndex
    case 'market.rest':
      return planetStore.selectedMarketIndex
    case 'arena.rest':
      return planetStore.selectedArenaIndex
    default:
      return 0
  }
}

const setSelectedIdx = (key: keyof RpcConfig, idx: number) => {
  switch (key) {
    case 'headless.gql':
      planetStore.setNodeIndex(idx)
      break
    case 'mimir.gql':
      planetStore.setMimirIndex(idx)
      break
    case 'market.rest':
      planetStore.setMarketIndex(idx)
      break
    case 'arena.rest':
      planetStore.setArenaIndex(idx)
      break
  }
}

const currentPlanetJson = computed(() => {
  return JSON.stringify(planetStore.currentPlanetConfig, null, 2)
})
</script>

<template>
  <div class="planet-settings-view">
    <n-space vertical size="large">
      <n-h1>{{ t('planet_settings_title') }}</n-h1>

      <!-- Planet Selection -->
      <PlanetSelector
        :model-value="planetStore.currentPlanetName"
        :options="planetOptions"
        :planet-id="planetStore.currentPlanetId"
        @update:model-value="(val) => planetStore.setPlanet(val)"
      />

      <!-- ID Mismatch Warning -->
      <n-alert v-if="planetStore.isIdMismatch" type="warning" closable>
        {{ t('planet_id_mismatch') }}
      </n-alert>

      <!-- API Node Selection -->
      <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="12" :y-gap="12">
        <n-grid-item v-for="key in rpcKeys" :key="key">
          <RpcSettingsCard
            :rpc-key="key"
            :endpoints="planetStore.rpcEndpoints[key] || []"
            :selected-index="getSelectedIdx(key)"
            @update:selected-index="(idx) => setSelectedIdx(key, idx)"
          />
        </n-grid-item>
      </n-grid>

      <!-- JSON Debug Info -->
      <RawDataDebug :data="currentPlanetJson" />

      <n-space justify="center">
        <n-button type="primary" @click="router.push('/')">
          {{ t('notfound_btn_back') }}
        </n-button>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>
.planet-settings-view {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 40px;
}
</style>
