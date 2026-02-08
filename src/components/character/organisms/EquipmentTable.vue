<template>
  <div class="equipment-table-container">
    <n-data-table
      size="small"
      :columns="columns"
      :data="sortedData"
      :pagination="{ pageSize: 10 }"
      :row-class-name="getRowClass"
      scroll-x="800"
    />
  </div>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { NDataTable, NTag, NText } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Equipment, Costume } from '@/types/character'
import { mapEquipmentToDisplayData, sortItems } from '@/logic/character'
import ItemIcon from '../atoms/ItemIcon.vue'
import ItemNameDisplay from '../molecules/ItemNameDisplay.vue'
import ElementIcon from '../atoms/ElementIcon.vue'
import { useI18n } from 'vue-i18n'
import { useCsvDataStore } from '@/stores/useCsvDataStore'

const props = defineProps<{
  data: (Equipment | Costume)[]
}>()

const { locale } = useI18n()
const csvStore = useCsvDataStore()

const sortedData = computed(() => {
  const equipment = props.data.filter(
    (i) => i.itemType.toUpperCase() === 'EQUIPMENT',
  ) as Equipment[]
  const costumes = props.data.filter((i) => i.itemType.toUpperCase() === 'COSTUME') as Costume[]

  return [...sortItems(equipment, 'equipment'), ...sortItems(costumes, 'costume')]
})

const mapToDisplayData = (row: Equipment | Costume) => {
  return mapEquipmentToDisplayData(row, csvStore.allSheets, locale.value)
}

const getRowClass = (row: Equipment | Costume) => {
  return row.equipped ? 'equipped-row' : ''
}

const columns: DataTableColumns<Equipment | Costume> = [
  {
    title: 'Item',
    key: 'icon',
    width: 80,
    align: 'center',
    fixed: 'left',
    render: (row) =>
      h('div', { class: 'relative' }, [
        h(ItemIcon, {
          item: mapToDisplayData(row),
          size: 56,
        }),
      ]),
  },
  {
    title: 'Information',
    key: 'name',
    minWidth: 180,
    render: (row) => {
      const item = mapToDisplayData(row)
      return h('div', { class: 'flex items-center gap-2' }, [
        item.elementalType && item.elementalType !== 'NORMAL'
          ? h(ElementIcon, { elementalType: item.elementalType, size: 20 })
          : null,
        h(ItemNameDisplay, {
          item: item,
        }),
      ])
    },
  },
  {
    title: 'CP',
    key: 'CP',
    width: 100,
    sorter: (a, b) => (a.CP || 0) - (b.CP || 0),
    render: (row) =>
      h(
        NText,
        {
          type: 'warning',
          strong: true,
          style: 'font-family: Kanit, sans-serif; font-size: 16px;',
        },
        { default: () => (row.CP || 0).toLocaleString() },
      ),
  },
  {
    title: 'ATK',
    key: 'atk',
    width: 80,
    align: 'right',
    render: (row) => {
      const val = row.statsMap?.aTK
      const total =
        typeof val === 'number' ? val : (val?.baseValue || 0) + (val?.additionalValue || 0)
      return total > 0 ? h(NText, { depth: 2 }, { default: () => total.toLocaleString() }) : '-'
    },
  },
  {
    title: 'DEF',
    key: 'def',
    width: 80,
    align: 'right',
    render: (row) => {
      const val = row.statsMap?.dEF
      const total =
        typeof val === 'number' ? val : (val?.baseValue || 0) + (val?.additionalValue || 0)
      return total > 0 ? h(NText, { depth: 2 }, { default: () => total.toLocaleString() }) : '-'
    },
  },
  {
    title: 'HP',
    key: 'hp',
    width: 90,
    align: 'right',
    render: (row) => {
      const val = row.statsMap?.hP
      const total =
        typeof val === 'number' ? val : (val?.baseValue || 0) + (val?.additionalValue || 0)
      return total > 0 ? h(NText, { depth: 2 }, { default: () => total.toLocaleString() }) : '-'
    },
  },
  {
    title: 'CRI',
    key: 'cri',
    width: 70,
    align: 'right',
    render: (row) => {
      const val = row.statsMap?.cRI
      const total =
        typeof val === 'number' ? val : (val?.baseValue || 0) + (val?.additionalValue || 0)
      return total > 0 ? h(NText, { depth: 3 }, { default: () => total.toLocaleString() }) : '-'
    },
  },
  {
    title: 'SPD',
    key: 'spd',
    width: 70,
    align: 'right',
    render: (row) => {
      const val = row.statsMap?.sPD
      const total =
        typeof val === 'number' ? val : (val?.baseValue || 0) + (val?.additionalValue || 0)
      return total > 0 ? h(NText, { depth: 3 }, { default: () => total.toLocaleString() }) : '-'
    },
  },
  {
    title: 'Status',
    key: 'equipped',
    width: 100,
    align: 'center',
    render: (row) =>
      row.equipped
        ? h(
            NTag,
            {
              size: 'small',
              type: 'success',
              round: true,
              bordered: false,
              style: 'font-weight: bold',
            },
            { default: () => 'Equipped' },
          )
        : h(
            NTag,
            { size: 'small', type: 'info', round: true, bordered: false },
            { default: () => 'Bag' },
          ),
  },
]
</script>

<style scoped>
.equipment-table-container :deep(.equipped-row) {
  background-color: rgba(24, 160, 88, 0.05);
}

.equipment-table-container :deep(.n-data-table-td) {
  padding: 8px !important;
}
</style>
