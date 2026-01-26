<template>
  <div class="info-all-avatar-page">
    <n-space vertical size="large">
      <!-- Avatar List Table -->
      <n-card size="small" bordered>
        <template #header-extra>
          <n-button
            type="primary"
            size="small"
            @click="handleRefresh"
            :loading="characterStore.isFetching"
          >
            {{ t('avatar_detail_btn_refresh') }}
          </n-button>
        </template>

        <n-data-table
          remote
          ref="table"
          :columns="columns"
          :data="characterStore.characters"
          :pagination="pagination"
          :loading="characterStore.isFetching"
          :row-props="rowProps"
          scroll-x="1000"
        />
      </n-card>

      <!-- Detailed Info for Selected Avatar -->
      <n-card
        v-if="activeAvatar"
        :title="`${t('avatar_retrieval_overview_title')}: ${activeAvatar.name}`"
        size="small"
        bordered
      >
        <template #header-extra>
          <n-tag type="success" size="small"
            >{{ t('common.level') }} {{ activeAvatar.level }}</n-tag
          >
        </template>

        <n-tabs type="line" animated>
          <!-- Tab Overview -->
          <n-tab-pane name="overview" :tab="t('avatar_detail_tab_overview')">
            <n-grid :cols="4" :x-gap="12" responsive="screen" style="margin-top: 12px">
              <n-grid-item>
                <n-statistic :label="t('common.ap')" :value="activeAvatar.ap">
                  <template #prefix>⚡</template>
                  <template #suffix>/ {{ activeAvatar.maxAp }}</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.ncg')" :value="activeAvatar.ncg">
                  <template #prefix>🪙</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.crystal')" :value="activeAvatar.crystal">
                  <template #prefix>💎</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.stage')" :value="activeAvatar.stage">
                  <template #prefix>🏁</template>
                  <template #suffix> (W{{ activeAvatar.worldId }})</template>
                </n-statistic>
              </n-grid-item>
            </n-grid>

            <n-divider title-placement="left">Key Materials</n-divider>
            <n-grid :cols="4" :x-gap="12" style="margin-bottom: 12px">
              <n-gi v-for="id in TRACKED_ITEM_IDS" :key="id">
                <n-card size="small" embedded>
                  <n-statistic
                    :label="
                      activeAvatar.inventory.materials.find((m) => m.id === id)?.name ||
                      `Item ${id}`
                    "
                    :value="activeAvatar.inventory.materials.find((m) => m.id === id)?.count ?? 0"
                  >
                    <template #prefix>📦</template>
                  </n-statistic>
                </n-card>
              </n-gi>
            </n-grid>

            <n-divider />

            <n-descriptions bordered label-placement="left" :column="2">
              <n-descriptions-item :label="t('common.address')">
                <n-text code copyable>{{ activeAvatar.address }}</n-text>
              </n-descriptions-item>
              <n-descriptions-item :label="t('pwa_table_name')">
                {{ activeAvatar.name }}
              </n-descriptions-item>
              <n-descriptions-item :label="t('common.level')">
                {{ activeAvatar.level }} ({{ t('common.exp') }}: {{ activeAvatar.exp }})
              </n-descriptions-item>
              <n-descriptions-item label="CP">
                <n-number-animation :from="0" :to="activeAvatar.cp" />
                <n-text depth="3" style="font-size: 12px; margin-left: 8px">
                  (Adv: {{ activeAvatar.adventureCp }})
                </n-text>
              </n-descriptions-item>
              <n-descriptions-item :label="t('common.rank')">
                #{{ activeAvatar.rank }}
              </n-descriptions-item>
              <n-descriptions-item label="AP Refill">
                <n-tag
                  :type="
                    activeAvatar.timeRefill >= activeAvatar.dailyRewardInterval ||
                    activeAvatar.timeRefillReal === 1
                      ? 'success'
                      : 'warning'
                  "
                  size="small"
                >
                  {{
                    activeAvatar.timeRefill >= activeAvatar.dailyRewardInterval ||
                    activeAvatar.timeRefillReal === 1
                      ? t('avatar_detail_ready_claim')
                      : `${activeAvatar.timeRefill} / ${activeAvatar.dailyRewardInterval}`
                  }}
                </n-tag>
              </n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>

          <!-- Tab Inventory -->
          <n-tab-pane name="inventory" :tab="t('avatar_detail_tab_inv')">
            <n-space vertical size="large" style="margin-top: 12px">
              <n-divider title-placement="left">{{ t('avatar_detail_sub_equip') }}</n-divider>
              <n-data-table
                size="small"
                :columns="equipmentColumns"
                :data="activeAvatar.inventory.equipments"
                :pagination="{ pageSize: 10 }"
                scroll-x="600"
              />

              <n-divider title-placement="left">{{ t('avatar_detail_sub_costume') }}</n-divider>
              <n-data-table
                size="small"
                :columns="costumeColumns"
                :data="activeAvatar.inventory.costumes"
                :pagination="{ pageSize: 10 }"
                scroll-x="600"
              />

              <n-divider title-placement="left">Materials</n-divider>
              <n-grid :cols="4" :x-gap="12" :y-gap="12">
                <n-gi v-for="mat in activeAvatar.inventory.materials" :key="mat.id">
                  <n-card size="small" hoverable>
                    <n-statistic :label="mat.name" :value="mat.count">
                      <template #prefix>📦</template>
                      <template #suffix v-if="mat.tradableCount">
                        <n-text depth="3" style="font-size: 12px">
                          ({{ mat.tradableCount }} {{ t('avatar_detail_tradable') }})
                        </n-text>
                      </template>
                    </n-statistic>
                  </n-card>
                </n-gi>
              </n-grid>
            </n-space>
          </n-tab-pane>

          <!-- Tab Runes -->
          <n-tab-pane name="runes" :tab="t('avatar_detail_tab_runes')">
            <n-space vertical size="large" style="margin-top: 12px">
              <n-divider title-placement="left">{{ t('avatar_detail_sub_runes') }}</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="12">
                <n-gi v-for="slot in activeAvatar.runeSlots" :key="slot.index">
                  <n-card size="small">
                    <n-space justify="space-between">
                      <n-text>Slot {{ slot.index }}</n-text>
                      <n-tag :type="slot.isLock ? 'error' : 'success'" size="tiny">
                        {{ slot.isLock ? 'Locked' : 'Unlocked' }}
                      </n-tag>
                    </n-space>
                    <div style="margin-top: 8px">
                      <n-text strong>{{ slot.name }}</n-text>
                    </div>
                  </n-card>
                </n-gi>
              </n-grid>

              <n-divider title-placement="left">{{ t('avatar_detail_learned_runes') }}</n-divider>
              <n-space>
                <n-tag v-for="rune in activeAvatar.runes" :key="rune.runeId" type="info">
                  {{ rune.name }} (Lv.{{ rune.level }})
                </n-tag>
              </n-space>
            </n-space>
          </n-tab-pane>

          <!-- Tab Season Pass -->
          <n-tab-pane name="season" :tab="t('avatar_detail_tab_season')">
            <n-grid :cols="2" :x-gap="12" :y-gap="12" style="margin-top: 12px">
              <n-gi v-for="(pass, index) in activeAvatar.seasonPass as any" :key="index">
                <n-card size="small" :title="pass.season_pass.pass_type">
                  <template #header-extra>
                    <n-tag type="info">Season {{ pass.season_pass.season_index }}</n-tag>
                  </template>
                  <n-descriptions :column="1" size="small">
                    <n-descriptions-item :label="t('common.level')">
                      {{ pass.level }}
                    </n-descriptions-item>
                    <n-descriptions-item :label="t('common.exp')">
                      {{ pass.exp }}
                    </n-descriptions-item>
                    <n-descriptions-item label="Premium">
                      <n-tag :type="pass.is_premium ? 'success' : 'default'" size="tiny">
                        {{ pass.is_premium ? 'Yes' : 'No' }}
                      </n-tag>
                    </n-descriptions-item>
                  </n-descriptions>
                </n-card>
              </n-gi>
            </n-grid>
          </n-tab-pane>

          <!-- Tab Others -->
          <n-tab-pane name="others" :tab="t('avatar_detail_sub_crafting')">
            <n-space vertical size="large" style="margin-top: 12px">
              <n-divider title-placement="left">{{ t('avatar_detail_sub_staking') }}</n-divider>
              <n-descriptions bordered label-placement="left" :column="2">
                <n-descriptions-item :label="t('avatar_detail_stat_staked')">
                  {{ activeAvatar.stakeNCG }} NCG
                </n-descriptions-item>
                <n-descriptions-item :label="t('avatar_detail_stat_ap_cost')">
                  {{ activeAvatar.apCost }}
                </n-descriptions-item>
              </n-descriptions>

              <n-divider title-placement="left">{{ t('avatar_detail_sub_crafting') }}</n-divider>
              <n-grid :cols="2" :x-gap="12" :y-gap="12">
                <n-gi v-for="slot in activeAvatar.craftingSlots" :key="slot.index">
                  <n-card size="small">
                    <n-space justify="space-between">
                      <n-text>Slot {{ slot.index }}</n-text>
                      <n-tag :type="slot.isUnlocked ? 'success' : 'default'" size="tiny">
                        {{ slot.isUnlocked ? 'Unlocked' : 'Locked' }}
                      </n-tag>
                    </n-space>
                  </n-card>
                </n-gi>
              </n-grid>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-card>

      <n-card v-else :title="t('avatar_retrieval_empty_title')" size="small" bordered>
        <n-alert type="warning">
          Vui lòng chọn hoặc đăng nhập Avatar trong phần thiết lập.
        </n-alert>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NStatistic,
  NSpace,
  NCard,
  NGrid,
  NGi,
  NGridItem,
  NTag,
  NDivider,
  NDescriptions,
  NDescriptionsItem,
  NEllipsis,
  NAlert,
  NDataTable,
  NText,
  NNumberAnimation,
  NTabs,
  NTabPane,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { AvatarData, Equipment, Costume } from '@/types/character'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { TRACKED_ITEM_IDS } from '@/constants'

