<template>
  <n-card :title="t('avatarData.inventory.title')" size="small">
    <n-tabs type="line" animated>
      <!-- Equipments -->
      <n-tab-pane name="equipments" :tab="t('avatarData.inventory.equipments')">
        <n-data-table
          :columns="equipColumns"
          :data="equipPagedData"
          size="small"
          striped
          :scroll-x="1200"
          :row-key="(row: EnrichedEquipment) => row.id + '_' + row.indexKey"
        />
        <n-pagination
          v-if="store.equipmentsAll.length > equipPageSize"
          v-model:page="equipPage"
          v-model:page-size="equipPageSize"
          :item-count="store.equipmentsAll.length"
          :page-sizes="[20, 50, 100]"
          show-size-picker
          style="margin-top: 8px"
        />
      </n-tab-pane>

      <!-- Costumes -->
      <n-tab-pane name="costumes" :tab="t('avatarData.inventory.costumes')">
        <n-data-table
          :columns="costumeColumns"
          :data="costumePagedData"
          size="small"
          striped
          :scroll-x="800"
          :row-key="(row: EnrichedCostume) => row.id + '_' + row.indexKey"
        />
        <n-pagination
          v-if="store.costumesAll.length > costumePageSize"
          v-model:page="costumePage"
          v-model:page-size="costumePageSize"
          :item-count="store.costumesAll.length"
          :page-sizes="[20, 50, 100]"
          show-size-picker
          style="margin-top: 8px"
        />
      </n-tab-pane>

      <!-- Runes -->
      <n-tab-pane name="runes" :tab="t('avatarData.inventory.runes')">
        <n-data-table
          :columns="runeColumns"
          :data="store.runesAll"
          size="small"
          striped
          :row-key="(row: RuneEntry) => row.runeId"
        />
      </n-tab-pane>

      <!-- Combination Slots -->
      <n-tab-pane name="slots" :tab="t('avatarData.inventory.combinationSlots')">
        <n-data-table
          :columns="slotColumns"
          :data="store.combinationSlots"
          size="small"
          striped
          :row-key="(row: CombinationSlot) => row.index"
        />
      </n-tab-pane>

      <!-- Equipped Summary -->
      <n-tab-pane name="equipped" :tab="t('avatarData.inventory.equipped')">
        <n-data-table
          :columns="equippedColumns"
          :data="store.equippedSlots"
          size="small"
          striped
          :row-key="(row: { itemSubType: string; id: number }) => row.itemSubType"
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
import type { EnrichedEquipment, EnrichedCostume, RuneEntry, CombinationSlot } from '../../types/avatarData'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()

// ============================================================
// Pagination state — each tab has its own state
// ============================================================
const equipPage = ref(1)
const equipPageSize = ref(20)
const costumePage = ref(1)
const costumePageSize = ref(20)

const equipPagedData = computed(() => {
  const start = (equipPage.value - 1) * equipPageSize.value
  return store.equipmentsAll.slice(start, start + equipPageSize.value)
})

const costumePagedData = computed(() => {
  const start = (costumePage.value - 1) * costumePageSize.value
  return store.costumesAll.slice(start, start + costumePageSize.value)
})

// Reset page when data changes
function resetEquipPage(): void { equipPage.value = 1 }
function resetCostumePage(): void { costumePage.value = 1 }

// Watch for data reset (store.fetchAvatarData called)
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
store.equipmentsAll.length === 0 ? resetEquipPage() : undefined
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
store.costumesAll.length === 0 ? resetCostumePage() : undefined

// ============================================================
// Equipment Columns
// ============================================================
const equipColumns = ref<DataTableColumns<EnrichedEquipment>>([
  { title: t('avatarData.inventory.name'), key: 'name', width: 150, ellipsis: { tooltip: true } },
  { title: t('avatarData.inventory.id'), key: 'id', width: 100 },
  { title: t('avatarData.inventory.grade'), key: 'grade', width: 70 },
  { title: t('avatarData.inventory.level'), key: 'level', width: 70 },
  { title: t('avatarData.inventory.subType'), key: 'itemSubType', width: 100 },
  { title: t('avatarData.inventory.elemental'), key: 'elementalType', width: 90 },
  { title: t('avatarData.inventory.cp'), key: 'cp', width: 80 },
  { title: t('avatarData.inventory.levelReq'), key: 'levelReq', width: 90 }
])

// ============================================================
// Costume Columns
// ============================================================
const costumeColumns = ref<DataTableColumns<EnrichedCostume>>([
  { title: t('avatarData.inventory.name'), key: 'name', width: 150, ellipsis: { tooltip: true } },
  { title: t('avatarData.inventory.id'), key: 'id', width: 100 },
  { title: t('avatarData.inventory.grade'), key: 'grade', width: 70 },
  { title: t('avatarData.inventory.subType'), key: 'itemSubType', width: 100 },
  { title: t('avatarData.inventory.elemental'), key: 'elementalType', width: 90 },
  { title: t('avatarData.inventory.cp'), key: 'cp', width: 80 },
  { title: t('avatarData.inventory.levelReq'), key: 'levelReq', width: 90 }
])

// ============================================================
// Rune Columns
// ============================================================
const runeColumns = ref<DataTableColumns<RuneEntry>>([
  { title: t('avatarData.inventory.runeId'), key: 'runeId' },
  { title: t('avatarData.inventory.level'), key: 'level' }
])

// ============================================================
// Combination Slot Columns
// ============================================================
const slotColumns = ref<DataTableColumns<CombinationSlot>>([
  { title: t('avatarData.inventory.index'), key: 'index' },
  { title: t('avatarData.inventory.petId'), key: 'petId' },
  { title: t('avatarData.inventory.isUnlocked'), key: 'isUnlocked' },
  { title: t('avatarData.inventory.startBlock'), key: 'startBlockIndex' },
  { title: t('avatarData.inventory.unlockBlock'), key: 'unlockBlockIndex' }
])

// ============================================================
// Equipped Summary Columns
// ============================================================
const equippedColumns = ref<DataTableColumns<{ itemSubType: string; id: number }>>([
  { title: t('avatarData.inventory.subType'), key: 'itemSubType' },
  { title: t('avatarData.inventory.id'), key: 'id' }
])
</script>
