<template>
  <n-scrollbar class="carousel-container" trigger="none">
    <!-- Banner quảng cáo -->

    <n-grid class="liveAssets-carousel" cols="12" item-responsive responsive="screen">
      <n-grid-item span="8 m:9 l:10"> </n-grid-item>
      <n-grid-item span="4 m:3 l:2">
        <n-carousel :autoplay="true" :interval="2000" :space-between="0" draggable>
          <a
            v-for="liveAsset in liveAssets"
            :key="liveAsset.Priority"
            :href="liveAsset.Url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              class="carousel-img"
              :src="`https://raw.githubusercontent.com/planetarium/NineChronicles.LiveAssets/main/Assets/Images/Banner/${liveAsset.BannerImageName}.png`"
            />
          </a>
        </n-carousel>
      </n-grid-item>
      ></n-grid
    >

    <!-- Menu chọn chức năng arena, shop,... -->
    <n-carousel
      key="card"
      effect="card"
      :centered-slides="true"
      slides-per-view="auto"
      draggable
      style="height: 70vh"
      trigger="hover"
      dot-type="line"
    >
      <n-carousel-item
        style="width: 40%"
        v-for="(menu, index) in menus"
        :key="index"
        @click="showOption(`go-${menu.path.name}`)"
      >
        {{ t(menu.title) }}
        <router-link :to="menu.path"> <img class="carousel-img" :src="menu.img" /> </router-link>
      </n-carousel-item>
    </n-carousel>
  </n-scrollbar>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useConfigURLStore } from '@/stores/configURL'
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const useConfigURL = useConfigURLStore()
const showOption = useHandlerMenuLeft.showOption
import { computed } from 'vue'
const { t } = useI18n()
const menus = [
  {
    title: 'page.arena.main',
    path: { name: 'arena-route' },
    img: '/assets/lobby/arena.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/assets/lobby/craft.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/assets/lobby/shop.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/assets/lobby/stage.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/assets/lobby/stake.png'
  }
]
// Sau này cần fetch tự động
const liveAssets = computed(() => useConfigURL.dataBanner)
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.carousel-container {
  position: relative;
}

.liveAssets-carousel {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
</style>
