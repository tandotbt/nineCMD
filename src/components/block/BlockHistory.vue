<script setup lang="ts">
import { useBlockStore } from '@/stores/useBlockStore'
import BlockHistoryItem from './BlockHistoryItem.vue'

import type { Block } from '@/types/block'

defineProps<{
  title: string
  blocks: Block[]
  labelIndex: string
  labelHash: string
  labelVirtual: string
}>()

const store = useBlockStore()
</script>

<template>
  <n-card :title="title">
    <template #header-extra>
      <n-space align="center">
        <n-button size="small" type="error" ghost @click="store.clearAllBlocks">
          {{ $t('history_clear_btn') }}
        </n-button>
      </n-space>
    </template>
    <n-space vertical>
      <BlockHistoryItem
        v-for="block in blocks"
        :key="block.id"
        :index="block.object.index"
        :hash="block.object.hash"
        :timestamp="block.object.timestamp"
        :is-virtual="block.id.startsWith('virtual')"
        :label-index="labelIndex"
        :label-hash="labelHash"
        :label-virtual="labelVirtual"
      />
    </n-space>
  </n-card>
</template>
