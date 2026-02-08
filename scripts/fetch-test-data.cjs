/**
 * @file scripts/fetch-test-data.cjs
 * @description Fetches real API data based on the network registry and persists them as local fixtures.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename, {
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
})

const FIXTURES_DIR = path.resolve(__dirname, '../src/__tests__/fixtures')
const REGISTRY_PATH = path.resolve(__dirname, '../src/__tests__/network-registry.json')

async function getConfigs() {
  const { PLANET_CONFIGS } = await jiti.import('../src/constants/index.ts')
  return [
    {
      name: 'Heimdall',
      planet: 'heimdall',
      planetId: PLANET_CONFIGS.heimdall.id,
      agentAddress: '0x6374FE5F54CdeD72Ff334d09980270c61BC95186',
      avatarAddress: '0x79BB6e025762A76C8C85F73581e8c49b68FcaB0C',
      headlessUrl: PLANET_CONFIGS.heimdall.rpcEndpoints['headless.gql'][0],
      mimirUrl: PLANET_CONFIGS.heimdall.rpcEndpoints['mimir.gql'][0],
    },
    {
      name: 'Odin',
      planet: 'odin',
      planetId: PLANET_CONFIGS.odin.id,
      agentAddress: '0x6374FE5F54CdeD72Ff334d09980270c61BC95186',
      avatarAddress: '0x79BB6e025762A76C8C85F73581e8c49b68FcaB0C',
      headlessUrl: PLANET_CONFIGS.odin.rpcEndpoints['headless.gql'][0],
      mimirUrl: PLANET_CONFIGS.odin.rpcEndpoints['mimir.gql'][0],
    },
  ]
}

/**
 * Prunes large arrays and objects to keep fixtures manageable.
 */
function pruneData(data, maxArrayLength = 10) {
  if (data === null || data === undefined) return data
  if (Array.isArray(data)) {
    return data.slice(0, maxArrayLength).map((item) => pruneData(item, maxArrayLength))
  }
  if (typeof data === 'object') {
    const pruned = {}
    for (const key in data) {
      pruned[key] = pruneData(data[key], maxArrayLength)
    }
    return pruned
  }
  return data
}

async function fetchGraphql(url, query, variables = {}) {
  try {
    const response = await axios.post(url, { query, variables }, { timeout: 30000 })
    if (response.data.errors) {
      console.warn(`[GQL Warn] ${url}: ${response.data.errors[0].message}`)
      return null
    }
    return response.data.data
  } catch (error) {
    console.error(`[Fetch Error] ${url}: ${error.message}`)
    return null
  }
}

