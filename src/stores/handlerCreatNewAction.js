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
    useFetchDataUser9C.dataUser9C !== null
      ? `${useFetchDataUser9C.dataUser9C.name} #${useFetchDataUser9C.avatarAddress.slice(0, 6)}`
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
  // Logic thêm action mới vào list
  function handleActionNew(actionName) {
    // Lấy dữ liệu mới từ object actionDataMap
    let newAction = actionDataMap.value[actionName]
    // Thêm dữ liệu mới vào cả hai mảng
    listActions.value.push(newAction)
    listActionStartNext.value.push(newAction.value)
  }
  // Danh sách actions
  const listActionStartNextLength = computed(() => listActionStartNext.value.length)
  return {
    listActions,
    listActionStartNext,
    handleActionNew,
    listActionStartNextLength
  }
})
