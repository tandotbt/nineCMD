<template>
  <div class="equipped-slots-display">
    <n-grid :cols="4" :x-gap="12" :y-gap="12" responsive="screen">
      <!-- Equipment Slots -->
      <n-gi v-for="slot in EQUIPMENT_SLOTS" :key="slot">
        <n-card size="small" :bordered="true" class="slot-card">
          <div class="slot-header">{{ t(`item_slot_${slot.toLowerCase()}`) }}</div>
          <div class="slot-content">
            <ItemIcon v-if="getEquippedItem(slot)" :item="getEquippedItem(slot)!" :size="80" />
            <div v-else class="empty-slot">
              <n-icon size="32" depth="3"><Plus /></n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-divider title-placement="left">{{ t('avatar_detail_sub_costumes') }}</n-divider>
    <n-grid :cols="2" :x-gap="12" responsive="screen">
      <n-gi v-for="slot in COSTUME_SLOTS" :key="slot">
        <n-card size="small" :bordered="true" class="slot-card">
          <div class="slot-header">{{ t(`item_slot_${slot.toLowerCase()}`) }}</div>
          <div class="slot-content">
            <ItemIcon
              v-if="getEquippedCostume(slot)"
              :item="getEquippedCostume(slot)!"
              :size="80"
            />
            <div v-else class="empty-slot">
              <n-icon size="32" depth="3"><Plus /></n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NGrid, NGi, NCard, NDivider, NIcon } from 'naive-ui'
import { Add24Regular as Plus } from '@vicons/fluent'
import ItemIcon from '../atoms/ItemIcon.vue'
import type { ItemDisplayData, ItemSubType } from '@/types/item'
import type { AvatarData } from '@/types/character'
import { mapEquipmentToDisplayData, mapCostumeToDisplayData } from '@/logic/character'
import { useCsvDataStore } from '@/stores/useCsvDataStore'

const props = defineProps<{
  avatar: AvatarData
}>()

const { t, locale } = useI18n()
const csvStore = useCsvDataStore()

const EQUIPMENT_SLOTS: ItemSubType[] = [
  'WEAPON',
  'ARMOR',
  'NECKLACE',
  'BELT',
  'RING1',
  'RING2',
  'AURA',
  'GRIMOIRE',
]

const COSTUME_SLOTS: ItemSubType[] = ['FULL_COSTUME', 'TITLE']

const getEquippedItem = (slot: ItemSubType): ItemDisplayData | null => {
  // Logic to find item by slot
  const equippedRings = props.avatar.inventory.equipments.filter(
    (e) => e.itemSubType === 'RING' && e.equipped,
  )

  let item
  if (slot === 'RING1') {
    item = equippedRings[0]
  } else if (slot === 'RING2') {
    item = equippedRings[1]
  } else {
    item = props.avatar.inventory.equipments.find((e) => e.itemSubType === slot && e.equipped)
  }

  if (!item) return null
  return mapEquipmentToDisplayData(item, csvStore.allSheets, locale.value)
}

const getEquippedCostume = (slot: ItemSubType): ItemDisplayData | null => {
  const costume = props.avatar.inventory.costumes.find((c) => c.itemSubType === slot && c.equipped)
  if (!costume) return null
  return mapCostumeToDisplayData(costume, csvStore.allSheets, locale.value)
}
</script>

<style scoped>
.slot-card {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}
.slot-header {
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}
.slot-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-slot {
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
