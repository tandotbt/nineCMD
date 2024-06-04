<template>
  <!-- <n-grid cols="12" item-responsive responsive="screen">
    <n-grid-item offset="3 m:5 l:5" span="6 m:2 l:2" class="carousel-container">
      <img class="carousel-img" :src="listImg.logo" />
    </n-grid-item>
  </n-grid> -->

  <n-avatar round :size="24" :src="listImg.logo" />
</template>

<script setup>
import { ref } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
const listImg = ref({
  logo: getImageBase64FromCacheOrFetch('/assets/icons/logoNineCMDSign.png')
})
</script>

<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 500%;
  height: 100%;
  object-fit: contain;
}
.carousel-container {
  position: relative;
}
</style>
