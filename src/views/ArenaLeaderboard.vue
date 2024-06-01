<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info">{{ t('page.arena.leaderboard') }}</n-gradient-text>

  <n-flex v-if="arenaSeasonStore.isActive" justify="space-around" size="large" vertical>
    <span>
      <n-gradient-text :size="20" :type="arenaSeasonStore.seasonNowData['statusSeason']">
        {{ arenaSeasonStore.seasonNowData['titleArena'] }}
        <img class="carousel-img" :src="arenaSeasonStore.seasonNowData['img']" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="arenaSeasonStore.seasonNowData['statusSeason']">
        {{ ticketsArena }}/8
        <img class="carousel-img" :src="imgList.ticket" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="arenaSeasonStore.seasonNowData['statusSeason']">
        {{ useFetchDataUser9C.ticketArenaBuy }}/{{
          arenaSeasonStore.maxPurchaseCountDuringIntervalActive
        }}
        <img class="carousel-img" :src="imgList.ticketBuy" />
      </n-gradient-text>
      <n-divider vertical />
      <n-gradient-text :size="20" :type="arenaSeasonStore.seasonNowData['statusSeason']">
        {{ ticketsArenaBought }}/{{ arenaSeasonStore.maxPurchaseCountActive }}
        <img class="carousel-img" :src="imgList.ticketBought" />
      </n-gradient-text>
    </span>
    <n-progress
      type="line"
      :status="arenaSeasonStore.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${arenaSeasonStore.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="arenaSeasonStore.seasonNowData['percentageSeason']"
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="arenaSeasonStore.seasonNowData['statusSeason'] === 'success'"
    >
      {{ arenaSeasonStore.seasonNowData['blockToEndSeason'] }}
    </n-progress>
    <n-progress
      type="line"
      :status="arenaSeasonStore.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${arenaSeasonStore.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="
        ((arenaSeasonStore.seasonNowData['nowRound'] * 100) /
          (arenaSeasonStore.seasonNowData['totalRound'] * 100)) *
        100
      "
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="arenaSeasonStore.seasonNowData['statusSeason'] === 'success'"
    >
      {{ arenaSeasonStore.seasonNowData['nowRound'] }}/{{
        arenaSeasonStore.seasonNowData['totalRound']
      }}
    </n-progress>
    <n-progress
      type="line"
      :status="arenaSeasonStore.seasonNowData['statusSeason']"
      :rail-color="
        changeColor(themeVars[`${arenaSeasonStore.seasonNowData['statusSeason']}Color`], {
          alpha: 0.2
        })
      "
      :percentage="
        (arenaSeasonStore.seasonNowData['blockEndRound'] / arenaSeasonStore.ROUND_BLOCKS) * 100
      "
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
      :indicator-placement="'inside'"
      :processing="arenaSeasonStore.seasonNowData['statusSeason'] === 'success'"
    >
      {{ arenaSeasonStore.seasonNowData['blockEndRound'] }}/{{ arenaSeasonStore.ROUND_BLOCKS }}
    </n-progress>
  </n-flex>
  <n-flex v-else><n-button @click="goBack">Quay lại</n-button></n-flex>
  <leadboardArena
    :isActive="arenaSeasonStore.isActive"
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
const arenaSeasonStore = useArenaSeasonStore()
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
    useFetchDataUser9C.dataUser9C !== null &&
    useFetchDataUser9C.dataUser9C.arenaInfo.length !== 0
  ) {
    return arenaSeasonStore.roundActive - 1 >
      useFetchDataUser9C.dataUser9C.arenaInfo.ticketResetCount
      ? arenaSeasonStore.maxPurchaseCountDuringIntervalActive
      : useFetchDataUser9C.dataUser9C.arenaInfo.ticket
  } else {
    return 0
  }
})
const ticketsArenaBought = computed(() =>
  useFetchDataUser9C.dataUser9C !== null && useFetchDataUser9C.dataUser9C.arenaInfo.length !== 0
    ? useFetchDataUser9C.dataUser9C.arenaInfo.purchasedTicketCount
    : 0
)

// Ảnh
const imgList = ref({
  ticket: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET.png'),
  ticketBuy: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BUY.png'),
  ticketBought: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BOUGHT.png')
})

onBeforeMount(() => {
  arenaSeasonStore.champId = route.params.champId
  arenaSeasonStore.roundId = route.params.roundId
})
onUpdated(() => {
  arenaSeasonStore.champId = route.params.champId
  arenaSeasonStore.roundId = route.params.roundId
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
