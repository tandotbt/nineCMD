import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { URL_CONFIG_URL_ALL_PLANET, CONFIG_URL_ALL_PLANET } from '@/utilities/constants'
import { ref, computed } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'

export const useConfigURLStore = defineStore('configURLStore', () => {

    const useWebSocketBlock = useWebSocketBlockStore()
    const selectedPlanet = computed(() => useWebSocketBlock.selectedPlanet.toLowerCase())

    const url = ref(URL_CONFIG_URL_ALL_PLANET)
    // const url = ref("https://httpbin.org/delay/10")
    const useApi = () => {
        return useFetch(url, { refetch: true }).get().json()
    }
    const { data, error, isFetching } = useApi()
    const dataConfig = computed(() => {
        if (isFetching) {
            return CONFIG_URL_ALL_PLANET.filter(item => item.name === selectedPlanet.value)
        } else if (data !== null && error === null) {
            return data.filter(item => item.name === selectedPlanet.value)
        } else return CONFIG_URL_ALL_PLANET.filter(item => item.name === selectedPlanet.value)
    }
    )
    const selectedNode = ref(null)
    // Tự chọn node đầu sau khi đổi server
    selectedNode.value = dataConfig.value[0]['rpcEndpoints']['headless.gql'][0]
    function changeNode(newNode) {
        selectedNode.value = newNode
    }
    return { url, dataConfig, isFetching, data, selectedPlanet, selectedNode, changeNode }

})
