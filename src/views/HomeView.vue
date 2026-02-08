<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { APP_NAME } from '../constants'
import { useDark, useToggle } from '@vueuse/core'
import {
  WeatherMoon24Regular as MoonIcon,
  WeatherSunny24Regular as SunIcon,
  Cube24Regular as CubeIcon,
  Person24Regular as PersonIcon,
  Settings24Regular as SettingsIcon,
  Info24Regular as InfoIcon,
  ArrowSync24Regular as RefreshIcon,
} from '@vicons/fluent'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const { t } = useI18n()
const router = useRouter()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()

// Dark mode logic
const isDark = useDark()
const toggleDark = useToggle(isDark)

onMounted(async () => {
  // Only fetch if we don't have any info yet, to avoid redundant fetches on every navigation
  if (settingsStore.isLoggedIn && !characterStore.info) {
    await characterStore.fetchAvatarDetail()
  }
})
</script>

<template>
  <div class="home-container">
    <n-card :title="APP_NAME" class="main-card" size="huge">
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
        <n-card v-if="characterStore.info" class="character-summary mb-6" embedded>
          <n-thing :title="characterStore.info.name">
            <template #avatar>
              <n-avatar round size="large">
                <n-icon><PersonIcon /></n-icon>
              </n-avatar>
            </template>
            <template #header-extra>
              <n-button
                circle
                size="small"
                :loading="characterStore.isFetching"
                @click="characterStore.fetchAvatarDetail()"
              >
                <template #icon
                  ><n-icon><RefreshIcon /></n-icon
                ></template>
              </n-button>
            </template>
            <template #description>
              <n-space>
                <n-tag type="success">Lv. {{ characterStore.info.level }}</n-tag>
                <n-tag type="info">Stage {{ characterStore.info.stage }}</n-tag>
                <n-tag type="warning"
                  >{{ characterStore.info.ap }} / {{ characterStore.info.maxAp }} AP</n-tag
                >
              </n-space>
            </template>
            <div class="mt-2 text-xs opacity-60">Agent: {{ settingsStore.agentAddress }}</div>
            <div class="text-xs opacity-60">Avatar: {{ settingsStore.avatarAddress }}</div>
          </n-thing>
        </n-card>

        <n-space justify="center" size="large">
          <n-button type="primary" size="large" @click="router.push('/automation')">
            <template #icon>
              <n-icon><refresh-icon /></n-icon>
            </template>
            Automation
          </n-button>

          <n-button type="primary" size="large" @click="router.push('/blocks')">
            <template #icon>
              <n-icon><cube-icon /></n-icon>
            </template>
            {{ t('home_btn_view_blocks') }}
          </n-button>

          <n-button type="success" size="large" @click="router.push('/info-all-avatar-address')">
            <template #icon>
              <n-icon><person-icon /></n-icon>
            </template>
            Avatar
          </n-button>

          <n-button type="info" size="large" @click="router.push('/settings/pwa')">
            <template #icon>
              <n-icon><info-icon /></n-icon>
            </template>
            System
          </n-button>

          <n-button type="tertiary" size="large" @click="router.push('/settings/game')">
            <template #icon>
              <n-icon><settings-icon /></n-icon>
            </template>
            {{ t('settings_game_title') }}
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 24px;
  max-width: 600px;
  margin: 100px auto 0;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  padding: 40px 0;
}

.character-summary {
  margin-bottom: 24px;
}

.mb-6 {
  margin-bottom: 24px;
}
.mt-2 {
  margin-top: 8px;
}
.text-xs {
  font-size: 12px;
}
.opacity-60 {
  opacity: 0.6;
}
</style>
