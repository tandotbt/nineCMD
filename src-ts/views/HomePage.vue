<template>
  <div class="home-page-container">
    <!-- ====== BANNER CAROUSEL (góc trên phải, cố định, giống bản JS) ====== -->
    <n-grid
      v-if="bannerStore.hasBanners"
      class="liveAssets-carousel"
      cols="12"
      item-responsive
      responsive="screen"
    >
      <n-grid-item :span="8" :suffix="false"> </n-grid-item>
      <n-grid-item :span="4">
        <n-carousel :autoplay="true" :interval="2000" :space-between="0" draggable>
          <a
            v-for="banner in bannerStore.banners"
            :key="banner.Priority ?? banner.BannerImageName"
            :href="banner.Url || '#'"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              class="carousel-img"
              :src="banner.BannerImageUrl"
              :alt="banner.BannerImageName"
            />
          </a>
        </n-carousel>
      </n-grid-item>
    </n-grid>

    <!-- ====== HOME CARD (nội dung chính) ====== -->
    <n-space vertical align="center" style="padding: 40px 20px">
      <n-card :title="t('page.home')" style="max-width: 500px; width: 100%">
        <n-text depth="3">
          {{ t('@--App.description') }}
        </n-text>
        <n-divider />
        <n-text style="font-size: 12px; color: rgba(128, 128, 128, 1)">
          🏠 Home Page - Placeholder
        </n-text>
        <n-divider />
        <n-text depth="3" style="font-size: 12px">
          {{ t('@--App.devNote') }}
        </n-text>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NSpace,
  NCard,
  NText,
  NDivider,
  NCarousel,
  NGrid,
  NGridItem
} from 'naive-ui'
import { useBannerStore } from '../stores/banner'

const { t } = useI18n()
const bannerStore = useBannerStore()
</script>

<style scoped>
.home-page-container {
  position: relative;
  min-height: 100%;
}

/* Banner góc trên phải, cố định, giống bản JS gốc */
.liveAssets-carousel {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  width: 33.33%;
}

.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
