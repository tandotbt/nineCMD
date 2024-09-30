<template>
  <n-modal v-model:show="useInventoryModal.isShowModalItem">
    <n-card
      :title="useInventoryModal.dataForViewGear.title"
      style="min-width: 200px; max-width: 400px"
      :cover="renderCover"
    >
      {{ useInventoryModal.dataForViewGear }}
    </n-card>
  </n-modal>
</template>

<script setup>
import { computed, h } from 'vue'
import { useInventoryModalStore } from '@/stores/inventoryModal'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { URL_GITHUB_NineChronicles } from '@/utilities/constants'
const useInventoryModal = useInventoryModalStore()
const listImg = computed(() => {
  return {
    grade: getImageBase64FromCacheOrFetch(
      `assets/itemsGear/item_bg_Normal_Tooltip_${useInventoryModal.dataForViewGear.grade}.png`
    ),
    imgGear: getImageBase64FromCacheOrFetch(
      `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${useInventoryModal.dataForViewGear.id}.png`
    )
  }
})
function renderCover() {
  return h('div', { style: { position: 'relative' } }, [
    h('img', { style: { width: '100%', height: '100%' }, src: listImg.value.grade }),
    h('img', {
      style: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' },
      src: listImg.value.imgGear
    })
  ])
}
</script>

<style scoped></style>
<style scoped></style>
