<template>
  <n-input v-model:value="imgUrl" type="url" placeholder="Basic Input" />
  <n-divider vertical />
  <n-button @click="fetchImg()">Get img</n-button>
  <n-image lazy width="100" :src="img" />
</template>

<script setup>
import { ref } from 'vue'

import getImageBase64FromCacheOrFetch from '@/utilities/getImageBase64FromCacheOrFetch'

const imgUrl = ref()
const img = ref()
function fetchImg() {
  img.value = getImageBase64FromCacheOrFetch(imgUrl.value)
}
</script>
