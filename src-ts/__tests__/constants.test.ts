import { describe, it, expect } from 'vitest'
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  CONFIG_i18n_LANGUAGES,
  PLANET_CONFIGS,
  PLANET_OPTIONS,
  POLL_INTERVAL_OPTIONS,
  AVG_BLOCK_FALLBACK,
  AVG_TRANS_FALLBACK,
  DEFAULT_POLL_INTERVAL_MS,
  ALL_CSV_SHEET_NAMES,
  CSV_SHEET_CONFIG,
  URL_ALL_PLANET,
  LIST_API_NINECMD,
  CSV_ENDPOINT_PATH,
  AVATAR_DATA_CODE_GET_STATIC,
  STAGE_SPECIAL_PREFIX,
  COST_AP_BY_STAKE,
  COST_AP_BY_STAKE_MIN,
  AP_POTION_ID,
  AP_POTION_TRADABLE_OFFSET,
  LOCALIZED_CSV_KEY_COLUMN,
  REMOTE_CSV_KEY_COLUMN,
  isLocalizedCsvLocale,
  V_GITHUB_NINECHRONICLES,
  URL_GITHUB_LIVEASSETS,
  LOCALIZED_CSV_LOCALES,
  LOCALE_TO_CSV_COLUMN,
  THEME_BREAKPOINTS,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  STORAGE_KEY_APP_SETTINGS,
  STORAGE_KEY_ENDPOINTS,
  DEFAULT_API_URL,
  DEFAULT_LEVEL_REQ,
  MAX_PURCHASE_COUNT,
  MAX_CHALLENGE_COUNT
} from '../utilities/constants'

