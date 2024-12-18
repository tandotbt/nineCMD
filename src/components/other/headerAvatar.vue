<template>
  <Transition name="slide-right" mode="out-in">
    <div class="container" v-if="isDCC">
      <div class="layer-img">
        <img :src="imgList.frameDCC" class="img-frame" />
        <img :src="imgList.imgDCC" class="img-avatar" />
      </div>
      <div class="layer-bgLevel">
        <img :src="imgList.bgLevel" class="img-bg" />
        <n-gradient-text type="warning" class="text-layer">{{ level }}</n-gradient-text>
      </div>
    </div>

    <div class="container" v-else>
      <div class="layer-img">
        <img :src="imgList.frameAvatar" class="img-frame" />
        <img :src="imgList.imgAvatar" class="img-avatar" />
      </div>
      <div class="layer-bgLevel">
        <img :src="imgList.bgLevel" class="img-bg" />
        <n-gradient-text type="warning" class="text-layer">{{ level }}</n-gradient-text>
      </div>
    </div>
  </Transition>
</template>

<!-- <script setup>
import { ref, computed } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import getListDCCFromCacheOrFetch from '@/utilities/getListDCCFromCacheOrFetch'
import { useHandlerMenuLeftStore } from '@/stores/handlerMenuLeft'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'

import { computedAsync } from '@vueuse/core'
const useHandlerMenuLeft = useHandlerMenuLeftStore()
const useFetchDataUser9C = useFetchDataUser9CStore()
// Giúp chọn thẻ login
const showOption = useHandlerMenuLeft.showOption

const isDCC = computedAsync(
  async () => await getListDCCFromCacheOrFetch(useFetchDataUser9C.avatarAddress)
)

// const isDCC = ref(0)
const idDCC = computed(() => isDCC.value)
const imgList = ref({
  imgDCC: computed(() =>
    isDCC.value
      ? getImageBase64FromCacheOrFetch(
          `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/PFP/` +
            idDCC.value +
            '.png`
        )
      : ''
  ),
  frameDCC: getImageBase64FromCacheOrFetch(
    `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame_dcc.png`
  ),
  imgAvatar: computed(() =>
    !isDCC.value
      ? getImageBase64FromCacheOrFetch(
          `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/` +
            portraitId.value +
            '.png`
        )
      : ''
  ),
  frameAvatar: getImageBase64FromCacheOrFetch(
    `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame.png`
  ),
  bgLevel: getImageBase64FromCacheOrFetch(
    `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/Character_Level_Bg.png`
  )
})
// const imgDCC = computed(() =>
//   isDCC.value
//     ? getImageBase64FromCacheOrFetch(
//         `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/PFP/` +
//           idDCC.value +
//           '.png`
//       )
//     : ''
// )
// const frameDCC = getImageBase64FromCacheOrFetch(
//   `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame_dcc.png`
// )

const portraitId = computed(() => {
  if (
    useFetchDataUser9C.dataUser9C_normal !== null &&
    useFetchDataUser9C.dataUser9C_arena !== null &&
    useFetchDataUser9C.isFetchingDataUser9C === false
  ) {
    if (useFetchDataUser9C.dataUser9C_arena.portraitId !== 0)
      return useFetchDataUser9C.dataUser9C_arena.portraitId
    else return useFetchDataUser9C.dataUser9C_normal.armorId
  } else return 10200000
})
// const imgAvatar = computed(() =>
//   !isDCC.value
//     ? getImageBase64FromCacheOrFetch(
//         `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/` +
//           portraitId.value +
//           '.png`
//       )
//     : ''
// )
// const frameAvatar = getImageBase64FromCacheOrFetch(
//   `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame.png`
// )

// const bgLevel = getImageBase64FromCacheOrFetch(
//   `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/Character_Level_Bg.png`
// )

const level = computed(() =>
  useFetchDataUser9C.dataUser9C_normal !== null && useFetchDataUser9C.isFetchingDataUser9C === false ? useFetchDataUser9C.dataUser9C_normal.level : 0
)
</script> -->

<script>
import { ref, computed } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import getListDCCFromCacheOrFetch from '@/utilities/getListDCCFromCacheOrFetch'
import { computedAsync } from '@vueuse/core'
import { V_GITHUB_NINECHRONICLES } from '@/utilities/constants'
export default {
  props: {
    avatarAddress: {
      type: String,
      required: true
    },
    portraitId: {
      type: Number,
      default: 10200000
    },
    level: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const isDCC = computedAsync(async () => await getListDCCFromCacheOrFetch(props.avatarAddress))
    const idDCC = computed(() => isDCC.value)
    const imgList = ref({
      imgDCC: computed(() =>
        isDCC.value
          ? getImageBase64FromCacheOrFetch(
              `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/PFP/` +
                idDCC.value +
                '.png'
            )
          : ''
      ),
      frameDCC: getImageBase64FromCacheOrFetch(
        `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame_dcc.png`
      ),
      imgAvatar: computed(() =>
        !isDCC.value
          ? getImageBase64FromCacheOrFetch(
              `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/` +
                props.portraitId +
                '.png'
            )
          : ''
      ),
      frameAvatar: getImageBase64FromCacheOrFetch(
        `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/character_frame.png`
      ),
      bgLevel: getImageBase64FromCacheOrFetch(
        `https://raw.githubusercontent.com/planetarium/NineChronicles/${V_GITHUB_NINECHRONICLES}/nekoyume/Assets/Resources/UI/Icons/Item/Character_Level_Bg.png`
      )
    })
    return { isDCC, imgList }
  }
}
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
