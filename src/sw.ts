/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { db } from './db'
import { API_URLS, BLOCK_CONFIG, PWA_CONFIG, STORAGE_KEYS } from './constants'
import type { GetBlocksResponse } from './types/block'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

precacheAndRoute(self.__WB_MANIFEST)

const PERIODIC_SYNC_TAG = PWA_CONFIG.SW_TAG_BLOCK_FETCH

interface PeriodicSyncEvent extends Event {
  tag: string
  waitUntil(promise: Promise<void>): void
}

// Function to fetch and save block
async function fetchAndSaveBlock() {
  // TODO: Implement retry logic for API fetch in Service Worker
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

    const response = await fetch(API_URLS.ODIN_MIMIR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    const result: GetBlocksResponse = await response.json()
    const newBlock = result.data.blocks.items[0]

    if (newBlock) {
      // Check if this is a new block
      const lastBlock = await db.blocks.orderBy('object.index').last()
      if (!lastBlock || newBlock.object.index > lastBlock.object.index) {
        await db.blocks.put(newBlock)

        // Check for notifications
        const startBlockSetting = await db.settings.get(STORAGE_KEYS.NOTIF_START_BLOCK)
        const thresholdSetting = await db.settings.get(STORAGE_KEYS.NOTIF_THRESHOLD)

        const startBlock = (startBlockSetting?.value as number) ?? null
        const threshold =
          (thresholdSetting?.value as number) ?? BLOCK_CONFIG.DEFAULT_NOTIFICATION_THRESHOLD

        if (startBlock !== null) {
          const diff = newBlock.object.index - startBlock
          if (diff >= threshold) {
            self.registration.showNotification('Nine CMD: Threshold Reached!', {
              body: `Tracked ${diff} blocks. Target reached at #${newBlock.object.index}`,
              icon: '/icon/favicon.ico',
              badge: '/icon/favicon.ico',
            })
            await db.settings.put({ key: STORAGE_KEYS.NOTIF_START_BLOCK, value: null })
          }
        }
      }
    }
  } catch (error) {
    console.error('[SW] Fetch Error:', error)
  }
}

// Background Sync
self.addEventListener('periodicsync', (event: Event) => {
  const syncEvent = event as PeriodicSyncEvent
  if (syncEvent.tag === PERIODIC_SYNC_TAG) {
    // TODO: Consider adjusting periodic sync interval based on network type
    syncEvent.waitUntil(fetchAndSaveBlock())
  }
})

// Fallback message listener for manual triggers from UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FETCH_BLOCK') {
    fetchAndSaveBlock()
  }
})