const { t } = useI18n()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()

const selectedRowAddress = ref<string | null>(null)

const activeAvatar = computed(() => {
  const address = selectedRowAddress.value || settingsStore.avatarAddress
  if (!address) return null
  return characterStore.characters.find((c) => c.address.toLowerCase() === address.toLowerCase())
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

const columns: DataTableColumns<AvatarData> = [
  {
    title: () => t('pwa_table_name'),
    key: 'name',
    fixed: 'left',
    width: 150,
    render(row) {
      return h(
        NText,
        {
          strong: true,
          type:
            row.address.toLowerCase() ===
            (selectedRowAddress.value || settingsStore.avatarAddress || '').toLowerCase()
              ? 'primary'
              : 'default',
        },
        { default: () => row.name },
      )
    },
  },
  {
    title: () => t('common.level'),
    key: 'level',
    width: 80,
    sorter: (a, b) => a.level - b.level,
  },
  {
    title: 'AP',
    key: 'ap',
    width: 100,
    render(row) {
      return h('span', {}, `${row.ap} / ${row.maxAp}`)
    },
  },
  {
    title: 'NCG',
    key: 'ncg',
    width: 120,
    sorter: (a, b) => a.ncg - b.ncg,
    render(row) {
      return h(NNumberAnimation, { precision: 0, to: row.ncg })
    },
  },
  {
    title: 'CP',
    key: 'cp',
    width: 120,
    sorter: (a, b) => a.cp - b.cp,
    render(row) {
      return h(NNumberAnimation, { to: row.cp })
    },
  },
  {
    title: () => t('common.stage'),
    key: 'stage',
    width: 100,
    render(row) {
      return h('span', {}, `W${row.worldId}-S${row.stage}`)
    },
  },
  {
    title: 'Items',
    key: 'materials',
    width: 150,
    render(row: AvatarData) {
      const potion = row.inventory.materials.find((m) => m.id === 500000)
      const hourglass = row.inventory.materials.find((m) => m.id === 600201)
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NTag,
              {
                size: 'small',
                type: potion && (potion.count || 0) > 0 ? 'warning' : 'default',
              },
              { default: () => `🧪 ${potion?.count || 0}` },
            ),
            h(
              NTag,
              {
                size: 'small',
                type: hourglass && (hourglass.count || 0) > 0 ? 'info' : 'default',
              },
              { default: () => `⏳ ${hourglass?.count || 0}` },
            ),
          ],
        },
      )
    },
  },
  {
    title: () => t('common.address'),
    key: 'address',
    width: 200,
    render(row) {
      return h(NEllipsis, { style: 'max-width: 180px' }, { default: () => row.address })
    },
  },
]

