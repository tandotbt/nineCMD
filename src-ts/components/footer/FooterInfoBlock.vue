<template>
  <n-text depth="3" style="font-size: 12px">
    #{{ blockNow }}
  </n-text>
  <n-divider vertical />
  <n-text depth="3" style="font-size: 12px">
    {{ avgBlockNow }}s
  </n-text>
  <n-divider vertical />
  <n-text depth="3" style="font-size: 12px">
    {{ avgTransNow }} tx/s
  </n-text>
  <n-divider vertical />
  <n-text depth="3" style="font-size: 12px">
    {{ selectedPlanet }}
  </n-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NText, NDivider } from 'naive-ui'
import { useStorage } from '@vueuse/core'
import type { FooterSettings } from '../../types/footer'

const settingNineCMD = useStorage<FooterSettings>('setting-nine-cmd', {} as FooterSettings, localStorage)

// Placeholder values - will be replaced with real WebSocket data
const blockNow = computed(() => '0')
const avgBlockNow = computed(() => '0')
const avgTransNow = computed(() => '0')
const selectedPlanet = computed(() => settingNineCMD.value.lastPlanet ?? 'Odin')
</script>
