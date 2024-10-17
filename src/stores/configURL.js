import { defineStore } from 'pinia'
import { useFetch, useStorage, refDebounced } from '@vueuse/core'
import {
  URL_CONFIG_URL_ALL_PLANET,
  CONFIG_URL_ALL_PLANET,
  URL_API_MIMIR,
  LINK_BANNER,
  URL_GITHUB_NineChronicles,
  CONFIG_URL_FALL_BACK_DATA_CSV,
  API_URL_MERGE_ARENA
} from '@/utilities/constants'
import { ref, computed, reactive } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import Papa from 'papaparse'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { arrayToIndexedObject } from '@/utilities/arrayToIndexedObject'
import { getPortraitId } from '@/utilities/getPortraitId'
export const useConfigURLStore = defineStore('configURLStore', () => {
  const useWebSocketBlock = useWebSocketBlockStore()
  const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())
  // Tạo độ trễ, giúp ngăn lỗi khi web sử dụng lại server Heimdall, việc đổi ngay lập tức Odin - > Heimdall khiến csv ko fecth kịp
  const selectedPlanetDelay = refDebounced(computed(() => useWebSocketBlock.selectedPlanet.toLowerCase()), 5000)

  const sessionStorageSheet = useStorage('sheet-csv', {}, sessionStorage)
  const useApi = (url) => {
    return useFetch(url, { refetch: true }).get().json()
  }
  const getSheet = (url, nameSheet, keyPropertyNames, fallBackData, isSaveSeason) => {
    return useFetch(
      url,
      { refetch: true },
      {
        beforeFetch({ cancel, options, url }) {
          if (url.includes('mimir.nine-chronicles.dev')) {
            cancel()
          }
          if (sessionStorageSheet.value[nameSheet.value] || dataGetAllSheet[selectedPlanetDelay.value].isGetFull) {
            getAllSheet()
            cancel()
          }
          // "text/csv" => SheetFormat.Csv,
          // "application/json" => SheetFormat.Json,
          options.headers = {
            ...options.headers,
            Accept: "text/csv",
          }
          return {
            options,
          }
        },
        afterFetch(ctx) {
          ctx.data = parseCsvToIndexedObject(ctx.data, keyPropertyNames)
          if (isSaveSeason)
            sessionStorageSheet.value[nameSheet.value] = ctx.data
          return ctx
        },
        updateDataOnError: true,
        onFetchError(ctx) {
          ctx.data = parseCsvToIndexedObject(fallBackData, keyPropertyNames)
          if (isSaveSeason)
            sessionStorageSheet.value[nameSheet.value] = ctx.data
          const mess = ctx.data.message ? ctx.data.message : "Lỗi ko tìm thấy csv"
          ctx.error = new Error(mess) // Modifies the error
          return ctx
        },
      }
    ).get()
  }

  const getBanner = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        afterFetch(ctx) {
          ctx.data = ctx.data.Banners !== null ? ctx.data.Banners : []

          const currentDate = new Date()

          ctx.data = ctx.data.filter((item) => {
            // Sửa link hình ảnh
            item.BannerImageName = getImageBase64FromCacheOrFetch(
              `https://raw.githubusercontent.com/planetarium/NineChronicles.LiveAssets/main/Assets/Images/Banner/${item.BannerImageName}.png`
            )
            // Nếu cả hai giá trị BeginDateTime và EndDateTime đều rỗng, chọn ngay lập tức
            if (!item.BeginDateTime && !item.EndDateTime) {
              return true
            }
            // Nếu BeginDateTime rỗng và EndDateTime có giá trị, kiểm tra xem EndDateTime có quá hạn chưa
            if (!item.BeginDateTime && item.EndDateTime) {
              return new Date(item.EndDateTime) > currentDate
            }
            // Nếu cả hai giá trị không rỗng, kiểm tra xem ngày hiện tại nằm trong khoảng thời gian được chỉ định
            return (
              new Date(item.BeginDateTime) <= currentDate &&
              new Date(item.EndDateTime) >= currentDate
            )
          })

          return ctx
        },
        onFetchError(ctx) {
          // ctx.data can be null when 5xx response
          if (ctx.data === null) ctx.data = []
          return ctx
        }
      }
    )
      .get()
      .json()
  }

  const {
    data: dataMainConfig,
    error: errorMainConfig,
    isFetching: isFetchingMainConfig
  } = useApi(URL_CONFIG_URL_ALL_PLANET)

  const urlGameConfigSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/GameConfigSheet`)
  const nameGameConfigSheet = computed(() => `GameConfigSheet_${selectedPlanetDelay.value}`)
  const nameArenaSheet = computed(() => `ArenaSheet_${selectedPlanetDelay.value}`)
  const urlArenaSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/ArenaSheet`)
  const nameItemNameSheet = computed(() => `ItemNameSheet_${selectedPlanetDelay.value}`)
  const urlItemNameSheet = computed(() => `${URL_GITHUB_NineChronicles}/nekoyume/Assets/StreamingAssets/Localization/item_name.csv#${selectedPlanetDelay.value}`)
  const nameSkillSheet = computed(() => `SkillSheet_${selectedPlanetDelay.value}`)
  const urlSkillSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/SkillSheet`)
  const nameSkillNameSheet = computed(() => `SkillNameSheet_${selectedPlanetDelay.value}`)
  const urlSkillNameSheet = computed(() => `${URL_GITHUB_NineChronicles}/nekoyume/Assets/StreamingAssets/Localization/skill_name.csv#${selectedPlanetDelay.value}`)
  const nameItemRequirementSheet = computed(() => `ItemRequirementSheet_${selectedPlanetDelay.value}`)
  const urlItemRequirementSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/ItemRequirementSheet`)
  const nameCostumeStatSheet = computed(() => `CostumeStatSheet_${selectedPlanetDelay.value}`)
  const urlCostumeStatSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/CostumeStatSheet`)
  const nameRuneOptionSheet = computed(() => `RuneOptionSheet_${selectedPlanetDelay.value}`)
  const urlRuneOptionSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/RuneOptionSheet`)
  const nameConsumableItemSheet = computed(() => `ConsumableItemSheet_${selectedPlanetDelay.value}`)
  const urlConsumableItemSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/ConsumableItemSheet`)


  const postDataGetAllSheet = computed(() => {
    return {
      query: `
        query {
          GameConfigSheet: sheet(sheetName: "GameConfigSheet") {
            csv
          }
          ArenaSheet: sheet(sheetName: "ArenaSheet") {
            csv
          }
          SkillSheet: sheet(sheetName: "SkillSheet") {
            csv
          }
          ItemRequirementSheet: sheet(sheetName: "ItemRequirementSheet") {
            csv
          }
          CostumeStatSheet: sheet(sheetName: "CostumeStatSheet") {
            csv
          }
          RuneOptionSheet: sheet(sheetName: "RuneOptionSheet") {
            csv
          }
          ConsumableItemSheet: sheet(sheetName: "ConsumableItemSheet") {
            csv
          }
        }
      `}
  })
  const dataGetAllSheet = reactive({
    odin: {
      isGetFull: false,
      GameConfigSheet: "",
      ArenaSheet: "",
      SkillSheet: "",
      ItemRequirementSheet: "",
      CostumeStatSheet: "",
      RuneOptionSheet: "",
      ConsumableItemSheet: "",
    },
    heimdall: {
      isGetFull: false,
      GameConfigSheet: "",
      ArenaSheet: "",
      SkillSheet: "",
      ItemRequirementSheet: "",
      CostumeStatSheet: "",
      RuneOptionSheet: "",
      ConsumableItemSheet: "",
    },

  })
  const parseCsvToIndexedObject = (input, keyPropertyNames) => {
    let output = {}
    Papa.parse(input, {

      header: true,
      dynamicTyping: true,
      comments: '_',
      newline: "",
      complete: function (results) {
        output = arrayToIndexedObject(results.data, keyPropertyNames)
      }
    })

    return output
  }

  const getSheet_mimir_graphql = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        beforeFetch({ cancel, options }) {
          if (dataGetAllSheet[selectedPlanetDelay.value].isGetFull) {
            getAllSheet()
            cancel()
          }
          // "text/csv" => SheetFormat.Csv,
          // "application/json" => SheetFormat.Json,
          options.headers = {
            ...options.headers,
          }
          return {
            options,
          }
        },
        afterFetch(ctx) {
          if (ctx.data.data === null) return ctx
          // eslint-disable-next-line no-unused-vars
          Object.entries(dataGetAllSheet[selectedPlanetDelay.value]).forEach(([key, value]) => {
            if (ctx.data.data && ctx.data.data[key]) {
              dataGetAllSheet[selectedPlanetDelay.value][key] = ctx.data.data[key]["csv"]
              dataGetAllSheet[selectedPlanetDelay.value].isGetFull = true
            }
          })
          getAllSheet()
          return ctx
        },
        updateDataOnError: true,
        onFetchError(ctx) {
          const mess = ctx.data.message ? ctx.data.message : "Lỗi ko tìm thấy csv"
          ctx.error = new Error(mess) // Modifies the error
          return ctx
        },
      }
    ).json()
      .post(postDataGetAllSheet)
  }


  // GameConfigSheet
  const {
    data: dataGameConfigSheet,
    error: errorGameConfigSheet,
    isFetching: isFetchingGameConfigSheet,
    // execute: executeGameConfigSheet
  } = getSheet(
    urlGameConfigSheet, nameGameConfigSheet, ['key'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['GameConfigSheet'], true
  )

  // ArenaSheet
  const {
    data: dataArenaSheet,
    error: errorArenaSheet,
    isFetching: isFetchingArenaSheet,
    // execute: executeArenaSheet
  } = getSheet(
    urlArenaSheet, nameArenaSheet, ['start_block_index'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['ArenaSheet'], true
  )

  // ItemNameSheet
  const {
    data: dataItemNameSheet,
    error: errorItemNameSheet,
    isFetching: isFetchingItemNameSheet,
    // execute: executeItemNameSheet
  } = getSheet(
    urlItemNameSheet, nameItemNameSheet, ['Key'], CONFIG_URL_FALL_BACK_DATA_CSV['all']['ItemNameSheet'], true
  )

  // SkillSheet
  const {
    data: dataSkillSheet,
    error: errorSkillSheet,
    isFetching: isFetchingSkillSheet,
    // execute: executeSkillSheet
  } = getSheet(
    urlSkillSheet, nameSkillSheet, ['id'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['SkillSheet'], true
  )


  // SkillNameSheet
  const {
    data: dataSkillNameSheet,
    error: errorSkillNameSheet,
    isFetching: isFetchingSkillNameSheet,
    // execute: executeSkillNameSheet
  } = getSheet(
    urlSkillNameSheet, nameSkillNameSheet, ['Key'], CONFIG_URL_FALL_BACK_DATA_CSV['all']['SkillNameSheet'], true
  )

  // ItemRequirementSheet
  const {
    data: dataItemRequirementSheet,
    error: errorItemRequirementSheet,
    isFetching: isFetchingItemRequirementSheet,
    // execute: executeItemRequirementSheet
  } = getSheet(
    urlItemRequirementSheet, nameItemRequirementSheet, ['item_id'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['ItemRequirementSheet'], true
  )

  // CostumeStatSheet
  const {
    data: dataCostumeStatSheet,
    error: errorCostumeStatSheet,
    isFetching: isFetchingCostumeStatSheet,
    // execute: executeCostumeStatSheet
  } = getSheet(
    urlCostumeStatSheet, nameCostumeStatSheet, ['id'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['CostumeStatSheet'], true
  )

  // RuneOptionSheet
  const {
    data: dataRuneOptionSheet,
    error: errorRuneOptionSheet,
    isFetching: isFetchingRuneOptionSheet,
    // execute: executeRuneOptionSheet
  } = getSheet(
    urlRuneOptionSheet, nameRuneOptionSheet, ['rune_id', 'level'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['RuneOptionSheet'], false
  )

  // ConsumableItemSheet
  const {
    data: dataConsumableItemSheet,
    error: errorConsumableItemSheet,
    isFetching: isFetchingConsumableItemSheet,
    // execute: executeConsumableItemSheet
  } = getSheet(
    urlConsumableItemSheet, nameConsumableItemSheet, ['id'], CONFIG_URL_FALL_BACK_DATA_CSV[selectedPlanetDelay.value]['ConsumableItemSheet'], true
  )
  const urlMimirGraphql = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/graphql`)
  const {
    data: dataMimirSheet,
    error: errorMimirSheet,
    isFetching: isFetchingMimirSheet,
  } = getSheet_mimir_graphql(urlMimirGraphql)

  function getAllSheet() {
    if (dataGetAllSheet[selectedPlanetDelay.value].GameConfigSheet) {
      dataGameConfigSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].GameConfigSheet, ['key'])
      sessionStorageSheet.value[nameGameConfigSheet.value] = dataGameConfigSheet.value
    } else if (sessionStorageSheet.value[nameGameConfigSheet.value])
      dataGameConfigSheet.value = sessionStorageSheet.value[nameGameConfigSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].ArenaSheet) {
      dataArenaSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].ArenaSheet, ['start_block_index'])
      sessionStorageSheet.value[nameArenaSheet.value] = dataArenaSheet.value
    } else if (sessionStorageSheet.value[nameArenaSheet.value])
      dataArenaSheet.value = sessionStorageSheet.value[nameArenaSheet.value]

    if (sessionStorageSheet.value[nameItemNameSheet.value])
      dataItemNameSheet.value = sessionStorageSheet.value[nameItemNameSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].SkillSheet) {
      dataSkillSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].SkillSheet, ['id'])
      sessionStorageSheet.value[nameSkillSheet.value] = dataSkillSheet.value
    } else if (sessionStorageSheet.value[nameSkillSheet.value])
      dataSkillSheet.value = sessionStorageSheet.value[nameSkillSheet.value]

    if (sessionStorageSheet.value[nameSkillNameSheet.value])
      dataSkillNameSheet.value = sessionStorageSheet.value[nameSkillNameSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].ItemRequirementSheet) {
      dataItemRequirementSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].ItemRequirementSheet, ['item_id'])
      sessionStorageSheet.value[nameItemRequirementSheet.value] = dataItemRequirementSheet.value
    } else if (sessionStorageSheet.value[nameItemRequirementSheet.value])
      dataItemRequirementSheet.value = sessionStorageSheet.value[nameItemRequirementSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].CostumeStatSheet) {
      dataCostumeStatSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].CostumeStatSheet, ['id'])
      sessionStorageSheet.value[nameCostumeStatSheet.value] = dataCostumeStatSheet.value
    } else if (sessionStorageSheet.value[nameCostumeStatSheet.value])
      dataCostumeStatSheet.value = sessionStorageSheet.value[nameCostumeStatSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].RuneOptionSheet) {
      dataRuneOptionSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].RuneOptionSheet, ['rune_id', 'level'])
      // sessionStorageSheet.value[nameRuneOptionSheet.value] = dataRuneOptionSheet.value
    } else if (sessionStorageSheet.value[nameRuneOptionSheet.value])
      dataRuneOptionSheet.value = sessionStorageSheet.value[nameRuneOptionSheet.value]

    if (dataGetAllSheet[selectedPlanetDelay.value].ConsumableItemSheet) {
      dataConsumableItemSheet.value = parseCsvToIndexedObject(dataGetAllSheet[selectedPlanetDelay.value].ConsumableItemSheet, ['id'])
      sessionStorageSheet.value[nameConsumableItemSheet.value] = dataConsumableItemSheet.value
    } else if (sessionStorageSheet.value[nameConsumableItemSheet.value])
      dataConsumableItemSheet.value = sessionStorageSheet.value[nameConsumableItemSheet.value]
  }

  const {
    data: dataBanner,
    error: errorBanner,
    isFetching: isFetchingBanner
  } = getBanner(LINK_BANNER)

  const dataConfig = computed(() => {
    if (dataMainConfig.value !== null && errorMainConfig.value == null) {
      return dataMainConfig.value.filter((item) => item.name === selectedPlanet.value)
    }
    return CONFIG_URL_ALL_PLANET.filter((item) => item.name === selectedPlanet.value)
  })

  const selectedNode = ref(null)
  const selectedNode_arena = computed(() => CONFIG_URL_ALL_PLANET.filter((item) => item.name === selectedPlanet.value)[0]['rpcEndpoints']['arena.gql'][0])

  function changeNode(newNode) {
    selectedNode.value = newNode
  }
  const isFetching = computed(
    () => isFetchingMainConfig.value ||
      isFetchingGameConfigSheet.value ||
      isFetchingBanner.value ||
      isFetchingArenaSheet.value ||
      isFetchingItemNameSheet.value ||
      isFetchingSkillSheet.value ||
      isFetchingSkillNameSheet.value ||
      isFetchingItemRequirementSheet.value ||
      isFetchingCostumeStatSheet.value ||
      isFetchingRuneOptionSheet.value ||
      isFetchingConsumableItemSheet.value
  )
  const hasError = computed(() => {
    return (
      errorMainConfig.value !== null ||
      errorGameConfigSheet.value !== null ||
      errorBanner.value !== null ||
      errorArenaSheet.value !== null ||
      errorItemNameSheet.value !== null ||
      errorSkillSheet.value !== null ||
      errorSkillNameSheet.value !== null ||
      errorItemRequirementSheet.value !== null ||
      errorCostumeStatSheet.value !== null ||
      errorRuneOptionSheet.value !== null ||
      errorConsumableItemSheet.value !== null
    )
  })

  const web9cscanUrl = computed(() => dataConfig.value[0]['9cscanUrl'])
  const apiRest9cscan = computed(() => dataConfig.value[0]['rpcEndpoints']['9cscan.rest'][0])
  const planetId = computed(() => dataConfig.value[0]['id'])
  // // eslint-disable-next-line no-unused-vars
  // watch(selectedPlanetDelay, (newValue, oldValue) => {
  //   console.log(`Mới ${newValue} và cữ ${oldValue}`)
  //   if (sessionStorageSheet.value[`GameConfigSheet_${newValue}`])
  //     dataGameConfigSheet.value = sessionStorageSheet.value[`GameConfigSheet_${newValue}`]
  //   else executeGameConfigSheet()
  //   if (sessionStorageSheet.value[`ArenaSheet_${newValue}`])
  //     dataArenaSheet.value = sessionStorageSheet.value[`ArenaSheet_${newValue}`]
  //   else executeArenaSheet()
  // })

  const urlMergeArena = computed(() => API_URL_MERGE_ARENA[selectedPlanet.value])
  const userAvatar = ref('')
  const avatarAddress = computed(() => (userAvatar.value !== null ? userAvatar.value.trim() : null))
  const urlRest9cscan = computed(() => `${apiRest9cscan.value}/account?avatar=${avatarAddress.value}`)
  const { data: dataPortraitId } = useFetch(urlMergeArena, { refetch: true }).json().get()
  const { data: dataFromRest9cscan } = useFetch(urlRest9cscan, { refetch: true }, {
    afterFetch(ctx) {
      if (ctx.data.error !== undefined) ctx.data = []
      return ctx
    }
  }).json().get()
  const my_portraitId = computed(() => getPortraitId(avatarAddress.value, dataPortraitId.value, dataFromRest9cscan.value))
  return {
    dataConfig,
    dataMainConfig, errorMainConfig, isFetchingMainConfig,
    dataGameConfigSheet, errorGameConfigSheet, isFetchingGameConfigSheet,
    dataArenaSheet, errorArenaSheet, isFetchingArenaSheet,
    dataItemNameSheet, errorItemNameSheet, isFetchingItemNameSheet,
    dataSkillSheet, errorSkillSheet, isFetchingSkillSheet,
    dataSkillNameSheet, errorSkillNameSheet, isFetchingSkillNameSheet,
    dataItemRequirementSheet, errorItemRequirementSheet, isFetchingItemRequirementSheet,
    dataCostumeStatSheet, errorCostumeStatSheet, isFetchingCostumeStatSheet,
    dataRuneOptionSheet, errorRuneOptionSheet, isFetchingRuneOptionSheet,
    dataConsumableItemSheet, errorConsumableItemSheet, isFetchingConsumableItemSheet,
    dataMimirSheet, errorMimirSheet, isFetchingMimirSheet,
    dataBanner, errorBanner, isFetchingBanner,
    isFetching, hasError,
    selectedPlanet, selectedNode, selectedNode_arena, changeNode,
    web9cscanUrl, apiRest9cscan, planetId,
    urlGameConfigSheet, nameGameConfigSheet,
    urlArenaSheet, nameArenaSheet,
    urlItemNameSheet, nameItemNameSheet,
    urlSkillSheet, nameSkillSheet,
    urlSkillNameSheet, nameSkillNameSheet,
    urlItemRequirementSheet, nameItemRequirementSheet,
    urlCostumeStatSheet, nameCostumeStatSheet,
    urlRuneOptionSheet, nameRuneOptionSheet,
    urlConsumableItemSheet, nameConsumableItemSheet,
    urlMimirGraphql, dataGetAllSheet,
    userAvatar, dataPortraitId, dataFromRest9cscan, my_portraitId
  }
})
