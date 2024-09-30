<template>
  <img class="carousel-img" :src="listImg.icon" />
</template>
<script setup>
import { ref } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
const listImg = ref({
  icon: getImageBase64FromCacheOrFetch('/assets/lobby/shop.png')
})
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
