<template>
  <div class="container" v-if="props.isGearLite">
    <div class="layer-img">
      <n-tooltip trigger="hover">
        <template #trigger>
          <img class="img-bg" :src="imgList.imgGear" />
        </template>
        {{ props.dataGear }}
      </n-tooltip>
    </div>
  </div>
  <!-- isEquipmentViewInventory -->
  <n-popover
    trigger="hover"
    @update:show="handlerViewItem(props.dataGear)"
    raw
    :show-arrow="false"
    content-style="padding: 0;"
    style="max-height: 300px; max-width: 250px"
    scrollable
    :overlap="false"
    placement="top"
    :keep-alive-on-hover="true"
    :delay="10"
    :duration="10"
    :animated="true"
    v-else-if="props.isEquipmentViewInventory"
  >
    <template #trigger>
      <n-flex class="carousel-container" justify="center" align="center">
        <img :src="imgList.imgBackGear" class="carousel-img" />
        <img :src="imgList.imgGear" class="carousel-img" style="position: absolute; width: 70%" />
        <n-gradient-text
          :size="20"
          type="warning"
          style="position: absolute; width: 80%; bottom: 0; text-align: right"
          v-if="props.dataGear.level > 0"
        >
          {{ `+${props.dataGear.level}` }}
        </n-gradient-text>
        <n-flex
          v-if="props.dataGear.statArray.listStat && props.dataGear.statArray.listStat.length !== 0"
          vertical
          class="carousel-img"
          align="center"
          style="position: absolute; width: 50%; left: -5px"
        >
          <img :src="imgList.imgBackGearOption" class="carousel-img" style="height: 70%" />
          <n-flex
            vertical
            justify="center"
            class="carousel-img"
            :size="[0, 0]"
            style="position: absolute; width: 40%; height: 70%"
          >
            <img
              v-for="(type, typeIndex) in props.dataGear.statArray.listStat"
              :key="typeIndex"
              :src="imgList.option[type]"
              :style="{
                top: `${18 - 7 * (4 - props.dataGear.statArray.listStat.length) - typeIndex * 13}%`,
                position: 'relative'
              }"
            />
          </n-flex>
        </n-flex>
      </n-flex>
    </template>
    <n-button-group size="tiny">
      <n-button type="primary">
        <template #icon>
          <n-icon><HomeIcon /></n-icon>
        </template>
        Trang bị
      </n-button>

      <n-button round type="info">
        <template #icon>
          <n-icon><HomeIcon /></n-icon>
        </template>

        Nâng cấp
      </n-button>
    </n-button-group>
    <n-scrollbar style="max-height: 200px">
      <n-card>
        <n-grid x-gap="12" :cols="7">
          <n-gi span="6">
            <n-h4
              align-text
              prefix="bar"
              :style="{ '--n-bar-color': cssHelper[`barGrade${props.dataGear.grade}`] }"
            >
              <n-ellipsis expand-trigger="click" line-clamp="1" :tooltip="false">
                {{ props.dataGear.title }}
              </n-ellipsis>
            </n-h4>
          </n-gi>
          <n-gi> <n-avatar :src="imgList.elemental" size="small" /> </n-gi>
        </n-grid>
        <n-gradient-text :size="24" type="warning"> CP {{ props.dataGear.cp }} </n-gradient-text>
        <n-text depth="3"> Lv req: {{ props.dataGear.levelReq }} </n-text>
        <n-ul align-text>
          <template
            v-for="(mainStat, mainStatKey) in props.dataGear.statArray.mainStat"
            :key="mainStatKey"
          >
            <n-text strong v-if="mainStat !== 0"> {{ mainStatKey }} {{ mainStat }} </n-text>
          </template>
          <template
            v-for="(optionStat, optionStatKey) in props.dataGear.statArray.optionStat"
            :key="optionStatKey"
          >
            <n-flex>
              <img :src="imgList.option['stat']" />{{ optionStatKey }} +{{ optionStat }}
            </n-flex>
          </template>
          <template v-if="props.dataGear.statArray.isHasSkill">
            <n-grid :x-gap="36" cols="12">
              <n-gi><img :src="imgList.option['skill']" /></n-gi>
              <n-gi span="6">
                <n-flex vertical v-for="(skill, index) in props.dataGear.skills" :key="index">
                  <n-ellipsis expand-trigger="click" line-clamp="1" :tooltip="false">
                    {{ skill.name }}
                  </n-ellipsis>

                  <n-ellipsis expand-trigger="click" line-clamp="1" :tooltip="false">
                    {{
                      skill.power !== 0 && skill.referencedStatType !== 'NONE'
                        ? `Power ${skill.power} ${skill.referencedStatType}`
                        : ''
                    }}
                    {{
                      skill.power !== 0 && skill.referencedStatType == 'NONE'
                        ? `Effect ${skill.power}%`
                        : ''
                    }}
                    {{
                      skill.statPowerRatio !== 0
                        ? `Effect ${skill.statPowerRatio}% ${skill.referencedStatType}`
                        : ''
                    }}
                  </n-ellipsis>
                  <n-ellipsis expand-trigger="click" line-clamp="1" :tooltip="false">
                    Chance {{ skill.chance }}%
                  </n-ellipsis>
                </n-flex>
              </n-gi>
            </n-grid>
          </template>
        </n-ul>
      </n-card>
    </n-scrollbar>
  </n-popover>
  <!-- isConsumablesViewInventory -->
  <n-popover
    trigger="hover"
    @update:show="handlerViewItem(props.dataGear)"
    raw
    :show-arrow="false"
    content-style="padding: 0;"
    style="max-height: 300px; max-width: 250px"
    scrollable
    :overlap="false"
    placement="top"
    :keep-alive-on-hover="true"
    :delay="10"
    :duration="10"
    :animated="true"
    v-else-if="props.isConsumablesViewInventory"
  >
    <template #trigger>
      <n-flex class="carousel-container" justify="center" align="center">
        <img :src="imgList.imgBackGear" class="carousel-img" />
        <img :src="imgList.imgGear" class="carousel-img" style="position: absolute; width: 70%" />
        <n-gradient-text
          :size="16"
          :gradient="{
            from: '#dcdcdc',
            to: '#ffffff'
          }"
          style="position: absolute; width: 80%; bottom: 0; text-align: right"
          v-if="props.dataGear.count > 0"
        >
          {{ `${props.dataGear.count}` }}
        </n-gradient-text>
      </n-flex>
    </template>
    <n-button-group size="tiny">
      <n-button type="primary">
        <template #icon>
          <n-icon><HomeIcon /></n-icon>
        </template>
        Trang bị
      </n-button>

      <!-- <n-button round type="info">
        <template #icon>
          <n-icon><HomeIcon /></n-icon>
        </template>

        Nâng cấp
      </n-button> -->
    </n-button-group>
    <n-scrollbar style="max-height: 200px">
      <n-card>
        <n-grid x-gap="12" :cols="7">
          <n-gi span="6">
            <n-h4
              align-text
              prefix="bar"
              :style="{ '--n-bar-color': cssHelper[`barGrade${props.dataGear.grade}`] }"
            >
              <n-ellipsis expand-trigger="click" line-clamp="1" :tooltip="false">
                {{ props.dataGear.title }}
              </n-ellipsis>
            </n-h4>
          </n-gi>
          <n-gi> <n-avatar :src="imgList.elemental" size="small" /> </n-gi>
        </n-grid>
        <n-gradient-text :size="24" type="warning"> CP {{ props.dataGear.cp }} </n-gradient-text>
        <n-text depth="3"> Lv req: {{ props.dataGear.levelReq }} </n-text>
        <n-ul align-text>
          <template
            v-for="(optionStat, optionStatKey) in props.dataGear.statsMap"
            :key="optionStatKey"
          >
            <n-flex v-if="optionStat !== 0">
              <img :src="imgList.option['stat']" />{{ optionStatKey }} +{{ optionStat }}
            </n-flex>
          </template>
        </n-ul>
      </n-card>
    </n-scrollbar>
  </n-popover>
  <div class="container" v-else>
    <div class="layer-img">
      <img :src="imgList.imgGear" class="img-frame" />
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { URL_GITHUB_NineChronicles } from '@/utilities/constants'
import { useInventoryModalStore } from '@/stores/inventoryModal'
import { HomeRound as HomeIcon } from '@vicons/material'
export default {
  props: {
    isGearLite: {
      type: Boolean,
      default: false
    },
    isEquipmentViewInventory: {
      type: Boolean,
      default: false
    },
    isConsumablesViewInventory: {
      type: Boolean,
      default: false
    },
    isEquipmentViewMore: {
      type: Boolean,
      default: false
    },
    isSuffixTemp: {
      type: Boolean,
      default: false
    },
    dataGear: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: { HomeIcon },
  setup(props) {
    const useInventoryModal = useInventoryModalStore()
    const urlImg = computed(() => {
      if (props.isGearLite) {
        return {
          gear: `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${props.dataGear.id}.png`
        }
      }
      if (props.isEquipmentViewInventory || props.isConsumablesViewInventory) {
        const ele = props.dataGear.elementalType.toLowerCase()
        const eleString = ele == 'normal' ? 'element' : 'elemental'
        return {
          gear: `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${props.dataGear.id}.png`,
          backGear: `assets/itemsGear/item_bg_${props.dataGear.grade}.png`,
          backGearOption: `assets/itemsGear/item_option_bg_${props.dataGear.grade}.png`,
          cover: `assets/itemsGear/item_bg_Normal_Tooltip_${props.dataGear.grade}.png`,
          elemental: `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/ElementalType/icon_${eleString}_${ele}.png`
        }
      }

      if (props.isSuffixTemp) {
        return {
          gear: `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/10100000.png`,
          backGear: `assets/itemsGear/item_bg_1.png`,
          backGearOption: `assets/itemsGear/item_option_bg_1.png`,
          cover: `assets/itemsGear/item_bg_Normal_Tooltip_1.png`
        }
      }
      return {
        gear: '',
        backGear: '',
        backGearOption: '',
        cover: '',
        elemental: ''
      }
    })
    const imgList = computed(() => {
      return {
        imgGear: getImageBase64FromCacheOrFetch(urlImg.value.gear),
        imgBackGear: getImageBase64FromCacheOrFetch(urlImg.value.backGear),
        imgBackGearOption: getImageBase64FromCacheOrFetch(urlImg.value.backGearOption),
        imgCover: getImageBase64FromCacheOrFetch(urlImg.value.cover),
        equip: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_equip.png'),
        option: {
          stat: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_option_stat.png'),
          skill: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_option_skill.png')
        },
        elemental: getImageBase64FromCacheOrFetch(urlImg.value.elemental)
      }
    })
    // Quản lý hiển thị chi tiết thông tin gear khi click
    function handlerViewItem(item) {
      useInventoryModal.dataForViewGear = item
      // useInventoryModal.isShowModalItem = !useInventoryModal.isShowModalItem
    }

    const cssHelper = reactive({
      barGrade1: '#83726d',
      barGrade2: '#3eab5a',
      barGrade3: '#4263b7',
      barGrade4: '#b79442',
      barGrade5: '#ab42b7',
      barGrade6: '#ad1217'
    })

    return {
      props,
      imgList,
      useInventoryModal,
      handlerViewItem,
      cssHelper
    }
  }
}
</script>

<!-- <script setup>
import { ref, reactive, onMounted } from 'vue'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { URL_GITHUB_NineChronicles } from '@/utilities/constants'
const props = defineProps({
  isGearLite: {
    type: Boolean,
    default: false
  },
  isEquipmentViewInventory: {
    type: Boolean,
    default: false
  },
  isEquipmentViewMore: {
    type: Boolean,
    default: false
  },
  isSuffixTemp: {
    type: Boolean,
    default: false
  },
  dataGear: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const imgList = ref()
const urlImg = reactive({
  gear: '',
  backGear: '',
  backGearOption: '',
  cover: ''
})

if (props.isGearLite) {
  urlImg.gear = `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${props.dataGear.id}.png`
}
if (props.isEquipmentViewInventory) {
  urlImg.gear = `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${props.dataGear.id}.png`
  urlImg.backGear = `assets/itemsGear/item_bg_${props.dataGear.grade}.png`
  urlImg.backGearOption = `assets/itemsGear/item_option_bg_${props.dataGear.grade}.png`
  urlImg.cover = `assets/itemsGear/item_bg_Normal_Tooltip_${props.dataGear.grade}.png`
}
if (props.isSuffixTemp) {
  urlImg.gear = `${URL_GITHUB_NineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/10100000.png`
  urlImg.backGear = `assets/itemsGear/item_bg_1.png`
  urlImg.backGearOption = `assets/itemsGear/item_option_bg_1.png`
  urlImg.cover = `assets/itemsGear/item_bg_Normal_Tooltip_1.png`
}
imgList.value = {
  imgGear: getImageBase64FromCacheOrFetch(urlImg.gear),
  imgBackGear: getImageBase64FromCacheOrFetch(urlImg.backGear),
  imgBackGearOption: getImageBase64FromCacheOrFetch(urlImg.backGearOption),
  imgCover: getImageBase64FromCacheOrFetch(urlImg.cover),
  equip: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_equip.png'),
  option: {
    stat: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_option_stat.png'),
    skill: getImageBase64FromCacheOrFetch('/assets/itemsGear/UI_icon_option_skill.png')
  }
}
</script> -->

<style scoped>
.carousel-container {
  position: relative;
}
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
