<script setup lang="ts">
/**
 * @file components/csv/CsvDataTable.vue
 * @description Data table component to display parsed CSV data using Naive UI.
 */

import { h, computed, reactive, ref, watch } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import type { CsvRow, CsvSheetData } from '@/types/csv'
import { Search24Regular as SearchIcon } from '@vicons/fluent'

interface Props {
  sheetData: CsvSheetData
}

const props = defineProps<Props>()

const searchText = ref('')

/**
 * Filter rows based on search text
 */
const filteredRows = computed(() => {
  if (!searchText.value) return props.sheetData.rows
  const search = searchText.value.toLowerCase()
  return props.sheetData.rows.filter((row) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(search)),
  )
})

/**
 * Generate columns based on CSV headers
 */
const columns = computed<DataTableColumns<CsvRow>>(() => {
  if (!props.sheetData.headers || props.sheetData.headers.length === 0) return []

  return props.sheetData.headers.map((header, index) => ({
    title: header,
    key: header,
    sorter: 'default',
    fixed: index === 0 ? 'left' : undefined,
    width: 200,
    minWidth: 150,
    ellipsis: {
      tooltip: true,
    },
    render(row: CsvRow) {
      const val = row[header]
      if (val === null || val === undefined) {
        return h('span', { style: 'color: #bbb' }, '-')
      }
      if (typeof val === 'boolean') {
        return h(
          'span',
          { style: `color: ${val ? '#18a058' : '#d03050'}; font-weight: bold` },
          String(val).toUpperCase(),
        )
      }
      return h('span', String(val))
    },
  }))
})

const pagination = reactive({
  page: 1,
  pageSize: 15,
  showSizePicker: true,
  pageSizes: [15, 30, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

// Reset page when data changes
watch(
  () => props.sheetData.name,
  () => {
    pagination.page = 1
    searchText.value = ''
  },
)
</script>

<template>
  <div class="csv-data-table">
    <n-card :title="sheetData.name" size="small">
      <template #header-extra>
        <n-tag type="info" size="small"> {{ sheetData.rows.length }} rows </n-tag>
      </template>

      <n-space vertical>
        <n-input v-model:value="searchText" placeholder="Search in all columns..." clearable>
          <template #prefix>
            <n-icon>
              <search-icon />
            </n-icon>
          </template>
        </n-input>

        <n-data-table
          ref="table"
          :columns="columns"
          :data="filteredRows"
          :pagination="pagination"
          :max-height="650"
          :scroll-x="columns.length * 200"
          size="small"
          :virtual-scroll="filteredRows.length > 500"
        />
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.csv-data-table {
  width: 100%;
}
</style>
