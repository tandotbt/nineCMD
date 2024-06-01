import { defineStore } from 'pinia'

import { CONFIG_GAME_CONFIG_SHEET, CONFIG_ARENA_SHEET } from '@/utilities/constants'
import { ref, computed } from 'vue'
import { useWebSocketBlockStore } from './webSocketBlock'
import { useConfigURLStore } from './configURL'
import checkHaveArena from '@/utilities/checkHaveArena.js'
export const useArenaSeasonStore = defineStore('arenaSeasonStore', () => {
  const useConfigURL = useConfigURLStore()
  const webSocketBlockStore = useWebSocketBlockStore()
  const ROUND_BLOCKS = computed(() =>
    useConfigURL.dataGameConfigSheet !== null
      ? useConfigURL.dataGameConfigSheet.find((item) => item[0] === 'daily_arena_interval')[1]
      : CONFIG_GAME_CONFIG_SHEET.daily_arena_interval
  )
  const arenaSheet = computed(() =>
    useConfigURL.dataArenaSheet !== null
      ? useConfigURL.dataArenaSheet
      : CONFIG_ARENA_SHEET[useConfigURL.selectedPlanet]
  )
  const seasonArenaInfo = computed(() =>
    checkHaveArena(webSocketBlockStore.calculateAVG.blockNow, arenaSheet.value, ROUND_BLOCKS.value, useConfigURL.selectedPlanet)
  )
  const seasonActiveNow = computed(
    () => seasonArenaInfo.value.filter((season) => season.active)[0]
  )

  const champIdActive = computed(
    () => seasonActiveNow.value.championshipId
  )
  const roundIdActive = computed(
    () => seasonActiveNow.value.roundId
  )
  const roundActive = computed(
    () => seasonActiveNow.value.nowRound
  )
  const seasonIndex = computed(
    () => seasonActiveNow.value.roundId - 1
  )
  const maxPurchaseCountActive = computed(
    () => seasonActiveNow.value.maxPurchaseCount
  )
  const maxPurchaseCountDuringIntervalActive = computed(
    () => seasonActiveNow.value.maxPurchaseCountDuringInterval
  )


  const champId = ref(0)
  const roundId = ref(0)
  const seasonPick = computed(() =>
    seasonArenaInfo.value.filter(
      (season) =>
        season.championshipId == champId.value && season.roundId == roundId.value
    )
  )
  const isActive = computed(() => (seasonPick.value.length == 1 ? seasonPick.value[0].active : false))


  const seasonNowData = computed(() => {
    if (seasonPick.value.length == 1) return seasonPick.value[0]
    else
      return {
        championshipId: 0,
        roundId: 0,
        titleArena: 'error',
        img: '/assets/medalArena/offSeason.png',
        blockToEndSeason: '8888/8888',
        statusSeason: 'error',
        percentageSeason: 100,
        startBlockIndex: 0,
        endBlockIndex: 1,
        active: true,
        totalRound: 0,
        nowRound: 0,
        blockEndRound: 0,
        maxPurchaseCount: 40,
        maxPurchaseCountDuringInterval: 8
      }
  })


  const isMergeListArena = ref(false)

  return {
    seasonArenaInfo, ROUND_BLOCKS, seasonIndex,
    isActive, champId, roundId, seasonNowData,
    seasonActiveNow, champIdActive, roundIdActive, roundActive, maxPurchaseCountActive, maxPurchaseCountDuringIntervalActive,
    isMergeListArena
  }
})
