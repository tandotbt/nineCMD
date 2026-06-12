/**
 * Banner Tests – Kiểm tra bannerService + banner store
 *
 * Coverage:
 * 1. bannerService: buildBannerImageUrl, isBannerActive, filterActiveBanners, fetchBanners
 * 2. banner store: state, loadBanners, retry, clearData
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  buildBannerImageUrl,
  isBannerActive,
  filterActiveBanners,
  fetchBanners,
  transformBannerItem
} from '../utilities/bannerService'
import { useBannerStore } from '../stores/banner'
import { LINK_BANNER, URL_GITHUB_LIVEASSETS } from '@/utilities/constants'
import type { BannerItem } from '../types/i18nCsv'

// ============================================================
// Mock data
// ============================================================

const now = new Date('2025-06-15T12:00:00Z')
const pastDate = '2025-01-01T00:00:00Z'
const futureDate = '2099-12-31T00:00:00Z'

const mockEventJson = {
  Banners: [
    {
      BannerImageName: 'banner_active',
      BeginDateTime: '2020-01-01T00:00:00Z',
      EndDateTime: '2099-12-31T00:00:00Z',
      Description: 'Active banner (long range)'
    },
    {
      BannerImageName: 'banner_expired',
      BeginDateTime: '2020-01-01T00:00:00Z',
      EndDateTime: '2020-12-31T00:00:00Z',
      Description: 'Expired banner'
    },
    {
      BannerImageName: 'banner_no_dates',
      BeginDateTime: null,
      EndDateTime: null,
      Description: 'Always active'
    },
    {
      BannerImageName: 'banner_future',
      BeginDateTime: '2099-01-01T00:00:00Z',
      EndDateTime: '2099-12-31T00:00:00Z',
      Description: 'Future banner'
    }
  ]
}

/** Mock fetch response */
function mockFetchResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => body
  } as Response
}

// ============================================================
// bannerService Tests
// ============================================================

describe('bannerService', () => {
  describe('buildBannerImageUrl', () => {
    it('builds correct URL with .png extension', () => {
      const url = buildBannerImageUrl('banner_001')
      expect(url).toBe(`${URL_GITHUB_LIVEASSETS}/Assets/Images/Banner/banner_001.png`)
    })
  })

  describe('isBannerActive', () => {
    it('returns true when both dates empty', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: null,
        EndDateTime: null,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(true)
    })

    it('returns true when within date range', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: pastDate,
        EndDateTime: futureDate,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(true)
    })

    it('returns false when expired (EndDateTime < now)', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: '2020-01-01T00:00:00Z',
        EndDateTime: '2020-12-31T00:00:00Z',
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(false)
    })

    it('returns false when not yet started (BeginDateTime > now)', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: '2030-01-01T00:00:00Z',
        EndDateTime: '2030-12-31T00:00:00Z',
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(false)
    })

    it('returns true when only EndDateTime set and EndDateTime > now', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: null,
        EndDateTime: futureDate,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(true)
    })

    it('returns false when only EndDateTime set and EndDateTime < now', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: null,
        EndDateTime: pastDate,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(false)
    })

    it('returns true when only BeginDateTime set and BeginDateTime <= now', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: pastDate,
        EndDateTime: null,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(true)
    })

    it('returns false when only BeginDateTime set and BeginDateTime > now', () => {
      const banner: BannerItem = {
        BannerImageName: 'b',
        BeginDateTime: futureDate,
        EndDateTime: null,
        BannerImageUrl: ''
      }
      expect(isBannerActive(banner, now)).toBe(false)
    })
  })

  describe('filterActiveBanners', () => {
    it('keeps only active banners', () => {
      const banners: BannerItem[] = [
        { BannerImageName: 'active', BeginDateTime: pastDate, EndDateTime: futureDate, BannerImageUrl: '' },
        { BannerImageName: 'expired', BeginDateTime: '2020-01-01', EndDateTime: '2020-12-31', BannerImageUrl: '' },
        { BannerImageName: 'no_dates', BeginDateTime: null, EndDateTime: null, BannerImageUrl: '' },
        { BannerImageName: 'future', BeginDateTime: '2030-01-01', EndDateTime: '2030-12-31', BannerImageUrl: '' }
      ]

      const filtered = filterActiveBanners(banners, now)
      expect(filtered).toHaveLength(2)
      expect(filtered.map((b) => b.BannerImageName)).toEqual(['active', 'no_dates'])
    })
  })

  describe('transformBannerItem', () => {
    it('resolves BannerImageUrl from BannerImageName', () => {
      const raw = {
        BannerImageName: 'test_banner',
        BeginDateTime: pastDate,
        EndDateTime: futureDate,
        Description: 'test'
      }
      const result = transformBannerItem(raw)
      expect(result.BannerImageUrl).toBe(`${URL_GITHUB_LIVEASSETS}/Assets/Images/Banner/test_banner.png`)
    })

    it('normalizes empty dates to null', () => {
      const raw = {
        BannerImageName: 'test',
        BeginDateTime: '',
        EndDateTime: undefined
      }
      const result = transformBannerItem(raw)
      expect(result.BeginDateTime).toBeNull()
      expect(result.EndDateTime).toBeNull()
    })
  })

  describe('fetchBanners', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('fetches and returns active banners', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse(mockEventJson))

      const result = await fetchBanners()

      expect(result).toHaveLength(2)
      expect(result[0].BannerImageName).toBe('banner_active')
      expect(result[0].BannerImageUrl).toContain('banner_active.png')
      expect(result[1].BannerImageName).toBe('banner_no_dates')
    })

    it('uses correct URL', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse(mockEventJson))

      await fetchBanners()

      expect(fetchSpy).toHaveBeenCalledWith(
        LINK_BANNER,
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('throws on HTTP error', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse(null, false, 500))

      await expect(fetchBanners()).rejects.toThrow('Banner HTTP 500')
    })

    it('handles null Banners array', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse({ Banners: null }))

      const result = await fetchBanners()
      expect(result).toEqual([])
    })

    it('handles empty Banners array', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse({ Banners: [] }))

      const result = await fetchBanners()
      expect(result).toEqual([])
    })
  })
})

