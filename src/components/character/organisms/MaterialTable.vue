<template>
  <n-space vertical :size="12">
    <n-input
      v-model:value="search"
      :placeholder="t('avatar.search_materials')"
      clearable
      size="small"
    >
      <template #prefix>
        <n-icon><SearchIcon /></n-icon>
      </template>
    </n-input>
    <n-data-table
      size="small"
      :columns="columns"
      :data="filteredData"
      :pagination="{ pageSize: 10 }"
      :max-height="550"
      scroll-x="800"
    />
  </n-space>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NDataTable, NTag, NSpace, NInput, NIcon, NText } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Material } from '@/types/character'
import { mapMaterialToDisplayData, sortItems } from '@/logic/character'
import ItemIcon from '../atoms/ItemIcon.vue'
import ItemNameDisplay from '../molecules/ItemNameDisplay.vue'
import { useI18n } from 'vue-i18n'
import { resolveNameFromCsv } from '@/logic/mapping'
import { useCsvDataStore } from '@/stores/useCsvDataStore'
import { SearchOutline as SearchIcon } from '@vicons/ionicons5'

const props = defineProps<{
  data: Material[]
}>()

const { t, locale } = useI18n()
const csvStore = useCsvDataStore()
const search = ref('')

const getItemName = (id: number | string) => {
  return resolveNameFromCsv(id, csvStore.allSheets, locale.value)
}

const mapToDisplayData = (row: Material) => {
  return mapMaterialToDisplayData(row, csvStore.allSheets, locale.value)
}

const filteredData = computed(() => {
  const sorted = sortItems(props.data, 'material')
  if (!search.value) return sorted
  const s = search.value.toLowerCase()
  return sorted.filter(
    (m) =>
      getItemName(m.id).toLowerCase().includes(s) ||
      String(m.id).includes(s) ||
      m.itemSubType?.toLowerCase().includes(s),
  )
})

const columns: DataTableColumns<Material> = [
  {
    title: 'Icon',
    key: 'icon',
    width: 80,
    align: 'center',
    fixed: 'left',
    render: (row) =>
      h(ItemIcon, {
        item: mapToDisplayData(row),
        size: 52,
      }),
  },
  {
    title: () => t('avatar.name'),
    key: 'name',
    minWidth: 180,
    render: (row) =>
      h(ItemNameDisplay, {
        item: mapToDisplayData(row),
        showId: true,
      }),
  },
  {
    title: 'Grade',
    key: 'grade',
    width: 80,
    align: 'center',
    sorter: (a, b) => Number(a.grade || 1) - Number(b.grade || 1),
    render: (row) =>
      h(
        NTag,
        {
          size: 'small',
          bordered: false,
          color: { textColor: '#fff', color: 'rgba(255,255,255,0.1)' },
          style: `border-left: 4px solid ${mapToDisplayData(row).gradeColor}`,
        },
        { default: () => `G${row.grade || 1}` },
      ),
  },
  {
    title: () => t('avatar.type'),
    key: 'itemSubType',
    width: 100,
    render: (row) =>
      row.itemSubType
        ? h(
            NTag,
            { size: 'tiny', bordered: false, type: 'info', round: true },
            { default: () => row.itemSubType },
          )
        : '-',
  },
  {
    title: () => t('avatar.count'),
    key: 'count',
    align: 'right',
    width: 100,
    sorter: (a, b) => a.count - b.count,
    render: (row) =>
      h(
        NText,
        { strong: true, style: 'font-family: Kanit, sans-serif; font-size: 15px' },
        { default: () => row.count.toLocaleString() },
      ),
  },
  {
    title: () => t('avatar.tradable'),
    key: 'tradableCount',
    align: 'right',
    width: 100,
    sorter: (a, b) => (a.tradableCount || 0) - (b.tradableCount || 0),
    render: (row) =>
      h(
        NText,
        { depth: 3, style: 'font-family: monospace' },
        { default: () => row.tradableCount?.toLocaleString() || '0' },
      ),
  },
  {
    title: () => t('avatar.req_block'),
    key: 'requiredBlockIndex',
    width: 110,
    align: 'center',
    render: (row) =>
      row.requiredBlockIndex
        ? h(NText, { code: true }, { default: () => row.requiredBlockIndex })
        : '-',
  },
]
</script>
