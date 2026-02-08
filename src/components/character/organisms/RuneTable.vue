<template>
  <n-data-table
    size="small"
    :columns="columns"
    :data="sortedData"
    :pagination="pagination"
    scroll-x="600"
  />
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { NDataTable, NText, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { RuneSlot, RuneInfo } from '@/types/character'
import { mapRuneToDisplayData, sortRunes } from '@/logic/character'
import ItemIcon from '../atoms/ItemIcon.vue'
import ItemNameDisplay from '../molecules/ItemNameDisplay.vue'
import { useI18n } from 'vue-i18n'
import { useCsvDataStore } from '@/stores/useCsvDataStore'

const props = defineProps<{
  data: (RuneSlot | RuneInfo)[]
  type: 'slot' | 'learned'
}>()

const { locale } = useI18n()
const csvStore = useCsvDataStore()

const pagination = props.type === 'learned' ? { pageSize: 10 } : false

type RuneRow = RuneSlot | RuneInfo

const mapToDisplayData = (row: RuneRow) => {
  return mapRuneToDisplayData(row, csvStore.allSheets, locale.value)
}

const sortedData = computed(() => {
  if (props.type === 'slot') return props.data
  return sortRunes(props.data as RuneInfo[])
})

const columns: DataTableColumns<RuneRow> = [
  ...(props.type === 'slot'
    ? [
        {
          title: '#',
          key: 'index',
          width: 60,
          render: (row: RuneRow) =>
            h(
              NText,
              { depth: 3, style: 'font-family: monospace' },
              { default: () => ((row as RuneSlot).index || 0) + 1 },
            ),
        },
      ]
    : []),
  {
    title: 'Rune',
    key: 'runeId',
    width: 80,
    align: 'center',
    render: (row: RuneRow) => {
      const runeId = (row as RuneInfo).runeId || (row as RuneSlot).runeId
      const isLock = (row as RuneSlot).isLock

      if (!runeId) {
        return h(
          'div',
          {
            style: {
              width: '52px',
              height: '52px',
              borderRadius: '6px',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            },
          },
          [isLock ? h('span', '🔒') : h('span', '➖')],
        )
      }

      return h(ItemIcon, {
        item: mapToDisplayData(row),
        size: 52,
      })
    },
  },
  {
    title: 'Information',
    key: 'name',
    minWidth: 180,
    render: (row: RuneRow) => {
      if (!row.runeId)
        return h(
          NText,
          { depth: 3, style: 'font-style: italic; opacity: 0.5' },
          { default: () => 'Empty Slot' },
        )
      return h(ItemNameDisplay, {
        item: mapToDisplayData(row),
      })
    },
  },
  {
    title: 'Type',
    key: 'runeType',
    width: 100,
    align: 'center' as const,
    render: (row: RuneRow) => {
      const info = mapToDisplayData(row)
      if (!info.runeType) return null
      return h(
        NTag,
        {
          size: 'small',
          type: info.runeType === 'SKILL' ? 'warning' : 'success',
          bordered: false,
          round: true,
        },
        { default: () => info.runeType },
      )
    },
  },
  ...(props.type === 'slot'
    ? [
        {
          title: 'Status',
          key: 'isLock',
          width: 120,
          align: 'center' as const,
          render: (row: RuneRow) => {
            const isLock = (row as RuneSlot).isLock
            const runeId = (row as RuneSlot).runeId
            if (isLock) {
              return h(
                NTag,
                { size: 'small', type: 'error', bordered: false, round: true },
                { default: () => 'Locked' },
              )
            }
            return h(
              NTag,
              {
                size: 'small',
                type: runeId ? 'success' : 'info',
                bordered: false,
                round: true,
              },
              { default: () => (runeId ? 'Equipped' : 'Empty') },
            )
          },
        },
      ]
    : []),
  ...(props.type === 'learned'
    ? [
        {
          title: 'Level',
          key: 'level',
          width: 80,
          align: 'center' as const,
          sorter: (a: RuneRow, b: RuneRow) => (a.level || 0) - (b.level || 0),
          render: (row: RuneRow) =>
            h(
              NText,
              { strong: true, style: 'font-family: Kanit, sans-serif' },
              { default: () => `Lv.${row.level}` },
            ),
        },
      ]
    : []),
]
</script>
