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
    <n-icon :component="listImg.serviceLogo" />
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
        <n-tab-pane
          v-for="(type, tabKey, tabIndex) in typeAction"
          :key="tabIndex"
          :name="tabKey"
          :tab="tabKey"
        >
          <n-space vertical>
            <n-button
              @click="useHandlerCreatNewAction.handleActionNew(tabKey, dataInputAction[tabKey])"
            >
              <n-avatar round size="small" :src="typeAction[tabKey].img" /> Add action {{ tabKey }}
            </n-button>
            <n-button
              @click="getGear(tabKey)"
              :disabled="dataInputAction[tabKey] === null || dataInputAction[tabKey].gear === null"
            >
              <n-avatar round size="small" :src="typeAction[tabKey].img" /> Get gear {{ tabKey }}
            </n-button>

            <div
              v-for="(typeValue, inputKey, inputIndex) in dataInputAction[tabKey]"
              :key="inputIndex"
            >
              <template v-if="typeof typeValue === 'string'">
                <n-input
                  v-model:value="dataInputAction[tabKey][inputKey]"
                  :placeholder="inputKey"
                ></n-input>
              </template>
              <template v-else-if="typeof typeValue === 'number'">
                <n-input-number
                  v-model:value="dataInputAction[tabKey][inputKey]"
                  :placeholder="inputKey"
                ></n-input-number>
              </template>
              <template v-else-if="typeof typeValue === 'boolean'">
                <label>{{ inputKey }}</label>
                <n-switch v-model:value="dataInputAction[tabKey][inputKey]">
                  <template #checked> true </template>
                  <template #unchecked> false </template>
                </n-switch>
              </template>
              <template v-else-if="Array.isArray(typeValue)">
                <label>{{ inputKey }}</label>
                <!-- Hiển thị nhãn cho mảng -->
                <n-dynamic-tags
                  v-model:value="dataInputAction[tabKey][inputKey]"
                  @create="onCreateRunes"
                />
              </template>
            </div>

            <div>
              <p>[{{ tabIndex + 1 }}] Setting {{ tabKey }}</p>
              <div v-for="(value, settingKey, settingIndex) in type" :key="settingKey">
                <pre v-if="settingKey !== 'img'"> 
                               
          {{ settingIndex }}<n-divider vertical />{{ settingKey }}<n-divider vertical />{{ value }}
        </pre>
              </div>
            </div>
          </n-space>
        </n-tab-pane>

        <n-tab-pane name="tabChronoSetting" tab="tabChronoSetting">
          <tabChronoSetting />
        </n-tab-pane>
        <n-tab-pane name="temp" tab="Temp"> <tabTemp /> </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, reactive, computed, shallowRef, markRaw } from 'vue'
import { DISPLAY_9CMD } from '@/utilities/constants'

import { FullscreenExitRound as offFull, FullscreenRound as onFull } from '@vicons/material'

import infoBlock from './other/infoBlock.vue'

import tabChronoSetting from './other/tabChronoSetting.vue'
import tabTemp from './tabTemp.vue'
import tabSettingNinecmd from './other/tabSettingNinecmd.vue'
import heartIcon from './icons/heartIcon.vue'
import logoChrono from '@/components/icons/logoChrono.vue'
import logoNineCMDSign from '@/components/icons/logoNineCMDSign.vue'

import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
import { useExtensionServiceStore } from '@/stores/extensionService'