const equipmentColumns: DataTableColumns<Equipment> = [
  { title: 'Name', key: 'name', width: 150, fixed: 'left' },
  {
    title: 'Status',
    key: 'equipped',
    width: 100,
    render(row) {
      return h(
        NTag,
        { type: row.equipped ? 'success' : 'default', size: 'small' },
        { default: () => (row.equipped ? 'Equipped' : 'In Bag') },
      )
    },
  },
  { title: 'Grade', key: 'grade', width: 80 },
  { title: 'Type', key: 'itemSubType', width: 120 },
  { title: 'CP', key: 'CP', width: 100, sorter: (a, b) => a.CP - b.CP },
  { title: 'Level Req', key: 'levelReq', width: 100 },
]

const costumeColumns: DataTableColumns<Costume> = [
  { title: 'Name', key: 'name', width: 150, fixed: 'left' },
  {
    title: 'Status',
    key: 'equipped',
    width: 100,
    render(row) {
      return h(
        NTag,
        { type: row.equipped ? 'success' : 'default', size: 'small' },
        { default: () => (row.equipped ? 'Equipped' : 'In Bag') },
      )
    },
  },
  { title: 'Grade', key: 'grade', width: 80 },
  { title: 'Type', key: 'itemSubType', width: 120 },
]

const rowProps = (row: AvatarData) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      selectedRowAddress.value = row.address
    },
  }
}

async function handleRefresh() {
  if (settingsStore.agentAddress) {
    await characterStore.fetchAllAvatars(settingsStore.agentAddress)
  }
}

onMounted(async () => {
  // Try loading from DB first for instant display
  if (settingsStore.agentAddress && characterStore.characters.length === 0) {
    await characterStore.loadFromHistory()
  }

  // Then fetch fresh data if needed
  if (settingsStore.agentAddress && characterStore.characters.length === 0) {
    await characterStore.fetchAllAvatars(settingsStore.agentAddress)
  }
})
</script>

<style scoped>
.info-all-avatar-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
