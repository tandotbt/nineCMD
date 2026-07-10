<template>
  <n-card :title="t('avatarData.graphql.title')" size="small">
    <n-tabs type="line" animated>
      <!-- Equipment Set -->
      <n-tab-pane name="itemSet" :tab="t('avatarData.graphql.itemSet')">
        <n-space vertical size="small">
          <n-card v-for="setType in equipmentSetTypes" :key="setType.key" size="small" :title="setType.label">
            <n-data-table
              v-if="flattenEquipData(setType.data).length > 0"
              :columns="equipSetColumns"
              :data="flattenEquipData(setType.data)"
              size="small"
              striped
              :row-key="(row: { uuid: string }) => row.uuid"
              :max-height="300"
            />
            <n-empty v-else :description="t('avatarData.graphql.noData')" />
          </n-card>
        </n-space>
      </n-tab-pane>

      <!-- Rune Set -->
      <n-tab-pane name="runeSet" :tab="t('avatarData.graphql.runeSet')">
        <n-space vertical size="small">
          <n-card v-for="setType in runeSetTypes" :key="setType.key" size="small" :title="setType.label">
            <n-data-table
              v-if="setType.data.length > 0"
              :columns="runeSetColumns"
              :data="setType.data"
              size="small"
              striped
              :row-key="(row: RuneSlotEntry) => String(row.index)"
              :max-height="300"
            />
            <n-empty v-else :description="t('avatarData.graphql.noData')" />
          </n-card>
        </n-space>
      </n-tab-pane>

      <!-- World Boss -->
      <n-tab-pane name="worldBoss" :tab="t('avatarData.graphql.worldBoss')">
        <template v-if="processedData?.worldBoss.total">
          <n-descriptions bordered :column="2" size="small" label-placement="left">
            <n-descriptions-item :label="t('avatarData.graphql.bossLevel')">
              {{ processedData.worldBoss.total.level }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.currentHp')">
              {{ fmtNum(processedData.worldBoss.total.currentHp) }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.idWB')">
              {{ processedData.worldBoss.total.id ?? '-' }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.startedBlock')">
              {{ fmtNum(processedData.worldBoss.total.startedBlockIndex) }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.endedBlock')">
              {{ fmtNum(processedData.worldBoss.total.endedBlockIndex) }}
            </n-descriptions-item>
          </n-descriptions>
          <n-descriptions v-if="processedData.worldBoss.avatar" bordered :column="2" size="small" label-placement="left" style="margin-top: 8px">
            <n-descriptions-item :label="t('avatarData.graphql.totalScore')">
              {{ fmtNum(processedData.worldBoss.avatar.totalScore) }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.highScore')">
              {{ fmtNum(processedData.worldBoss.avatar.highScore) }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.remainChallenges')">
              {{ processedData.worldBoss.avatar.remainChallengeCount ?? '-' }} / {{ processedData.worldBoss.avatar.totalChallengeCount ?? MAX_CHALLENGE_COUNT }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.purchaseCount')">
              {{ processedData.worldBoss.avatar.purchaseCount ?? '-' }} / {{ MAX_PURCHASE_COUNT }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.latestRewardRank')">
              {{ processedData.worldBoss.avatar.latestRewardRank ?? '-' }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.avatarCp')">
              {{ fmtNum(processedData.worldBoss.avatar.cp) }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.avatarLevel')">
              {{ processedData.worldBoss.avatar.level ?? '-' }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.latestBossLevel')">
              {{ processedData.worldBoss.avatar.latestBossLevel ?? '-' }}
            </n-descriptions-item>
            <n-descriptions-item :label="t('avatarData.graphql.lastAttack')">
              {{ fmtNum(processedData.worldBoss.avatar.lastAttack) }}
            </n-descriptions-item>
          </n-descriptions>
        </template>
        <n-empty v-else :description="t('avatarData.graphql.noData')" />
      </n-tab-pane>

      <!-- Event Dungeon -->
      <n-tab-pane name="eventDungeon" :tab="t('avatarData.graphql.eventDungeon')">
        <n-descriptions v-if="processedData?.eventDungeon" bordered :column="2" size="small" label-placement="left">
          <n-descriptions-item :label="t('avatarData.graphql.dungeonId')">
            {{ processedData.eventDungeon.dungeonId }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('avatarData.graphql.dungeonRound')">
            {{ processedData.eventDungeon.round }}
          </n-descriptions-item>
        </n-descriptions>
        <n-empty v-else :description="t('avatarData.graphql.noData')" />
      </n-tab-pane>

      <!-- Patrol Reward -->
      <n-tab-pane name="patrolReward" :tab="t('avatarData.graphql.patrolReward')">
        <n-descriptions v-if="processedData?.patrolReward" bordered :column="2" size="small" label-placement="left">
          <n-descriptions-item :label="t('avatarData.graphql.blockLastClaim')">
            {{ processedData.patrolReward.blockLastClaim }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('avatarData.graphql.interval')">
            {{ processedData.patrolReward.interval }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('avatarData.graphql.diffBlock')">
            {{ processedData.patrolReward.diffBlock }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('avatarData.graphql.canClaim')">
            <n-tag :type="processedData.patrolReward.isCanClaim ? 'success' : 'default'" size="small">
              {{ processedData.patrolReward.isCanClaim ? t('avatarData.graphql.yes') : t('avatarData.graphql.no') }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
        <n-empty v-else :description="t('avatarData.graphql.noData')" />
      </n-tab-pane>

      <!-- Adventure CP -->
      <n-tab-pane name="adventureCp" :tab="t('avatarData.graphql.adventureCp')">
        <n-descriptions v-if="processedData?.adventureCp != null" bordered :column="2" size="small" label-placement="left">
          <n-descriptions-item :label="t('avatarData.graphql.adventureCp')">
            {{ processedData.adventureCp }}
          </n-descriptions-item>
        </n-descriptions>
        <n-empty v-else :description="t('avatarData.graphql.noData')" />
      </n-tab-pane>

      <!-- Claimed Gift IDs -->
      <n-tab-pane name="claimedGifts" :tab="t('avatarData.graphql.claimedGifts')">
        <n-data-table
          v-if="processedData?.claimedGiftIds && processedData.claimedGiftIds.length > 0"
          :columns="claimedGiftColumns"
          :data="claimedGiftData"
          size="small"
          striped
          :row-key="(row: { id: number }) => String(row.id)"
          :max-height="300"
        />
        <n-empty v-else :description="t('avatarData.graphql.noData')" />
      </n-tab-pane>

      <!-- Raw JSON -->
      <n-tab-pane name="rawJson" :tab="t('avatarData.graphql.rawJson')">
        <n-scrollbar style="max-height: 400px">
          <n-code
            :code="rawJsonCode"
            language="json"
            word-wrap
          />
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard, NTabs, NTabPane, NDataTable, NDescriptions, NDescriptionsItem,
  NScrollbar, NCode, NEmpty, NSpace, NTag, type DataTableColumns
} from 'naive-ui'
import { useAvatarDataDisplayStore } from '../../stores/avatarDataDisplay'
import { useAppSettingsStore } from '../../stores/appSettings'
import { MAX_PURCHASE_COUNT, MAX_CHALLENGE_COUNT } from '@/utilities/constants'
import type { EquipmentSetResponse, RuneSlotEntry, GetDataGraphqlProcessed } from '../../types/avatarData'

const { t } = useI18n()
const store = useAvatarDataDisplayStore()
const appSettings = useAppSettingsStore()

/** Format number with locale from appSettings */
function fmtNum(value: number | undefined | null): string {
  if (value == null) return '-'
  return value.toLocaleString(appSettings.lang === 'vi' ? 'vi-VN' : 'en-US')
}

const processedData = computed<GetDataGraphqlProcessed | null>(() => store.processedRestApi)

// ============================================================
// Equipment Set Tables
// ============================================================
const equipmentSetTypes = computed(() => [
  { key: 'adventure', label: t('avatarData.graphql.adventureSet'), data: processedData.value?.equipmentSets.adventure ?? null },
  { key: 'arena', label: t('avatarData.graphql.arenaSet'), data: processedData.value?.equipmentSets.arena ?? null },
  { key: 'raid', label: t('avatarData.graphql.raidSet'), data: processedData.value?.equipmentSets.raid ?? null },
  { key: 'infiniteTower', label: t('avatarData.graphql.infiniteTowerSet'), data: processedData.value?.equipmentSets.infiniteTower ?? null }
])

const equipSetColumns = computed<DataTableColumns<string>>(() => [
  { title: 'Equipment UUID', key: 'uuid', width: 300 }
])

// Equipment set is { costumes: string[], equipments: string[] } — flatten for table
// Also handles null (no data) and empty cases
function flattenEquipData(set: EquipmentSetResponse | null | undefined): Array<{ uuid: string }> {
  if (!set || typeof set !== 'object' || !Array.isArray(set.equipments)) return []
  const costumes = Array.isArray(set.costumes) ? set.costumes : []
  return [...set.equipments, ...costumes].map((uuid) => ({ uuid }))
}

// ============================================================
// Rune Set Tables
// ============================================================
const runeSetTypes = computed(() => [
  { key: 'adventure', label: t('avatarData.graphql.adventureSet'), data: processedData.value?.runeSets.adventure ?? [] },
  { key: 'arena', label: t('avatarData.graphql.arenaSet'), data: processedData.value?.runeSets.arena ?? [] },
  { key: 'raid', label: t('avatarData.graphql.raidSet'), data: processedData.value?.runeSets.raid ?? [] },
  { key: 'infiniteTower', label: t('avatarData.graphql.infiniteTowerSet'), data: processedData.value?.runeSets.infiniteTower ?? [] }
])

const runeSetColumns = computed<DataTableColumns<RuneSlotEntry>>(() => [
  { title: '#', key: 'index', width: 50 },
  { title: t('avatarData.inventory.runeId'), key: 'runeId', width: 100,
    render(row) { return row.runeId != null ? String(row.runeId) : '-' }
  },
  { title: 'Slot', key: 'runeSlotType', width: 100 },
  { title: 'Type', key: 'runeType', width: 80 },
  { title: 'Locked', key: 'isLock', width: 80,
    render(row) {
      return row.isLock ? h(NTag, { type: 'error', size: 'small' }, { default: () => '🔒' })
                         : h(NTag, { type: 'success', size: 'small' }, { default: () => '✅' })
    }
  }
])

// ============================================================
// Claimed Gift IDs
// ============================================================
const claimedGiftData = computed(() =>
  (processedData.value?.claimedGiftIds ?? []).map((id) => ({ id }))
)

const claimedGiftColumns = computed<DataTableColumns<{ id: number }>>(() => [
  { title: 'Gift ID', key: 'id', width: 200 }
])

// ============================================================
// Raw JSON
// ============================================================
const rawJsonCode = computed(() => {
  if (!store.rawRestApi) return '{}'
  try {
    return JSON.stringify(store.rawRestApi, null, 2)
  } catch {
    return String(store.rawRestApi)
  }
})
</script>
