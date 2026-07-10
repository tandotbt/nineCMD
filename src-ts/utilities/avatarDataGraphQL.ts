/**
 * Avatar Data GraphQL – Query strings + fetch functions
 *
 * Separates query definitions and fetch logic from the store.
 * Reuses graphqlQuery<T>() from mimirGraphql.ts for POST with error handling.
 */

import { graphqlQuery } from './mimirGraphql'
import { useConfigURLStore } from '../stores/configURL'
import { useAppSettingsStore } from '../stores/appSettings'
import { createLogger } from './logger'
import { LIST_API_NINECMD } from '@/utilities/constants'
import type { PlanetName } from '@/utilities/constants'

const logger = createLogger({ module: 'avatarDataGraphQL' })

// ============================================================
// Query A — Step 1: Combine all GraphQL node data
// ============================================================

/** Agent query fragment: gold, crystal */
const AGENT_FIELDS = `gold
          crystal`

/** Equipment item fields for GraphQL query */
const EQUIPMENT_FIELDS = `grade
              id
              itemType
              itemSubType
              elementalType
              requiredBlockIndex
              setId
              stat {
                statType
                baseValue
                totalValue
                additionalValue
              }
              equipped
              itemId
              level
              skills {
                id
                elementalType
                power
                chance
                statPowerRatio
                referencedStatType
              }
              buffSkills {
                id
                elementalType
                power
                chance
                statPowerRatio
                referencedStatType
              }
              statsMap {
                hP
                aTK
                dEF
                cRI
                hIT
                sPD
              }`

/** Build avatar section of Query A */
function buildAvatarFragment(avatarAddress: string): string {
  return `avatar(avatarAddress: "${avatarAddress}") {
          address
          name
          level
          actionPoint
          dailyRewardReceivedIndex
          stageMap {
            pairs
            count
          }
          runes {
            runeId
            level
          }
          inventory {
            equipped: equipments(equipped: true) {
              itemSubType
              id
            }
            all: equipments {
              ${EQUIPMENT_FIELDS}
            }
            costumes {
              grade
              id
              itemType
              itemSubType
              elementalType
              requiredBlockIndex
              itemId
              equipped
            }
            materials {
              id
            }
            consumables {
              id
            }
          }
          itemMap {
            count
            pairs
          }
          combinationSlots {
            address
            petId
            index
            isUnlocked
            startBlockIndex
            unlockBlockIndex
          }
        }`
}

/**
 * Build Query A — single GraphQL query for all node data.
 *
 * Includes:
 * - agent: gold, crystal
 * - avatar: name, level, actionPoint, stageMap, runes, inventory, itemMap, combinationSlots
 * - stakeStates: deposit
 * - unlockedWorldIds
 *
 * Uses alias pattern: equipped: equipments(equipped:true) + all: equipments
 * (same as src/stores/fetchDataUser9C.js)
 *
 * @param agentAddress - agent address (0x...)
 * @param avatarAddress - avatar address (0x...)
 * @returns GraphQL query string
 */
export function buildQueryA(agentAddress: string, avatarAddress: string): string {
  return `
    query {
      stateQuery {
        agent(address: "${agentAddress}") {
          ${AGENT_FIELDS}
        }
        ${buildAvatarFragment(avatarAddress)}
        stakeStates(addresses: "${agentAddress}") {
          deposit
        }
        unlockedWorldIds(avatarAddress: "${avatarAddress}")
      }
    }
  `
}

// ============================================================
// Fetch Query A
// ============================================================

/**
 * Execute Query A — fetch avatar data from headless GraphQL endpoint.
 *
 * Gets headlessGql URL from configURL store (dynamic + fallback).
 * Uses graphqlQuery<T>() from mimirGraphql.ts for error handling.
 *
 * IMPORTANT: graphqlQuery() already unwraps `json.data` from the response.
 * So the returned value IS `data` (i.e. { stateQuery: { agent, avatar, ... } }).
 * Do NOT access `response['data']` again — that would be double-unwrap.
 *
 * @param agentAddress - agent address
 * @param avatarAddress - avatar address
 * @returns The `data` object from GraphQL response (already unwrapped)
 */
