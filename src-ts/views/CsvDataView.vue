<template>
  <div style="padding: 16px">
    <n-space vertical>
      <!-- Header with planet indicator -->
      <n-space align="center" justify="space-between">
        <n-text strong style="font-size: 18px">{{ t('csvData.title') }}</n-text>
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
        <!-- Pagination controls (n-pagination của naive-ui) -->
        <n-pagination
          v-model:page="mainCurrentPage"
          v-model:page-size="mainCurrentPageSize"
          :item-count="rowCount"
          :page-sizes="pageSizeOptions.map((o) => o.value)"
          show-size-picker
          style="margin-top: 12px; justify-content: flex-end"
        />
      </template>

      <!-- ====== BANNER SECTION (từ Event.json) ====== -->
      <n-card :title="t('csvData.bannerCardTitle')" size="small" style="margin-top: 16px">
        <n-space align="center" size="small" style="margin-bottom: 8px">
          <n-tag v-if="bannerStore.lastFetchTime" :bordered="false" type="info" size="small">
            {{ t('banner.lastFetched') }} {{ formatBannerTime(bannerStore.lastFetchTime) }}
          </n-tag>
          <n-button size="tiny" :loading="bannerStore.isLoading" @click="bannerStore.retry()">
            {{ t('banner.reload') }}
          </n-button>
        </n-space>
        <n-spin v-if="bannerStore.isLoading && !bannerStore.isLoaded">
          <n-text depth="3">{{ t('banner.loading') }}</n-text>
        </n-spin>
        <n-alert v-else-if="bannerStore.error" type="error" :title="t('csvData.bannerError')">
          {{ bannerStore.error }}
        </n-alert>
        <n-empty v-else-if="!bannerStore.hasBanners" :description="t('banner.empty')" />
        <n-grid v-else :cols="3" :x-gap="12" :y-gap="12">
          <n-grid-item v-for="b in bannerStore.banners" :key="b.BannerImageName">
            <n-card hoverable size="small">
              <template #cover>
                <img :src="b.BannerImageUrl" :alt="b.BannerImageName" style="width: 100%; height: 120px; object-fit: cover" />
              </template>
              <n-text depth="3" style="font-size: 11px">
                {{ b.BannerImageName }}
              </n-text>
              <br />
              <n-text depth="3" style="font-size: 10px; opacity: 0.7">
                {{ b.BeginDateTime || '∞' }} → {{ b.EndDateTime || '∞' }}
              </n-text>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>

      <!-- ====== GLOBAL CSV SECTION (i18n + RemoteCsv - dùng chung 1 table) ====== -->
      <n-card :title="t('csvData.globalCardTitle')" size="small" style="margin-top: 16px">
        <n-space align="center" size="small" style="margin-bottom: 8px" wrap>
          <n-text>{{ t('csvData.source') }}:</n-text>
          <n-select
            v-model:value="globalSource"
            :options="globalSourceOptions"
            size="small"
            style="width: 220px"
          />
          <n-tag :bordered="false" type="success" size="small">
            {{ t('csvData.locale') }}: {{ globalCsvStore.localeColumn }}
          </n-tag>
          <n-tag v-if="globalSourceRowCount > 0" :bordered="false" type="warning" size="small">
            {{ globalSourceRowCount }} {{ t('csvData.rows') }}
          </n-tag>
          <n-tag v-if="currentGlobalSourceError" :bordered="false" type="error" size="small">
            {{ t('csvData.loadFailed') }}
          </n-tag>
        </n-space>

        <n-spin v-if="globalCsvStore.isLoading && !globalCsvStore.isLoaded">
          <n-text depth="3">{{ t('csvData.loading') }}</n-text>
        </n-spin>
        <n-alert v-else-if="globalCsvStore.error" type="error" :title="t('csvData.error')">
          {{ globalCsvStore.error }}
        </n-alert>
        <n-empty v-else-if="!globalCsvStore.isLoaded" :description="t('csvData.notLoaded')" />

        <template v-else-if="globalSourceRowCount > 0">
          <n-data-table
            :columns="globalSourceColumns"
            :data="globalSourcePagedRows"
            :bordered="true"
            size="small"
            striped
            :max-height="320"
            :scroll-x="800"
            :row-key="globalRowKeyGetter"
          />
          <n-pagination
            v-model:page="globalCurrentPage"
            v-model:page-size="globalCurrentPageSize"
            :item-count="globalSourceRowCount"
            :page-sizes="pageSizeOptions.map((o) => o.value)"
            show-size-picker
            style="margin-top: 12px; justify-content: flex-end"
          />
        </template>
        <n-empty v-else :description="`${t('csvData.noDataFor')} ${globalSource}`" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NDataTable,
  NSpace,
  NText,
  NSelect,
  NSpin,
  NEmpty,
  NButton,
  NTag,
  NCard,
  NAlert,
  NGrid,
  NGridItem,
  NPagination,
  type DataTableColumns
} from 'naive-ui'
import { useCsvDataStore } from '../stores/csvData'
import { useGlobalCsvStore } from '../stores/globalCsv'
import { useBannerStore } from '../stores/banner'
import { ALL_CSV_SHEET_NAMES, CSV_SHEET_CONFIG } from '../utilities/constants'
import type { CsvSheetName } from '../types/csvData'

