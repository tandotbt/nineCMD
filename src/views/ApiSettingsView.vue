<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useApiStore } from '../stores/useApiStore'
import { API_URLS } from '../constants'
import ApiUrlSelector from '@/components/settings/ApiUrlSelector.vue'

const { t } = useI18n()
const apiStore = useApiStore()
const router = useRouter()
</script>

<template>
  <div class="api-settings-view">
    <n-space vertical size="large">
      <n-h1>{{ t('api_settings_title') }}</n-h1>

      <n-grid cols="1 s:2 m:2" responsive="screen" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <ApiUrlSelector
            :title="t('api_label_9cmd')"
            :endpoints="API_URLS.API_9CMD"
            :selected-index="apiStore.api9CmdIndex"
            @update:selected-index="apiStore.setApi9CmdIndex"
          />
        </n-grid-item>
        <n-grid-item>
          <ApiUrlSelector
            :title="t('api_label_season_pass')"
            :endpoints="API_URLS.SEASON_PASS"
            :selected-index="apiStore.seasonPassIndex"
            @update:selected-index="apiStore.setSeasonPassIndex"
          />
        </n-grid-item>
        <n-grid-item>
          <ApiUrlSelector
            :title="t('api_label_scan_item_name')"
            :endpoints="API_URLS.SCAN_ITEM_NAME"
            :selected-index="apiStore.scanItemNameIndex"
            @update:selected-index="apiStore.setScanItemNameIndex"
          />
        </n-grid-item>
        <n-grid-item>
          <ApiUrlSelector
            :title="t('api_label_planet_raw')"
            :endpoints="API_URLS.PLANET_RAW"
            :selected-index="apiStore.planetRawIndex"
            @update:selected-index="apiStore.setPlanetRawIndex"
          />
        </n-grid-item>
      </n-grid>

      <n-space justify="center">
        <n-button type="primary" @click="router.push('/')">
          {{ t('notfound_btn_back') }}
        </n-button>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>
.api-settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}
</style>
