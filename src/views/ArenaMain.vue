<template>
  <breadcrumbPage :pages="pages" />
  <n-gradient-text :size="24" type="info">
    {{ t('page.arena.main') }} <n-divider vertical />
    {{ useArenaSeason.realTomeSeasonEnd.hours }}:{{ useArenaSeason.realTomeSeasonEnd.minutes }}:{{
      useArenaSeason.realTomeSeasonEnd.seconds
    }}</n-gradient-text
  >
  <div v-if="!useFetchDataUser9C.isFetchingDataUser9C">
    <n-carousel
      v-if="useFetchDataUser9C.isUseFetchArena"
      ref="carouselRef"
      key="slide"
      effect="slide"
      centered-slides
      slides-per-view="2"
      mousewheel
      style="height: 60vh"
      trigger="hover"
      dot-type="line"
      direction="vertical"
      dot-placement="right"
      :space-between="10"
      :loop="true"
    >
      <n-carousel-item
        style="width: 100%"
        v-for="(season, index) in useArenaSeason.seasonArenaInfoAll"
        :key="index"
        ><n-flex justify="space-around" size="large" vertical>
          <router-link
            :to="{
              name: 'arena-leaderboard-route',
              params: { champId: season.championshipId, roundId: season.roundId }
            }"
          >
            <n-gradient-text
              :size="24"
              :type="season.statusSeason"
              @click="showOption('go-arena-leaderboard-route')"
            >
              {{ season.titleArena }}
              <img class="carousel-img" :src="getImageBase64FromCacheOrFetch(season.img)" />
            </n-gradient-text>
          </router-link>
          <n-progress
            type="line"
            :status="season.statusSeason"
            :rail-color="changeColor(themeVars[`${season.statusSeason}Color`], { alpha: 0.2 })"
            :percentage="season.percentageSeason"
            :height="24"
            :border-radius="4"
            :fill-border-radius="0"
            :indicator-placement="'inside'"
            :processing="season.statusSeason === 'success'"
          >
            {{ season.blockToEndSeason }}
          </n-progress>
          <n-progress
            type="line"
            :status="season.statusSeason"
            :rail-color="changeColor(themeVars[`${season.statusSeason}Color`], { alpha: 0.2 })"
            :percentage="((season.nowRound * 100) / (season.totalRound * 100)) * 100"
            :height="24"
            :border-radius="4"
            :fill-border-radius="0"
            :indicator-placement="'inside'"
            :processing="season.statusSeason === 'success'"
          >
            {{ season.nowRound }}/{{ season.totalRound }}
          </n-progress>
          <n-progress
            type="line"
            :status="season.statusSeason"
            :rail-color="changeColor(themeVars[`${season.statusSeason}Color`], { alpha: 0.2 })"
            :percentage="(season.blockEndRound / useArenaSeason.ROUND_BLOCKS) * 100"
            :height="24"
            :border-radius="4"
            :fill-border-radius="0"
            :indicator-placement="'inside'"
            :processing="season.statusSeason === 'success'"
          >
            {{ season.blockEndRound }}/{{ useArenaSeason.ROUND_BLOCKS }}
          </n-progress>
        </n-flex>
      </n-carousel-item>
    </n-carousel>
    <n-p v-else>
      <n-gradient-text :size="20" type="warning">
        {{ t('@--views--ArenaMain-vue.messageJoinArenaFirst') }}
      </n-gradient-text>
    </n-p>
  </div>
  <n-p v-else>
    <n-gradient-text :size="20" type="info">
      {{ t('@--views--ArenaMain-vue.messageLoading') }}
    </n-gradient-text>
  </n-p>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, markRaw, onUpdated, onMounted } from 'vue'
import { HomeRound as HomeIcon, StadiumRound as ArenaIcon } from '@vicons/material'
import breadcrumbPage from '@/components/other/breadcrumbPage.vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'

import { changeColor } from 'seemly'
import { useThemeVars } from 'naive-ui'
const useArenaSeason = useArenaSeasonStore()
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const useFetchDataUser9C = useFetchDataUser9CStore()
const { t } = useI18n()
const pages = ref([
  { title: 'page.home', path: { name: 'home-route' }, icon: markRaw(HomeIcon) },
  { title: 'page.arena.main', path: { name: 'arena-route' }, icon: markRaw(ArenaIcon) }
])

const carouselRef = ref(null)
const goToIndex = (index) => {
  if (carouselRef.value !== null) carouselRef.value.to(index)
}

onUpdated(() => {
  if (useFetchDataUser9C.isUseFetchArena) goToIndex(useArenaSeason.seasonIndex)
})
onMounted(() => {
  // Gọi hàm bạn muốn khi component được mounted và khi đã join arena
  if (useFetchDataUser9C.isUseFetchArena) goToIndex(useArenaSeason.seasonIndex)
})
const showOption = useHandlerMenuLeft.showOption
const themeVars = useThemeVars()
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  /* width: 100%;
  height: 100%; */
  object-fit: contain;
}
.carousel-container {
  position: relative;
}
</style>