// ============================================================
// banner Store Tests
// ============================================================

describe('banner Store', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  // ============================================================
  // Initial State
  // ============================================================
  describe('initial state', () => {
    it('has correct default values', () => {
      const store = useBannerStore()
      expect(store.banners).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isLoaded).toBe(false)
      expect(store.lastFetchTime).toBe(0)
      expect(store.bannerCount).toBe(0)
      expect(store.hasBanners).toBe(false)
    })
  })

  // ============================================================
  // loadBanners
  // ============================================================
  describe('loadBanners', () => {
    it('loads and stores banners successfully', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse(mockEventJson))

      const store = useBannerStore()
      const result = await store.loadBanners()

      expect(result).toBe(true)
      expect(store.isLoaded).toBe(true)
      expect(store.bannerCount).toBe(2)
      expect(store.hasBanners).toBe(true)
      expect(store.banners[0].BannerImageName).toBe('banner_active')
      expect(store.lastFetchTime).toBeGreaterThan(0)
    })

    it('sets error on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const store = useBannerStore()
      const result = await store.loadBanners()

      expect(result).toBe(false)
      expect(store.error).toBe('Network error')
      expect(store.isLoaded).toBe(false)
    })

    it('handles empty Banners array', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse({ Banners: [] }))

      const store = useBannerStore()
      const result = await store.loadBanners()

      expect(result).toBe(true)
      expect(store.banners).toEqual([])
      expect(store.bannerCount).toBe(0)
      expect(store.hasBanners).toBe(false)
    })
  })

  // ============================================================
  // retry
  // ============================================================
  describe('retry', () => {
    it('calls loadBanners again', async () => {
      fetchSpy
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce(mockFetchResponse(mockEventJson))

      const store = useBannerStore()
      await store.loadBanners() // Fail
      expect(store.error).toBe('First fail')

      const result = await store.retry()
      expect(result).toBe(true)
      expect(store.error).toBeNull()
      expect(store.isLoaded).toBe(true)
    })
  })

  // ============================================================
  // clearData
  // ============================================================
  describe('clearData', () => {
    it('resets all state', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchResponse(mockEventJson))

      const store = useBannerStore()
      await store.loadBanners()

      store.clearData()

      expect(store.banners).toEqual([])
      expect(store.isLoaded).toBe(false)
      expect(store.lastFetchTime).toBe(0)
      expect(store.error).toBeNull()
    })
  })
})
