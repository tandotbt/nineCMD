<template>
  <div style="padding: 16px">
    <n-space vertical>
      <!-- Header with planet indicator -->
      <n-space align="center" justify="space-between">
        <n-text strong style="font-size: 18px">CSV Data Viewer</n-text>
        <n-space align="center" size="small">
          <n-tag
            v-if="csvData.fetchPlanet"
            :bordered="false"
            :type="isCurrentPlanetCached ? 'success' : 'warning'"
            size="small"
          >
            {{ csvData.fetchPlanet }}
            <template v-if="isCurrentPlanetCached">✓ cached</template>
          </n-tag>
          <n-tag
            v-if="cachedPlanetCount > 0"
            :bordered="false"
            type="info"
            size="small"
          >
            {{ cachedPlanetCount }} planet(s) cached
          </n-tag>
        </n-space>
      </n-space>

      <!-- Planet switching loading -->
      <n-spin v-if="csvData.isPlanetSwitching" size="large" style="display: block; text-align: center; padding: 40px">
        <n-text depth="2">Switching planet data...</n-text>
      </n-spin>

      <!-- Loading (initial) -->
      <n-spin v-else-if="csvData.isLoading" size="large" style="display: block; text-align: center; padding: 40px" />

      <!-- No data -->
      <n-empty v-else-if="!csvData.isLoaded" description="CSV data not loaded yet. Reload the page to fetch." />

      <!-- Sheet selector + Table -->
      <template v-else>
        <n-space align="center" style="margin-bottom: 12px">
          <n-text>Sheet:</n-text>
          <n-select
            v-model:value="selectedSheet"
            :options="sheetOptions"
            style="width: 300px"
          />
          <n-text depth="3" style="font-size: 12px">
            {{ rowCount }} rows
          </n-text>
        </n-space>

        <n-data-table
          :columns="tableColumns"
          :data="tableData"
          :bordered="true"
          :single-line="false"
          size="small"
          striped
          :scroll-x="1200"
          :row-key="rowKeyGetter"
        />
        <!-- Pagination controls outside table -->
        <n-space align="center" justify="center" style="margin-top: 12px">
          <n-button size="small" :disabled="currentPage <= 1" @click="currentPage--">
            ← Prev
          </n-button>
          <n-text>Page {{ currentPage }} / {{ totalPages }}</n-text>
          <n-button size="small" :disabled="currentPage >= totalPages" @click="currentPage++">
            Next →
          </n-button>
          <n-select
            v-model:value="currentPageSize"
            :options="pageSizeOptions"
            size="small"
            style="width: 100px"
          />
        </n-space>
      </template>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NDataTable,
  NSpace,
  NText,
  NSelect,
  NSpin,
  NEmpty,
  NButton,
  NTag,
  type DataTableColumns
} from 'naive-ui'
import { useCsvDataStore } from '../stores/csvData'
import { ALL_CSV_SHEET_NAMES, CSV_SHEET_CONFIG } from '../utilities/constants'
import type { CsvSheetName } from '../types/csvData'

const csvData = useCsvDataStore()

/** Whether current planet data is cached */
const isCurrentPlanetCached = computed(() => {
  if (!csvData.fetchPlanet) return false
  return csvData.isPlanetCached(csvData.fetchPlanet)
})

/** Number of planets with cached data */
const cachedPlanetCount = computed(() => csvData.getCachedPlanets().length)

/** Selected sheet name */
const selectedSheet = ref<CsvSheetName>(ALL_CSV_SHEET_NAMES[0])

/** Pagination state */
const currentPage = ref(1)
const currentPageSize = ref(20)

const pageSizeOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 }
]

/** Options for sheet selector */
const sheetOptions = ALL_CSV_SHEET_NAMES.map((name) => ({
  label: `${name} (${CSV_SHEET_CONFIG[name].description || ''})`,
  value: name
}))

/** Current sheet data rows */
const allRows = computed(() => {
  const sheet = csvData.getSheet(selectedSheet.value)
  if (!sheet) return []
  return Object.values(sheet)
})

/** Row count */
const rowCount = computed(() => allRows.value.length)

/** Total pages */
const totalPages = computed(() => Math.max(1, Math.ceil(rowCount.value / currentPageSize.value)))

/** Paginated rows for display */
const tableData = computed(() => {
  const start = (currentPage.value - 1) * currentPageSize.value
  const end = start + currentPageSize.value
  return allRows.value.slice(start, end).map((row, idx) => ({ _idx: start + idx, ...row }))
})

/** Strongly-typed row-key getter matching naive-ui's `CreateRowKey` signature
 *  (`RowKey` is not re-exported from the package's main entry, so we use its
 *  structural equivalent: `string | number`.) */
const rowKeyGetter = (row: Record<string, unknown>): string | number => {
  const idx = row._idx
  return typeof idx === 'number' ? idx : String(idx ?? '')
}

/** Dynamic table columns from first row keys */
const tableColumns = computed<DataTableColumns>(() => {
  if (allRows.value.length === 0) return []
  const firstRow = allRows.value[0]
  return Object.keys(firstRow).map((key) => ({
    title: key,
    key,
    minWidth: 80,
    ellipsis: { tooltip: true },
    sorter: (rowA: Record<string, unknown>, rowB: Record<string, unknown>) => {
      const a = rowA[key]
      const b = rowB[key]
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b))
    }
  }))
})

/** Reset to page 1 when sheet or pageSize changes */
watch(selectedSheet, () => { currentPage.value = 1 })
watch(currentPageSize, () => { currentPage.value = 1 })

/** Reset to page 1 when planet changes (data refreshes) */
watch(() => csvData.fetchPlanet, () => { currentPage.value = 1 })
</script>
