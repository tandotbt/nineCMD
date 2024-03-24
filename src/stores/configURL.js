import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { URL_CONFIG_URL_ALL_PLANET, CONFIG_URL_ALL_PLANET, API_NINECMD, LINK_BANNER } from '@/utilities/constants'
import { ref, computed } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import { useI18n } from 'vue-i18n'
import Papa from 'papaparse'
export const useConfigURLStore = defineStore('configURLStore', () => {
    const useWebSocketBlock = useWebSocketBlockStore()
    const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())
    const { locale } = useI18n()

    const useApi = (url) => {
        return useFetch(url, { refetch: true }).get().json()
    }
    const getSheet = (url) => {
        return useFetch(url, { refetch: true }, {
            afterFetch(ctx) {
                Papa.parse(ctx.data, {
                    complete: function (results) {
                        ctx.data = results.data
                    }
                });
                return ctx;
            },
        }).get()
    }

    const getBanner = (url) => {
        return useFetch(url, { refetch: true }, {
            afterFetch(ctx) {
                ctx.data = ctx.data.Banners !== null ? ctx.data.Banners : []

                const currentDate = new Date();

                ctx.data = ctx.data.filter(item => {
                    // Nếu cả hai giá trị BeginDateTime và EndDateTime đều rỗng, chọn ngay lập tức
                    if (!item.BeginDateTime && !item.EndDateTime) {
                        return true;
                    }
                    // Nếu BeginDateTime rỗng và EndDateTime có giá trị, kiểm tra xem EndDateTime có quá hạn chưa
                    if (!item.BeginDateTime && item.EndDateTime) {
                        return new Date(item.EndDateTime) > currentDate;
                    }
                    // Nếu cả hai giá trị không rỗng, kiểm tra xem ngày hiện tại nằm trong khoảng thời gian được chỉ định
                    return new Date(item.BeginDateTime) <= currentDate && new Date(item.EndDateTime) >= currentDate;
                });

                return ctx;
            },
            onFetchError(ctx) {
                // ctx.data can be null when 5xx response
                if (ctx.data === null)
                    ctx.data = []
                return ctx
            }
        }).get().json()
    }

    const { data: dataMainConfig, error: errorMainConfig, isFetching: isFetchingMainConfig } = useApi(URL_CONFIG_URL_ALL_PLANET)
    const { data: dataGameConfigSheet, error: errorGameConfigSheet, isFetching: isFetchingGameConfigSheet } = getSheet(`${API_NINECMD}/get9cBoardCSV?network=${selectedPlanet.value}&csv=GameConfigSheet&locale=${locale.value}`)
    const { data: dataBanner, error: errorBanner, isFetching: isFetchingBanner } = getBanner(LINK_BANNER)

    const dataConfig = computed(() => {
        if (dataMainConfig.value !== null && errorMainConfig.value == null) {
            return dataMainConfig.value.filter(item => item.name === selectedPlanet.value)
        }
        return CONFIG_URL_ALL_PLANET.filter(item => item.name === selectedPlanet.value)
    }
    )

    const selectedNode = ref(null)
    // Tự chọn node đầu sau khi đổi server

    selectedNode.value = dataConfig.value[0]['rpcEndpoints']['headless.gql'][0]
    function changeNode(newNode) {
        selectedNode.value = newNode
    }
    const isFetching = computed(() => isFetchingMainConfig.value || isFetchingGameConfigSheet.value || isFetchingBanner.value)
    const hasError = computed(() => {
        return errorMainConfig.value !== null || errorGameConfigSheet.value !== null || errorBanner.value !== null
    });

    return {
        dataConfig,
        dataMainConfig, errorMainConfig, isFetchingMainConfig,
        dataGameConfigSheet, errorGameConfigSheet, isFetchingGameConfigSheet,
        dataBanner, errorBanner, isFetchingBanner,
        isFetching, hasError,
        selectedPlanet,
        selectedNode,
        changeNode
    }

})