const { t } = useI18n()

const csvData = useCsvDataStore()
const globalCsvStore = useGlobalCsvStore()
const bannerStore = useBannerStore()

/** Format timestamp → HH:MM:SS */
function formatBannerTime(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// Auto-load khi mount (best-effort, không block UI nếu fail)
onMounted(() => {
  if (!bannerStore.isLoaded && !bannerStore.isLoading) {
    bannerStore.loadBanners()
  }
  if (!globalCsvStore.isLoaded && !globalCsvStore.isLoading) {
    globalCsvStore.loadAll()
  }
})

// ============================================================
// Global CSV Section (ItemName + SkillName + RemoteCsv - dùng chung 1 table)
// ============================================================

/** 3 nguồn global CSV: ItemName (i18n tên vật phẩm), SkillName (i18n tên skill), RemoteCsv (config từ xa) */
type GlobalSource = 'ItemNameSheet' | 'SkillNameSheet' | 'RemoteCsv'

/** Selected source trong Global CSV section */
const globalSource = ref<GlobalSource>('ItemNameSheet')

/** Options cho global source selector - i18n */
const globalSourceOptions = computed(() => [
  { label: t('csvData.options.itemName'), value: 'ItemNameSheet' as const },
  { label: t('csvData.options.skillName'), value: 'SkillNameSheet' as const },
  { label: t('csvData.options.remoteCsv'), value: 'RemoteCsv' as const }
])

/** Tất cả rows cho source hiện tại (không slice – pagination lo phần hiển thị) */
const globalSourceAllRows = computed<Record<string, unknown>[]>(() => {
  let sheet: Record<string | number, unknown> = {}
  if (globalSource.value === 'ItemNameSheet') {
    sheet = globalCsvStore.itemNameSheet as Record<string | number, unknown>
  } else if (globalSource.value === 'SkillNameSheet') {
    sheet = globalCsvStore.skillNameSheet as Record<string | number, unknown>
  } else {
    sheet = globalCsvStore.remoteCsv as Record<string | number, unknown>
  }
  if (!sheet) return []
  return Object.values(sheet) as Record<string, unknown>[]
})

/** Row count cho source hiện tại (full, không slice) */
const globalSourceRowCount = computed<number>(() => {
  if (globalSource.value === 'ItemNameSheet') return globalCsvStore.itemNameCount
  if (globalSource.value === 'SkillNameSheet') return globalCsvStore.skillNameCount
  return globalCsvStore.remoteCsvCount
})

/** Error message cho source hiện tại (nếu có) */
const currentGlobalSourceError = computed<string | null>(() => {
  if (globalSource.value === 'RemoteCsv') {
    return globalCsvStore.sourceErrors.remote
  }
  // ItemName + SkillName share the same fetch (localized) → 1 error covers both
  return globalCsvStore.sourceErrors.localized
})

/** Paged rows cho table (slice từ all rows) */
const globalSourcePagedRows = computed(() => {
  const start = (globalCurrentPage.value - 1) * globalCurrentPageSize.value
  const end = start + globalCurrentPageSize.value
  return globalSourceAllRows.value.slice(start, end).map((row, idx) => ({
    _idx: start + idx,
    ...row
  }))
})

/** Columns cho table (dynamic từ first row keys) */
const globalSourceColumns = computed<DataTableColumns>(() => {
  if (globalSourceAllRows.value.length === 0) return []
  const first = globalSourceAllRows.value[0]
  return Object.keys(first).map((key) => ({
    title: key,
    key,
    minWidth: 100,
    ellipsis: { tooltip: true },
    sorter: (rowA: Record<string, unknown>, rowB: Record<string, unknown>) => {
      const a = rowA[key]
      const b = rowB[key]
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b))
    }
  }))
})