export async function fetchQueryA(
  agentAddress: string,
  avatarAddress: string
): Promise<Record<string, unknown>> {
  const configURL = useConfigURLStore()
  const appSettings = useAppSettingsStore()
  const planet = appSettings.selectedPlanet as PlanetName
  const headlessGql = configURL.getHeadlessGql(planet)

  if (!headlessGql) {
    throw new Error(`No headless GraphQL endpoint for planet "${planet}"`)
  }

  const query = buildQueryA(agentAddress, avatarAddress)
  logger.debug(`Fetching Query A from: ${headlessGql}`)

  const data = await graphqlQuery<Record<string, unknown>>(headlessGql, query)
  if (!data) {
    throw new Error('No data returned from Query A')
  }

  return data
}

// ============================================================
// Query B — Step 2: Material counts (mandatory — provides exact counts with tradableId)
// ============================================================

/**
 * Build Query B — dynamic material count query.
 *
 * Uses dynamic aliases: i<id>: items(inventoryItemId: <id>) { count }
 * Called to get exact material counts from GraphQL node.
 *
 * @param avatarAddress - avatar address
 * @param materialIds - array of material IDs to query
 * @returns GraphQL query string
 */
export function buildQueryB(avatarAddress: string, materialIds: number[]): string {
  const aliases = materialIds
    .map((id) => `i${id}: items(inventoryItemId: ${id}) { count, tradableId }`)
    .join('\n')

  return `
    query {
      stateQuery {
        avatar(avatarAddress: "${avatarAddress}") {
          inventory {
            ${aliases}
          }
        }
      }
    }
  `
}

/**
 * Fetch material counts from GraphQL node (Step 2).
 *
 * Calls graphqlQuery() with buildQueryB() query.
 * Returns raw response with avatar.inventory containing material counts.
 *
 * @param avatarAddress - avatar address
 * @param materialIds - array of material IDs to query
 * @returns Raw GraphQL response
 */
export async function fetchQueryB(
  avatarAddress: string,
  materialIds: number[]
): Promise<Record<string, unknown>> {
  const configURL = useConfigURLStore()
  const appSettings = useAppSettingsStore()
  const planet = appSettings.selectedPlanet as PlanetName
  const url = configURL.getHeadlessGql(planet)

  if (!url) {
    throw new Error(`No headless GraphQL endpoint for planet "${planet}"`)
  }

  const query = buildQueryB(avatarAddress, materialIds)
  const response = await graphqlQuery<Record<string, unknown>>(url, query)
  if (!response) {
    throw new Error('No data returned from Query B')
  }
  return response
}

// ============================================================
// REST API — Step 3: getDataGraphql
// ============================================================

/**
 * Fetch REST API getDataGraphql (Step 3).
 *
 * Calls 9CMD API with multiple codeGet parameters.
 * URL from LIST_API_NINECMD (9CMD server, NOT 9cscan).
 * Pattern: {URL}/getDataGraphql?network={planet}&avatarAddress={addr}&codeGet={...}
 *
 * @param avatarAddress - avatar address
 * @param codeGets - array of codeGet values
 * @returns REST API response
 */
export async function fetchGetDataGraphql(
  avatarAddress: string,
  codeGets: string[]
): Promise<Record<string, unknown>> {
  const appSettings = useAppSettingsStore()
  const planet = appSettings.selectedPlanet as PlanetName
  const apiUrl = LIST_API_NINECMD[0]

  if (!apiUrl) {
    throw new Error(`No 9CMD API endpoint configured in LIST_API_NINECMD`)
  }

  const params = new URLSearchParams({
    network: planet,
    avatarAddress
  })
  for (const code of codeGets) {
    params.append('codeGet', code)
  }

  const url = `${apiUrl}/getDataGraphql?${params.toString()}`
  logger.debug(`Fetching getDataGraphql: ${url}`)

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })

  if (!res.ok) {
    throw new Error(`getDataGraphql HTTP ${res.status}: ${res.statusText}`)
  }

  return res.json()
}
