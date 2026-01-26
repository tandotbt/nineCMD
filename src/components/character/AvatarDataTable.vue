<template>
  <div class="avatar-data-table">
    <n-data-table
      size="small"
      :columns="columns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
      :pagination="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NDataTable, NButton, NText } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { AvatarData } from '@/stores/useCharacterStore'

defineProps<{
  data: AvatarData[]
  loading: boolean
}>()

const router = useRouter()
const route = useRoute()

const rowKey = (row: AvatarData) => row.address

const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
})

const columns: DataTableColumns<AvatarData> = [
  {
    title: 'Name',
    key: 'name',
    render(row) {
      return h(NText, { strong: true }, { default: () => row.name })
    },
  },
  {
    title: 'Lv',
    key: 'level',
    width: 60,
    align: 'center',
    sorter: (a, b) => a.level - b.level,
  },
  {
    title: 'AP',
    key: 'ap',
    width: 80,
    align: 'center',
    render: (row) => `${row.ap}/${row.maxAp}`,
  },
  {
    title: 'CP',
    key: 'cp',
    width: 100,
    align: 'right',
    render: (row) => row.cp.toLocaleString(),
  },
  {
    title: 'Stage',
    key: 'stage',
    width: 80,
    align: 'center',
    render: (row) => `W${row.worldId}-${row.stage}`,
  },
  {
    title: 'Daily',
    key: 'dailyRewardReceivedIndex',
    width: 60,
    align: 'center',
    render: (row) => `#${row.dailyRewardReceivedIndex}`,
  },
  {
    title: 'Action',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          onClick: () => handleViewDetail(row),
        },
        { default: () => 'Detail' },
      )
    },
  },
]

function handleViewDetail(row: AvatarData) {
  router.push({
    name: 'avatar-detail',
    params: { avatarAddress: row.address },
    query: { agent: (route.query.agent as string) || '' },
  })
}
</script>

<style scoped>
.avatar-data-table {
  width: 100%;
}
</style>
