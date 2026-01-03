/**
 * @file stores/useBlockStore.ts
 * @description Pinia store for global block state management.
 * Integrates with BlockManager for offline support and real-time updates.
 * Uses Dexie for persistent storage accessible by Service Worker.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFetch, useOnline, useWebNotification } from '@vueuse/core'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import type { Observable } from 'rxjs'
import { i18n } from '../i18n'
import { BlockManager } from '../core/BlockManager'
import { API_URLS, BLOCK_CONFIG, STORAGE_KEYS } from '../constants'
import { db } from '../db'
import type { Block, GetBlocksResponse } from '../types/block'

export const useBlockStore = defineStore('block', () => {
  const isOnline = useOnline()
  const isFetching = ref(false)
  const error = ref<string | null>(null)

  // Persistence via Dexie liveQuery
  const blocks = useObservable(
    liveQuery(() =>
      db.blocks.orderBy('object.index').reverse().limit(BLOCK_CONFIG.MAX_BLOCKS_CACHE).toArray(),
    ) as unknown as Observable<Block[]>,
    { initialValue: [] as Block[] },
  )

  const startBlockIndex = useObservable(
    liveQuery(async () => {
      const setting = await db.settings.get(STORAGE_KEYS.NOTIF_START_BLOCK)
      return (setting?.value as number) ?? null
    }) as unknown as Observable<number | null>,
    { initialValue: null as number | null },
  )

  const notificationThreshold = useObservable(
    liveQuery(async () => {
      const setting = await db.settings.get(STORAGE_KEYS.NOTIF_THRESHOLD)
      return (setting?.value as number) ?? BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD
    }) as unknown as Observable<number>,
    { initialValue: BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD as number },
  )

  const {
    isSupported: isNotificationSupported,
    show: showWebNotification,
    ensurePermissions,
  } = useWebNotification()

  // TODO: Review potential race condition between UI and Service Worker DB updates
  // Initialize BlockManager with a callback to update DB
  const blockManager = new BlockManager(async (block) => {
    await db.blocks.put(block)
    checkNotificationThreshold(block.object.index)
  }, blocks.value || [])

  const checkNotificationThreshold = (currentIndex: number) => {
    const startIndex = startBlockIndex.value
    const threshold = notificationThreshold.value ?? BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD

    if (startIndex !== null && startIndex !== undefined) {
      const diff = currentIndex - startIndex
      if (diff >= threshold) {
        if (isNotificationSupported.value) {
          showWebNotification({
            title: i18n.global.t('store_notif_title'),
            body: i18n.global.t('store_notif_body', { n: diff }),
            icon: '/icon/favicon.ico',
          })
        }
        // Reset after notification
        db.settings.put({ key: STORAGE_KEYS.NOTIF_START_BLOCK, value: null })
      }
    }
  }

  const setNotificationMarker = async () => {
    const latest = blocks.value?.[0]
    if (latest) {
      await db.settings.put({ key: STORAGE_KEYS.NOTIF_START_BLOCK, value: latest.object.index })
      ensurePermissions()
    }
  }

  const blockNow = computed(() => blocks.value?.[0]?.object.index ?? -1)
  const blocksTracked = computed(() => blocks.value?.length ?? 0)

  const averageBlockTimeMs = computed(() => {
    if (!blocks.value || blocks.value.length < 2) return BLOCK_CONFIG.DEFAULT_AVERAGE_BLOCK_TIME_MS
    return blockManager.getAverageBlockTime()
  })

  // TODO: Implement rate limiting for manual fetch actions
  const fetchLatestBlock = async () => {
    if (!isOnline.value) return

    isFetching.value = true
    error.value = null

    try {
      const query = `
        query GetLatestBlock {
          blocks(skip: 0, take: 1) {
            items {
              id
              object {
                hash
                index
                miner
                stateRootHash
                timestamp
                txCount
              }
            }
          }
        }
      `

      const { data, error: fetchError } = await useFetch(API_URLS.ODIN_MIMIR)
        .post({ query })
        .json<GetBlocksResponse>()

      if (fetchError.value) {
        throw new Error(fetchError.value)
      }

      const newBlock = data.value?.data.blocks.items[0]
      if (newBlock) {
        await blockManager.addRealBlock(newBlock)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : i18n.global.t('store_fetch_error')
      console.error('Block Store Fetch Error:', error.value)
    } finally {
      isFetching.value = false
    }
  }

  // Periodic fetch logic (Managed by App.vue or here, but now persistent via DB)
  let fetchInterval: ReturnType<typeof setInterval> | null = null

  const startAutoFetch = () => {
    if (fetchInterval) clearInterval(fetchInterval)
    fetchInterval = setInterval(fetchLatestBlock, BLOCK_CONFIG.FETCH_INTERVAL_MS)
    blockManager.setOnlineStatus(isOnline.value)
  }

  const stopAutoFetch = () => {
    if (fetchInterval) {
      clearInterval(fetchInterval)
      fetchInterval = null
    }
  }

  const clearAllBlocks = async () => {
    await db.blocks.clear()
    await db.settings.delete(STORAGE_KEYS.NOTIF_START_BLOCK)
  }

  // Sync online status and blocks with BlockManager
  import('vue').then(({ watch }) => {
    watch(isOnline, (online) => {
      blockManager.setOnlineStatus(online)
    })
    watch(
      () => blocks.value,
      (newBlocks) => {
        if (newBlocks) {
          blockManager.setBlocks(newBlocks)
        }
      },
      { deep: true },
    )
  })

  return {
    latestBlock: computed(() => blocks.value?.[0] || null),
    blocks: computed(() => blocks.value ?? []),
    blockNow,
    averageBlockTimeMs,
    isFetching,
    error,
    fetchLatestBlock,
    startAutoFetch,
    stopAutoFetch,
    clearAllBlocks,
    setNotificationMarker,
    startBlockIndex: computed(() => startBlockIndex.value ?? null),
    isNotificationSupported,
    notificationThreshold: computed({
      get: () => notificationThreshold.value ?? BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD,
      set: (val: number) => {
        db.settings.put({ key: STORAGE_KEYS.NOTIF_THRESHOLD, value: val })
      },
    }),
    blocksTracked,
  }
})
