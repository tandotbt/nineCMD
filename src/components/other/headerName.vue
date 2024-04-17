<template>
  <n-ellipsis
    style="
      max-width: 15vw;
      text-overflow: ellipsis;
      /* position: absolute;
      margin-left: calc(53px - (100vw / 24)); */
    "
  >
    <n-gradient-text type="success" class="text-layer">{{ nameAndTag }}</n-gradient-text>
  </n-ellipsis>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
// import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
// import getListDCCFromCacheOrFetch from '@/utilities/getListDCCFromCacheOrFetch'

import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'

const { t } = useI18n()

const useFetchDataUser9C = useFetchDataUser9CStore()

const nameAndTag = computed(() =>
  useFetchDataUser9C.dataUser9C !== null
    ? `${useFetchDataUser9C.dataUser9C.name} #${useFetchDataUser9C.avatarAddress.slice(0, 6)}`
    : t('fetchDataUser9c.guest')
)
</script>

<style scoped>
.container {
  position: relative;
  height: 62px;
  width: 70px;
  margin: 0 auto;
  height: 100%;
  object-fit: contain;
}

.layer-img {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
.layer-bgLevel {
  position: absolute;
  top: 0%;
  right: -5%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.img-frame,
.img-bg {
  position: absolute;
  z-index: 0;
}
.text-layer {
  z-index: 1;
}
</style>
