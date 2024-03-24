import { defineStore } from 'pinia'
import { useWebSocket } from '@/utilities/websocket'
import { ref, computed } from 'vue'
import { AVG_BLOCK, AVG_TRANS, URL_NINE_CHRONICLES_SERVE } from '@/utilities/constants'
import convertToSeconds from '@/utilities/convertToSeconds'
import { useDataArenaParticipateStore } from './dataArenaParticipate'

export const useWebSocketBlockStore = defineStore('webSocketBlockStore', () => {

  const dataWSS_Odin = ref(null)
  const dataWSS_Heimdall = ref(null)
  const dataWSSList_Odin = ref([])
  const dataWSSList_Heimdall = ref([])

  const selectedPlanet = ref('Odin')
  const selectedWss = ref('wss://j3u7e1snee.execute-api.ap-northeast-2.amazonaws.com/production')

  function createWebSocket(planet, dataWSS, dataWSSList) {
    function addData(newData) {
      const jsonData = JSON.parse(newData)
      dataWSSList.value.push(jsonData)
      dataWSS.value = newData
    }
    useWebSocket(URL_NINE_CHRONICLES_SERVE.find(item => item.planet === planet).wss, addData)
  }

  const webSocket_Odin = createWebSocket('Odin', dataWSS_Odin, dataWSSList_Odin)
  const webSocket_Heimdall = createWebSocket('Heimdall', dataWSS_Heimdall, dataWSSList_Heimdall)

  function changePlanet(newPlanet) {
    selectedPlanet.value = newPlanet
    selectedWss.value = URL_NINE_CHRONICLES_SERVE.find(item => item.planet === newPlanet).wss
    // Đưa về false để nhận danh sách avatar lại theo season mới
    useDataArenaParticipateStore().isUseAvatartLogin = false
  }

  const calculateAVG = computed(() => {
    const item = selectedPlanet.value === 'Odin' ? dataWSSList_Odin.value : dataWSSList_Heimdall.value
    let dataBlocks;
    if (selectedPlanet.value === 'Odin' && dataWSS_Odin.value !== null) {
      dataBlocks = JSON.parse(dataWSS_Odin.value);
    } else if (selectedPlanet.value === 'Heimdall' && dataWSS_Heimdall.value !== null) {
      dataBlocks = JSON.parse(dataWSS_Heimdall.value);
    } else {
      dataBlocks = null
    }
    let blockNow = dataBlocks !== null ? parseFloat(dataBlocks.index.N) : 0
    let avgBlockNow = AVG_BLOCK
    let avgTransNow = AVG_TRANS
    if (item.length < 2) return { blockNow, avgBlockNow, avgTransNow }

    const transactionCounts = item.map(item => item.transactionCount.N)
    const updateTimes = item.map(item => item.updateTime.S)
    const timestamps = item.map(item => item.timestamp.S)

    const mergedData = transactionCounts.map((trans, index) => ({
      trans: Number(trans),
      updateTime: convertToSeconds(updateTimes[index]),
      timestamp: convertToSeconds(timestamps[index]),
      updateTimeNext: convertToSeconds(updateTimes[index + 1]),
      timestampNext: convertToSeconds(timestamps[index + 1]),
    }))

    const last100Items = mergedData.slice(-100)
    avgTransNow = parseFloat((last100Items.reduce((sum, item) => sum + item.trans, 0) / last100Items.length).toFixed(2))
    avgBlockNow = parseFloat((last100Items.reduce((sum, item) => sum + (item.updateTimeNext - item.updateTime), 0) / last100Items.length).toFixed(2))
    return { blockNow, avgBlockNow, avgTransNow }
  })

  return {
    webSocket_Odin,
    dataWSSList_Odin,
    webSocket_Heimdall,
    dataWSSList_Heimdall,
    selectedPlanet,
    selectedWss,
    calculateAVG,
    changePlanet
  }
})
