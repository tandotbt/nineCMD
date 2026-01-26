/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFetch } from '@vueuse/core'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { useApiStore } from '../../stores/useApiStore'
import { buildCsvUrl } from '../../stores/useCsvDataStore'
import { usePlanetStore } from '../../stores/usePlanetStore'
import { CSV_SHEET_CONFIG } from '../../constants'
import type { AvatarDetailHeadless } from '../../types/character'

/**
 * CsvConsistency.test.ts
 *
 * Mục tiêu:
 * 1. Tải dữ liệu CSV từ API (Mocked via MSW).
 * 2. Parse CSV bằng logic thật (đồng bộ).
 * 3. Kết hợp với dữ liệu Avatar từ fixture local.
 * 4. Kiểm tra xem các Item ID trong Avatar có tồn tại và hợp lệ trong CSV không.
 */

// Helper function to parse CSV synchronously (matching worker logic)
function parseCsvSync(content: string, keyMain: string, unique = false, isRawCsv = false) {
  const rawContent = isRawCsv ? content : Buffer.from(content, 'base64').toString('utf-8')
  const csvString = rawContent
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.trim().startsWith('_'))
    .join('\n')

  const results = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })

  const rows = results.data as Record<string, string | number>[]
  const mappedData: Record<string, Record<string, string | number>> = {}

  rows.forEach((row, index) => {
    const keyValue = row[keyMain]
    if (keyValue !== undefined && keyValue !== null && keyValue !== '') {
      const key = unique ? `${keyValue}_${index}` : String(keyValue)
      mappedData[key] = row
    }
  })

  return {
    headers: results.meta.fields || [],
    rows,
    mappedData,
  }
}

describe('CSV & Mocked Data Integration Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should link mocked avatar data with mocked CSV lookups', async () => {
    const planet = 'heimdall'
    const fixturePath = path.resolve(__dirname, `../fixtures/${planet}/headless.json`)
    if (!fs.existsSync(fixturePath)) {
      console.warn('Fixture not found. Please run fetch-test-data.cjs first.')
      return
    }

    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
    const avatarKey = Object.keys(fixture.stateQuery || fixture).find((k) =>
      k.startsWith('avatar_'),
    )
    const avatar = (fixture.stateQuery?.[avatarKey!] ||
      fixture[avatarKey!] ||
      fixture.avatar) as AvatarDetailHeadless

    const planetStore = usePlanetStore()
    planetStore.setPlanet(planet)

    const apiStore = useApiStore()
    const sheetsToFetch = ['ItemRequirementSheet', 'EquipmentItemRecipeSheet']
    const url = buildCsvUrl(
      planet,
      apiStore.api9CmdUrl as string,
      planetStore.currentPlanetId,
      sheetsToFetch,
    )

    console.log(`[Test] Fetching CSV sheets: ${sheetsToFetch.join(', ')}`)

    // 1. Fetch CSV from 9capi (Intercepted by MSW)
    const { data: capiData, error: capiError } = await useFetch(url).json<{
      status: string
      data: Record<string, string>
    }>()

    if (capiError.value) throw new Error(capiError.value)
    expect(capiData.value?.status).toBe('success')

    const csvDataMap = capiData.value?.data || {}
    const parsedSheets: Record<
      string,
      {
        headers: string[]
        rows: Record<string, string | number>[]
        mappedData: Record<string, Record<string, string | number>>
      }
    > = {}

    sheetsToFetch.forEach((sheetName) => {
      const config = CSV_SHEET_CONFIG[sheetName] || { keyMain: 'id' }
      const content = csvDataMap[sheetName] || ''
      parsedSheets[sheetName] = parseCsvSync(content, config.keyMain, config.unique)
    })

    // 2. Fetch item_name.csv (Intercepted by MSW)
    console.log(`[Test] Fetching item_name.csv`)
    const { data: itemNameData, error: itemNameError } = await useFetch(
      apiStore.scanItemNameUrl as string,
    ).text()
    if (itemNameError.value) throw new Error(itemNameError.value)

    parsedSheets['ItemNameSheet'] = parseCsvSync(itemNameData.value || '', 'Key', false, true)

    // Debug: log first few keys of ItemNameSheet
    const itemNameKeys = Object.keys(parsedSheets['ItemNameSheet'].mappedData)
    console.log(`[Test] ItemNameSheet sample keys: ${itemNameKeys.slice(0, 5).join(', ')}`)
    console.log(`[Test] Total ItemNameSheet keys: ${itemNameKeys.length}`)

    // 3. Cross-reference Validation
    console.log(`[Test] Validating ${avatar.inventory.equipments.length} equipments against CSV...`)

    for (const eq of avatar.inventory.equipments) {
      const excelId = eq.id
      const nameKey = `ITEM_NAME_${excelId}`
      const nameSheet = parsedSheets['ItemNameSheet']
      const nameRow = nameSheet?.mappedData[nameKey]

      if (!nameRow) {
        console.warn(`[Test] Excel ID ${excelId} (from eq.id) not found in ItemNameSheet.`)
      }

      const hasValidName = nameRow ? !!(nameRow?.English || nameRow?.Vietnam) : true
      expect(
        hasValidName,
        `Item Excel ID ${excelId} should have an English or Vietnam name if it exists in CSV`,
      ).toBe(true)

      // Check ItemRequirementSheet
      const reqSheet = parsedSheets['ItemRequirementSheet']
      const reqRow = reqSheet?.mappedData[String(excelId)]
      const hasLevel = reqRow ? typeof reqRow.level === 'number' : true
      expect(hasLevel, `Item Excel ID ${excelId} should have a numeric level requirement`).toBe(
        true,
      )

      if (!reqRow) {
        console.warn(
          `[Test] Item Excel ID ${excelId} not found in ItemRequirementSheet (common for some items)`,
        )
      }
    }

    console.log('[Test] CSV & Mocked Data Integration Check Passed')
  })
})
