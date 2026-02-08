<template>
  <div class="info-all-avatar-page">
    <n-space vertical size="large">
      <!-- Detailed Info for Selected Avatar -->
      <n-card v-if="activeAvatar" size="small" bordered>
        <template #header>
          <n-flex align="center" :size="16">
            <div class="avatar-portrait-container">
              <img :src="GAME_ASSETS.AVATAR.FRAME_NORMAL" class="avatar-frame" />
              <img
                :src="resolveAvatarUrl(activeAvatar.portraitId || 10200000)"
                class="avatar-portrait"
              />
              <div class="avatar-level-badge">
                <img :src="GAME_ASSETS.AVATAR.LEVEL_BG" class="level-bg" />
                <span class="level-text">{{ activeAvatar.level }}</span>
              </div>
            </div>
            <n-flex vertical :size="0">
              <n-text strong style="font-size: 18px">{{ activeAvatar.name }}</n-text>
              <n-text depth="3">#{{ activeAvatar.rank }}</n-text>
            </n-flex>
          </n-flex>
        </template>

        <n-tabs type="line" animated>
          <!-- Tab Overview -->
          <n-tab-pane name="overview" :tab="t('avatar_detail_tab_overview')">
            <n-grid
              :cols="'2 s:3 m:4'"
              :x-gap="12"
              :y-gap="12"
              responsive="screen"
              style="margin-top: 12px"
            >
              <n-grid-item>
                <n-statistic :label="t('common.ap')" :value="activeAvatar.ap">
                  <template #prefix>
                    <img :src="GAME_ASSETS.ICONS.AP" class="stat-icon" />
                  </template>
                  <template #suffix>/ {{ activeAvatar.maxAp }}</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.ncg')" :value="activeAvatar.ncg">
                  <template #prefix>
                    <img :src="GAME_ASSETS.ICONS.NCG" class="stat-icon" />
                  </template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.crystal')" :value="activeAvatar.crystal">
                  <template #prefix>
                    <img :src="GAME_ASSETS.ICONS.CRYSTAL" class="stat-icon" />
                  </template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic :label="t('common.stage')" :value="activeAvatar.stage">
                  <template #prefix>
                    <img :src="GAME_ASSETS.ICONS.STAGE" class="stat-icon" />
                  </template>
                  <template #suffix> (W{{ activeAvatar.worldId }})</template>
                </n-statistic>
              </n-grid-item>
            </n-grid>

            <n-divider title-placement="left">Key Materials</n-divider>
            <n-grid
              :cols="'2 s:3 m:4'"
              :x-gap="12"
              :y-gap="12"
              responsive="screen"
              style="margin-bottom: 12px"
            >
              <n-gi v-for="id in TRACKED_ITEM_IDS" :key="id">
                <n-card size="small" embedded>
                  <n-flex align="center" :wrap="false" :size="12">
                    <ItemIcon :item="getKeyMaterialDisplayData(id)" :size="52" />
                    <n-statistic
                      :label="getItemName(id)"
                      :value="getKeyMaterialDisplayData(id).count"
                    />
                  </n-flex>
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
              <EquippedSlotsDisplay :avatar="activeAvatar" />

              <n-divider title-placement="left">{{ t('avatar_detail_all_items') }}</n-divider>
              <EquipmentTable
                :data="[...activeAvatar.inventory.equipments, ...activeAvatar.inventory.costumes]"
              />

              <n-divider title-placement="left">{{ t('avatar_detail_tab_inv') }}</n-divider>
              <MaterialTable :data="activeAvatar.inventory.materials" />
            </n-space>
          </n-tab-pane>

          <!-- Tab Runes & Staking -->
          <n-tab-pane
            name="runes"
            :tab="t('avatar_detail_tab_runes') + ' & ' + t('avatar_detail_sub_staking')"
          >
            <n-space vertical size="large" style="margin-top: 12px">
              <n-divider title-placement="left">{{ t('avatar_detail_sub_staking') }}</n-divider>
              <n-grid :cols="2" :x-gap="12">
                <n-gi>
                  <n-card size="small" embedded>
                    <n-statistic
                      :label="t('avatar_detail_stat_staked')"
                      :value="activeAvatar.stakeNCG"
                    >
                      <template #prefix>
                        <img :src="GAME_ASSETS.ICONS.STAKE" class="stat-icon" />
                      </template>
                      <template #suffix>NCG</template>
                    </n-statistic>
                  </n-card>
                </n-gi>
                <n-gi>
                  <n-card size="small" embedded>
                    <n-statistic
                      :label="t('avatar_detail_stat_ap_cost')"
                      :value="activeAvatar.apCost"
                    >
                      <template #prefix>
                        <img :src="GAME_ASSETS.ICONS.AP" class="stat-icon" />
                      </template>
                    </n-statistic>
                  </n-card>
                </n-gi>
              </n-grid>

              <n-divider title-placement="left">{{ t('avatar_detail_sub_runes') }}</n-divider>
              <RuneTable :data="activeAvatar.runeSlots" type="slot" />

              <n-divider title-placement="left">{{ t('avatar_detail_learned_runes') }}</n-divider>
              <RuneTable :data="activeAvatar.runes" type="learned" />
            </n-space>
          </n-tab-pane>

          <!-- Tab Season & Events -->
          <n-tab-pane name="season" :tab="t('avatar_detail_tab_season')">
            <n-space vertical size="large" style="margin-top: 12px">
              <!-- Event Dungeon Section -->
              <div v-if="activeAvatar.eventDungeonInfo">
                <n-divider title-placement="left">{{ t('avatar_detail_event_dungeon') }}</n-divider>
                <n-grid :cols="'1 s:2 m:4'" :x-gap="12" :y-gap="12" responsive="screen">
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_tickets')">
                        <template #prefix>
                          <img :src="GAME_ASSETS.ICONS.EVENT_TICKET" class="stat-icon" />
                        </template>
                        <n-number-animation :from="0" :to="activeAvatar.eventDungeonInfo.ticket" />
                        <template #suffix>
                          <n-text depth="3" style="font-size: 14px">
                            /
                            {{
                              activeAvatar.eventDungeonInfo.ticket +
                              activeAvatar.eventDungeonInfo.ticketBuyed
                            }}
                          </n-text>
                        </template>
                      </n-statistic>
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_turn')">
                        <template #prefix>🔄</template>
                        <n-number-animation
                          :from="0"
                          :to="activeAvatar.eventDungeonInfo.currentTurn"
                        />
                        <template #suffix>
                          <n-text depth="3" style="font-size: 14px">
                            / {{ activeAvatar.eventDungeonInfo.totalTurns }}
                          </n-text>
                        </template>
                      </n-statistic>
                      <n-progress
                        type="line"
                        :percentage="
                          (activeAvatar.eventDungeonInfo.currentTurn * 100) /
                          activeAvatar.eventDungeonInfo.totalTurns
                        "
                        :show-indicator="false"
                        processing
                        style="margin-top: 8px"
                      />
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_stage_unlocked')">
                        <template #prefix>🚩</template>
                        <n-number-animation
                          :from="0"
                          :to="activeAvatar.eventDungeonInfo.stageIdUnlocked"
                        />
                      </n-statistic>
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic label="Round Blocks">
                        <template #prefix>⏱️</template>
                        <n-text depth="3" style="font-size: 12px">
                          {{ activeAvatar.eventDungeonInfo.currentRoundStartBlock }} -
                          {{ activeAvatar.eventDungeonInfo.currentRoundEndBlock }}
                        </n-text>
                      </n-statistic>
                    </n-card>
                  </n-gi>
                </n-grid>
              </div>

              <!-- World Boss Section -->
              <div
                v-if="activeAvatar.worldBossInfoTotal && activeAvatar.worldBossInfoTotal.total_hp"
              >
                <n-divider title-placement="left">{{ t('avatar_detail_world_boss') }}</n-divider>
                <n-grid :cols="'1 s:2 m:4'" :x-gap="12" :y-gap="12" responsive="screen">
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_boss_hp')">
                        <template #prefix>
                          <img :src="GAME_ASSETS.ICONS.BOSS" class="stat-icon" />
                        </template>
                        <n-number-animation
                          :from="0"
                          :to="Number(activeAvatar.worldBossInfoTotal.current_hp)"
                        />
                        <template #suffix>
                          <n-text depth="3" style="font-size: 14px">
                            / {{ activeAvatar.worldBossInfoTotal.total_hp }}
                          </n-text>
                        </template>
                      </n-statistic>
                      <n-progress
                        type="line"
                        status="error"
                        :percentage="
                          (Number(activeAvatar.worldBossInfoTotal.current_hp) * 100) /
                          Number(activeAvatar.worldBossInfoTotal.total_hp)
                        "
                        :show-indicator="false"
                        style="margin-top: 8px"
                      />
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_tickets')">
                        <template #prefix>
                          <img :src="GAME_ASSETS.ICONS.WORLDBOSS_TICKET" class="stat-icon" />
                        </template>
                        <n-number-animation
                          :from="0"
                          :to="activeAvatar.worldBossInfoAvatar?.ticket || 0"
                        />
                        <template #suffix>
                          <n-text depth="3" style="font-size: 14px">
                            /
                            {{
                              (activeAvatar.worldBossInfoAvatar?.ticket || 0) +
                              (activeAvatar.worldBossInfoAvatar?.ticket_buyed || 0)
                            }}
                          </n-text>
                        </template>
                      </n-statistic>
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic :label="t('avatar_detail_my_damage')">
                        <template #prefix>⚔️</template>
                        <n-number-animation
                          :from="0"
                          :to="Number(activeAvatar.worldBossInfoAvatar?.accumulated_damage || 0)"
                        />
                      </n-statistic>
                    </n-card>
                  </n-gi>
                  <n-gi>
                    <n-card size="small" embedded>
                      <n-statistic label="Round Blocks">
                        <template #prefix>⏳</template>
                        <n-text depth="3" style="font-size: 12px">
                          {{ activeAvatar.worldBossInfoTotal.start_block_index }} -
                          {{ activeAvatar.worldBossInfoTotal.end_block_index }}
                        </n-text>
                      </n-statistic>
                    </n-card>
                  </n-gi>
                </n-grid>
              </div>

              <!-- Season Pass Section -->
              <div
                v-if="activeAvatar.seasonPass && Object.keys(activeAvatar.seasonPass).length > 0"
              >
                <n-divider title-placement="left">{{ t('avatar_detail_sub_season') }}</n-divider>
                <n-grid :cols="'1 s:2 m:3'" :x-gap="12" :y-gap="12" responsive="screen">
                  <n-gi v-for="(pass, passType) in activeAvatar.seasonPass" :key="passType">
                    <n-card
                      size="small"
                      :title="t(`avatar_detail_season_pass_type_${pass.season_pass.pass_type}`)"
                      class="season-pass-card"
                      :segmented="{ content: true, footer: 'soft' }"
                    >
                      <template #header-extra>
                        <n-space align="center" :size="8">
                          <n-tag
                            :type="pass.is_premium ? 'success' : 'default'"
                            size="small"
                            round
                            variant="outline"
                          >
                            {{
                              pass.is_premium
                                ? t('avatar_detail_pass_premium')
                                : t('avatar_detail_pass_normal')
                            }}
                          </n-tag>
                          <n-tag type="info" size="small" bordered
                            >S{{ pass.season_pass.season_index }}</n-tag
                          >
                        </n-space>
                      </template>

                      <n-grid :cols="2" :x-gap="12">
                        <n-gi>
                          <n-statistic :label="t('common.level')">
                            <template #prefix>⭐</template>
                            <n-number-animation :from="0" :to="pass.level" />
                          </n-statistic>
                        </n-gi>
                        <n-gi>
                          <n-statistic :label="t('common.exp')">
                            <template #prefix>✨</template>
                            <n-number-animation :from="0" :to="pass.exp" />
                          </n-statistic>
                        </n-gi>
                      </n-grid>

                      <template #footer>
                        <n-flex justify="space-between" align="center">
                          <n-space :size="4">
                            <n-tag
                              v-if="pass.isCanClaim?.isCanClaimNormal"
                              type="success"
                              size="tiny"
                              round
                            >
                              Claim Normal
                            </n-tag>
                            <n-tag
                              v-if="pass.isCanClaim?.isCanClaimPremium && pass.is_premium"
                              type="warning"
                              size="tiny"
                              round
                            >
                              Claim Premium
                            </n-tag>
                          </n-space>
                          <n-tag
                            :type="pass.isInTimeClaim ? 'info' : 'error'"
                            size="tiny"
                            variant="outline"
                          >
                            {{ pass.isInTimeClaim ? 'In Progress' : 'Expired' }}
                          </n-tag>
                        </n-flex>
                      </template>
                    </n-card>
                  </n-gi>
                </n-grid>
              </div>
            </n-space>
          </n-tab-pane>

          <!-- Tab Crafting -->
          <n-tab-pane name="crafting" :tab="t('avatar_detail_sub_crafting')">
            <n-space vertical size="large" style="margin-top: 12px">
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
import { computed, onMounted } from 'vue'
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
  NAlert,
  NText,
  NNumberAnimation,
  NTabs,
  NTabPane,
  NFlex,
  NProgress,
} from 'naive-ui'
import EquipmentTable from '@/components/character/organisms/EquipmentTable.vue'
import MaterialTable from '@/components/character/organisms/MaterialTable.vue'
import RuneTable from '@/components/character/organisms/RuneTable.vue'
import EquippedSlotsDisplay from '@/components/character/organisms/EquippedSlotsDisplay.vue'
import ItemIcon from '@/components/character/atoms/ItemIcon.vue'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useCsvDataStore } from '@/stores/useCsvDataStore'
import { TRACKED_ITEM_IDS, GAME_ASSETS } from '@/constants'
import { resolveNameFromCsv } from '@/logic/mapping'
import { mapMaterialToDisplayData } from '@/logic/character'
import { resolveAvatarUrl } from '@/logic/assets'
import type { ItemDisplayData } from '@/types/item'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const settingsStore = useSettingsStore()
const csvStore = useCsvDataStore()

