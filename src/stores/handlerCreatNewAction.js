import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useConfigURLStore } from '@/stores/configURL'
import { useI18n } from 'vue-i18n'
import { useNow } from '@vueuse/core'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
export const useHandlerCreatNewActionStore = defineStore('handlerCreatNewActionStore', () => {
  const { t, d, locale } = useI18n()
  const timeNow = useNow()
  const useFetchDataUser9C = useFetchDataUser9CStore()
  const useConfigURL = useConfigURLStore()
  const nameAndTag = computed(() =>
    useFetchDataUser9C.dataUser9C_normal !== null
      ? `${useFetchDataUser9C.dataUser9C_normal.name} #${useFetchDataUser9C.avatarAddress.slice(2, 6)}`
      : t('fetchDataUser9c.guest')
  )
  const listActions = ref([])
  const listActionStartNext = ref([])
  const actionDataMap = computed(() => {
    return {
      refillAP: {
        label: `${useConfigURL.selectedPlanet} | Refill AP | ${nameAndTag.value} | ${d(timeNow.value, 'useTimeNode')}`,
        value: `refillAP<br/>${useConfigURL.selectedPlanet}<br/>${locale.value}<br/>${useConfigURL.selectedNode}<br/>${useConfigURL.apiRest9cscan}<br/>${useConfigURL.web9cscanUrl}<br/>${useFetchDataUser9C.agentAddress}<br/>${useFetchDataUser9C.avatarAddress}<br/>${d(timeNow.value, 'useTimeNode')}`,
        disabled: false,
        labelImg: getImageBase64FromCacheOrFetch('/assets/icons/UI_main_icon_box.png')
      },
      battleArena: {
        label: `${useConfigURL.selectedPlanet} | Battle Arena | ${nameAndTag.value} | ${d(timeNow.value, 'useTimeNode')}`,
        value: "",
        disabled: false,
        labelImg: getImageBase64FromCacheOrFetch('/assets/iconsArena/Arena_bg_19.png')
      },
      sweep: {
        label: 'Sweep',
        value: 'sweep_value',
        disabled: false
      },
      repeat: {
        label: 'Repeat',
        value: 'repeat_value',
        disabled: false
      }
    }
  })
  // Tạo dữ liệu bước ban đầu
  function fillData(type, rawData, dataInput) {
    let dataAfter;
    switch (type) {
      case 'refillAP':
        dataAfter = rawData
        break
      case 'battleArena':
        dataAfter = rawData // avatarAddressEnemy ticket equipments costumes runeInfos auras isLimit
        // type planet locale url_node url_api_9cscan url_9cscan agent avatar avatarAddressEnemy ticket equipments costumes runeInfos auras isLimit useTimeNode
        dataAfter.value = `battleArena<br/>${useConfigURL.selectedPlanet}<br/>${locale.value}<br/>${useConfigURL.selectedNode}<br/>${useConfigURL.apiRest9cscan}<br/>${useConfigURL.web9cscanUrl}<br/>${useFetchDataUser9C.agentAddress}<br/>${useFetchDataUser9C.avatarAddress}<br/>${dataInput.avatarAddressEnemy}<br/>${dataInput.ticket}<br/>${dataInput.equipments}<br/>${dataInput.costumes}<br/>${dataInput.runeInfos}<br/>${dataInput.auras}<br/>${dataInput.isLimit}<br/>${d(timeNow.value, 'useTimeNode')}`
        break
      default:
        dataAfter = rawData
    }
    return dataAfter
  }
  // Logic thêm action mới vào list
  function handleActionNew(actionName, dataInput) {
    // Lấy dữ liệu mới từ object actionDataMap
    const newAction = actionDataMap.value[actionName]
    const finalAction = fillData(actionName, newAction, dataInput)
    // Thêm dữ liệu mới vào cả hai mảng
    listActions.value.push(finalAction)
    listActionStartNext.value.push(finalAction.value)
  }
  const isRunning_battleArena = computed(() => listActionStartNext.value.length > 0 ? listActionStartNext.value[0].split('<br/>')[0] === 'battleArena' : false)
  // Danh sách actions
  const listActionStartNextLength = computed(() => listActionStartNext.value.length)
  return {
    listActions,
    listActionStartNext,
    handleActionNew,
    listActionStartNextLength,
    isRunning_battleArena
  }
})
