<template>
  <n-modal v-model:show="useInventoryModal.isShowModalChar">
    <n-card style="width: 90vw" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <n-divider>{{ t('@--components--other--inventoryModal-vue.nameModal') }}</n-divider>

      <n-grid :x-gap="10" cols="1 500:10">
        <n-grid-item span="1 500:3">
          <n-card content-style="padding: 0;">
            <n-tabs
              type="segment"
              size="small"
              :tabs-padding="20"
              @update:value="(value) => handlerListItem(value)"
            >
              <n-tab-pane
                name="equipment"
                :tab="t('@--components--other--inventoryModal-vue.tab-pane.equipment')"
                display-directive="if"
              >
                <n-collapse>
                  <n-collapse-item name="1">
                    <template #header>
                      {{ t('@--components--other--inventoryModal-vue.collapse-item.filter') }}
                    </template>
                    <template #header-extra>
                      <n-icon><SeatchIcon /></n-icon>
                    </template>
                    <n-pagination
                      v-model:page="useInventoryModal.page"
                      v-model:page-size="useInventoryModal.pageSize"
                      :page-sizes="[8, 10, 20, 30, 40]"
                      :display-order="['size-picker']"
                      show-size-picker
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <n-tab-pane
                name="consumables"
                :tab="t('@--components--other--inventoryModal-vue.tab-pane.consumables')"
                display-directive="if"
              >
                <n-collapse>
                  <n-collapse-item name="1">
                    <template #header>
                      {{ t('@--components--other--inventoryModal-vue.collapse-item.filter') }}
                    </template>
                    <template #header-extra>
                      <n-icon><SeatchIcon /></n-icon>
                    </template>
                    <n-pagination
                      v-model:page="useInventoryModal.page"
                      v-model:page-size="useInventoryModal.pageSize"
                      :page-sizes="[8, 10, 20, 30, 40]"
                      :display-order="['size-picker']"
                      show-size-picker
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <n-tab-pane
                name="materials"
                :tab="t('@--components--other--inventoryModal-vue.tab-pane.materials')"
                display-directive="if"
              >
                <n-collapse>
                  <n-collapse-item name="1">
                    <template #header>
                      {{ t('@--components--other--inventoryModal-vue.collapse-item.filter') }}
                    </template>
                    <template #header-extra>
                      <n-icon><SeatchIcon /></n-icon>
                    </template>
                    <n-pagination
                      v-model:page="useInventoryModal.page"
                      v-model:page-size="useInventoryModal.pageSize"
                      :page-sizes="[8, 10, 20, 30, 40]"
                      :display-order="['size-picker']"
                      show-size-picker
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <n-tab-pane
                name="costumes"
                :tab="t('@--components--other--inventoryModal-vue.tab-pane.costumes')"
                display-directive="if"
              >
                <n-collapse>
                  <n-collapse-item name="1">
                    <template #header>
                      {{ t('@--components--other--inventoryModal-vue.collapse-item.filter') }}
                    </template>
                    <template #header-extra>
                      <n-icon><SeatchIcon /></n-icon>
                    </template>
                    <n-pagination
                      v-model:page="useInventoryModal.page"
                      v-model:page-size="useInventoryModal.pageSize"
                      :page-sizes="[8, 10, 20, 30, 40]"
                      :display-order="['size-picker']"
                      show-size-picker
                    />
                  </n-collapse-item>
                </n-collapse>
              </n-tab-pane>
              <!-- <n-tab-pane name="materials" tab="Nguyên liệu" display-directive="if"> </n-tab-pane> -->
            </n-tabs>
            <!-- <n-scrollbar style="max-height: 30vh"> -->
            <listItemTable :typeDataFilter="typeDataFilter" />
            <!-- </n-scrollbar> -->
          </n-card>
        </n-grid-item>
        <n-grid-item span="1 500:5">
          <n-card title="Gear" hoverable> Card Content </n-card>
        </n-grid-item>
        <n-grid-item span="1 500:2">
          <n-card title="Index" hoverable> Card Content </n-card>
        </n-grid-item>
      </n-grid>

      <template #action>
        <!-- <n-switch v-model:value="valueTest">
          <template #checked> Check </template>
          <template #unchecked> Uncheck </template>
        </n-switch> -->
      </template>
    </n-card>
  </n-modal>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useInventoryModalStore } from '@/stores/inventoryModal'
import listItemTable from '@/components/other/listItemTable.vue'
import { SearchRound as SeatchIcon } from '@vicons/material'
const useInventoryModal = useInventoryModalStore()
// Tìm lọc data gửi đi
const typeDataFilter = ref('equipment')
function handlerListItem(typeData) {
  typeDataFilter.value = typeData
  // Đặt page về 1
  useInventoryModal.page = 1
}

// const valueTest = ref(false)
</script>
