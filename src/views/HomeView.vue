<script setup lang="ts">
import { useRouter } from 'vue-router'
import { APP_NAME } from '../constants'
import { useDark, useToggle } from '@vueuse/core'
import {
  WeatherMoon24Regular as MoonIcon,
  WeatherSunny24Regular as SunIcon,
  Cube24Regular as CubeIcon,
  Earth24Regular as EarthIcon,
  Database24Regular as DataIcon,
} from '@vicons/fluent'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// Dark mode logic
const isDark = useDark()
const toggleDark = useToggle(isDark)
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
        <n-space justify="center" size="large">
          <n-button type="primary" size="large" @click="router.push('/blocks')">
            <template #icon>
              <n-icon><cube-icon /></n-icon>
            </template>
            {{ t('home_btn_view_blocks') }}
          </n-button>

          <n-button type="info" size="large" @click="router.push('/settings/planets')">
            <template #icon>
              <n-icon><earth-icon /></n-icon>
            </template>
            {{ t('home_btn_view_planets') }}
          </n-button>

          <n-button type="warning" size="large" @click="router.push('/data-explorer')">
            <template #icon>
              <n-icon><data-icon /></n-icon>
            </template>
            {{ t('home_btn_data_explorer', 'Data Explorer') }}
          </n-button>

          <n-button secondary size="large" @click="router.push('/settings/apis')">
            {{ t('home_btn_api_settings') }}
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
</style>
