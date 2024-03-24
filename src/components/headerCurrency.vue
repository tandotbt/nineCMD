<template>
  <n-flex justify="center">
    <n-icon>
      <n-grid cols="12" item-responsive responsive="screen">
        <n-grid-item offset="12 m:0 l:0" span="0 m:1 l:1" class="carousel-container">
          <img
            style="display: none; transform: translateX(-10px)"
            src="/assets/icons/UI_bar_02_bg.png"
          />
        </n-grid-item>
        <n-grid-item offset="12 m:0 l:0" span="1 m:1 l:1" class="carousel-container">
          <img class="icon" :src="'/assets/icons/' + type + '.png'" />
        </n-grid-item>
      </n-grid>
    </n-icon>
    <n-gradient-text class="" :size="15" type="info">{{ value }}</n-gradient-text>
  </n-flex>
</template>
<script>
import { useI18n } from 'vue-i18n'

export default {
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()

    return { t }
  }
}
</script>
<style scoped>
.img-background {
  position: absolute;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.carousel-container {
  position: relative;
}

.image-container {
  position: relative;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
}

.icon {
  /* position: absolute;
  top: 0px;
  left: 150px; */
  transform: scale(0.5) translateX(-80px) translateY(-30px);
}

.img {
  user-select: none;
}
.text {
  position: absolute;
  top: -35px;
  left: 35px;
}
</style>
