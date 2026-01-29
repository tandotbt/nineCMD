<template>
  <div class="avatar-detail-page">
    <div v-if="characterStore.isFetching && !characterStore.info" class="loading-state">
      <n-spin size="large" description="Fetching avatar details..." />
    </div>

    <template v-else-if="characterStore.info">
      <!-- Simple Header -->
      <n-page-header @back="$router.back()" style="margin-bottom: 16px">
        <template #title>
          {{ characterStore.info.name }} (Lv.{{ characterStore.info.level }})
        </template>
        <template #extra>
          <n-button
            size="small"
            type="primary"
            @click="handleRefresh"
            :loading="characterStore.isFetching"
          >
            Refresh
          </n-button>
        </template>
      </n-page-header>

      <!-- All Stats in Descriptions -->
      <n-card size="small" bordered style="margin-bottom: 16px" title="Avatar Summary">
        <n-descriptions label-placement="left" :column="3" bordered size="small">
          <n-descriptions-item label="Address">
            <code style="font-size: 10px">{{ characterStore.info.address }}</code>
          </n-descriptions-item>
          <n-descriptions-item label="NCG">
            {{ characterStore.info.ncg.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="Crystal">
            {{ characterStore.info.crystal.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="AP">
            {{ characterStore.info.ap }} /
            {{ characterStore.info.maxAp }}
          </n-descriptions-item>
          <n-descriptions-item label="AP Cost">
            {{ characterStore.info.apCost }} AP/run
          </n-descriptions-item>
          <n-descriptions-item label="CP">
            {{ characterStore.info.cp.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="Adv CP">
            {{ characterStore.info.adventureCp.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="Stage">
            W{{ characterStore.info.worldId }} -
            {{ characterStore.info.stage }}
          </n-descriptions-item>
          <n-descriptions-item label="Daily Index">
            #{{ characterStore.info.dailyRewardReceivedIndex }}
          </n-descriptions-item>
          <n-descriptions-item label="Daily Block">
            {{ characterStore.info.dailyRewardReceivedBlockIndex }}
          </n-descriptions-item>
          <n-descriptions-item label="Staked NCG">
            {{ characterStore.info.stakeNCG.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="Rank"> #{{ characterStore.info.rank }} </n-descriptions-item>
          <n-descriptions-item label="isHasCraftOneTime">
            <n-tag
              :type="characterStore.info.isHasCraftOneTime ? 'success' : 'default'"
              size="tiny"
            >
              {{ characterStore.info.isHasCraftOneTime ? 'YES' : 'NO' }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- Data Tables -->
      <n-tabs type="line" animated>
        <n-tab-pane name="equipments" tab="Equipments">
          <n-data-table
            size="small"
            :columns="itemColumns"
            :data="characterStore.info.inventory.equipments"
            :pagination="{ pageSize: 10 }"
          />
        </n-tab-pane>
        <n-tab-pane name="costumes" tab="Costumes">
          <n-data-table
            size="small"
            :columns="itemColumns"
            :data="characterStore.info.inventory.costumes"
            :pagination="{ pageSize: 10 }"
          />
        </n-tab-pane>
        <n-tab-pane name="materials" :tab="t('avatar.materials')">
          <n-space vertical :size="12">
            <n-input
              v-model:value="materialSearch"
              :placeholder="t('avatar.search_materials')"
              clearable
              size="small"
            />
            <n-data-table
              size="small"
              :columns="materialColumns"
              :data="filteredMaterials"
              :pagination="{ pageSize: 10 }"
              :max-height="500"
            />
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="rune_slots" tab="Equipped Runes">
          <n-data-table
            size="small"
            :columns="runeSlotColumns"
            :data="characterStore.info.runeSlots"
          />
        </n-tab-pane>
        <n-tab-pane name="runes" tab="Learned Runes">
          <n-data-table
            size="small"
            :columns="learnedRuneColumns"
            :data="characterStore.info.runes"
            :pagination="{ pageSize: 10 }"
          />
        </n-tab-pane>
        <n-tab-pane name="craft_slots" tab="Craft Slots">
          <n-data-table
            size="small"
            :columns="craftSlotColumns"
            :data="characterStore.info.craftingSlots"
          />
        </n-tab-pane>
        <n-tab-pane name="raw" tab="Raw Detail Object">
          <pre
            style="
              font-size: 10px;
              padding: 8px;
              border-radius: 4px;
              overflow: auto;
              max-height: 500px;
            "
          >
            {{ JSON.stringify(characterStore.currentAvatarDetail, null, 2) }}
          </pre>
        </n-tab-pane>
      </n-tabs>
    </template>

    <div v-else class="error-state">
      <n-empty :description="characterStore.error || 'Avatar not found'" />
      <n-button style="margin-top: 16px" @click="$router.back()">Go Back</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, h, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  NDataTable,
  NTag,
  NButton,
  NPageHeader,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NSpin,
  NEmpty,
  NTabs,
  NTabPane,
  NInput,
  NSpace,
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { DataTableColumns } from 'naive-ui'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useCsvDataStore } from '@/stores/useCsvDataStore'
import type { Equipment, RuneSlot, RuneInfo, Material } from '@/types/character'
import { resolveNameFromCsv, resolveRuneInfo } from '@/logic/mapping'
import { extractExcelId } from '@/logic/character'

const route = useRoute()
const characterStore = useCharacterStore()
const csvStore = useCsvDataStore()
const { t, locale } = useI18n()

const props = defineProps<{
  avatarAddress: string
}>()

const materialSearch = ref('')

const getItemName = (id: number | string) => {
  return resolveNameFromCsv(id, csvStore.allSheets, locale.value)
}

const getRuneName = (runeId: number) => {
  return resolveRuneInfo(runeId, csvStore.allSheets, locale.value).name
}

const filteredMaterials = computed(() => {
  const all = characterStore.info?.inventory.materials || []
  if (!materialSearch.value) return all
  const s = materialSearch.value.toLowerCase()
  return all.filter(
    (m) =>
      getItemName(m.id).toLowerCase().includes(s) ||
      String(m.id).includes(s) ||
      m.itemSubType?.toLowerCase().includes(s),
  )
})

const getGradeColor = (grade: string | number | undefined) => {
  const g = Number(grade)
  switch (g) {
    case 1:
      return '#909399'
    case 2:
      return '#67c23a'
    case 3:
      return '#409eff'
    case 4:
      return '#9036d8'
    case 5:
      return '#e6a23c'
    case 6:
      return '#f56c6c'
    default:
      return '#909399'
  }
}

const itemColumns: DataTableColumns<Equipment> = [
  {
    title: 'Name',
    key: 'name',
    render: (row) =>
      getItemName(extractExcelId(row as unknown as Record<string, unknown>) || row.itemId),
  },
  { title: 'Type', key: 'itemSubType' },
  { title: 'Lv', key: 'level', width: 60, align: 'center', render: (row) => `+${row.level}` },
  {
    title: 'Status',
    key: 'equipped',
    width: 100,
    render: (row) =>
      row.equipped
        ? h(NTag, { size: 'tiny', type: 'success' }, { default: () => 'Equipped' })
        : 'Bag',
  },
]

const materialColumns: DataTableColumns<Material> = [
  {
    title: () => t('avatar.item_id'),
    key: 'id',
    width: 80,
    render: (row) => h('span', { style: 'font-size: 10px; color: #999' }, row.id),
  },
  {
    title: () => t('avatar.name'),
    key: 'name',
    width: 200,
    fixed: 'left',
    render: (row) =>
      h(
        'span',
        { style: `color: ${getGradeColor(row.grade)}; font-weight: bold` },
        getItemName(row.id),
      ),
  },
  {
    title: () => t('avatar.type'),
    key: 'itemSubType',
    width: 120,
    render: (row) =>
      row.itemSubType
        ? h(NTag, { size: 'tiny', bordered: false }, { default: () => row.itemSubType })
        : '-',
  },
  {
    title: () => t('avatar.grade'),
    key: 'grade',
    width: 80,
    align: 'center',
    render: (row) =>
      h(
        NTag,
        { size: 'tiny', color: { color: getGradeColor(row.grade), textColor: '#fff' } },
        { default: () => `G${row.grade}` },
      ),
  },
  {
    title: () => t('avatar.count'),
    key: 'count',
    align: 'right',
    width: 100,
    sorter: (a, b) => a.count - b.count,
    render: (row) => h('span', { style: 'font-weight: bold' }, row.count.toLocaleString()),
  },
  {
    title: () => t('avatar.tradable'),
    key: 'tradableCount',
    align: 'right',
    width: 100,
    sorter: (a, b) => (a.tradableCount || 0) - (b.tradableCount || 0),
    render: (row) => row.tradableCount?.toLocaleString() || '0',
  },
  {
    title: () => t('avatar.req_block'),
    key: 'requiredBlockIndex',
    width: 120,
    render: (row) => row.requiredBlockIndex || '-',
  },
]

const runeSlotColumns: DataTableColumns<RuneSlot> = [
  { title: 'Slot', key: 'index', width: 80 },
  {
    title: 'Rune Name',
    key: 'name',
    render: (row) => (row.runeId ? getRuneName(row.runeId) : 'Empty'),
  },
  { title: 'Status', key: 'isLock', render: (row) => (row.isLock ? 'Locked' : 'Unlocked') },
]

const learnedRuneColumns: DataTableColumns<RuneInfo> = [
  { title: 'Rune ID', key: 'runeId', width: 100 },
  { title: 'Name', key: 'name', render: (row) => getRuneName(row.runeId) },
  { title: 'Lv', key: 'level', width: 60, align: 'center' },
]

const craftSlotColumns: DataTableColumns<{
  index: number
  isUnlocked: boolean
  startBlockIndex?: number
  petId?: string
}> = [
  { title: 'Index', key: 'index', width: 80 },
  { title: 'Unlocked', key: 'isUnlocked', render: (row) => (row.isUnlocked ? 'YES' : 'NO') },
  { title: 'Start Block', key: 'startBlockIndex' },
  { title: 'Pet', key: 'petId' },
]

async function handleRefresh() {
  const agentAddress = route.query.agent as string
  if (props.avatarAddress && agentAddress) {
    await characterStore.fetchAvatarDetail()
  }
}

onMounted(() => {
  handleRefresh()
})
</script>

<style scoped>
.avatar-detail-page {
  padding: 12px;
  max-width: 1000px;
  margin: 0 auto;
}
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
