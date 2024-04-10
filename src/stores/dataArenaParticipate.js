import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { API_NINE_CHRONICLES, CONFIG_URL_ALL_PLANET, API_URL_PROXY } from '@/utilities/constants'
import { computed, ref } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import { useConfigURLStore } from './configURL'
export const useDataArenaParticipateStore = defineStore('dataArenaParticipateStore', () => {
  const useWebSocketBlock = useWebSocketBlockStore()
  const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())
  // Hàm lấy agent hoặc avatar khi biết cái còn lại
  const isUseAvatartLogin = ref(false)
  const useConfigURL = useConfigURLStore()
  const urlRest9cscan = computed(() => useConfigURL.apiRest9cscan)
  const path9cscanRest = computed(() =>
    isUseAvatartLogin.value ? '/account?avatar=' : '/account?address='
  )
  const address = ref(null)
  const isUseAvatartLoginOK = ref(false)

  const urlFindAgentAddress = computed(() => {
    if (isUseAvatartLogin.value && isUseAvatartLoginOK.value) {
      return `${urlRest9cscan.value}${path9cscanRest.value}${address.value}`
    } else {
      return null
    }
  })

  // Cách lấy cũ
  // const useApiAvatar = (url) => {
  //     return useFetch(url, { refetch: true }, {
  //         afterFetch(ctx) {

  //             ctx.data = ctx.data.map(obj => {
  //                 // Kiểm tra xem object có chứa key "avatarName" không
  //                 if (Object.keys(obj).includes("avatarName")) {
  //                     // Tạo một object mới với key "avatarname" và giá trị là giống với key "avatarName"
  //                     return {
  //                         ...obj,
  //                         avataraddress: obj.avatarAddress,
  //                         avatarname: obj.avatarName,
  //                         // Xóa key "avatarName" nếu muốn loại bỏ key cũ
  //                         // avatarName: undefined,
  //                         // Bạn cũng có thể giữ nguyên key "avatarName" nếu muốn
  //                     };
  //                 }
  //                 // Trả về object ban đầu nếu không có key "avatarName"
  //                 return obj;
  //             })

  //             return ctx
  //         }, updateDataOnError: true,
  //         onFetchError(ctx) {
  //             // ctx.data can be null when 5xx response
  //             if (ctx.data === null)
  //                 ctx.data = []

  //             ctx.error = new Error('Mảng rỗng')
  //             return ctx
  //         }
  //     }).get().json()
  // }
  // const urlArenaParticipate = computed(() => {
  //     if (!isUseAvatartLogin.value && isUseAvatartLoginOK.value) {
  //         return `${urlRest9cscan.value}${path9cscanRest.value}${address.value}`
  //     } else if (isUseAvatartLogin.value && !isUseAvatartLoginOK.value) {
  //         return URL_NINE_CHRONICLES_SERVE.find(item => item.planet.toLowerCase() === selectedPlanet.value).arenaParticipate
  //     } else return null
  // })
  // Lấy avatar address mới bằng nine-chronicles
  const useApiAvatar = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        // Bỏ qua url có null
        beforeFetch({ url, cancel }) {
          if (url === null) cancel()
          if (url.includes('null')) cancel()
          return url
        },
        afterFetch(ctx) {
          // Chỉ xử lý khi dùng avatar address và dùng link nine-chronicles
          if (isUseAvatartLogin.value) {
            ctx.data = ctx.data.ranks.map((obj) => {
              return {
                ...obj,
                avataraddress: obj.AvatarAddress,
                avatarname: obj.Name
              }
            })
          } else {
            ctx.data = ctx.data.map((obj) => {
              // Kiểm tra xem object có chứa key "avatarName" không
              if (Object.keys(obj).includes('avatarName')) {
                // Tạo một object mới với key "avatarname" và giá trị là giống với key "avatarName"
                return {
                  ...obj,
                  avataraddress: obj.avatarAddress,
                  avatarname: obj.avatarName
                  // Xóa key "avatarName" nếu muốn loại bỏ key cũ
                  // avatarName: undefined,
                  // Bạn cũng có thể giữ nguyên key "avatarName" nếu muốn
                }
              }
              // Trả về object ban đầu nếu không có key "avatarName"
              return obj
            })
          }

          return ctx
        },
        updateDataOnError: true,
        onFetchError(ctx) {
          // ctx.data can be null when 5xx response
          if (ctx.data === null) ctx.data = []
          else if (isUseAvatartLogin.value) {
            ctx.data = ctx.data.ranks.map((obj) => {
              return {
                ...obj,
                avataraddress: obj.AvatarAddress,
                avatarname: obj.Name
              }
            })
          } else {
            ctx.data = ctx.data.map((obj) => {
              // Kiểm tra xem object có chứa key "avatarName" không
              if (Object.keys(obj).includes('avatarName')) {
                // Tạo một object mới với key "avatarname" và giá trị là giống với key "avatarName"
                return {
                  ...obj,
                  avataraddress: obj.avatarAddress,
                  avatarname: obj.avatarName
                  // Xóa key "avatarName" nếu muốn loại bỏ key cũ
                  // avatarName: undefined,
                  // Bạn cũng có thể giữ nguyên key "avatarName" nếu muốn
                }
              }
              // Trả về object ban đầu nếu không có key "avatarName"
              return obj
            })
          }
          ctx.error = new Error('Xử lý lỗi không xác định "[object DOMException]"')
          return ctx
        }
      }
    )
      .get()
      .json()
  }

  const getSeason = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        afterFetch(ctx) {
          // chuyển text sang url ghép luôn
          ctx.data = encodeURIComponent(ctx.data[0])
          return ctx
        },
        updateDataOnError: true,
        onFetchError(ctx) {
          // ctx.data can be null when 5xx response
          if (ctx.data === null)
            ctx.data =
              selectedPlanet.value === 'odin'
                ? encodeURIComponent('Season 19')
                : encodeURIComponent('Season 1')

          ctx.error = new Error('Tự chọn season có sẵn')
          return ctx
        }
      }
    )
      .json()
      .get()
  }
  const idPlanetNow = computed(
    () => CONFIG_URL_ALL_PLANET.find((item) => item.name.toLowerCase() === selectedPlanet.value).id
  )
  const urlGetSeason = computed(
    () =>
      API_URL_PROXY +
      encodeURIComponent(`${API_NINE_CHRONICLES}/arena/season?planetId=${idPlanetNow.value}`)
  )
  const { data: dataGetSeason } = getSeason(urlGetSeason)
  const urlArenaParticipate = computed(() => {
    if (!isUseAvatartLogin.value) {
      return `${urlRest9cscan.value}${path9cscanRest.value}${address.value}`
    } else if (isUseAvatartLogin.value) {
      return (
        API_URL_PROXY +
        encodeURIComponent(
          `${API_NINE_CHRONICLES}/arena?planetId=${idPlanetNow.value}&season=${dataGetSeason.value}&userSet=1`
        )
      )
    } else return null
  })

  const useApiAgent = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        // Bỏ qua url có null
        beforeFetch({ url, cancel }) {
          if (url === null) return cancel()
          if (url.includes('null')) return cancel()
          return url
        },
        afterFetch(ctx) {
          ctx.data = ctx.data[0].address
          return ctx
        }
      }
    )
      .get()
      .json()
  }

  const {
    data: listAvatar,
    error: errorListAvatar,
    isFetching: isFetchingListAvatar
  } = useApiAvatar(urlArenaParticipate)
  const {
    data: agentFinded,
    error: errorAgentFinded,
    isFetching: isFetchingAgentFinded
  } = useApiAgent(urlFindAgentAddress)

  return {
    isUseAvatartLogin,
    isUseAvatartLoginOK,
    urlArenaParticipate,
    isFetchingListAvatar,
    listAvatar,
    errorListAvatar,
    agentFinded,
    errorAgentFinded,
    isFetchingAgentFinded,
    selectedPlanet,
    urlRest9cscan,
    path9cscanRest,
    address
  }
})
