import { describe, it, expect } from 'vitest'
import { resolveAssetUrl, resolveAvatarUrl, resolveItemUrl, resolveRuneUrl } from '../assets'

describe('assets logic', () => {
  const BASE_URL =
    'https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons'

  describe('resolveAssetUrl', () => {
    it('should resolve portraitId to item URL', () => {
      expect(resolveAssetUrl({ portraitId: 10200000 })).toBe(`${BASE_URL}/Item/10200000.png`)
      expect(resolveAssetUrl({ portraitId: '10200000' })).toBe(`${BASE_URL}/Item/10200000.png`)
    })

    it('should resolve element to elemental icon URL', () => {
      expect(resolveAssetUrl({ element: 'FIRE' })).toBe(
        `${BASE_URL}/ElementalType/icon_elemental_fire.png`,
      )
      expect(resolveAssetUrl({ element: 'NORMAL' })).toBe(
        `${BASE_URL}/ElementalType/icon_element_normal.png`,
      )
      expect(resolveAssetUrl({ element: 'normal' })).toBe(
        `${BASE_URL}/ElementalType/icon_element_normal.png`,
      )
    })

    it('should resolve tickerRune to rune icon URL', () => {
      expect(resolveAssetUrl({ tickerRune: 'RUNE_ADVENTURER' })).toBe(
        `${BASE_URL}/FungibleAssetValue/RUNE_ADVENTURER.png`,
      )
    })

    it('should return empty string if no params provided', () => {
      expect(resolveAssetUrl({})).toBe('')
    })

    it('should prioritize portraitId over other params', () => {
      expect(resolveAssetUrl({ portraitId: 123, element: 'FIRE', tickerRune: 'ABC' })).toBe(
        `${BASE_URL}/Item/123.png`,
      )
    })
  })

  describe('helpers', () => {
    it('resolveAvatarUrl should work', () => {
      expect(resolveAvatarUrl(10200000)).toBe(`${BASE_URL}/Item/10200000.png`)
    })

    it('resolveItemUrl should work', () => {
      expect(resolveItemUrl(10100000)).toBe(`${BASE_URL}/Item/10100000.png`)
    })

    it('resolveRuneUrl should work', () => {
      expect(resolveRuneUrl('RUNE_ADVENTURER')).toBe(
        `${BASE_URL}/FungibleAssetValue/RUNE_ADVENTURER.png`,
      )
    })
  })
})
