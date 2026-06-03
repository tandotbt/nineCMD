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
        <!-- Tab 1: Block Monitor -->
        <n-tab-pane name="blockMonitor" :tab="t('blockMonitor.tab')">
          <FooterBlockMonitor />
        </n-tab-pane>

        <!-- Tab 2: Settings -->
        <n-tab-pane name="setting" :tab="t('settings.tab')">
          <FooterSettings />
        </n-tab-pane>

        <!-- Tab 3: Endpoints -->
        <n-tab-pane name="endpoints" :tab="t('endpoints.tab')">
          <FooterEndpoints />
        </n-tab-pane>

        <!-- Tab 4: Actions -->
        <n-tab-pane name="actions" :tab="t('actions.tab')">
          <FooterActions />
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
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
  NFlex
} from 'naive-ui'
import {
  FullscreenRound as onFull,
  FullscreenExitRound as offFull
} from '@vicons/material'
import FooterInfoBlock from './FooterInfoBlock.vue'
import FooterBlockMonitor from './FooterBlockMonitor.vue'
import FooterSettings from './FooterSettings.vue'
import FooterEndpoints from './FooterEndpoints.vue'
import FooterActions from './FooterActions.vue'

const { t } = useI18n()

const showDrawer = ref(false)
const drawerSize = ref<string>('70%')
const iconFull = shallowRef<typeof onFull>(onFull)
const pngLoading = '' // Placeholder

const DRAWER_SIZE = '70%'
const DRAWER_SIZE_MAX = '100%'

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
