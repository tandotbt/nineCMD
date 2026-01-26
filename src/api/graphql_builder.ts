/**
 * @file api/graphql_builder.ts
 * @description Helper functions to build complex GraphQL queries.
 */

import { GQL_QUERIES, TRACKED_ITEM_IDS } from '@/constants'

/**
 * Builds a partial query for a single avatar to be used in a batch request.
 */
export function buildAvatarBatchPart(
  addr: string,
  prefix: string = 'avatar',
  materialIds: number[] = [],
): string {
  const allTrackedIds = [...new Set([...TRACKED_ITEM_IDS, ...materialIds])]
  const trackedItems = allTrackedIds
    .map((id) => `i_${id}: items(inventoryItemId: ${id}) { count tradableId }`)
    .join('\n        ')

  const cleanAddr = addr.startsWith('0x') ? addr.slice(2) : addr

  return `
    unlockedWorldIds_${cleanAddr}: unlockedWorldIds(avatarAddress: "${addr}")
    ${prefix}_${cleanAddr}: avatar(avatarAddress: "${addr}") {
      ${GQL_QUERIES.CHARACTER.FIELDS_AVATAR_BASE}
      inventory {
        ${GQL_QUERIES.CHARACTER.FIELDS_INVENTORY_CONTENT}
        ${trackedItems}
      }
      ${GQL_QUERIES.CHARACTER.FIELDS_CRAFTING_AND_ITEMS}
    }
  `
}

/**
 * Builds a full batch query for multiple avatars.
 */
export function buildAvatarBatchQuery(agentAddress: string, avatarAddresses: string[]): string {
  let avatarFields = ''
  avatarAddresses.forEach((addr) => {
    avatarFields += buildAvatarBatchPart(addr, 'avatar')
  })

  return `query { 
    stateQuery { 
      ${avatarFields} 
      stakeState(address: "${agentAddress}") { deposit } 
    } 
  }`
}

/**
 * Builds a full detail query for a single avatar, including agent state.
 */
export function buildAvatarDetailFullQuery(
  avatarAddress: string,
  agentAddress: string,
  materialIds: number[] = [],
): string {
  return `
    query GetAvatarDetail {
      stateQuery {
        agent(address: "${agentAddress}") {
          gold
          crystal
        }
        ${buildAvatarBatchPart(avatarAddress, 'avatar', materialIds)}
        stakeState(address: "${agentAddress}") { deposit }
      }
    }
  `
}
