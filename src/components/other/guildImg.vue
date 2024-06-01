<template>
  <Transition name="slide-right" mode="out-in">
    <div class="container" v-if="isJoinedGuild">
      <div class="layer-img">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-badge
              class="img-bg"
              :value="`#${$props.rankGuild}`"
              type="error"
              :offset="offsetRankGuild"
            >
              <!-- <img :src="imgList.imgGuild" /> -->
              <n-avatar lazy :size="60" :src="imgList.imgGuild" />
              <n-badge
                class="img-bg"
                :value="`#${$props.rankMember}`"
                type="success"
                :offset="offsetRankMember"
              ></n-badge>
              <!-- <n-badge
                class="img-bg"
                :value="$props.totalScoreGuild"
                type="info"
                :offset="offsetGuildScoce"
              ></n-badge> -->
            </n-badge>
          </template>
          {{ nameGuildReal }}
        </n-tooltip>
      </div>
    </div>

    <div class="container" v-else>
      <div class="layer-img">
        <img :src="imgList.frame" class="img-frame" />
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { URL_API_GUILD } from '@/utilities/constants'
export default {
  props: {
    nameGuild: {
      type: String,
      required: true
    },
    rankMember: {
      type: [String, Number],
      default: 0
    },
    rankGuild: {
      type: [String, Number],
      default: 0
    },
    totalScoreGuild: {
      type: [String, Number],
      default: 0
    }
  },
  setup(props) {
    const offsetRankGuild = [-44, 57]
    const offsetRankMember = [44, 48]
    const offsetGuildScoce = [30, 30]
    const isJoinedGuild = computed(
      () => props.nameGuild !== null && props.nameGuild !== undefined && props.nameGuild !== ''
    )
    const nameGuildReal = computed(() => (isJoinedGuild.value ? props.nameGuild.split('_')[1] : ''))
    const imgList = ref({
      // imgGuild: computed(() =>
      //   isJoinedGuild.value
      //     ? getImageBase64FromCacheOrFetch(`${URL_API_GUILD}/${props.nameGuild}.png`)
      //     : ''
      // ),
      imgGuild: computed(() =>
        isJoinedGuild.value ? `${URL_API_GUILD}/${props.nameGuild}.png` : ''
      ),
      frame: getImageBase64FromCacheOrFetch('/assets/iconsArena/GuildEmpty.png')
    })
    return {
      isJoinedGuild,
      imgList,
      nameGuildReal,
      offsetRankGuild,
      offsetRankMember,
      offsetGuildScoce
    }
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
  /* top: 0%;
  right: -5%; */
  display: flex;
  /* justify-content: center; */
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
