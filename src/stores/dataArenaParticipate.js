import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { URL_NINE_CHRONICLES_SERVE } from '@/utilities/constants'
import { computed, ref } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import { useConfigURLStore } from './configURL'
export const useDataArenaParticipateStore = defineStore('dataArenaParticipateStore', () => {

    const useWebSocketBlock = useWebSocketBlockStore()
    const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())
    // Hàm lấy agent hoặc avatar khi biết cái còn lại
    const isUseAvatartLogin = ref(false)
    const useConfigURL = useConfigURLStore()
    const urlRest9cscan = computed(() => useConfigURL.dataConfig[0]['rpcEndpoints']['9cscan.rest'][0])
    const path9cscanRest = computed(() => isUseAvatartLogin.value ? "/account?avatar=" : "/account?address=")
    const address = ref(null)
    const isUseAvatartLoginOK = ref(false)

    const urlArenaParticipate = computed(() => {
        if (!isUseAvatartLogin.value && isUseAvatartLoginOK.value) {
            return `${urlRest9cscan.value}${path9cscanRest.value}${address.value}`
        } else if (isUseAvatartLogin.value && !isUseAvatartLoginOK.value) {
            return URL_NINE_CHRONICLES_SERVE.find(item => item.planet.toLowerCase() === selectedPlanet.value).arenaParticipate
        } else return null
    }
    )

    const urlFindAgentAddress = computed(() => {
        if (isUseAvatartLogin.value && isUseAvatartLoginOK.value) {
            return `${urlRest9cscan.value}${path9cscanRest.value}${address.value}`
        } else {
            return null
        }
    })

    const useApiAvatar = (url) => {
        return useFetch(url, { refetch: true }, {
            afterFetch(ctx) {
                ctx.data = ctx.data.map(obj => {
                    // Kiểm tra xem object có chứa key "avatarName" không
                    if (Object.keys(obj).includes("avatarName")) {
                        // Tạo một object mới với key "avatarname" và giá trị là giống với key "avatarName"
                        return {
                            ...obj,
                            avataraddress: obj.avatarAddress,
                            avatarname: obj.avatarName,
                            // Xóa key "avatarName" nếu muốn loại bỏ key cũ
                            // avatarName: undefined,
                            // Bạn cũng có thể giữ nguyên key "avatarName" nếu muốn
                        };
                    }
                    // Trả về object ban đầu nếu không có key "avatarName"
                    return obj;
                })
                return ctx
            },
        }).get().json()
    }

    const useApiAgent = (url) => {
        return useFetch(url, { refetch: true }, {
            afterFetch(ctx) {
                ctx.data = ctx.data[0].address
                return ctx
            },
        }).get().json()
    }


    const { data: listAvatar, error: errorListAvatar, isFetching: isFetchingListAvatar } = useApiAvatar(urlArenaParticipate)
    const { data: agentFinded, error: errorAgentFinded, isFetching: isFetchingAgentFinded } = useApiAgent(urlFindAgentAddress)

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
