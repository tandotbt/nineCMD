<template>
  <itemModal />
  <n-pagination
    v-model:page="useInventoryModal.page"
    v-model:page-size="useInventoryModal.pageSize"
    simple
    :item-count="lengthItems"
  />
  <n-grid
    cols="3 400:5"
    :collapsed="useInventoryModal.gridCollapsed"
    :collapsed-rows="gridCollapsedRows"
  >
    <template v-for="(item, itemIndex) in items" :key="itemIndex">
      <n-gi @click="handlerViewItem(item)">
        <gearImg
          :dataGear="item"
          :isGearLite="props.typeDataFilter === 'materials'"
          :isEquipmentViewInventory="
            props.typeDataFilter === 'equipment' || props.typeDataFilter === 'costumes'
          "
          :isConsumablesViewInventory="props.typeDataFilter === 'consumables'"
        />
      </n-gi>
    </template>

    <n-gi
      v-if="showSuffix"
      suffix
      class="suffix"
      #="{ overflow }"
      @click="useInventoryModal.gridCollapsed = !useInventoryModal.gridCollapsed"
    >
      {{ overflow ? 'Còn tiếp' : 'Hết' }}
    </n-gi>
  </n-grid>
</template>

<script setup>
const props = defineProps({
  typeDataFilter: { type: String, defaul: 'equipment' }
})
import { ref, computed } from 'vue'
import itemModal from '@/components/other/itemModal.vue'
import gearImg from '@/components/other/gearImg.vue'
import { useInventoryModalStore } from '@/stores/inventoryModal'

const useInventoryModal = useInventoryModalStore()

const items = computed(() => {
  return useInventoryModal.gridDataMini[props.typeDataFilter]
})
const lengthItems = computed(() =>
  Math.ceil(useInventoryModal.gridData[props.typeDataFilter].length)
)

// Quản lý hiển thị chi tiết thông tin gear khi click
function handlerViewItem(item) {
  useInventoryModal.dataForViewGear = item
  useInventoryModal.isShowModalItem = !useInventoryModal.isShowModalItem
}
// Ẩn
const gridCollapsedRows = ref(3)

const showSuffix = ref(true)
</script>

<style scoped>
.suffix {
  border: 1px solid rgba(0, 128, 0, 0.36);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