async function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('Registry not found. Please run scripts/scanner.cjs first.')
    process.exit(1)
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'))
  const { CHARACTER_QUERIES } = await jiti.import('../src/api/queries/character.ts')
  const { get9cmdApiUrl } = await jiti.import('../src/api/rest.ts')
  const { API_URLS } = await jiti.import('../src/constants/index.ts')
  const TEST_CONFIGS = await getConfigs()

  // 0. Fetch Planet Raw Data
  console.log('\n>>> Fetching Planet Raw Data <<<')
  try {
    const response = await axios.get(registry.rest.planetRaw.baseUrl, { timeout: 10000 })
    if (response.data) {
      fs.writeFileSync(
        path.join(FIXTURES_DIR, 'planets.json'),
        JSON.stringify(response.data, null, 2),
      )
      console.log('✓ Saved planets.json')
    }
  } catch (error) {
    console.warn(`! Planet Raw Data skipped: ${error.message}`)
  }

  // 1. Fetch Item Name CSV
  console.log('\n>>> Fetching Item Name CSV <<<')
  try {
    const response = await axios.get(API_URLS.SCAN_ITEM_NAME[0], { timeout: 30000 })
    if (response.data) {
      fs.writeFileSync(path.join(FIXTURES_DIR, 'item_name.csv'), response.data)
      console.log('✓ Saved item_name.csv')
    }
  } catch (error) {
    console.warn(`! Item Name CSV skipped: ${error.message}`)
  }

  for (const config of TEST_CONFIGS) {
    const planetDir = path.join(FIXTURES_DIR, config.planet)
    if (!fs.existsSync(planetDir)) {
      fs.mkdirSync(planetDir, { recursive: true })
    }

    console.log(`\n>>> Processing ${config.name} (${config.planet}) <<<`)

    // 0. Manual Fetch: Full Avatar Detail
    console.log('Fetching Full Avatar Detail (Dynamic Builder)...')
    const fullDetailQuery = CHARACTER_QUERIES.GET_AVATAR_DETAIL_FULL(
      config.avatarAddress,
      config.agentAddress,
    )
    const fullDetailData = await fetchGraphql(config.headlessUrl, fullDetailQuery)
    if (fullDetailData) {
      fs.writeFileSync(
        path.join(planetDir, 'headless.json'),
        JSON.stringify(pruneData(fullDetailData), null, 2),
      )
      console.log('✓ Saved headless.json')
    }

    // Helper to find query in registry
    const findQuery = (name) => {
      return (
        registry.graphql.headless.find((e) => e.name === name) ||
        registry.graphql.mimir.find((e) => e.name === name)
      )
    }

    // 1. Headless GQL from Registry
    let latestTxHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
    const blocksQueryLatestEntry = findQuery('BLOCKS_GET_LATEST')
    if (blocksQueryLatestEntry) {
      const latestBlock = await fetchGraphql(config.mimirUrl, blocksQueryLatestEntry.query)
      if (latestBlock && latestBlock.blocks?.items?.[0]?.object) {
        const blockObj = latestBlock.blocks.items[0].object
        // Try to get a real transaction hash if available, otherwise use block hash
        if (blockObj.txIds?.[0]) {
          latestTxHash = blockObj.txIds[0]
          console.log(`  Using real transaction hash: ${latestTxHash}`)
        } else {
          latestTxHash = blockObj.hash
          console.log(`  No transactions in block, using block hash: ${latestTxHash}`)
        }
      }
    }

    for (const entry of registry.graphql.headless) {
      if (entry.type !== 'query') continue

      console.log(`Fetching ${entry.name}...`)
      const variables = {
        agentAddress: config.agentAddress,
        avatarAddress: config.avatarAddress,
        skip: 0,
        take: 1,
        txHash: latestTxHash,
      }

      let data = await fetchGraphql(config.headlessUrl, entry.query, variables)
      // Fallback to Mimir if Headless fails (common for Blocks on some RPCs)
      if (!data) {
        console.log(`  ! Headless failed for ${entry.name}, trying Mimir...`)
        data = await fetchGraphql(config.mimirUrl, entry.query, variables)
      }

      if (data) {
        fs.writeFileSync(
          path.join(planetDir, `${entry.name}.json`),
          JSON.stringify(pruneData(data), null, 2),
        )
        console.log(`✓ Saved ${entry.name}.json`)
      }
    }

    // 2. Mimir GQL from Registry
    for (const entry of registry.graphql.mimir) {
      if (entry.type !== 'query') continue

      console.log(`Fetching ${entry.name}...`)
      const variables = {
        agentAddress: config.agentAddress,
        avatarAddress: config.avatarAddress,
        skip: 0,
        take: 1,
        txHash: latestTxHash,
      }

      const data = await fetchGraphql(config.mimirUrl, entry.query, variables)
      if (data) {
        fs.writeFileSync(
          path.join(planetDir, `${entry.name}.json`),
          JSON.stringify(pruneData(data), null, 2),
        )
        console.log(`✓ Saved ${entry.name}.json`)
      }
    }

    // 3. Extra: Fetch Blocks from Mimir too
    console.log('Fetching Blocks from Mimir...')
    const blocksQueryLatest = findQuery('BLOCKS_GET_LATEST')
    if (blocksQueryLatest) {
      const data = await fetchGraphql(config.mimirUrl, blocksQueryLatest.query)
      if (data) {
        fs.writeFileSync(
          path.join(planetDir, `BLOCKS_GET_LATEST_MIMIR.json`),
          JSON.stringify(pruneData(data), null, 2),
        )
        console.log('✓ Saved BLOCKS_GET_LATEST_MIMIR.json')
      }
    }

    // 4. 9cmd API
    console.log(`Fetching 9cmd API...`)
    try {
      const url = get9cmdApiUrl(
        registry.rest.api9cmd.baseUrl,
        config.avatarAddress,
        config.planet,
        registry.rest.api9cmd.params,
      )
      const response = await axios.get(url, { timeout: 10000 })
      if (response.data && response.data.data) {
        fs.writeFileSync(
          path.join(planetDir, '9cmd.json'),
          JSON.stringify(pruneData(response.data.data), null, 2),
        )
        console.log('✓ Saved 9cmd.json')
      }
    } catch (error) {
      console.warn(`! 9cmd API skipped: ${error.message}`)
    }

    // 5. Season Pass
    console.log(`Fetching Season Pass API...`)
    try {
      const url = `${registry.rest.seasonPass.baseUrl}/api/user/status/all?avatar_addr=${config.avatarAddress}&agent_addr=${config.agentAddress}&planet_id=${config.planetId}`
      const response = await axios.get(url, { timeout: 10000 })
      if (response.data) {
        fs.writeFileSync(
          path.join(planetDir, 'season.json'),
          JSON.stringify(pruneData(response.data), null, 2),
        )
        console.log('✓ Saved season.json')
      }
    } catch (error) {
      console.warn(`! Season Pass skipped: ${error.message}`)
    }

    // 6. Arena Ranking Data
    console.log(`Fetching Arena Ranking Data...`)
    try {
      // Fetch seasons first
      const seasonUrl = `${registry.rest.nineChroniclesApi.baseUrl}/arena/season?planetId=${config.planetId}`
      const seasonRes = await axios.get(seasonUrl, { timeout: 10000 })
      if (seasonRes.data && Array.isArray(seasonRes.data) && seasonRes.data.length > 0) {
        const latestSeason = seasonRes.data[0]
        fs.writeFileSync(
          path.join(planetDir, 'arena_seasons.json'),
          JSON.stringify(seasonRes.data, null, 2),
        )

        const rankingUrl = `${registry.rest.nineChroniclesApi.baseUrl}/arena?planetId=${config.planetId}&season=${encodeURIComponent(latestSeason)}&userSet=1`
        const rankingRes = await axios.get(rankingUrl, { timeout: 20000 })
        if (rankingRes.data) {
          fs.writeFileSync(
            path.join(planetDir, 'arena_ranking.json'),
            JSON.stringify(pruneData(rankingRes.data, 50), null, 2),
          )
          console.log(`✓ Saved arena_ranking.json (Season: ${latestSeason})`)
        }
      }
    } catch (error) {
      console.warn(`! Arena Ranking skipped: ${error.message}`)
    }
  }

  console.log('\nFixtures update process completed.')
}

main().catch(console.error)
