<template>
  <div class="equipped-tag">
    <img :src="equipIconUrl" draggable="false" />
  </div>
</template>

<script setup lang="ts">
import { getEquipIconUrl } from '@/logic/assets'

const equipIconUrl = getEquipIconUrl()
</script>

<style scoped>
.equipped-tag {
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
  z-index: 5;
}

.equipped-tag img {
  width: 100%;
  display: block;
}
</style>
