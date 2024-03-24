<template>
  <n-grid cols="24" item-responsive responsive="screen">
    <n-grid-item span="5 m:6 l:7">{{ t('@--components--HeaderNineCMD-vue.header') }} </n-grid-item>
    <n-grid-item offset="3 m:3 l:3" span="6 m:5 l:4">
      <n-carousel
        autoplay
        :interval="3000"
        :show-dots="false"
        direction="vertical"
        mousewheel
        style="height: 8vh"
        draggable
      >
        <n-popconfirm :positive-text="null">
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="percentageBlockReffilAP"
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              :processing="processingBlockReffilAP"
              :color="themeVars.warningColor"
              :rail-color="changeColor(themeVars.warningColor, { alpha: 0.2 })"
            >
              <img v-if="isShowGuest" class="loading-gif" src="/assets/gifs/loading_blocks.gif" />
              <span v-else> {{ hours }}:{{ minutes }}:{{ seconds }} </span>
            </n-progress>
          </template>

          <template #action>
            <n-button>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-potion') }}
            </n-button>
            <n-button>{{ t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-bar') }}</n-button>
          </template>
          <span>
            {{
              t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-info', {
                block,
                DAILY_REWARD_INTERVAL
              })
            }}
          </span>
        </n-popconfirm>
        <n-popconfirm :positive-text="null">
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="percentageAP"
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              :color="themeVars.primaryColor"
              :rail-color="changeColor(themeVars.primaryColor, { alpha: 0.2 })"
            >
              <img v-if="isShowGuest" class="loading-gif" src="/assets/gifs/loading_blocks.gif" />

              <n-ellipsis style="max-width: 15vw" v-else
                >{{ APNow }}/{{ ACTION_POINT_MAX }}</n-ellipsis
              >
            </n-progress>
          </template>
          <span>
            {{
              t('@--components--HeaderNineCMD-vue.popconfirm.AP-info', { APNow, ACTION_POINT_MAX })
            }}
            {{
              t(
                '@--components--HeaderNineCMD-vue.popconfirm.costAP-info',
                {
                  costAP,
                  stakeNCG
                },
                stakeNCG.value
              )
            }}
          </span>
        </n-popconfirm>
      </n-carousel>
    </n-grid-item>
    <n-grid-item offset="1 m:0 l:0" span="9 m:9 l:9">
      <n-carousel
        autoplay
        :interval="3000"
        :show-dots="false"
        direction="vertical"
        mousewheel
        style="height: 8vh"
        draggable
      >
        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="NCG" :value="n(NCG, 'NCG')" />
          </template>
          <n-text>
            <n-h6>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.NCG-have', { NCG }, NCG.value) }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.NCG-info') }}
            </n-p>
          </n-text>
        </n-popconfirm>
        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="CRYSTAL" :value="n(Crystal, 'Crystal')" />
          </template>

          <n-text>
            <n-h6>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.Crystal-have',
                  { Crystal },
                  Crystal.value
                )
              }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.Crystal-info') }}
            </n-p>
          </n-text>
        </n-popconfirm>
      </n-carousel>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useThemeVars } from 'naive-ui'
import { changeColor } from 'seemly'
import headerCurrency from '@/components/headerCurrency.vue'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useWebSocketBlockStore } from '@/stores/webSocketBlock'
import { computed } from 'vue'
import { useConfigURLStore } from '@/stores/configURL'
import { CONFIG_GAME_CONFIG_SHEET } from '@/utilities/constants'

const themeVars = useThemeVars()
const { t, n } = useI18n()

const useConfigURL = useConfigURLStore()
const webSocketBlockStore = useWebSocketBlockStore()
// Lấy giá trị cố định
const ACTION_POINT_MAX = computed(() =>
  useConfigURL.dataGameConfigSheet !== null
    ? useConfigURL.dataGameConfigSheet.find((item) => item[0] === 'action_point_max')[1]
    : CONFIG_GAME_CONFIG_SHEET.action_point_max
)
const DAILY_REWARD_INTERVAL = computed(() =>
  useConfigURL.dataGameConfigSheet !== null
    ? useConfigURL.dataGameConfigSheet.find((item) => item[0] === 'daily_reward_interval')[1]
    : CONFIG_GAME_CONFIG_SHEET.daily_reward_interval
)
// Lấy giá trị của user
const useFetchDataUser9C = useFetchDataUser9CStore()
const isShowGuest = computed(() => (useFetchDataUser9C.dataUser9C !== null ? false : true))
const blockRefillAP = computed(() =>
  useFetchDataUser9C.dataUser9C !== null
    ? useFetchDataUser9C.dataUser9C.blockRefillAP
    : blockNow.value
)
const APNow = computed(() =>
  useFetchDataUser9C.dataUser9C !== null ? useFetchDataUser9C.dataUser9C.AP : 0
)
const stakeNCG = computed(() =>
  useFetchDataUser9C.dataUser9C !== null ? useFetchDataUser9C.dataUser9C.stakeNCG : 0
)
const costAP = computed(() =>
  useFetchDataUser9C.dataUser9C !== null ? useFetchDataUser9C.dataUser9C.costAP : 5
)
const NCG = computed(() =>
  useFetchDataUser9C.dataUser9C !== null ? useFetchDataUser9C.dataUser9C.ncg : 0
)
const Crystal = computed(() =>
  useFetchDataUser9C.dataUser9C !== null ? useFetchDataUser9C.dataUser9C.crystal : 0
)
// Tính toán
const blockNow = computed(() => webSocketBlockStore.calculateAVG.blockNow)
const avgBlockNow = computed(() => webSocketBlockStore.calculateAVG.avgBlockNow)
// Số block đã tích lũy
const block = computed(() => blockNow.value - blockRefillAP.value)
const percentageBlockReffilAP = computed(() =>
  (block.value / DAILY_REWARD_INTERVAL.value) * 100 > 100
    ? 100
    : (block.value / DAILY_REWARD_INTERVAL.value) * 100
)
// Tính % AP hiện tại
const percentageAP = computed(() =>
  (APNow.value / ACTION_POINT_MAX.value) * 100 > 100
    ? 100
    : (APNow.value / ACTION_POINT_MAX.value) * 100
)
// Chạy thanh tiến trình khi chưa đủ 100%
const processingBlockReffilAP = computed(() =>
  percentageBlockReffilAP.value >= 100 ? false : true
)

// Tính toán số giây
const totalSeconds = computed(() =>
  Math.abs((DAILY_REWARD_INTERVAL.value - block.value) * avgBlockNow.value)
)
// Chuyển đổi thành giờ, phút, giây
const hours = computed(() => String(Math.floor(totalSeconds.value / 3600)).padStart(2, '0'))
const minutes = computed(() =>
  String(Math.floor((totalSeconds.value % 3600) / 60)).padStart(2, '0')
)
const seconds = computed(() => String(Math.floor(totalSeconds.value % 60)).padStart(2, '0'))
</script>
<style scoped>
.loading-gif {
  margin: 0 auto;
  /* width: 100%; */
  height: 100%;
  object-fit: contain;
}
</style>
