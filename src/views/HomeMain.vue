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
            <img class="carousel-img" :src="liveAsset.BannerImageName" />
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
        <!-- {{ t(menu.title) }} -->
        <router-link :to="menu.path"> <component :is="menu.component"></component> </router-link>
      </n-carousel-item>
    </n-carousel>
  </n-scrollbar>
</template>

<script setup>
// import { useI18n } from 'vue-i18n'
// import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useConfigURLStore } from '@/stores/configURL'
import lobblyArena from '@/components/icons/lobblyArena.vue'
import lobblyWorkshop from '@/components/icons/lobblyWorkshop.vue'
import lobblyShop from '@/components/icons/lobblyShop.vue'
import lobblyStage from '@/components/icons/lobblyStage.vue'
import lobblyStake from '@/components/icons/lobblyStake.vue'
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const useConfigURL = useConfigURLStore()
const showOption = useHandlerMenuLeft.showOption
import { computed } from 'vue'
// const { t } = useI18n()
const menus = [
  {
    title: 'page.arena.main',
    path: { name: 'arena-route' },
    component: lobblyArena
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    component: lobblyWorkshop
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    component: lobblyShop
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    component: lobblyStage
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    component: lobblyStake
  }
]
// Fetch tự động
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
