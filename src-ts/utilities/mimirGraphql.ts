/**
 * mimirGraphql Utility – Helper functions for Mimir GraphQL API
 *
 * Mimir provides:
 * - query GetAgent($address) → agent info + avatar address list
 * - query GetAvatar($addresses) → info for MULTIPLE avatars (dynamic query build)
 * - query GetAvatar($addr) → info for 1 avatar
 *
 * URL from useConfigURLStore.getMimirUrl(planet) - prefer dynamic from API,
 * fallback to PLANET_CONFIGS[planet].mimirUrl (https://${planet}-mimir.9c.gg/graphql).
 */

import { createLogger } from './logger'
import type { AgentInfo, AvatarInfo } from '../types/arenaLookup'

const logger = createLogger({ module: 'mimirGraphql' })

// ============================================================
// GraphQL POST helper
// ============================================================

/**
 * General helper to POST GraphQL query to mimir
 * @throws Error if HTTP error or response has errors
 */
export async function graphqlQuery<T = Record<string, unknown>>(
  url: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | null> {
  logger.debug('POST', url, JSON.stringify(variables).slice(0, 200))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  if (!res.ok) {
    throw new Error(`GraphQL ${url} → HTTP ${res.status}`)
  }
  const json = (await res.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join('; '))
  }
  return json.data ?? null
}

// ============================================================
// GetAgent
// ============================================================

/**
 * Query GetAgent — get agent info + avatar address list
 * @returns AgentInfo or null if not found
 */
export async function getAgent(
  mimirUrl: string,
  agentAddress: string
): Promise<AgentInfo | null> {
  const query = `
    query GetAgent($address: Address!) {
      agent(address: $address) {
        address
        monsterCollectionRound
        version
        avatarAddresses { key value }
      }
    }
  `
  const data = await graphqlQuery<{ agent: AgentInfo | null }>(
    mimirUrl,
    query,
    { address: agentAddress }
  )
  return data?.agent ?? null
}

// ============================================================
// GetAvatar (multi - inline address directly into query)
// ============================================================

/**
 * Query GetAvatar — get info for MULTIPLE avatars
 *
 * Note: Does NOT use GraphQL variables, instead inlines addresses directly into query.
 * Reason: Mimir may not support passing Address![] via variables for this query,
 * or response aliases may be misaligned with variable arrays. Inline addresses ensure
 * alias `avatar_<index>` always maps correctly to the address at that index.
 *
 * Syntax: each avatar adds 1 field alias
 *   avatar_0: avatar(address: "0xAAA") { ... }
 *   avatar_1: avatar(address: "0xBBB") { ... }
 *
 * @param avatarAddresses array of addresses
 * @returns array of AvatarInfo (skips null/undefined items)
 */
export async function getAvatars(
  mimirUrl: string,
  avatarAddresses: string[]
): Promise<AvatarInfo[]> {
  if (!avatarAddresses || avatarAddresses.length === 0) return []

  // Build query: inline addresses directly into template
  const aliases = avatarAddresses
    .map(
      (addr, i) =>
        `avatar_${i}: avatar(address: "${addr}") {
          address agentAddress characterId exp level name
        }`
    )
    .join('\n')
  const query = `query GetAvatar {\n${aliases}\n}`

  // Do not pass variables
  const data = await graphqlQuery<Record<string, AvatarInfo | null>>(
    mimirUrl,
    query
  )

  if (!data) return []
  return avatarAddresses
    .map((_addr, i) => data[`avatar_${i}`])
    .filter((item): item is AvatarInfo => item !== null && item !== undefined)
}

// ============================================================
// GetAvatar (single)
// ============================================================

/**
 * Query GetAvatar for a single avatar
 */
export async function getAvatar(
  mimirUrl: string,
  avatarAddress: string
): Promise<AvatarInfo | null> {
  const query = `
    query GetAvatar($addr: Address!) {
      avatar_0: avatar(address: $addr) {
        address agentAddress characterId exp level name
      }
    }
  `
  const data = await graphqlQuery<{ avatar_0: AvatarInfo | null }>(
    mimirUrl,
    query,
    { addr: avatarAddress }
  )
  return data?.avatar_0 ?? null
}
