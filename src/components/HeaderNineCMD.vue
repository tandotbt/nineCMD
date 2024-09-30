<template>
  <n-grid cols="24" item-responsive responsive="screen">
    <n-grid-item span="1 m:1 l:1" style="height: 10vh">
      <router-link :to="{ name: 'login-route' }" @click="showOption('go-login-route')">
        <headerAvatar
          :avatarAddress="useFetchDataUser9C.avatarAddress"
          :portraitId="portraitId"
          :level="level"
        />
      </router-link>
    </n-grid-item>
    <n-grid-item
      offset="0 m:0 l:0"
      span="1 m:1 l:1"
      style="
        height: 10vh;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        position: absolute;
        margin-left: 70px;
      "
    >
      <headerName />
    </n-grid-item>
    <n-grid-item offset="7 m:7 l:8" span="7 m:6 l:4" style="padding: 3vh">
      <n-carousel
        autoplay
        :interval="3000"
        :show-dots="false"
        direction="vertical"
        mousewheel
        style="height: 8vh"
        draggable
      >
        <n-popconfirm :positive-text="null" style="max-width: 250px">
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
              <img v-if="isShowGuest" class="loading-gif" :src="listImg.gifLoading" />
              <n-text v-else>
                <n-ellipsis style="max-width: 15vw">
                  {{ realTimeRefillAP.hours }}:{{ realTimeRefillAP.minutes }}:{{
                    realTimeRefillAP.seconds
                  }}
                </n-ellipsis>
              </n-text>
            </n-progress>
          </template>

          <template #action>
            <n-button :disabled="percentageAP === 100 || isShowGuest">
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-potion') }}
            </n-button>
            <n-button
              @click="useHandlerCreatNewAction.handleActionNew('refillAP')"
              :disabled="percentageBlockReffilAP !== 100 || percentageAP === 100 || isShowGuest"
            >
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-bar') }}
            </n-button>
          </template>
          <n-text>
            <n-h6>
              {{
                t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-info', {
                  block,
                  DAILY_REWARD_INTERVAL
                })
              }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.refillAP-info-2') }}
            </n-p>
          </n-text>
        </n-popconfirm>
        <n-popconfirm :positive-text="null" style="max-width: 250px">
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="percentageAP"
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              :color="themeVars.infoColor"
              :rail-color="changeColor(themeVars.infoColor, { alpha: 0.2 })"
            >
              <img v-if="isShowGuest" class="loading-gif" :src="listImg.gifLoading" />
              <n-text v-else>
                <n-ellipsis style="max-width: 15vw">
                  {{ APNow }}/{{ ACTION_POINT_MAX }}
                </n-ellipsis>
              </n-text>
            </n-progress>
          </template>
          <n-text>
            <n-h6>
              {{
                t('@--components--HeaderNineCMD-vue.popconfirm.AP-info', {
                  APNow,
                  ACTION_POINT_MAX
                })
              }}
            </n-h6>
            <n-p>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.costAP-info',
                  {
                    costAP,
                    stakeNCG: n(stakeNCG, 'decimal')
                  },
                  Math.floor(stakeNCG)
                )
              }}
            </n-p>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.AP-info-2') }}
            </n-p>
          </n-text>
        </n-popconfirm>

        <n-popconfirm :positive-text="null" style="max-width: 250px">
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="
                (useArenaSeason.seasonActiveNow['blockEndRound'] / useArenaSeason.ROUND_BLOCKS) *
                100
              "
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              :color="themeVars.primaryColor"
              :rail-color="
                changeColor(themeVars[`${useArenaSeason.seasonActiveNow['statusSeason']}Color`], {
                  alpha: 0.2
                })
              "
              :processing="true"
            >
              <n-flex align="flex-end" :wrap="false">
                <n-text>
                  <n-ellipsis style="max-width: 15vw">
                    {{ useArenaSeason.realTomeSeasonEnd.hours }}:{{
                      useArenaSeason.realTomeSeasonEnd.minutes
                    }}:{{ useArenaSeason.realTomeSeasonEnd.seconds }}
                  </n-ellipsis>
                </n-text>
                <n-icon size="24">
                  <img
                    style="width: -webkit-fill-available"
                    :src="useArenaSeason.seasonActiveNow['img']"
                  />
                </n-icon>
              </n-flex>
            </n-progress>
          </template>
          <n-text>
            <n-h6>
              {{ useArenaSeason.seasonActiveNow['titleArena'] }}
              <n-divider vertical />
              {{ useArenaSeason.realTomeSeasonEnd.hours }}:{{
                useArenaSeason.realTomeSeasonEnd.minutes
              }}:{{ useArenaSeason.realTomeSeasonEnd.seconds }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.blocks-total') }}
              {{ useArenaSeason.seasonActiveNow['blockToEndSeason'] }}
            </n-p>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.round-total') }}
              {{ useArenaSeason.seasonActiveNow['nowRound'] }}/{{
                useArenaSeason.seasonActiveNow['totalRound']
              }}
            </n-p>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.blocks-round') }}
              {{ useArenaSeason.seasonActiveNow['blockEndRound'] }}/{{
                useArenaSeason.ROUND_BLOCKS
              }}
            </n-p>
          </n-text>
        </n-popconfirm>
      </n-carousel>
    </n-grid-item>
    <n-grid-item offset="0 m:0 l:0" span="8 m:9 l:9" style="padding: 3vh">
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
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.NCG-have',
                  { NCG: n(NCG, 'decimal') },
                  Math.floor(NCG)
                )
              }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.NCG-info') }}
            </n-p>
          </n-text>
        </n-popconfirm>

        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="NCG_STAKE" :value="n(stakeNCG, 'NCG')" />
          </template>
          <n-text>
            <n-h6>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.stake-NCG-have',
                  { NCG: n(stakeNCG, 'decimal') },
                  Math.floor(stakeNCG)
                )
              }}
            </n-h6>
            <n-p> {{ t('@--components--HeaderNineCMD-vue.popconfirm.stake-NCG-info') }}</n-p>
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
                  { Crystal: n(Crystal, 'decimal') },
                  Math.floor(Crystal)
                )
              }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.Crystal-info') }}
            </n-p>
          </n-text>
        </n-popconfirm>

        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="ARENA_TICKET" :value="ticketsArena" />
          </template>
          <n-text>
            <n-h6>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-have',
                  { ticket: n(ticketsArena, 'decimal') },
                  Math.floor(ticketsArena)
                )
              }}
            </n-h6>
            <n-p> {{ t('@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-info') }}</n-p>
          </n-text>
        </n-popconfirm>

        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="ARENA_TICKET_BUY" :value="ticketsArenaBuy" />
          </template>
          <n-text>
            <n-h6>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-buy-have',
                  { ticket: n(ticketsArenaBuy, 'decimal') },
                  Math.floor(ticketsArenaBuy)
                )
              }}
            </n-h6>
            <n-p> {{ t('@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-buy-info') }}</n-p>
          </n-text>
        </n-popconfirm>
        <n-popconfirm :positive-text="null" style="max-width: 80vw; max-height: 60vh" scrollable>
          <template #trigger>
            <headerCurrency type="ARENA_TICKET_BOUGHT" :value="ticketsArenaBought" />
          </template>
          <n-text>
            <n-h6>
              {{
                t(
                  '@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-bought-have',
                  { ticket: n(ticketsArenaBought, 'decimal') },
                  Math.floor(ticketsArenaBought)
                )
              }}
            </n-h6>
            <n-p>
              {{ t('@--components--HeaderNineCMD-vue.popconfirm.ticket-arena-bought-info') }}</n-p
            >
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
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useWebSocketBlockStore } from '@/stores/webSocketBlock'
import { useConfigURLStore } from '@/stores/configURL'
import { ref, computed } from 'vue'
import { CONFIG_GAME_CONFIG_SHEET } from '@/utilities/constants'
import { secondConvertToTime } from '@/utilities/convertToSeconds'
import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import headerCurrency from '@/components/other/headerCurrency.vue'
import headerAvatar from '@/components/other/headerAvatar.vue'
import headerName from '@/components/other/headerName.vue'

