<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="uiConfig"
    :date-locale="uiConfigDate"
    :breakpoints="themeBreakpoints"
  >
    <n-loading-bar-provider>
      <!-- <n-theme-editor> -->
      <n-message-provider :closable="true" :duration="5000">
        <n-space vertical>
          <n-layout style="height: 100vh">
            <n-layout-header
              style="height: 10vh; padding: 3vh"
              :inverted="false"
              bordered
              position="absolute"
            >
              <HeaderNineCMD />
            </n-layout-header>
            <n-layout position="absolute" style="top: 10vh; bottom: 10vh" has-sider>
              <n-layout-sider
                ref="menuLeftRef"
                bordered
                show-trigger="bar"
                collapse-mode="width"
                position="absolute"
                :collapsed-width="0"
                :width="300"
                :native-scrollbar="false"
                :inverted="false"
                style="max-height: 80vh"
                :collapsed="collapsed"
                @collapse="collapsed = true"
                @expand="collapsed = false"
              >
                <MenuLeft />

                <n-select
                  v-model:value="selectedPlanet"
                  :options="planetOptions"
                  label="planet"
                  @update:value="changePlanet($event)"
                ></n-select>

                <n-select
                  v-model:value="locale"
                  :options="langOptions"
                  :render-label="renderLabel"
                  :render-tag="renderSingleSelectTag"
                  @update:value="changeLang($event)"
                ></n-select>

                <n-select
                  v-model:value="selectedNode"
                  :options="nodeOptions"
                  @update:value="changeNode($event)"
                ></n-select>

                <n-switch
                  :round="true"
                  v-model:value="isDarkMode"
                  @update:value="toggleTheme($event)"
                >
                  <template #checked> {{ t(themeTitle) }} </template>
                  <template #unchecked> {{ t(themeTitle) }} </template>
                  <template #checked-icon>
                    <n-icon :component="DarkIcon" />
                  </template>
                  <template #unchecked-icon>
                    <n-icon :component="LightIcon" />
                  </template>
                </n-switch>
              </n-layout-sider>
              <n-layout style="max-height: 80vh">
                <!-- z-index để tránh banner quảng cáo đè lên các phần khác -->
                <n-scrollbar :style="{ 'z-index': 0 }"><RouterView /></n-scrollbar>
              </n-layout>
            </n-layout>
            <n-layout-footer
              style="height: 10vh; padding: 3vh"
              :inverted="false"
              bordered
              position="absolute"
            >
              <FooterBlock />
            </n-layout-footer>
          </n-layout>
        </n-space>
      </n-message-provider>
      <!-- </n-theme-editor> -->
    </n-loading-bar-provider>

    <n-global-style />
  </n-config-provider>
</template>

<script setup>
import { ref, h, computed } from 'vue'
import MenuLeft from '@/components/MenuLeft.vue'
import HeaderNineCMD from '@/components/HeaderNineCMD.vue'
import FooterBlock from '@/components/FooterBlock.vue'
import { useStorage, onClickOutside } from '@vueuse/core'

// import { NThemeEditor } from 'naive-ui'
import { darkTheme, NIcon, NAvatar, NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { URL_NINE_CHRONICLES_SERVE } from '@/utilities/constants'
import { useWebSocketBlockStore } from '@/stores/webSocketBlock'
import { CONFIG_i18n_LANGUAGES } from '@/utilities/constants'
import { DarkModeFilled as DarkIcon, LightModeFilled as LightIcon } from '@vicons/material'
import { useConfigURLStore } from '@/stores/configURL'
// Thu gọn khi click ra ngoài
const collapsed = ref(true)
const menuLeftRef = ref(null)
onClickOutside(menuLeftRef, () => (collapsed.value = true))

// Dịch
const { t, locale, availableLocales } = useI18n()

const webSocketBlockStore = useWebSocketBlockStore()
const configURLStore = useConfigURLStore()
const nodeOptions = computed(() =>
  configURLStore.dataConfig[0]['rpcEndpoints']['headless.gql']
    // Node bắt đầu http không hoạt động khi đang chạy trên web https
    .filter((item) => item.startsWith('https'))
    .map((item) => ({
      label: item,
      value: item
    }))
)

const selectedNode = ref(configURLStore.selectedNode)
const planetOptions = URL_NINE_CHRONICLES_SERVE.map((item) => ({
  label: item.planet,
  value: item.planet
}))
const changeNode = (value) => {
  configURLStore.changeNode(value)
}
const langOptions = availableLocales.map((item) => ({
  label: CONFIG_i18n_LANGUAGES.find((data) => data.lang === item).label,
  value: item
}))
const selectedPlanet = ref(webSocketBlockStore.selectedPlanet)

const changePlanet = (value) => {
  webSocketBlockStore.changePlanet(value)
  // Tự chọn node đầu tiên tùy theo planet dc chọn
  selectedNode.value = nodeOptions.value[0].value
  configURLStore.changeNode(selectedNode.value)
  // Lưu planet vào local
  settingNineCMD.value.lastPlanet = value
  // Đổi lựa chọn của select
  selectedPlanet.value = value
}

const renderSingleSelectTag = ({ option }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value).png,
        round: true,
        size: 24,
        style: {
          marginRight: '12px'
        }
      }),
      option.label
    ]
  )
}
const renderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value).png,
        round: false,
        size: 'small'
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0'
          }
        },
        [
          h('div', null, [option.label]),
          h(
            NText,
            { depth: 3, tag: 'div' },
            {
              default: () =>
                CONFIG_i18n_LANGUAGES.find((item) => item.lang === option.value).description
            }
          )
        ]
      )
    ]
  )
}