const getItemName = (id: number | string) => {
  return resolveNameFromCsv(id, csvStore.allSheets, locale.value)
}

const getKeyMaterialDisplayData = (id: number): ItemDisplayData => {
  const material = activeAvatar.value?.inventory.materials.find((m) => m.id === id)
  if (material) {
    return mapMaterialToDisplayData(material, csvStore.allSheets, locale.value)
  }
  // Standard fallback for missing materials
  return mapMaterialToDisplayData({ id, count: 0, grade: 1 }, csvStore.allSheets, locale.value)
}

const activeAvatar = computed(() => {
  const address = settingsStore.avatarAddress
  if (!address) return null

  // Prefer the fully reactive info from store if it matches the selected address
  if (characterStore.info && characterStore.info.address.toLowerCase() === address.toLowerCase()) {
    return characterStore.info
  }

  return characterStore.characters.find((c) => c.address.toLowerCase() === address.toLowerCase())
})

onMounted(async () => {
  // Ensure we have the latest detail for the selected avatar
  if (settingsStore.avatarAddress) {
    await characterStore.fetchAvatarDetail()
  }
})
</script>

<style scoped>
.info-all-avatar-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.avatar-portrait-container {
  position: relative;
  width: 64px;
  height: 64px;
}

.avatar-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  object-fit: contain;
}

.avatar-portrait {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  z-index: 1;
  object-fit: contain;
}

.avatar-level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.level-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.level-text {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: bold;
  color: #f2c97d;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.stat-icon {
  width: 22px;
  height: 22px;
  vertical-align: middle;
  margin-right: 4px;
  object-fit: contain;
}

.season-pass-card {
  border-top: 3px solid #f2c97d;
  transition: transform 0.2s ease;
}

.season-pass-card:hover {
  transform: translateY(-2px);
}
</style>