const themeVars = useThemeVars()
const { t, n } = useI18n()
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const showOption = useHandlerMenuLeft.showOption
const useConfigURL = useConfigURLStore()
const webSocketBlockStore = useWebSocketBlockStore()
const useArenaSeason = useArenaSeasonStore()

// Lấy giá trị cố định
const ACTION_POINT_MAX = computed(() =>
  useConfigURL.dataGameConfigSheet !== null
    ? useConfigURL.dataGameConfigSheet['action_point_max']['value']
    : CONFIG_GAME_CONFIG_SHEET.action_point_max
)
const DAILY_REWARD_INTERVAL = computed(() =>
  useConfigURL.dataGameConfigSheet !== null
    ? useConfigURL.dataGameConfigSheet['daily_reward_interval']['value']
    : CONFIG_GAME_CONFIG_SHEET.daily_reward_interval
)
// Lấy giá trị của user
const useFetchDataUser9C = useFetchDataUser9CStore()
const isShowGuest = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? false
    : true
)
const blockRefillAP = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null
    ? useFetchDataUser9C.dataUser9C_normal.blockRefillAP
    : blockNow.value
)
const APNow = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null &&
  useFetchDataUser9C.isFetchingDataUser9C === false &&
  useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.AP
    : 0
)
const stakeNCG = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.stakeNCG
    : 0
)
const costAP = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.costAP
    : 5
)
const NCG = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null &&
  useFetchDataUser9C.isFetchingDataUser9C === false &&
  useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.ncg
    : 0
)
const Crystal = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.crystal
    : 0
)
const portraitId = computed(() => {
  if (
    useFetchDataUser9C.dataUser9C_normal !== null &&
    useFetchDataUser9C.dataUser9C_arena !== null &&
    useFetchDataUser9C.isFetchingDataUser9C === false
  ) {
    if (useFetchDataUser9C.dataUser9C_arena.portraitId !== 0)
      return useFetchDataUser9C.dataUser9C_arena.portraitId
    else return useFetchDataUser9C.dataUser9C_normal.armorId
  } else return 10200000
})
const level = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_normal.level
    : 0
)
const ticketsArena = computed(() => {
  if (
    useFetchDataUser9C.dataUser9C_normal !== null &&
    useFetchDataUser9C.dataUser9C_normal.arenaInfo.length !== 0
  ) {
    return useArenaSeason.roundActive - 1 >
      useFetchDataUser9C.dataUser9C_normal.arenaInfo.ticketResetCount
      ? useArenaSeason.maxPurchaseCountDuringIntervalActive
      : useFetchDataUser9C.dataUser9C_normal.arenaInfo.ticket
  } else {
    return 0
  }
})
const ticketsArenaBought = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null &&
  useFetchDataUser9C.dataUser9C_normal.arenaInfo.length !== 0
    ? useFetchDataUser9C.dataUser9C_normal.arenaInfo.purchasedTicketCount
    : 0
)
const ticketsArenaBuy = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null &&
  useFetchDataUser9C.dataUser9C_normal.arenaInfo.length !== 0
    ? useFetchDataUser9C.ticketArenaBuy
    : 0
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
const realTimeRefillAP = computed(() => secondConvertToTime(totalSeconds.value))

const listImg = ref({
  gifLoading: getImageBase64FromCacheOrFetch('/assets/gifs/loading_blocks.gif')
})
</script>
<style scoped>
.loading-gif {
  margin: 0 auto;
  /* width: 100%; */
  height: 100%;
  object-fit: contain;
}
</style>