import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { getEquipmentsAndRuneFrom9cscan } from '@/utilities/getEquipmentsAndRuneFrom9cscan'
import { useI18n } from 'vue-i18n'
import { useNow } from '@vueuse/core'
const { t, d, locale } = useI18n()
const useExtensionService = useExtensionServiceStore()
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
// Hiển thị trước thông tin đầu vào action
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useConfigURLStore } from '@/stores/configURL'
const timeNow = useNow()
const useFetchDataUser9C = useFetchDataUser9CStore()
const useConfigURL = useConfigURLStore()
const nameAndTag = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null
    ? `${useFetchDataUser9C.dataUser9C_normal.name} #${useFetchDataUser9C.avatarAddress.slice(2, 6)}`
    : t('fetchDataUser9c.guest')
)
const typeAction = reactive({
  refillAP: {
    img: getImageBase64FromCacheOrFetch('/assets/icons/UI_main_icon_box.png'),
    label: computed(
      () =>
        `${useConfigURL.selectedPlanet} | Refill AP | ${nameAndTag.value} | ${d(timeNow.value, 'useTimeNode')}`
    ),
    name: 'refillAP',
    planet: computed(() => useConfigURL.selectedPlanet),
    locale: computed(() => locale.value),
    node: computed(() => useConfigURL.selectedNode),
    api9cscan: computed(() => useConfigURL.apiRest9cscan),
    web9cscan: computed(() => useConfigURL.web9cscanUrl),
    agent: computed(() => useFetchDataUser9C.agentAddress),
    avatar: computed(() => useFetchDataUser9C.avatarAddress),
    time: computed(() => d(timeNow.value, 'useTimeNode'))
  },
  battleArena: {
    img: getImageBase64FromCacheOrFetch('/assets/iconsArena/Arena_bg_19.png'),
    label: computed(
      () =>
        `${useConfigURL.selectedPlanet} | Battle Arena | ${nameAndTag.value} | ${d(timeNow.value, 'useTimeNode')}`
    ),
    name: 'battleArena',
    planet: computed(() => useConfigURL.selectedPlanet),
    locale: computed(() => locale.value),
    node: computed(() => useConfigURL.selectedNode),
    api9cscan: computed(() => useConfigURL.apiRest9cscan),
    web9cscan: computed(() => useConfigURL.web9cscanUrl),
    agent: computed(() => useFetchDataUser9C.agentAddress),
    avatar: computed(() => useFetchDataUser9C.avatarAddress),
    avatarAddressEnemy: computed(() => dataInputAction.battleArena.avatarAddressEnemy),
    ticket: computed(() => dataInputAction.battleArena.ticket),
    equipments: computed(() => dataInputAction.battleArena.equipments),
    costumes: computed(() => dataInputAction.battleArena.costumes),
    runeInfos: computed(() => dataInputAction.battleArena.runeInfos),
    auras: computed(() => dataInputAction.battleArena.auras),
    isLimit: computed(() => dataInputAction.battleArena.isLimit),
    time: computed(() => d(timeNow.value, 'useTimeNode'))
  }
})
const dataInputAction = reactive({
  refillAP: null,
  battleArena: {
    gear: 'Arena',
    avatarAddressEnemy: '0x123',
    ticket: 1,
    equipments: [],
    costumes: [],
    runeInfos: [],
    auras: [],
    isLimit: true
  }
})
async function getGear(typeDataSaved) {
  const data = await getEquipmentsAndRuneFrom9cscan(
    typeAction[typeDataSaved].planet,
    dataInputAction[typeDataSaved].gear,
    typeAction[typeDataSaved].agent,
    typeAction[typeDataSaved].avatar
  )

  dataInputAction[typeDataSaved].equipments = data.value.equipments
  dataInputAction[typeDataSaved].costumes = data.value.costumes
  dataInputAction[typeDataSaved].runeInfos = data.value.runeInfos
}
// Hàm giúp nhập runes
function onCreateRunes(inputString) {
  if (inputString.includes(' ')) {
    return inputString.split(' ')
  } else {
    return inputString
  }
}
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

const anhXaLogo = {
  NineCMDSign: markRaw(logoNineCMDSign),
  Chrono: markRaw(logoChrono)
}
const listImg = computed(() => {
  return {
    gifLoading: getImageBase64FromCacheOrFetch('/assets/gifs/run.gif'),
    pngLoading: getImageBase64FromCacheOrFetch('/assets/gifs/run.png'),
    serviceLogo: anhXaLogo[useExtensionService.selectServiceSign]
  }
})
</script>

<style scoped></style>
