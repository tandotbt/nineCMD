<template>
  <n-float-button :right="10" :bottom="10" position="fixed" type="primary" menu-trigger="hover">
    <n-icon>
      <ListIcon />
    </n-icon>
    <inventoryModal />
    <template #menu>
      <template v-for="(menu, menuKey) in menus" :key="menuKey">
        <n-float-button :shape="menu.shape" :type="menu.typeButton" :onClick="menu.onClick">
          <n-icon :component="menu.icon" />
        </n-float-button>
      </template>
    </template>
  </n-float-button>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { FormatListBulletedRound as ListIcon, HomeRound as HomeIcon } from '@vicons/material'
import inventoryModal from '@/components/other/inventoryModal.vue'
import { useInventoryModalStore } from '@/stores/inventoryModal'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
const useInventoryModal = useInventoryModalStore()
const useFetchDataUser9C = useFetchDataUser9CStore()
const menus = ref({
  test: {
    icon: markRaw(HomeIcon),
    shape: 'square',
    typeButton: 'primary',
    onClick() {
      console.log('hi')
    }
  },
  inventory: {
    icon: markRaw(HomeIcon),
    shape: 'circle',
    typeButton: 'default',
    onClick() {
      if (!useFetchDataUser9C.isFetchingDataUser9C)
        useInventoryModal.isShowModalChar = !useInventoryModal.isShowModalChar
    }
  }
})
</script>
