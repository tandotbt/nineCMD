/**
 * CSV Fetcher Tests – Kiểm tra csvFetcher utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildCsvFetchUrl, fetchCsvFromApi } from '../utilities/csvFetcher'
// import type { CsvSheetName } from '../types/csvData'

describe('CSV Fetcher Utility', () => {
  // ============================================================
  // buildCsvFetchUrl
  // ============================================================
  describe('buildCsvFetchUrl', () => {
    it('builds correct URL with single sheet', () => {
      const url = buildCsvFetchUrl(
        'https://api-nf.9cmd.top',
        ['GameConfigSheet'],
        'odin'
      )
      expect(url).toBe(
        'https://api-nf.9cmd.top/getGraphqlCSV?network=odin&csv=GameConfigSheet&encodeAsBase64=true'
      )
    })

    it('builds correct URL with multiple sheets', () => {
      const url = buildCsvFetchUrl(
        'https://api-nf.9cmd.top',
        ['GameConfigSheet', 'RuneListSheet'],
        'heimdall'
      )
      expect(url).toContain('network=heimdall')
      expect(url).toContain('csv=GameConfigSheet')
      expect(url).toContain('csv=RuneListSheet')
      expect(url).toContain('encodeAsBase64=true')
      // All csv params should be joined with &
      expect(url).toContain('&csv=GameConfigSheet&csv=RuneListSheet')
    })

    it('encodes special characters in network name', () => {
      const url = buildCsvFetchUrl(
        'https://api.test.com',
        ['GameConfigSheet'],
        'test planet'
      )
      expect(url).toContain('network=test%20planet')
    })
  })

  // ============================================================
  // fetchCsvFromApi
  // ============================================================
  describe('fetchCsvFromApi', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('returns base64 data on success', async () => {
      const mockData = {
        status: 'success',
        data: {
          GameConfigSheet: 'base64data1',
          RuneListSheet: 'base64data2'
        }
      }

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await fetchCsvFromApi(
        'https://api.test.com/getGraphqlCSV?network=odin',
        ['GameConfigSheet', 'RuneListSheet']
      )

      expect(result.GameConfigSheet).toBe('base64data1')
      expect(result.RuneListSheet).toBe('base64data2')
    })

    it('throws on HTTP error', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      await expect(
        fetchCsvFromApi('https://api.test.com', ['GameConfigSheet'])
      ).rejects.toThrow('HTTP 500')
    })

    it('throws on API error status', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'error', message: 'Sheet not found' })
      } as Response)

      await expect(
        fetchCsvFromApi('https://api.test.com', ['GameConfigSheet'])
      ).rejects.toThrow('Sheet not found')
    })

    it('throws on missing data field', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success' })
      } as Response)

      await expect(
        fetchCsvFromApi('https://api.test.com', ['GameConfigSheet'])
      ).rejects.toThrow('missing data')
    })

    it('throws on missing sheets in response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { GameConfigSheet: 'base64data' }
          // Missing RuneListSheet
        })
      } as Response)

      await expect(
        fetchCsvFromApi('https://api.test.com', ['GameConfigSheet', 'RuneListSheet'])
      ).rejects.toThrow('Missing sheets')
    })
  })
})
