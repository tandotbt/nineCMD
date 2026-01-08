import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFetch } from '@vueuse/core'
import fs from 'fs'
import path from 'path'
import { useApiStore } from '../stores/useApiStore'
import { buildCsvUrl } from '../stores/useCsvDataStore'
import { usePlanetStore } from '../stores/usePlanetStore'

/**
 * Test case này dùng để so sánh dữ liệu CSV thực tế từ 3 planet: Odin, Heimdall, Thor.
 * Sử dụng logic từ Store để đảm bảo tính nhất quán giữa code và test.
 */
describe('CSV Data Consistency - Real API Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const getExpectedData = (fileName: string) => {
    const filePath = path.resolve(__dirname, fileName)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }

  const getExpectedText = (fileName: string) => {
    const filePath = path.resolve(__dirname, fileName)
    if (!fs.existsSync(filePath)) return ''
    return fs.readFileSync(filePath, 'utf-8')
  }

  const EXPECTED_DATA_ODIN = getExpectedData('csv_odin.json')
  const EXPECTED_DATA_HEIMDALL = getExpectedData('csv_heimdall.json')
  const EXPECTED_DATA_THOR = getExpectedData('csv_thor.json')
  const EXPECTED_ITEM_NAME = getExpectedText('item_name.csv')

  interface ExpectedCsvResponse {
    data: Record<string, string>
  }

  it('should fetch real data from all planets and compare with expected files', async () => {
    const planets = ['odin', 'heimdall', 'thor'] as const
    const expectedMap: Record<(typeof planets)[number], ExpectedCsvResponse | null> = {
      odin: EXPECTED_DATA_ODIN as ExpectedCsvResponse | null,
      heimdall: EXPECTED_DATA_HEIMDALL as ExpectedCsvResponse | null,
      thor: EXPECTED_DATA_THOR as ExpectedCsvResponse | null,
    }

    const allDiffs: string[] = []
    const planetStore = usePlanetStore()

    for (const planet of planets) {
      const expected = expectedMap[planet]
      if (!expected) {
        console.log(`--- Skipping Planet: ${planet} (No expected data file) ---`)
        continue
      }

      console.log(`--- Testing Planet: ${planet} ---`)
      planetStore.setPlanet(planet)

      const expectedSheets = (expected.data as Record<string, string>) || {}
      const sheetsToFetch = Object.keys(expectedSheets)

      if (sheetsToFetch.length === 0) {
        console.log(`No sheets found in expected data for ${planet}.`)
        continue
      }

      const apiStore = useApiStore()
      const url = buildCsvUrl(planet, apiStore.api9CmdUrl as string, sheetsToFetch)

      try {
        // Sử dụng useFetch giống như trong useCsvDataStore
        const { data, error } = await useFetch(url).json<{
          status: string
          data: Record<string, string>
        }>()

        if (error.value) {
          throw new Error(error.value)
        }

        if (!data.value || data.value.status !== 'success') {
          throw new Error(`API returned failure status for ${planet}`)
        }

        console.log(`Comparing ${planet} data (${sheetsToFetch.length} sheets)...`)
        const currentSheets = data.value.data || {}

        sheetsToFetch.forEach((sheetName) => {
          const expectedContent = expectedSheets[sheetName]
          const currentContent = currentSheets[sheetName]

          if (expectedContent !== currentContent) {
            const msg = `[DIFF] Sheet [${sheetName}] has changed on ${planet}!`
            console.warn(msg)
            if (!currentContent) {
              console.warn(`      -> Sheet is missing in API response`)
            } else {
              console.warn(`      -> Expected (base64 length): ${expectedContent?.length ?? 0}`)
              console.warn(`      -> Current  (base64 length): ${currentContent.length}`)
            }
            allDiffs.push(msg)
          }
        })

        if (!allDiffs.some((d) => d.includes(planet))) {
          console.log(`[OK] All sheets for ${planet} match expected data.`)
        }
      } catch (err) {
        console.error(`Failed to fetch data for ${planet}:`, err)
        allDiffs.push(`Failed to fetch data for ${planet}`)
      }
    }

    // 2. Fetch item_name.csv dùng useFetch
    console.log(`--- Testing item_name.csv ---`)
    try {
      const apiStore = useApiStore()
      const { data, error } = await useFetch(apiStore.scanItemNameUrl as string).text()
      if (error.value) throw new Error(error.value)

      const currentItemName = (data.value || '').trim()
      const expectedItemName = EXPECTED_ITEM_NAME.trim()

      if (expectedItemName) {
        if (currentItemName !== expectedItemName) {
          const msg = `[DIFF] item_name.csv has changed!`
          console.warn(msg)
          allDiffs.push(msg)
        } else {
          console.log(`[OK] item_name.csv matches expected data.`)
        }
      }
    } catch (err) {
      console.error(`Failed to fetch item_name.csv:`, err)
      allDiffs.push(`Failed to fetch item_name.csv`)
    }

    // Final assertion
    expect(allDiffs, 'Found differences in CSV data').toEqual([])
  }, 30000) // Increase timeout to 30s for real API calls
})
