<template>
  <n-card :title="t('avatarData.material.title')" size="small">
    <n-tabs type="line" animated>
      <!-- Materials -->
      <n-tab-pane name="materials" :tab="t('avatarData.material.materials')">
        <n-data-table
          :columns="materialColumns"
          :data="materialPagedData"
          size="small"
          striped
          :row-key="(row: { id: number; count: number }) => row.id"
        />
        <n-pagination
          v-if="store.materialsAll.length > materialPageSize"
          v-model:page="materialPage"
          v-model:page-size="materialPageSize"
          :item-count="store.materialsAll.length"
          :page-sizes="[20, 50, 100]"
          show-size-picker
          style="margin-top: 8px"
        />
      </n-tab-pane>

      <!-- Consumables -->
      <n-tab-pane name="consumables" :tab="t('avatarData.material.consumables')">
        <n-data-table
          :columns="consumableColumns"
          :data="consumablePagedData"
          size="small"
          striped
          :row-key="(row: { id: number; count: number; itemIdList: number[] }) => row.id"
        />
        <n-pagination
          v-if="store.consumablesAll.length > consumablePageSize"
          v-model:page="consumablePage"
          v-model:page-size="consumablePageSize"
          :item-count="store.consumablesAll.length"
          :page-sizes="[20, 50, 100]"
          show-size-picker
          style="margin-top: 8px"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NTabs, NTabPane, NDataTable, NPagination, type DataTableColumns } from 'naive-ui'
import { useAvatarDataDisplayStore } from '../../stores/avatarDataDisplay'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()

// ============================================================
// Pagination state — each tab has its own state
// ============================================================
const materialPage = ref(1)
const materialPageSize = ref(20)
const consumablePage = ref(1)
const consumablePageSize = ref(20)

const materialPagedData = computed(() => {
  const start = (materialPage.value - 1) * materialPageSize.value
  return store.materialsAll.slice(start, start + materialPageSize.value)
})

const consumablePagedData = computed(() => {
  const start = (consumablePage.value - 1) * consumablePageSize.value
  return store.consumablesAll.slice(start, start + consumablePageSize.value)
})

// ============================================================
// Columns
// ============================================================
const materialColumns = ref<DataTableColumns<{ id: number; count: number }>>([
  { title: 'ID', key: 'id' },
  { title: t('avatarData.material.count'), key: 'count' }
])

const consumableColumns = ref<DataTableColumns<{ id: number; count: number; itemIdList: number[] }>>([
  { title: 'ID', key: 'id' },
  { title: t('avatarData.material.count'), key: 'count' }
])
</script>
