<!-- 
Dịch
Lấy đúng dữ liệu ap hiện tại, blocks refill AP, ncg, crysatl, vé arena, vé world boss nếu có, event dungeon nếu có,...
Ẩn hiện gif loading khi có/không có dữ liệu
Chức năng refill AP, dùng bình AP, tính toán thời gian dự kiến nhận ap
-->
<template>
  <n-grid cols="24" item-responsive responsive="screen">
    <n-grid-item span="5 m:6 l:7"
      >{{ t('@--App-vue.header') }} Blocks refill {{ blocksReffillAP }}
    </n-grid-item>
    <n-grid-item offset="3 m:3 l:3" span="6 m:5 l:4">
      <n-carousel
        autoplay
        :interval="3000"
        :show-dots="false"
        direction="vertical"
        mousewheel
        style="height: 10vh"
        draggable
      >
        <n-popconfirm>
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="50"
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              processing
              :color="themeVars.warningColor"
              :rail-color="changeColor(themeVars.warningColor, { alpha: 0.2 })"
            >
              <!-- <span>1h30</span> -->
              <img class="carousel-img" src="../assets/gifs/loading_blocks.gif" />
            </n-progress>
          </template>

          <template #action>
            <n-button>cancel</n-button>
            <n-button>use AP potion</n-button>
            <n-button>change ap</n-button>
          </template>
          <span>Block hồi refill AP 1780/1780 </span>
        </n-popconfirm>
        <n-popconfirm :positive-text="null">
          <template #trigger>
            <n-progress
              type="line"
              :height="20"
              :percentage="50"
              :indicator-placement="'inside'"
              :border-radius="4"
              :fill-border-radius="0"
              :color="themeVars.primaryColor"
              :rail-color="changeColor(themeVars.primaryColor, { alpha: 0.2 })"
            >
              <n-ellipsis style="max-width: 15vw">120/120</n-ellipsis>
            </n-progress>
          </template>
          <span>AP hiện tại</span>
        </n-popconfirm>
      </n-carousel>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useThemeVars } from 'naive-ui'
import { changeColor } from 'seemly'
const themeVars = useThemeVars()
const { t } = useI18n()

// Hiển thị và tính toán AP, thời gian hồi
import { useFetchDataUser9C } from '@/stores/fetchDataUser9C'
import { computed } from 'vue'
const fetchDataUser9C = useFetchDataUser9C()
const blocksReffillAP = computed(() =>
  fetchDataUser9C.dataUser9C !== null
    ? fetchDataUser9C.dataUser9C.data.stateQuery.avatar.dailyRewardReceivedIndex
    : 0
)
</script>
<style scoped>
.carousel-img {
  margin: 0 auto;
  /* width: 100%; */
  height: 100%;
  object-fit: contain;
}
</style>
