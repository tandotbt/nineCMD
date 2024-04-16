<template>
  <n-badge
    @click="showDrawer = !showDrawer"
    :value="useHandlerCreatNewAction.listActionStartNextLength"
  >
    <n-avatar
      v-if="useHandlerCreatNewAction.listActionStartNextLength"
      size="medium"
      :src="listImg.gifLoading"
    ></n-avatar>
    <n-avatar v-else size="medium" :src="listImg.pngLoading"></n-avatar>
  </n-badge>

  <n-drawer v-model:show="showDrawer" placement="bottom" :height="drawerSize">
    <n-drawer-content :native-scrollbar="false" :default-height="100" closable>
      <template #header>
        <n-space justify="baseline">
          <infoBlock />
          <n-button quaternary size="small" @click="toggleFullscreen">
            <template #icon>
              <n-icon :component="iconFull" />
            </template>
          </n-button>
        </n-space>
      </template>
      <template #footer>
        <n-flex justify="end">
          <span> Make with <heartIcon /> by tanbt </span>
          <span> ©2024</span>
        </n-flex>
      </template>
      <n-tabs type="bar" trigger="hover" animated>
        <n-tab-pane name="setting ninecmd" tab="Setting"> <tabSettingNinecmd /></n-tab-pane>
        <n-tab-pane name="refill AP setting" tab="Refill AP">
          <n-space>
            <div>
              <p>Click refillAP</p>
              <n-button @click="useHandlerCreatNewAction.handleActionNew('refillAP')">
                Thêm action
              </n-button>
            </div>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="use AP potion setting" tab="AP potion"> Temp </n-tab-pane>
        <n-tab-pane name="sweep setting" tab="Sweep"> Temp </n-tab-pane>
        <n-tab-pane name="temp" tab="Temp"> <tabTemp /> </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import { DISPLAY_9CMD } from '@/utilities/constants'

import { FullscreenExitRound as offFull, FullscreenRound as onFull } from '@vicons/material'

import infoBlock from './other/infoBlock.vue'
import tabTemp from './tabTemp.vue'
import tabSettingNinecmd from './other/tabSettingNinecmd.vue'
import heartIcon from './icons/heartIcon.vue'

import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
// import { useI18n } from 'vue-i18n'

// const { t } = useI18n()
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
// Hàm toggleFullscreen
// Logic cho việc toggle full screen
const toggleFullscreen = () => {
  if (drawerSize.value === DISPLAY_9CMD.drawerSize) {
    drawerSize.value = DISPLAY_9CMD.drawerSizeMax
    iconFull.value = offFull
  } else {
    drawerSize.value = DISPLAY_9CMD.drawerSize
    iconFull.value = onFull
  }
}
// Biến cho kích thước của drawer và biến icon
const drawerSize = ref(DISPLAY_9CMD.drawerSize)
const iconFull = shallowRef(onFull)
const showDrawer = ref(false)

const listImg = {
  gifLoading: getImageBase64FromCacheOrFetch('/assets/gifs/run.gif'),
  pngLoading: getImageBase64FromCacheOrFetch('/assets/gifs/run.png')
}
</script>

<style scoped></style>
