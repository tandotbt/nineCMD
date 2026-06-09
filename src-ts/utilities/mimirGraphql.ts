/**
 * mimirGraphql Utility – Helper functions gọi Mimir GraphQL API
 *
 * Mimir cung cấp:
 * - query GetAgent($address) → thông tin agent + danh sách avatar addresses
 * - query GetAvatar($addresses) → thông tin NHIỀU avatar (build query động)
 * - query GetAvatar($addr) → thông tin 1 avatar
 *
 * URL lấy qua useConfigURLStore.getMimirUrl(planet) - ưu tiên dynamic từ API,
 * fallback về PLANET_CONFIGS[planet].mimirUrl (https://${planet}-mimir.9c.gg/graphql).
 */

import { createLogger } from './logger'
import type { AgentInfo, AvatarInfo } from '../types/arenaLookup'

const logger = createLogger({ module: 'mimirGraphql' })

// ============================================================
// GraphQL POST helper
// ============================================================

/**
 * Helper chung để POST GraphQL query tới mimir
 * @throws Error nếu HTTP lỗi hoặc response có errors
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
 * Query GetAgent — lấy thông tin agent + danh sách avatar addresses
 * @returns AgentInfo hoặc null nếu không tồn tại
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
// GetAvatar (multi - inline address thẳng vào query)
// ============================================================

/**
 * Query GetAvatar — lấy thông tin NHIỀU avatar
 *
 * Lưu ý: KHÔNG dùng GraphQL variables, mà inline trực tiếp address vào query.
 * Lý do: Mimir có thể không hỗ trợ truyền Address![] qua variables cho query này,
 * hoặc response alias bị lệch khi dùng variable array. Inline address đảm bảo
 * alias `avatar_<index>` luôn map đúng tới address tại index đó.
 *
 * Cú pháp: mỗi avatar thêm 1 field alias
 *   avatar_0: avatar(address: "0xAAA") { ... }
 *   avatar_1: avatar(address: "0xBBB") { ... }
 *
 * @param avatarAddresses mảng address
 * @returns mảng AvatarInfo (bỏ qua item null/undefined)
 */
export async function getAvatars(
  mimirUrl: string,
  avatarAddresses: string[]
): Promise<AvatarInfo[]> {
  if (!avatarAddresses || avatarAddresses.length === 0) return []

  // Build query: inline trực tiếp address vào template
  const aliases = avatarAddresses
    .map(
      (addr, i) =>
        `avatar_${i}: avatar(address: "${addr}") {
          address agentAddress characterId exp level name
        }`
    )
    .join('\n')
  const query = `query GetAvatar {\n${aliases}\n}`

  // Không truyền variables
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
 * Query GetAvatar cho 1 avatar đơn lẻ
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
