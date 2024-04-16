<template>
  <n-grid cols="12" item-responsive responsive="screen">
    <n-grid-item offset="3 m:5 l:5" span="6 m:2 l:2" class="carousel-container">
      <img class="carousel-img" :src="listImg.alone" />
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import { ref } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
const listImg = ref({
  alone: getImageBase64FromCacheOrFetch('/assets/icons/alone.png')
})
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
</style>
