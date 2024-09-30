<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info"
    >{{ t('page.arena.leaderboard') }} <n-divider vertical />
    {{ useArenaSeason.realTomeSeasonEnd.hours }}:{{ useArenaSeason.realTomeSeasonEnd.minutes }}:{{
      useArenaSeason.realTomeSeasonEnd.seconds
    }}</n-gradient-text
  >

  <n-flex v-if="useArenaSeason.isActive" justify="space-around" size="large" vertical>
    <span>
      <n-gradient-text :size="20" :type="useArenaSeason.seasonNowData['statusSeason']">
        {{ useArenaSeason.seasonNowData['titleArena'] }}
        <img class="carousel-img" :src="useArenaSeason.seasonNowData['img']" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="useArenaSeason.seasonNowData['statusSeason']">
        {{ ticketsArena }}/8
        <img class="carousel-img" :src="imgList.ticket" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="useArenaSeason.seasonNowData['statusSeason']">
        {{ useFetchDataUser9C.ticketArenaBuy }}/{{
          useArenaSeason.maxPurchaseCountDuringIntervalActive
        }}
        <img class="carousel-img" :src="imgList.ticketBuy" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="useArenaSeason.seasonNowData['statusSeason']">
        {{ ticketsArenaBought }}/{{ useArenaSeason.maxPurchaseCountActive }}
        <img class="carousel-img" :src="imgList.ticketBought" />
      </n-gradient-text>
    </span>
    <n-progress
      type="line"
      :status="useArenaSeason.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${useArenaSeason.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="useArenaSeason.seasonNowData['percentageSeason']"
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="useArenaSeason.seasonNowData['statusSeason'] === 'success'"
    >
      {{ useArenaSeason.seasonNowData['blockToEndSeason'] }}
    </n-progress>
    <n-progress
      type="line"
      :status="useArenaSeason.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${useArenaSeason.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="
        ((useArenaSeason.seasonNowData['nowRound'] * 100) /
          (useArenaSeason.seasonNowData['totalRound'] * 100)) *
        100
      "
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="useArenaSeason.seasonNowData['statusSeason'] === 'success'"
    >
      {{ useArenaSeason.seasonNowData['nowRound'] }}/{{
        useArenaSeason.seasonNowData['totalRound']
      }}
    </n-progress>
    <n-progress
      type="line"
      :status="useArenaSeason.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${useArenaSeason.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="
        (useArenaSeason.seasonNowData['blockEndRound'] / useArenaSeason.ROUND_BLOCKS) * 100
      "
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="useArenaSeason.seasonNowData['statusSeason'] === 'success'"
    >
      {{ useArenaSeason.seasonNowData['blockEndRound'] }}/{{ useArenaSeason.ROUND_BLOCKS }}
    </n-progress>
  </n-flex>
  <n-flex v-else
    ><n-button @click="goBack">
      {{ t('@--views--ArenaLeaderboard-vue.button.backArenaMain') }}
    </n-button>
  </n-flex>
  <leadboardArena
    :isActive="useArenaSeason.isActive"
    :champIdSelect="parseInt(route.params.champId)"
    :roundIdSelect="parseInt(route.params.roundId)"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, markRaw, onBeforeMount, onUpdated } from 'vue'
import {
  HomeRound as HomeIcon,
  StadiumRound as ArenaIcon,
  LeaderboardRound as LeaderboardIcon
} from '@vicons/material'
import breadcrumbPage from '@/components/other/breadcrumbPage.vue'
import leadboardArena from '@/components/other/leadboardArena.vue'
import { useRoute, useRouter } from 'vue-router'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { changeColor } from 'seemly'
import { useThemeVars } from 'naive-ui'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
const themeVars = useThemeVars()
const useFetchDataUser9C = useFetchDataUser9CStore()
const useArenaSeason = useArenaSeasonStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.arena.main', path: { name: 'arena-route' }, icon: markRaw(ArenaIcon) },
  {
    title: 'page.arena.leaderboard',
    path: {
      name: 'arena-leaderboard-route',
      params: { champId: route.params.champId, roundId: route.params.roundId } // Sử dụng giá trị từ route
    },
    icon: markRaw(LeaderboardIcon)
  }
])
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const showOption = useHandlerMenuLeft.showOption
const goBack = () => {
  router.push({ name: 'arena-route' })
  showOption('go-arena-route')
}

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

// Ảnh
const imgList = ref({
  ticket: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET.png'),
  ticketBuy: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BUY.png'),
  ticketBought: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BOUGHT.png')
})

onBeforeMount(() => {
  useArenaSeason.champId = route.params.champId
  useArenaSeason.roundId = route.params.roundId
})
onUpdated(() => {
  useArenaSeason.champId = route.params.champId
  useArenaSeason.roundId = route.params.roundId
})
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  /* width: 100%;*/
  height: 5vh;
  object-fit: contain;
}
</style>
