import { defineStore } from 'pinia'
import { useFetch, useStorage, refDebounced } from '@vueuse/core'
import {
  URL_CONFIG_URL_ALL_PLANET,
  CONFIG_URL_ALL_PLANET,
  URL_API_MIMIR,
  LINK_BANNER
} from '@/utilities/constants'
import { ref, computed } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import Papa from 'papaparse'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
export const useConfigURLStore = defineStore('configURLStore', () => {
  const useWebSocketBlock = useWebSocketBlockStore()
  const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())
  // Tạo độ trễ, giúp ngăn lỗi khi web sử dụng lại server Heimdall, việc đổi ngay lập tức Odin - > Heimdall khiến csv ko fecth kịp
  const selectedPlanetDelay = refDebounced(computed(() => useWebSocketBlock.selectedPlanet.toLowerCase()), 5000)

  const sessionStorageSheet = useStorage('sheet-csv', {}, sessionStorage)
  const useApi = (url) => {
    return useFetch(url, { refetch: true }).get().json()
  }
  const getSheet = (url, nameSheet) => {
    return useFetch(
      url,
      { refetch: true },
      {
        beforeFetch({ cancel, options }) {
          if (sessionStorageSheet.value[nameSheet.value]) {
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
          Papa.parse(ctx.data, {
            complete: function (results) {
              ctx.data = results.data
            }
          })
          sessionStorageSheet.value[nameSheet.value] = ctx.data
          return ctx
        }
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
  const urlArenaSheet = computed(() => `${URL_API_MIMIR}/${selectedPlanetDelay.value}/sheets/ArenaSheet`)

  const nameArenaSheet = computed(() => `ArenaSheet_${selectedPlanetDelay.value}`)
  // GameConfigSheet
  const {
    data: dataGameConfigSheet,
    error: errorGameConfigSheet,
    isFetching: isFetchingGameConfigSheet,
    // execute: executeGameConfigSheet
  } = getSheet(
    urlGameConfigSheet, nameGameConfigSheet
  )



  // ArenaSheet
  const {
    data: dataArenaSheet,
    error: errorArenaSheet,
    isFetching: isFetchingArenaSheet,
    // execute: executeArenaSheet
  } = getSheet(
    urlArenaSheet, nameArenaSheet
  )

  function getAllSheet() {
    if (sessionStorageSheet.value[nameGameConfigSheet.value])
      dataGameConfigSheet.value = sessionStorageSheet.value[nameGameConfigSheet.value]
    if (sessionStorageSheet.value[nameArenaSheet.value])
      dataArenaSheet.value = sessionStorageSheet.value[nameArenaSheet.value]
  }
  // watchEffect(() => {
  //   getAllSheet()
  // })
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
  // Tự chọn node đầu sau khi đổi server
  // selectedNode.value = dataConfig.value[0]['rpcEndpoints']['headless.gql'][0]

  function changeNode(newNode) {
    selectedNode.value = newNode
  }
  const isFetching = computed(
    () => isFetchingMainConfig.value ||
      isFetchingGameConfigSheet.value ||
      isFetchingBanner.value ||
      isFetchingArenaSheet.value
  )
  const hasError = computed(() => {
    return (
      errorMainConfig.value !== null ||
      errorGameConfigSheet.value !== null ||
      errorBanner.value !== null ||
      errorArenaSheet.value !== null
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

  return {
    dataConfig,
    dataMainConfig, errorMainConfig, isFetchingMainConfig,
    dataGameConfigSheet, errorGameConfigSheet, isFetchingGameConfigSheet,
    dataArenaSheet, errorArenaSheet, isFetchingArenaSheet,
    dataBanner, errorBanner, isFetchingBanner,
    isFetching, hasError,
    selectedPlanet, selectedNode, changeNode,
    web9cscanUrl, apiRest9cscan, planetId,
    urlGameConfigSheet, nameGameConfigSheet, urlArenaSheet, nameArenaSheet
  }
})
