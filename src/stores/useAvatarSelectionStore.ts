/**
 * @file stores/useAvatarSelectionStore.ts
 * @description Pinia store for discovering avatars via Nine Chronicles Arena API.
 */

import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useFetch } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { useApiStore } from './useApiStore'
import { resolvePortraitUrl } from '@/logic/character'
import { usePlanetStore } from './usePlanetStore'
import { CHARACTER_LOGIC_CONSTANTS } from '@/constants'
import type { CharacterSuggestion, ArenaRanking } from '@/types/character'

export const useAvatarSelectionStore = defineStore('avatarSelection', () => {
  const apiStore = useApiStore()
  const planetStore = usePlanetStore()

  /**
   * Helper to proxy a URL through the 9cmd API.
   */
  const proxyUrl = (url: string) => {
    return `${apiStore.api9CmdUrl}/get-proxy?url=${encodeURIComponent(url)}`
  }

  /**
   * Fetch the current arena season for the active planet.
   */
  const urlGetSeason = computed(() => {
    const planetId = planetStore.currentPlanetId
    if (!planetId) return null
    return proxyUrl(`${apiStore.nineChroniclesApiUrl}/arena/season?planetId=${planetId}`)
  })

  const {
    data: rawSeasonData,
    isFetching: fetchingSeason,
    execute: executeFetchSeason,
  } = useFetch(urlGetSeason as MaybeRefOrGetter<string>, {
    refetch: true,
    immediate: false,
    beforeFetch({ url, cancel }) {
      if (!url || url.includes('null')) cancel()
    },
  }).json()

  const currentSeasonName = computed<string>(() => {
    if (
      rawSeasonData.value &&
      Array.isArray(rawSeasonData.value) &&
      rawSeasonData.value.length > 0
    ) {
      return rawSeasonData.value[0]
    }
    // Fallback to constants if API fails or returns empty
    const planetName = planetStore.currentPlanetName
    return (
      CHARACTER_LOGIC_CONSTANTS.ARENA.FIRST_SEASON[
        planetName as keyof typeof CHARACTER_LOGIC_CONSTANTS.ARENA.FIRST_SEASON
      ] || ''
    )
  })

  /**
   * Fetch avatars (rankings) for the current season.
   */
  const urlGetAvatars = computed(() => {
    if (!currentSeasonName.value) return null
    const planetId = planetStore.currentPlanetId
    return proxyUrl(
      `${apiStore.nineChroniclesApiUrl}/arena?planetId=${planetId}&season=${encodeURIComponent(currentSeasonName.value)}&userSet=1`,
    )
  })

  const {
    data: rawAvatarData,
    isFetching: fetchingAvatars,
    error: fetchError,
    execute: executeFetchAvatars,
  } = useFetch(urlGetAvatars as MaybeRefOrGetter<string>, {
    refetch: true,
    immediate: false,
    beforeFetch({ url, cancel }) {
      if (!url || url.includes('null')) cancel()
    },
    afterFetch(ctx) {
      // Map Nine Chronicles API fields to our internal CharacterSuggestion format
      // The API returns an object with a 'ranks' property
      const source = (ctx.data?.ranks || ctx.data) as ArenaRanking[]
      if (Array.isArray(source)) {
        ctx.data = source.map(
          (item: ArenaRanking): CharacterSuggestion => ({
            address: item.AvatarAddress,
            name: item.Name,
            level: item.AvatarLevel || item.Level || 0,
            planet: planetStore.currentPlanetName,
            agentAddress: item.AgentAddress || '',
            portraitUrl: resolvePortraitUrl(item.PortraitId || 10200000),
          }),
        )
      } else {
        ctx.data = []
      }
      return ctx
    },
    onFetchError(ctx) {
      if (ctx.data === null) ctx.data = []
      return ctx
    },
  }).json()

  const discoveredAvatars = computed<CharacterSuggestion[]>(() => {
    return Array.isArray(rawAvatarData.value) ? rawAvatarData.value : []
  })

  /**
   * Watch for planet changes to clear data and refetch.
   */
  watch(
    () => planetStore.currentPlanetId,
    () => {
      // Clear data to prevent selecting wrong avatar for new planet
      if (rawSeasonData.value) rawSeasonData.value = null
      if (rawAvatarData.value) rawAvatarData.value = null
      if (urlGetSeason.value) {
        executeFetchSeason()
      }
    },
    { immediate: true },
  )

  /**
   * Watch for season changes to refetch avatars.
   */
  watch(currentSeasonName, (name) => {
    if (name && urlGetAvatars.value) {
      executeFetchAvatars()
    }
  })

  return {
    discoveredAvatars,
    currentSeasonName,
    isLoading: computed(() => fetchingSeason.value || fetchingAvatars.value),
    isFetching: computed(() => fetchingSeason.value || fetchingAvatars.value),
    error: computed(() => (fetchError.value ? 'fetch_failed' : null)),
  }
})