const theme = ref(null)
const themeTitle = ref('Light')
const themeOverrides = ref(null)
const uiConfig = ref(null)
const uiConfigDate = ref(null)

/**
 * @type import('naive-ui').GlobalThemeOverrides
 */

const lightThemeOverrides = {
  // common: {
  //   fontFamily: 'nine-chronicles-font-1',
  //   fontFamilyMono: 'ninecmd-font'
  // },
  Result: {
    titleTextColor: 'rgba(203, 203, 33, 1)',
    textColor: 'rgba(203, 203, 23, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
}

const darkThemeOverrides = {
  // common: {
  //   fontFamily: 'nine-chronicles-font-1',
  //   fontFamilyMono: 'ninecmd-font'
  // },
  Result: {
    titleTextColor: 'rgba(60, 160, 0, 1)',
    textColor: 'rgba(40, 140, 0, 1)'
  },
  LoadingBar: {
    height: '4px'
  }
}
function changeLang(selectedLang) {
  uiConfig.value = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang).uiConfig
  uiConfigDate.value = CONFIG_i18n_LANGUAGES.find((item) => item.lang === selectedLang).uiConfigDate
  // Lưu ngôn ngữ vào local
  settingNineCMD.value.lang = selectedLang
  locale.value = selectedLang
}
function toggleTheme(toggleTheme) {
  theme.value = toggleTheme === true ? darkTheme : null
  themeTitle.value =
    theme.value === null ? '@--App-vue.toggleTheme.light' : '@--App-vue.toggleTheme.dark'
  themeOverrides.value = theme.value === null ? lightThemeOverrides : darkThemeOverrides
  settingNineCMD.value.isDarkMode = toggleTheme
}

const isDarkMode = ref(false)
// Kiểm tra xem dữ liệu đã tồn tại trong lưu trữ trước khi khởi tạo
const settingNineCMD = useStorage('setting-nine-cmd', {}, localStorage)

// Kiểm tra xem khóa isDarkMode đã tồn tại trong dữ liệu lưu trữ hay không
if (settingNineCMD.value.isDarkMode) {
  // Nếu tồn tại, gán trạng thái dark mode từ dữ liệu lưu trữ
  isDarkMode.value = settingNineCMD.value.isDarkMode
  // Thực hiện các hành động khác tùy thuộc vào trạng thái dark mode
} else {
  // Nếu không tồn tại, tiến hành khởi tạo một giá trị mặc định cho trạng thái dark mode
  settingNineCMD.value.isDarkMode = false
}
// Kiểm tra xem khóa lastPlanet
if (settingNineCMD.value.lastPlanet) {
  changePlanet(settingNineCMD.value.lastPlanet)
}
// Kiểm tra khóa Lang
if (settingNineCMD.value.lang) {
  changeLang(settingNineCMD.value.lang)
}
toggleTheme(settingNineCMD.value.isDarkMode)

// Tự co dãn theo kích cỡ màn hình
const themeBreakpoints = { xs: 320, s: 470, m: 660, l: 1280, xl: 1536, xxl: 1920 }
</script>
