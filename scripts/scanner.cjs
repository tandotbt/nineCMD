/**
 * @file scripts/scanner.cjs
 * @description Scans the project for API endpoints and GraphQL queries to build a test registry.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { createJiti } = require('jiti');

const jiti = createJiti(__filename, {
  alias: {
    '@': path.resolve(__dirname, '../src'),
  },
});

const REGISTRY_PATH = path.resolve(__dirname, '../src/__tests__/network-registry.json');

async function scan() {
  console.log('Scanning for network calls...');

  const { GQL_QUERIES, CHARACTER_CODE_GETS, API_URLS } = await jiti.import('../src/constants/index.ts');

  const registry = {
    graphql: {
      headless: [],
      mimir: [],
    },
    rest: {
      api9cmd: {
        baseUrl: API_URLS.API_9CMD[0],
        params: CHARACTER_CODE_GETS,
      },
      seasonPass: {
        baseUrl: API_URLS.SEASON_PASS[0],
      },
      planetRaw: {
        baseUrl: API_URLS.PLANET_RAW[0],
      },
    },
  };

  /**
   * Normalizes a GraphQL query string by removing extra whitespace.
   */
  const normalizeGql = (q) => q.replace(/\s+/g, ' ').trim();

  /**
   * Recursively scans GQL_QUERIES object to extract query strings.
   */
  const scanGql = (obj, parentKey = '') => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        const isQuery = /^\s*query\b/.test(trimmedValue);
        const isMutation = /^\s*mutation\b/.test(trimmedValue);
        const isFragment = /^\s*fragment\b/.test(trimmedValue);

        if (isQuery || isMutation || isFragment) {
          const entry = {
            name: `${parentKey}${key}`,
            query: normalizeGql(trimmedValue),
            type: isQuery ? 'query' : isMutation ? 'mutation' : 'fragment',
          };
          // Heuristic to separate Mimir from Headless
          if (trimmedValue.toLowerCase().includes('actionpoint') ||
              trimmedValue.toLowerCase().includes('mimir') ||
              trimmedValue.toLowerCase().includes('blocks') ||
              trimmedValue.toLowerCase().includes('transaction') ||
              key.includes('MIMIR')) {
            registry.graphql.mimir.push(entry);
          } else {
            registry.graphql.headless.push(entry);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        scanGql(value, `${parentKey}${key}_`);
      }
    }
  };

  scanGql(GQL_QUERIES);

  // Write the registry
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`Successfully generated registry at ${REGISTRY_PATH}`);
  console.log(`Found ${registry.graphql.headless.length} Headless queries and ${registry.graphql.mimir.length} Mimir queries.`);
}

scan().catch((err) => {
  console.error('Scan failed:', err);
  process.exit(1);
});
