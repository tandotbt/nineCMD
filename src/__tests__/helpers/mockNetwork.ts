import { http, HttpResponse } from 'msw'
import fs from 'fs'
import path from 'path'
import registry from '../network-registry.json'

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

/**
 * Normalizes a GraphQL query string by removing extra whitespace.
 */
function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, ' ').trim()
}

/**
 * Legacy support for tests still calling setupNetworkMock
 */
export function setupNetworkMock() {
  console.log('[MockNetwork] MSW is active, setupNetworkMock (legacy) called.')
}

/**
 * MSW Handlers for intercepting network requests and returning fixture data.
 */
export const handlers = [
  // Handle GraphQL Requests
  http.post('*/graphql', async ({ request }) => {
    const url = new URL(request.url)
    const body = (await request.json()) as { query: string; variables?: Record<string, unknown> }
    const query = normalizeQuery(body.query)

    // Determine planet
    let planet = 'odin'
    if (url.href.includes('heimdall')) planet = 'heimdall'
    if (url.href.includes('thor')) planet = 'thor'

    // 1. Find matching query in registry
    const allGql = [...registry.graphql.headless, ...registry.graphql.mimir]
    const match = allGql.find((entry) => normalizeQuery(entry.query) === query)

    let fixturePath = ''
    if (match) {
      fixturePath = path.join(FIXTURES_DIR, planet, `${match.name}.json`)
      // Fallback for blocks if standard query failed on Headless but worked on Mimir
      if (!fs.existsSync(fixturePath) && match.name.startsWith('BLOCKS_')) {
        const mimirBlockPath = path.join(FIXTURES_DIR, planet, `${match.name}_MIMIR.json`)
        if (fs.existsSync(mimirBlockPath)) fixturePath = mimirBlockPath
      }
    } else if (url.href.includes('mimir')) {
      const mimirFull = path.join(FIXTURES_DIR, planet, 'mimir.json')
      fixturePath = fs.existsSync(mimirFull)
        ? mimirFull
        : path.join(FIXTURES_DIR, planet, 'CHARACTER_GET_AVATAR_MIMIR_SIMPLE.json')
    } else if (
      query.includes('GetAvatarDetail') ||
      query.includes('avatar_') ||
      query.includes('GetAgentAvatars')
    ) {
      fixturePath = path.join(FIXTURES_DIR, planet, 'headless.json')
    } else {
      fixturePath = path.join(FIXTURES_DIR, planet, 'headless.json')
    }

    // 2. Final Blocks Fallback (if still no fixture found via registry)
    if (
      !fs.existsSync(fixturePath) &&
      (query.includes('GetLatestBlock') || query.includes('GetBlocks'))
    ) {
      const fallbackPath = path.join(FIXTURES_DIR, planet, 'BLOCKS_GET_LATEST_MIMIR.json')
      if (fs.existsSync(fallbackPath)) fixturePath = fallbackPath
    }

    // 3. Special case for transaction status if fixture is missing (always success for tests)
    if (!fs.existsSync(fixturePath) && query.includes('GetTransactionStatus')) {
      return HttpResponse.json({
        data: {
          transaction: {
            object: {
              txStatus: 'SUCCESS',
            },
          },
        },
      })
    }

    if (fixturePath && fs.existsSync(fixturePath)) {
      const fileContent = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      const rawData = (fileContent.stateQuery || fileContent) as Record<string, unknown>
      const stateQuery = (fileContent.stateQuery || {}) as Record<string, unknown>

      let finalData: Record<string, unknown> = {}

      // Handle Dynamic Aliases (avatar_..., unlockedWorldIds_...)
      if (query.includes('avatar_') || query.includes('unlockedWorldIds_')) {
        const matchAvatarPrefix = body.query.match(/(avatar|unlockedWorldIds)_([a-fA-F0-9x]+)/g)
        const wrappedData: Record<string, unknown> = {}

        if (matchAvatarPrefix) {
          matchAvatarPrefix.forEach((prefix) => {
            const type = prefix.split('_')[0]
            if (rawData[prefix]) {
              wrappedData[prefix] = rawData[prefix]
            } else if (type === 'avatar') {
              const anyAvatarKey = Object.keys(rawData).find((k) => k.startsWith('avatar_'))
              wrappedData[prefix] = anyAvatarKey ? rawData[anyAvatarKey] : rawData.avatar || rawData
            } else if (type === 'unlockedWorldIds') {
              const anyUnlockedKey = Object.keys(rawData).find((k) =>
                k.startsWith('unlockedWorldIds_'),
              )
              wrappedData[prefix] = anyUnlockedKey
                ? rawData[anyUnlockedKey]
                : rawData.unlockedWorldIds || []
            }
          })
        }

        // If query doesn't use aliases but we have them in fixture, or vice versa
        if (!wrappedData.avatar && !wrappedData.unlockedWorldIds) {
          const anyAvatarKey = Object.keys(rawData).find((k) => k.startsWith('avatar_'))
          if (anyAvatarKey) wrappedData.avatar = rawData[anyAvatarKey]
        }

        finalData = {
          ...wrappedData,
          agent: rawData.agent || stateQuery.agent,
          stakeState: rawData.stakeState || stateQuery.stakeState,
        }

        // Ensure 'avatar' is available if requested without alias
        if (query.includes('avatar(') && !query.includes('avatar_') && !finalData.avatar) {
          const anyAvatarKey = Object.keys(rawData).find((k) => k.startsWith('avatar_'))
          if (anyAvatarKey) finalData.avatar = rawData[anyAvatarKey]
        }
      }
      // Handle Agent Avatars List
      else if (query.includes('GetAgentAvatars')) {
        finalData = {
          agent: rawData.agent || stateQuery.agent,
        }
      }
      // Handle Mimir or Blocks (Direct)
      else if (
        url.href.includes('mimir') ||
        query.includes('blocks') ||
        query.includes('actionPoint')
      ) {
        finalData = rawData
      }
      // Default wrapping for headless
      else {
        finalData = rawData
        // Fallback for non-aliased avatar request
        if (query.includes('avatar(') && !finalData.avatar) {
          const anyAvatarKey = Object.keys(rawData).find((k) => k.startsWith('avatar_'))
          if (anyAvatarKey) finalData.avatar = rawData[anyAvatarKey]
        }
      }

      // Final check: if query has stateQuery block, we must wrap in stateQuery
      if (query.includes('stateQuery') && !finalData.stateQuery && !finalData.blocks) {
        return HttpResponse.json({ data: { stateQuery: finalData } })
      }

      return HttpResponse.json({ data: finalData })
    }

    console.warn(
      `[MSW] GQL Fixture not found: ${planet} - ${match?.name || 'Unknown'}. Path: ${fixturePath}`,
    )
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Proxy Requests (GET)
  http.get('*/get-proxy', ({ request }) => {
    const url = new URL(request.url)
    const targetUrlString = url.searchParams.get('url')
    if (!targetUrlString) return new HttpResponse(null, { status: 400 })

    const targetUrl = new URL(targetUrlString)

    // Handle Season Pass via Proxy
    if (targetUrl.pathname.includes('/api/user/status/all')) {
      let planet = 'odin'
      const planetId = targetUrl.searchParams.get('planet_id')
      if (planetId === '0x000000000001') planet = 'heimdall'

      const fixturePath = path.join(FIXTURES_DIR, planet, 'season.json')
      if (fs.existsSync(fixturePath)) {
        const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
        return HttpResponse.json(content)
      }
    }

    // Handle Arena Seasons via Proxy
    if (targetUrl.pathname.includes('/arena/season')) {
      let planet = 'odin'
      const planetId = targetUrl.searchParams.get('planetId')
      if (planetId === '0x000000000001') planet = 'heimdall'
      if (planetId === '0x000000000002') planet = 'thor'

      const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_seasons.json')
      if (fs.existsSync(fixturePath)) {
        const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
        return HttpResponse.json(content)
      }
      return HttpResponse.json(['Season 19', 'Season 20'])
    }

    // Handle Arena Rankings via Proxy
    if (targetUrl.pathname.includes('/arena') && !targetUrl.pathname.includes('/season')) {
      let planet = 'odin'
      const planetId = targetUrl.searchParams.get('planetId')
      if (planetId === '0x000000000001') planet = 'heimdall'
      if (planetId === '0x000000000002') planet = 'thor'

      const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_ranking.json')
      if (fs.existsSync(fixturePath)) {
        const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
        // Primary API expects an array of ranks directly
        return HttpResponse.json(content.ranks || content)
      }

      return HttpResponse.json([
        { Name: 'Alice', AvatarAddress: '0x1', Score: 1000, Rank: 1, PortraitId: 10200000 },
        { Name: 'Bob', AvatarAddress: '0x2', Score: 900, Rank: 2, PortraitId: 10200000 },
      ])
    }

    // Handle api-check style arena requests via Proxy
    if (targetUrl.hostname.includes('api-check')) {
      let planet = 'odin'
      const network = targetUrl.searchParams.get('network')
      if (network) planet = network

      if (targetUrl.pathname.includes('season-list')) {
        const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_seasons.json')
        if (fs.existsSync(fixturePath)) {
          const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
          return HttpResponse.json({
            seasons: Array.isArray(content)
              ? content.map((s) => ({
                  championshipId: 0,
                  roundId: 0,
                  titleArena: s,
                  active: true,
                }))
              : [],
          })
        }
        return HttpResponse.json({
          seasons: [{ championshipId: 1, roundId: 1, titleArena: 'Fallback Season', active: true }],
        })
      }
      if (targetUrl.pathname.includes('ranking')) {
        const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_ranking.json')
        if (fs.existsSync(fixturePath)) {
          const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
          return HttpResponse.json(content)
        }
        return HttpResponse.json({
          ranks: [
            { Name: 'Alice', AvatarAddress: '0x1', Score: 1000, Rank: 1, PortraitId: 10200000 },
          ],
        })
      }
    }

    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Proxy Requests (POST)
  http.post('*/post-proxy', async ({ request }) => {
    const url = new URL(request.url)
    const targetUrlString = url.searchParams.get('url')
    if (!targetUrlString) return new HttpResponse(null, { status: 400 })

    // For now, we don't have specific POST proxy fixtures, but we can add them here if needed
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle 9cmd API (REST)
  http.get('*/getDataGraphql', ({ request }) => {
    const url = new URL(request.url)
    let planet = 'odin'
    if (url.searchParams.get('planet') === 'heimdall' || url.href.includes('heimdall'))
      planet = 'heimdall'

    const fixturePath = path.join(FIXTURES_DIR, planet, '9cmd.json')
    if (fs.existsSync(fixturePath)) {
      const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      return HttpResponse.json({ data: content })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Direct api-check style arena requests (Non-proxy)
  http.get('https://api-check.nine-chronicles.com/api/arena/*', ({ request }) => {
    const url = new URL(request.url)
    let planet = 'odin'
    const network = url.searchParams.get('network')
    if (network) planet = network

    if (url.pathname.includes('season-list')) {
      const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_seasons.json')
      if (fs.existsSync(fixturePath)) {
        const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
        return HttpResponse.json({
          seasons: Array.isArray(content)
            ? content.map((s) => ({
                championshipId: 0,
                roundId: 0,
                titleArena: s,
                active: true,
              }))
            : [],
        })
      }
      return HttpResponse.json({
        seasons: [{ championshipId: 1, roundId: 1, titleArena: 'Fallback Season', active: true }],
      })
    }
    if (url.pathname.includes('ranking')) {
      const fixturePath = path.join(FIXTURES_DIR, planet, 'arena_ranking.json')
      if (fs.existsSync(fixturePath)) {
        const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
        return HttpResponse.json(content)
      }
      return HttpResponse.json({
        ranks: [
          { Name: 'Alice', AvatarAddress: '0x1', Score: 1000, Rank: 1, PortraitId: 10200000 },
        ],
      })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Season Pass API
  http.get('*/api/user/status/all', ({ request }) => {
    const url = new URL(request.url)
    let planet = 'odin'
    const planetId = url.searchParams.get('planet_id')
    if (planetId === '0x000000000001') planet = 'heimdall'

    const fixturePath = path.join(FIXTURES_DIR, planet, 'season.json')
    if (fs.existsSync(fixturePath)) {
      const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      return HttpResponse.json(content)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle 9capi CSV Requests
  http.get('*/getGraphqlCSV', ({ request }) => {
    const url = new URL(request.url)
    const network = url.searchParams.get('network') || 'odin'
    const fixturePath = path.join(FIXTURES_DIR, `csv_${network}.json`)
    if (fs.existsSync(fixturePath)) {
      const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      return HttpResponse.json(content)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Planet Raw Data
  http.get('*/planets/', () => {
    const fixturePath = path.join(FIXTURES_DIR, 'planets.json')
    if (fs.existsSync(fixturePath)) {
      const content = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
      return HttpResponse.json(content)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Handle Static CSV Files
  http.get('*/item_name.csv', () => {
    const fixturePath = path.join(FIXTURES_DIR, 'item_name.csv')
    if (fs.existsSync(fixturePath)) {
      const content = fs.readFileSync(fixturePath, 'utf-8')
      return new HttpResponse(content, { headers: { 'Content-Type': 'text/csv' } })
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
