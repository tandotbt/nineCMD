<template>
  <n-scrollbar class="carousel-container" trigger="none">
    <!-- Banner quảng cáo -->

    <n-grid class="liveAssets-carousel" cols="12" item-responsive responsive="screen">
      <n-grid-item span="8 m:9 l:10"> </n-grid-item>
      <n-grid-item span="4 m:3 l:2">
        <n-carousel :autoplay="true" :interval="2000" :space-between="0" draggable>
          <img
            v-for="liveAsset in liveAssets"
            :key="liveAsset.Priority"
            class="carousel-img"
            :src="`https://raw.githubusercontent.com/planetarium/NineChronicles.LiveAssets/main/Assets/Images/Banner/${liveAsset.BannerImageName}.png`"
          />
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

import { useHandlerMenuLeft } from '@/stores/handlerMenuLeft'

const handlerMenuLeft = useHandlerMenuLeft()
const showOption = handlerMenuLeft.showOption
import { ref } from 'vue'
const { t } = useI18n()
const menus = [
  {
    title: 'page.arena.main',
    path: { name: 'arena-route' },
    img: '/src/assets/lobby/arena.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/src/assets/lobby/craft.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/src/assets/lobby/shop.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/src/assets/lobby/stage.png'
  },
  {
    title: 'page.notFound',
    path: { name: 'not-found-route' },
    img: '/src/assets/lobby/stake.png'
  }
]
// Sau này cần fetch tự động
const liveAssets = ref([
  {
    Priority: 79,
    BannerImageName: 'feb-promo',
    PopupImageName: 'feb-promo',
    UseDateTime: true,
    BeginDateTime: '2024-02-21T02:00:00',
    EndDateTime: '2024-03-05T23:59:00',
    Url: 'https://bit.ly/9CM_202402Promo',
    UseAgentAddress: false,
    Description: 'feb-promo',
    EnableKeys: []
  },
  {
    Priority: 80,
    BannerImageName: 'seasonpass3',
    PopupImageName: 'seasonpass3',
    UseDateTime: true,
    BeginDateTime: '2024-02-01T00:00:00',
    EndDateTime: '2024-02-29T23:59:00',
    Url: 'https://bit.ly/9CM_SP_S3',
    UseAgentAddress: false,
    Description: 'seasonpass3',
    EnableKeys: []
  },
  {
    Priority: 81,
    BannerImageName: '2024lunar',
    PopupImageName: '2024lunar',
    UseDateTime: true,
    BeginDateTime: '2024-02-01T00:00:00',
    EndDateTime: '2024-02-29T23:59:00',
    Url: 'https://bit.ly/9CM_2024LNY_Event',
    UseAgentAddress: false,
    Description: '2024lunar',
    EnableKeys: []
  },
  {
    Priority: 98,
    BannerImageName: 'Banner_Event56',
    PopupImageName: 'Main_Event56',
    UseDateTime: false,
    BeginDateTime: '',
    EndDateTime: '',
    Url: 'https://bit.ly/9C_M_Save_Your_Private_Key',
    UseAgentAddress: false,
    Description: 'Save_Your_Private_Key',
    EnableKeys: []
  },
  {
    Priority: 99,
    BannerImageName: 'Banner_4',
    PopupImageName: 'InviteFriend',
    UseDateTime: false,
    BeginDateTime: '',
    EndDateTime: '',
    Url: 'https://onboarding.nine-chronicles.com/',
    UseAgentAddress: true,
    Description: 'Invite Your friend',
    EnableKeys: []
  },
  {
    Priority: 100,
    BannerImageName: 'Banner_3',
    PopupImageName: 'MonsterCollection',
    UseDateTime: false,
    BeginDateTime: '',
    EndDateTime: '',
    Url: 'https://ninechronicles.medium.com/monster-collection-v2-update-6cde770c9f31',
    UseAgentAddress: false,
    Description: 'Monster Collection',
    EnableKeys: []
  }
])
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