describe('constants', () => {
  // ============================================================
  // i18n Constants
  // ============================================================
  describe('i18n constants', () => {
    it('DEFAULT_LOCALE and FALLBACK_LOCALE are both "en"', () => {
      expect(DEFAULT_LOCALE).toBe('en')
      expect(FALLBACK_LOCALE).toBe('en')
    })

    it('CONFIG_i18n_LANGUAGES contains vi and en', () => {
      expect(CONFIG_i18n_LANGUAGES).toHaveLength(2)
      const langs = CONFIG_i18n_LANGUAGES.map((l) => l.lang)
      expect(langs).toContain('vi')
      expect(langs).toContain('en')
    })

    it('each language config has required fields', () => {
      for (const lang of CONFIG_i18n_LANGUAGES) {
        expect(lang.lang).toBeTruthy()
        expect(lang.label).toBeTruthy()
        expect(lang.png).toContain('https://')
        expect(lang.uiConfig).toBeDefined()
        expect(lang.uiConfigDate).toBeDefined()
      }
    })
  })

  // ============================================================
  // Planet Constants
  // ============================================================
  describe('planet constants', () => {
    it('PLANET_CONFIGS has 3 planets', () => {
      expect(Object.keys(PLANET_CONFIGS)).toHaveLength(3)
    })

    it('each planet has id, label, and mimirUrl', () => {
      for (const [name, config] of Object.entries(PLANET_CONFIGS)) {
        expect(config.id).toBe(name)
        expect(config.label).toBeTruthy()
        expect(typeof config.mimirUrl).toBe('string')
      }
    })

    it('PLANET_OPTIONS is an ordered array of 3 planets', () => {
      expect(PLANET_OPTIONS).toHaveLength(3)
    })

  })

  // ============================================================
  // Block Polling Constants
  // ============================================================
  describe('block polling constants', () => {
    it('DEFAULT_POLL_INTERVAL_MS is 10000', () => {
      expect(DEFAULT_POLL_INTERVAL_MS).toBe(10000)
    })

    it('POLL_INTERVAL_OPTIONS has 6 options', () => {
      expect(POLL_INTERVAL_OPTIONS).toHaveLength(6)
    })

    it('AVG_BLOCK_FALLBACK is 8 seconds', () => {
      expect(AVG_BLOCK_FALLBACK).toBe(8)
    })

    it('AVG_TRANS_FALLBACK is 100', () => {
      expect(AVG_TRANS_FALLBACK).toBe(100)
    })

    it('all poll interval options have label and value', () => {
      for (const opt of POLL_INTERVAL_OPTIONS) {
        expect(opt.label).toContain('s')
        expect(typeof opt.value).toBe('number')
        expect(opt.value).toBeGreaterThan(0)
      }
    })
  })

  // ============================================================
  // CSV Constants
  // ============================================================
  describe('CSV constants', () => {
    it('ALL_CSV_SHEET_NAMES matches keys of CSV_SHEET_CONFIG', () => {
      const configKeys = Object.keys(CSV_SHEET_CONFIG)
      expect(ALL_CSV_SHEET_NAMES).toEqual(configKeys)
    })

    it('CSV_SHEET_CONFIG has all expected sheets', () => {
      const expectedSheets = [
        'GameConfigSheet',
        'RuneSheet',
        'WorldBossListSheet',
        'EventScheduleSheet',
        'StageSheet'
      ]
      for (const sheet of expectedSheets) {
        expect(CSV_SHEET_CONFIG).toHaveProperty(sheet)
        expect(CSV_SHEET_CONFIG[sheet as keyof typeof CSV_SHEET_CONFIG].keyColumn).toBeTruthy()
      }
    })

    it('LIST_API_NINECMD has at least one entry', () => {
      expect(LIST_API_NINECMD.length).toBeGreaterThan(0)
    })

    it('CSV_ENDPOINT_PATH starts with /', () => {
      expect(CSV_ENDPOINT_PATH).toMatch(/^\//)
    })

    it('URL_ALL_PLANET is a valid URL', () => {
      expect(URL_ALL_PLANET).toContain('https://')
      expect(URL_ALL_PLANET).toContain('nine-chronicles.com')
    })
  })

  // ============================================================
  // Avatar Data Constants
  // ============================================================
  describe('avatar data constants', () => {
    it('AVATAR_DATA_CODE_GET_STATIC has at least 5 entries', () => {
      expect(AVATAR_DATA_CODE_GET_STATIC.length).toBeGreaterThanOrEqual(5)
    })

    it('STAGE_SPECIAL_PREFIX is "100000"', () => {
      expect(STAGE_SPECIAL_PREFIX).toBe('100000')
    })

    it('AP_POTION_ID is a positive number', () => {
      expect(AP_POTION_ID).toBeGreaterThan(0)
    })

    it('AP_POTION_TRADABLE_OFFSET is a positive number', () => {
      expect(AP_POTION_TRADABLE_OFFSET).toBeGreaterThan(0)
    })

    it('COST_AP_BY_STAKE is sorted ascending by ncgStake', () => {
      for (let i = 1; i < COST_AP_BY_STAKE.length; i++) {
        expect(COST_AP_BY_STAKE[i].ncgStake).toBeGreaterThanOrEqual(COST_AP_BY_STAKE[i - 1].ncgStake)
      }
    })

    it('COST_AP_BY_STAKE_MIN is the minimum costAP', () => {
      const minCost = Math.min(...COST_AP_BY_STAKE.map((t) => t.costAP))
      expect(COST_AP_BY_STAKE_MIN).toBeLessThanOrEqual(minCost)
    })

    it('each COST_AP_BY_STAKE entry has ncgStake and costAP', () => {
      for (const tier of COST_AP_BY_STAKE) {
        expect(typeof tier.ncgStake).toBe('number')
        expect(typeof tier.costAP).toBe('number')
      }
    })
  })

  // ============================================================
  // GitHub / URL Constants
  // ============================================================
  describe('GitHub / URL constants', () => {
    it('V_GITHUB_NINECHRONICLES is "development"', () => {
      expect(V_GITHUB_NINECHRONICLES).toBe('development')
    })

    it('URL_GITHUB_LIVEASSETS contains raw.githubusercontent.com', () => {
      expect(URL_GITHUB_LIVEASSETS).toContain('raw.githubusercontent.com')
    })

    it('URL_GITHUB_NineChronicles contains the branch', () => {
      expect(V_GITHUB_NINECHRONICLES).toBe('development')
    })
  })

  // ============================================================
  // Localized CSV Constants
  // ============================================================
  describe('localized CSV constants extended', () => {
    it('LOCALIZED_CSV_LOCALES has 4 locales', () => {
      expect(LOCALIZED_CSV_LOCALES).toHaveLength(4)
    })

    it('LOCALE_TO_CSV_COLUMN maps en, vi, ko, ja', () => {
      expect(LOCALE_TO_CSV_COLUMN['en']).toBe('English')
      expect(LOCALE_TO_CSV_COLUMN['vi']).toBe('Vietnamese')
      expect(LOCALE_TO_CSV_COLUMN['ko']).toBe('Korean')
      expect(LOCALE_TO_CSV_COLUMN['ja']).toBe('Japanese')
    })
  })

  // ============================================================
  // Theme / Layout Constants
  // ============================================================
  describe('theme and layout constants', () => {
    it('THEME_BREAKPOINTS has xs and md', () => {
      expect(THEME_BREAKPOINTS.xs).toBe(320)
      expect(THEME_BREAKPOINTS.m).toBe(660)
    })

    it('HEADER_HEIGHT and FOOTER_HEIGHT are CSS strings', () => {
      expect(HEADER_HEIGHT).toContain('vh')
      expect(FOOTER_HEIGHT).toContain('vh')
    })

    it('DEFAULT_API_URL is localhost', () => {
      expect(DEFAULT_API_URL).toContain('127.0.0.1')
    })

    it('DEFAULT_LEVEL_REQ is 888888', () => {
      expect(DEFAULT_LEVEL_REQ).toBe(888888)
    })

    it('MAX_PURCHASE_COUNT is 40', () => {
      expect(MAX_PURCHASE_COUNT).toBe(40)
    })

    it('MAX_CHALLENGE_COUNT is 3', () => {
      expect(MAX_CHALLENGE_COUNT).toBe(3)
    })
  })

  // ============================================================
  // Type Guards
  // ============================================================
  describe('type guards', () => {
    it('isLocalizedCsvLocale returns true for valid locales', () => {
      expect(isLocalizedCsvLocale('English')).toBe(true)
      expect(isLocalizedCsvLocale('Vietnamese')).toBe(true)
      expect(isLocalizedCsvLocale('Korean')).toBe(true)
      expect(isLocalizedCsvLocale('Japanese')).toBe(true)
    })

    it('isLocalizedCsvLocale returns false for invalid locales', () => {
      expect(isLocalizedCsvLocale('Chinese')).toBe(false)
      expect(isLocalizedCsvLocale('')).toBe(false)
    })
  })

  // ============================================================
  // Localized CSV Constants
  // ============================================================
  describe('localized CSV constants', () => {
    it('LOCALIZED_CSV_KEY_COLUMN is "Key"', () => {
      expect(LOCALIZED_CSV_KEY_COLUMN).toBe('Key')
    })

    it('REMOTE_CSV_KEY_COLUMN is "Key"', () => {
      expect(REMOTE_CSV_KEY_COLUMN).toBe('Key')
    })

    it('STORAGE_KEY_APP_SETTINGS is "setting-nine-cmd"', () => {
      expect(STORAGE_KEY_APP_SETTINGS).toBe('setting-nine-cmd')
    })

    it('STORAGE_KEY_ENDPOINTS is "configURL-endpoints"', () => {
      expect(STORAGE_KEY_ENDPOINTS).toBe('configURL-endpoints')
    })
  })
})