/** Whether current planet data is cached */
const isCurrentPlanetCached = computed(() => {
  if (!csvData.fetchPlanet) return false
  return csvData.isPlanetCached(csvData.fetchPlanet)
})

/** Number of planets with cached data */
const cachedPlanetCount = computed(() => csvData.getCachedPlanets().length)

/** Selected sheet name */
const selectedSheet = ref<CsvSheetName>(ALL_CSV_SHEET_NAMES[0])

/** Pagination state - main CSV table */
const mainCurrentPage = ref(1)
const mainCurrentPageSize = ref(20)

/** Pagination state - global CSV table (tách riêng để không ảnh hưởng nhau) */
const globalCurrentPage = ref(1)
const globalCurrentPageSize = ref(20)

const pageSizeOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 }
]

/** Options for sheet selector */
const sheetOptions = ALL_CSV_SHEET_NAMES.map((name: CsvSheetName) => ({
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

/** Paginated rows for display */
const tableData = computed(() => {
  const start = (mainCurrentPage.value - 1) * mainCurrentPageSize.value
  const end = start + mainCurrentPageSize.value
  return allRows.value.slice(start, end).map((row, idx) => ({ _idx: start + idx, ...row }))
})

/** Strongly-typed row-key getter matching naive-ui's `CreateRowKey` signature
 *  (`RowKey` is not re-exported from the package's main entry, so we use its
 *  structural equivalent: `string | number`.)
 *  Tách thành named function (không inline arrow) để tránh IDE warning
 *  "Filters are deprecated" do Volar cache cũ cho CreateRowKey inline. */
const rowKeyGetter = (row: Record<string, unknown>): string | number => {
  const idx = row._idx
  return typeof idx === 'number' ? idx : String(idx ?? '')
}

/** Row-key getter cho Global CSV table (cùng signature với rowKeyGetter) */
const globalRowKeyGetter = (row: Record<string, unknown>): string | number => {
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

/** Reset to page 1 when sheet or pageSize changes (main CSV table) */
watch(selectedSheet, () => { mainCurrentPage.value = 1 })
watch(mainCurrentPageSize, () => { mainCurrentPage.value = 1 })

/** Reset to page 1 when global source changes (global CSV table) */
watch(globalSource, () => { globalCurrentPage.value = 1 })
watch(globalCurrentPageSize, () => { globalCurrentPage.value = 1 })

/** Reset to page 1 when planet changes (data refreshes) */
watch(() => csvData.fetchPlanet, () => { mainCurrentPage.value = 1 })
/** Reset to page 1 when Global CSV data reloads (reset GLOBAL table, không phải main) */
watch(() => globalCsvStore.isLoaded, () => { globalCurrentPage.value = 1 })
</script>
