<template>
  <n-flex class="carousel-img" justify="center">
    <img class="carousel-img1" :src="listImg.icon" />
    <img class="carousel-img2" :src="listImg.title" />
    <img v-if="useArenaSeason.isSeason" class="carousel-img2 move-up" :src="listImg.banner" />
  </n-flex>
</template>
<script setup>
import { computed } from 'vue'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const useArenaSeason = useArenaSeasonStore()
const settingNineCMD = useStorage('setting-nine-cmd', {}, localStorage)
const isDarkMode = computed(() => settingNineCMD.value.isDarkMode)
const localeNow = computed(() => locale.value.toUpperCase())
const listImg = computed(() => {
  return {
    icon: getImageBase64FromCacheOrFetch('/assets/iconsArena/Arena_bg_01.png'),
    banner: getImageBase64FromCacheOrFetch(
      `/assets/iconsArena/bg_promotion_bg_01_mod_${localeNow.value}.png`
    ),
    title: getImageBase64FromCacheOrFetch(
      `/assets/iconsArena/title_${isDarkMode.value}_${localeNow.value}.png`
    )
  }
})
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.carousel-img1 {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.carousel-img2 {
  position: absolute;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.move-up {
  animation: moveUp 1s ease infinite alternate; /* Chạy hiệu ứng lên xuống trong 1 giây */
}

@keyframes moveUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2vh); /* Chuyển động lên 50px */
  }
}
</style>
