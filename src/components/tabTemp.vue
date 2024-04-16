<template>
  <Transition name="slide-right" mode="out-in">
    <div class="container" v-if="isDCC">
      <div class="layer-img">
        <img :src="frameDCC" class="img-frame" />
        <img :src="imgDCC" class="img-avatar" />
      </div>
      <div class="layer-bgLevel">
        <img :src="bgLevel" class="img-bg" />
        <n-gradient-text type="warning" class="text-layer">{{ level }}</n-gradient-text>
      </div>
    </div>

    <div class="container" v-else>
      <div class="layer-img">
        <img :src="frameAvatar" class="img-frame" />
        <img :src="imgAvatar" class="img-avatar" />
      </div>
      <div class="layer-bgLevel">
        <img :src="bgLevel" class="img-bg" />
        <n-gradient-text type="warning" class="text-layer">{{ level }}</n-gradient-text>
      </div>
    </div>
  </Transition>
  <n-switch v-model:value="isDCC"></n-switch>
</template>

<script setup>
import { ref } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'

// https://api.dccnft.com/v1/9c/avatars/all

const isDCC = ref(true)
const level = ref(123)

const idDCC = ref(216)
const imgDCC = getImageBase64FromCacheOrFetch(
  'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/PFP/' +
    idDCC.value +
    '.png'
)
const frameDCC = getImageBase64FromCacheOrFetch(
  'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/character_frame_dcc.png'
)
const portraitId = ref(10200000)
const imgAvatar = getImageBase64FromCacheOrFetch(
  'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/' +
    portraitId.value +
    '.png'
)
const frameAvatar = getImageBase64FromCacheOrFetch(
  'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/character_frame.png'
)

const bgLevel = getImageBase64FromCacheOrFetch(
  'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/Character_Level_Bg.png'
)
</script>

<style scoped>
.container {
  position: relative;
  height: 62px;
  width: 70px;
}

.section {
  position: relative;
}

.layer-img {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;
}
.layer-bgLevel {
  position: absolute;
  top: -10%;
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
/* Chuyển cảnh */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
