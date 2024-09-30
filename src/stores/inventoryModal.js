import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'

export const useInventoryModalStore = defineStore('inventoryModalStore', () => {
  const useFetchDataUser9C = useFetchDataUser9CStore()
  const isShowModalChar = ref(false)

  const gridCollapsed = ref(true)
  // Dữ liệu show
  const isShowModalItem = ref(false)
  const dataForViewGear = ref({})
  // Xử lý data trước
  const gridData = reactive({
    equipment: computed(() => useFetchDataUser9C.dataUser9C_normal ? useFetchDataUser9C.dataUser9C_normal.listEquipment : []),
    costumes: computed(() => useFetchDataUser9C.dataUser9C_normal ? useFetchDataUser9C.dataUser9C_normal.listCostumes : []),
    materials: computed(() => useFetchDataUser9C.dataUser9C_normal ? useFetchDataUser9C.dataUser9C_normal.listMaterials : []),
    consumables: computed(() => useFetchDataUser9C.dataUser9C_normal ? useFetchDataUser9C.dataUser9C_normal.listConsumables : []),
  })
  const gridDataFilter = reactive({
    weapon: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'WEAPON')),
    armor: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'ARMOR')),
    belt: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'BELT')),
    neck: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'NECKLACE')),
    ring: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'RING')),
    aura: computed(() => gridData['equipment'].filter((item) => item.itemSubType === 'AURA')),
    matGrade1: computed(() => gridData['materials'].filter((item) => item.grade === 1)),
    matGrade2: computed(() => gridData['materials'].filter((item) => item.grade === 2)),
    matGrade3: computed(() => gridData['materials'].filter((item) => item.grade === 3)),
    matGrade4: computed(() => gridData['materials'].filter((item) => item.grade === 4)),
    matGrade5: computed(() => gridData['materials'].filter((item) => item.grade === 5)),
    matGrade6: computed(() => gridData['materials'].filter((item) => item.grade === 6))
  })

  // Chọn dữ liệu để hiển thị
  const page = ref(1)
  const pageSize = ref(8)

  const pageStart = computed(() => (page.value - 1) * pageSize.value)
  const pageEnd = computed(() => (page.value) * pageSize.value)
  const gridDataMini = reactive({
    equipment: computed(() => gridData.equipment.slice(pageStart.value, pageEnd.value)),
    costumes: computed(() => gridData.costumes.slice(pageStart.value, pageEnd.value)),
    materials: computed(() => gridData.materials.slice(pageStart.value, pageEnd.value)),
    consumables: computed(() => gridData.consumables.slice(pageStart.value, pageEnd.value)),
  })
  watch([page, pageSize], ([newPage, newPageSize]) => {
    if (newPage > Math.ceil(gridData.equipment.length / newPageSize)) {
      page.value = 1
    }
  })
  return {
    isShowModalChar, gridCollapsed,
    isShowModalItem, dataForViewGear,
    gridData, gridDataFilter,
    page, pageSize, pageStart, pageEnd, gridDataMini
  }
})
