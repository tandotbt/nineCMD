<template>
  <div class="avatar-detail-page">
    <div v-if="characterStore.isFetching && !characterStore.info" class="loading-state">
      <n-spin size="large" description="Fetching avatar details..." />
    </div>

    <template v-else-if="characterStore.info">
      <!-- Simple Header -->
      <n-page-header @back="$router.back()" style="margin-bottom: 16px">
        <template #avatar>
          <n-avatar
            v-if="characterStore.info.portraitUrl"
            round
            size="large"
            :src="characterStore.info.portraitUrl"
            :fallback-src="ASSET_CONFIG.FALLBACK_ICON"
          />
        </template>
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
          <EquipmentTable :data="characterStore.info.inventory.equipments" />
        </n-tab-pane>
        <n-tab-pane name="costumes" tab="Costumes">
          <EquipmentTable :data="characterStore.info.inventory.costumes" />
        </n-tab-pane>
        <n-tab-pane name="materials" :tab="t('avatar.materials')">
          <MaterialTable :data="characterStore.info.inventory.materials" />
        </n-tab-pane>
        <n-tab-pane name="rune_slots" tab="Equipped Runes">
          <RuneTable :data="characterStore.info.runeSlots" type="slot" />
        </n-tab-pane>
        <n-tab-pane name="runes" tab="Learned Runes">
          <RuneTable :data="characterStore.info.runes" type="learned" />
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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
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
  NDataTable,
  NAvatar,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { ASSET_CONFIG } from '@/constants'
import type { CraftingSlot } from '@/types/character'
import EquipmentTable from '@/components/character/organisms/EquipmentTable.vue'
import MaterialTable from '@/components/character/organisms/MaterialTable.vue'
import RuneTable from '@/components/character/organisms/RuneTable.vue'

const route = useRoute()
const characterStore = useCharacterStore()
const { t } = useI18n()

const props = defineProps<{
  avatarAddress: string
}>()

const craftSlotColumns: DataTableColumns<CraftingSlot> = [
  { title: 'Index', key: 'index', width: 80 },
  {
    title: 'Unlocked',
    key: 'isUnlocked',
    render: (row: CraftingSlot) => (row.isUnlocked ? 'YES' : 'NO'),
  },
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
