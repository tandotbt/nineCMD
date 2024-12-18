<template>
  <n-flex class="carousel-img" justify="center">
    <img class="carousel-img1" :src="listImg.icon" />
    <img class="carousel-img2" :src="listImg.title" />
  </n-flex>
</template>
<script setup>
import { computed } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const settingNineCMD = useStorage('setting-nine-cmd', {}, localStorage)
const isDarkMode = computed(() => settingNineCMD.value.isDarkMode)
const localeNow = computed(() => locale.value.toUpperCase())
const listImg = computed(() => {
  return {
    icon: getImageBase64FromCacheOrFetch('/assets/iconsShop/shop.png'),
    title: getImageBase64FromCacheOrFetch(
      `/assets/iconsShop/title_${isDarkMode.value}_${localeNow.value}.png`
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
</style>
