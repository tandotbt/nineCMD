/**
 * @file api/rest.ts
 * @description Helpers for REST API calls (primarily 9cmd API).
 */

import { CHARACTER_CODE_GETS } from '@/constants'

/**
 * Builds the URLSearchParams for a 9cmd API request.
 * @param avatarAddress The avatar address.
 * @param planet The planet name (network).
 * @param codeGets Array of codeGet parameters. Defaults to CHARACTER_CODE_GETS.
 * @returns {URLSearchParams} The built params.
 */
export function build9cmdApiParams(
  avatarAddress: string,
  planet: string,
  codeGets: string[] | readonly string[] = CHARACTER_CODE_GETS,
): URLSearchParams {
  const params = new URLSearchParams({
    avatarAddress,
    network: planet,
  })
  codeGets.forEach((code) => params.append('codeGet', code))
  return params
}

/**
 * Builds the full URL for a 9cmd API request.
 * @param baseUrl The base URL of the 9cmd API.
 * @param avatarAddress The avatar address.
 * @param planet The planet name (network).
 * @param codeGets Array of codeGet parameters. Defaults to CHARACTER_CODE_GETS.
 * @returns {string} The full URL.
 */
export function get9cmdApiUrl(
  baseUrl: string,
  avatarAddress: string,
  planet: string,
  codeGets: string[] | readonly string[] = CHARACTER_CODE_GETS,
): string {
  const params = build9cmdApiParams(avatarAddress, planet, codeGets)
  return `${baseUrl}/getDataGraphql?${params.toString()}`
}
