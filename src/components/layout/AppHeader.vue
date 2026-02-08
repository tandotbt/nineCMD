<script setup lang="ts">
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { Settings24Regular as SettingsIcon, SignOut24Regular as LogoutIcon } from '@vicons/fluent'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/useSettingsStore'

const router = useRouter()
const settingsStore = useSettingsStore()

const handleLogout = async () => {
  await settingsStore.logout()
  router.push('/login')
}

defineProps<{
  title: string
  locale: string
  langOptions: SelectMixedOption[]
  planet: string
  planetOptions: SelectMixedOption[]
  isOnline: boolean
  onlineText: string
  offlineText: string
}>()

const emit = defineEmits<{
  (e: 'update:locale', value: string): void
  (e: 'update:planet', value: string): void
}>()

const handleUpdateValue = (value: string) => {
  emit('update:locale', value)
}

const handlePlanetUpdate = (value: string) => {
  emit('update:planet', value)
}
</script>

<template>
  <n-layout-header bordered style="padding: 16px">
    <n-space justify="space-between" align="center">
      <span style="font-size: 1.5rem; font-weight: bold">{{ title }}</span>
      <n-space align="center">
        <n-select
          :value="planet"
          :options="planetOptions"
          style="width: 120px"
          @update:value="handlePlanetUpdate"
        />
        <n-select
          :value="locale"
          :options="langOptions"
          style="width: 140px"
          @update:value="handleUpdateValue"
        />
        <n-button quaternary circle @click="router.push('/settings/game')">
          <template #icon>
            <n-icon><SettingsIcon /></n-icon>
          </template>
        </n-button>
        <n-button v-if="settingsStore.isLoggedIn" quaternary circle @click="handleLogout">
          <template #icon>
            <n-icon><LogoutIcon /></n-icon>
          </template>
        </n-button>
        <n-tag :type="isOnline ? 'success' : 'error'">
          {{ isOnline ? onlineText : offlineText }}
        </n-tag>
      </n-space>
    </n-space>
  </n-layout-header>
</template>
