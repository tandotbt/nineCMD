<template>
  <n-carousel
    autoplay
    :interval="3000"
    :show-dots="false"
    direction="vertical"
    mousewheel
    style="height: 8vh"
    draggable
  >
    <template v-if="banners.length > 0">
      <a
        v-for="banner in banners"
        :key="banner.priority"
        :href="banner.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="banner.imageUrl" style="width: 100%; height: 8vh; object-fit: cover" />
      </a>
    </template>
    <template v-else>
      <n-text depth="3" style="font-size: 11px; padding: 2vh">
        Banner Placeholder
      </n-text>
    </template>
  </n-carousel>
</template>

<script setup lang="ts">
import { NCarousel, NText } from 'naive-ui'
import type { HeaderBannerItem } from '../../types/header'

withDefaults(defineProps<{
  banners?: HeaderBannerItem[]
}>(), {
  banners: () => []
})
</script>
