<script setup lang="ts">
/**
 * @file views/CsvDataView.vue
 * @description View for exploring CSV data fetched from 9capi.
 */

import { useCsvDataStore } from '@/stores/useCsvDataStore'
import CsvDataTable from '@/components/csv/CsvDataTable.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const csvStore = useCsvDataStore()

const selectedSheet = ref<string | null>(null)

const sheetOptions = computed(() => {
  return Object.keys(csvStore.allSheets).map((name) => ({
    label: name,
    value: name,
  }))
})

const currentSheetData = computed(() => {
  const sheetName = selectedSheet.value
  return sheetName ? csvStore.allSheets[sheetName] : null
})

onMounted(() => {
  if (Object.keys(csvStore.allSheets).length === 0) {
    csvStore.fetchCsvData(false)
  }
})

watch(sheetOptions, (newOptions) => {
  if (newOptions && newOptions.length > 0 && !selectedSheet.value) {
    const firstOption = newOptions[0]
    if (firstOption) {
      selectedSheet.value = firstOption.value
    }
  }
})
</script>

<template>
  <div class="csv-data-view p-4">
    <n-space vertical size="large">
      <n-card :title="t('csv_explorer_title', 'CSV Data Explorer')">
        <template #header-extra>
          <n-button
            type="primary"
            :loading="csvStore.isLoading"
            @click="() => csvStore.fetchCsvData(true)"
          >
            {{ t('csv_refresh_button', 'Refresh Data') }}
          </n-button>
        </template>

        <n-alert v-if="csvStore.error" type="error" class="mb-4">
          {{ csvStore.error }}
        </n-alert>

        <n-space align="center">
          <span>{{ t('csv_select_sheet', 'Select Sheet:') }}</span>
          <n-select
            v-model:value="selectedSheet"
            :options="sheetOptions"
            style="width: 300px"
            :placeholder="t('csv_select_placeholder', 'Select a sheet to view')"
          />
        </n-space>
      </n-card>

      <div v-if="csvStore.isLoading" class="flex justify-center p-12">
        <n-spin size="large" />
      </div>

      <div v-else-if="currentSheetData">
        <CsvDataTable :sheet-data="currentSheetData" />
      </div>

      <n-empty
        v-else
        :description="t('csv_no_data', 'No data available. Please fetch data first.')"
      />
    </n-space>
  </div>
</template>

<style scoped>
.csv-data-view {
  max-width: 1600px;
  margin: 0 auto;
}
</style>
