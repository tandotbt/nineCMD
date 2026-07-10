# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Library**: Naive UI (tree-shaking, direct imports)
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 5.0.7
- **Internationalization**: Vue-i18n ^11.4.4
- **Block Data**: GraphQL queries tới Mimir endpoint (thay WebSocket)
- **Avatar Data**: GraphQL queries tới Headless endpoint (buildQueryA) + REST API (fetchGetDataGraphql)
- **CSV Data**: 9CMD API `/getGraphqlCSV` → base64 → PapaParse → Pinia store
- **Planet Data**: Fetch từ `https://planets.nine-chronicles.com/planets/` (URL_ALL_PLANET)
- **Name Resolution**: globalCsv store (ItemName + SkillName + RemoteCsv) → localized names
- **Build Tool**: Vite 8.0.13
- **Testing**: Vitest 4.1.7
- **TypeScript**: TypeScript 6.0.3 (strict mode)
- **Utility Libraries**: `@vueuse/core` 14.3.0 (useStorage, refDebounced, onClickOutside)
- **Data Parsing**: PapaParse 5.5.3

## Development Setup
- **TypeScript**: `strict: true`, `noImplicitAny: true`, `isolatedModules: true`, `moduleResolution: bundler`
- **Dual Entry Points**: 
  - `index.html` → `src/main.js` (JS version, port 1414)
  - `index-ts.html` → `src-ts/main.ts` (TS version, port 1415)
- **Vite Configs**:
  - `vite.config.js` - JS version (alias `@/` → `src/`)
  - `vite-ts.config.js` - TS version (alias `@/` → `src-ts/`, plugin redirect)
- **ESLint**: `typescript-eslint` (parser + plugin)
- **Naive UI**: Direct imports (tree-shaking), KHÔNG dùng `app.use(naive)`

## TypeScript Migration Strategy
- **Dual version approach**: JS version giữ nguyên, TS version chạy song song trong `src-ts/`
- **Self-contained src-ts/**: Tự có types, constants, i18n - không import từ `src/`
- **Pinia stores**: `src-ts/stores/` cho appSettings + blockPolling + configURL + csvData + globalCsv + banner + arenaLookup + avatarDataDisplay
- **Gradual Migration**: `allowJs: true` + `checkJs: false` cho过渡期
- **Relative imports**: Dùng `../` thay `@/` trong src-ts/ (vì `@/` map tới `src/`)

## Technical Constraints
- **Hiệu suất**: Ứng dụng chạy mượt trên thiết bị cấu hình thấp (iPhone 6)
- **Tương thích**: Chrome, Firefox, Safari, Edge
- **API**: Nine Chronicles GraphQL (Mimir + Headless) + REST + URL_ALL_PLANET + 9CMD CSV endpoints
- **Đa hành tinh**: Odin/Heimdall/Thor với config riêng, dynamic từ API
- **TypeScript Strict Mode**: `strict: true` enforced
- **CSV Data Size**: 21 sheets, dữ liệu lớn → cache trong memory, KHÔNG localStorage

## Dependencies
### Runtime
- `vue` 3.5.34, `vue-router` 5.0.7, `vue-i18n` ^11.4.4
- `pinia` 3.0.4, `naive-ui` ^2.44.1
- `@vueuse/core` 14.3.0, `crypto-js` 4.2.0
- `papaparse` 5.5.3, `nanoid` 5.1.11

### Dev
- `typescript` ^6.0.3, `vite` ^8.0.13
- `@vitejs/plugin-vue` ^6.0.7, `@vitejs/plugin-vue-jsx` ^5.1.5
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`
- `vitest` ^4.1.7, `@vitest/ui`, `@vitest/coverage-v8`

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build    # Build JS version
npm run build:ts # Build TS version
npm run lint     # ESLint
npm run test     # Vitest (510 tests)
npm run check:ts # Vue-TSC type check (0 errors)
```

## TypeScript File Structure (Latest)
```
src-ts/                           # TS version (self-contained)
├ main.ts                        # Entry: Vue 3 + Pinia + i18n + Router
├ App.vue                        # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                # 6 routes (/ is home, /csv-data, /arena-lookup, /avatar-data)
├ layouts/MainLayout.vue         # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts            # Dark mode, planet, language, poll, isPolling, logLevel + logger
│  ├── blockPolling.ts           # GraphQL block polling + auto-start watch + logger
│  ├── configURL.ts              # Fetch planet data, dynamic RPC endpoints + logger
│  ├── csvData.ts                # CSV data fetch/parse + per-planet cache + planet change watcher
│  ├── globalCsv.ts              # 3 nguồn global (ItemName+SkillName+RemoteCsv), Promise.allSettled
│  ├── banner.ts                 # Global banner từ Event.json, clickable
│  ├── arenaLookup.ts            # Arena leaderboard + manual lookup + search/filter
│  └── avatarDataDisplay.ts      # NEW: Avatar data (GraphQL + REST API + CSV enrichment)
├ components/
│  ├── Placeholder*.vue          # Placeholder components (FloatButton, Header, MenuLeft, Footer)
│  ├── header/                   # HeaderAvatar, HeaderProgress, HeaderBanner
│  ├── footer/                   # 8 footer components (InfoBlock, NodeManager, BlockMonitor, Settings, Endpoints, Actions, StorageInfo, LogViewer)
│  └── avatarData/               # NEW: 5 avatar data components
│     ├── AvatarDataForm.vue         # Form agent + avatar address
│     ├── AvatarDataInfoTable.vue    # Character info (n-descriptions)
│     ├── AvatarDataInventoryTable.vue # 5 tabs inventory
│     ├── AvatarDataMaterialTable.vue  # Materials + Consumables
│     └── AvatarDataGraphqlTable.vue   # REST API data + Raw JSON
├ views/
│  ├── FirstLoadingPage.vue      # Overlay + planet switching overlay + separate error handling
│  ├── CsvDataView.vue           # CSV data viewer with pagination + planet indicator
│  ├── ArenaLookupPage.vue       # Arena leaderboard search + "Dùng để đăng nhập"
│  ├── AvatarDataView.vue        # NEW: Avatar data display (Form → Loading/Results)
│  ├── HomePage.vue + Banner carousel
│  ├── LoginPage.vue             # Login form + agent/avatar lookup + prefill to avatar-data
│  └── NotFoundPage.vue
├ types/
│  ├── arenaLookup.ts            # Arena + Mimir + Internal types
│  ├── avatarData.ts             # NEW: 30+ interfaces (AgentBalance, EquipmentItem, etc.)
│  ├── csvData.ts, footer.ts, header.ts, i18nCsv.ts, logger.ts, ui.d.ts
├ i18n/                          # + switchingPlanet, firstLoading.*, csvData.*, login.*, arenaLookup.*, avatarData.*
├ utilities/
│  ├── arenaGql.ts               # fetchSeasons, fetchLeaderboard, mapLeaderboard
│  ├── avatarDataGraphQL.ts      # NEW: buildQueryA/B, fetchQueryA, fetchGetDataGraphql
│  ├── avatarDataHelpers.ts      # NEW: Pure helpers (9 functions)
│  ├── bannerService.ts, constants.ts, csvFetcher.ts, csvParser.ts
│  ├── logger.ts, mimirGraphql.ts, nameService.ts, placeholder.ts
├ assets/base.css, main.css
└ __tests__/                     # 510 tests (18 files)
   ├── appSettings.test.ts       (30)
   ├── arenaGql.test.ts          (17)
   ├── arenaLookup.test.ts       (16)
   ├── banner.test.ts            (23)
   ├── blockPolling.test.ts      (26)
   ├── configURL.test.ts         (36)
   ├── csvData.test.ts           (23)
   ├── csvFetcher.test.ts        (8)
   ├── csvParser.test.ts         (23)
   ├── darkMode.test.ts          (19)
   ├── globalCsv.test.ts         (50+)
   ├── i18n.test.ts              (19)
   ├── logger.test.ts            (21)
   ├── mimirGraphql.test.ts      (16)
   └── router.test.ts            (13)
```

## Key Patterns
- **Naive UI tree-shaking**: Import components individually
- **Dark Mode**: Pinia store `appSettings.isDarkMode` → watch in App.vue → apply theme
- **i18n**: vue-i18n + Naive UI locale (enUS/viVN) + localStorage persistence via Pinia store
- **Block Polling**: GraphQL `blocks(take: 1)` → Mimir endpoint → calculate avg from index diff
- **ConfigURL**: Fetch từ URL_ALL_PLANET → dynamic RPC endpoints → random/manual selection
- **CSV Data**: 9CMD API → base64 → PapaParse → 21 sheets → Pinia store → search/filter
- **Per-Planet Cache**: `cacheByPlanet: Record<PlanetName, AllSheetsData>` → check cache before fetch
- **Planet Change Watcher**: csvData watch `appSettings.selectedPlanet` → auto switchPlanet()
- **FirstLoading**: Overlay backdrop → planet + CSV parallel fetch → countdown 3s → redirect home
- **Planet Selection**: Pinia stores shared between FooterNodeManager (UI) + blockPolling (data) + configURL (URLs) + csvData (CSV)
- **Logger**: `createLogger({ module })` → structured logging, log history (max 200), displayed in Settings tab
- **Auto-start Polling**: `watch(appSettings.isPolling, { immediate: true })` → auto start/stop
- **Footer Decomposition**: FooterNodeManager tách thành 6 components riêng
- **Avatar Data Decomposition**: 5 components (Form, InfoTable, InventoryTable, MaterialTable, GraphqlTable)
- **CSV Enrichment**: Raw GraphQL → helper functions enrich with CSV names/CP/skills/stats → display
- **GraphQL Response Unwrapping**: `graphqlQuery<T>()` returns `json.data` → callers access directly
- **Cross-Page Prefill**: localStorage one-shot pattern (ArenaLookup→Login, Login→AvatarData)
- **Test Setup**: `setActivePinia(createPinia())` + mock localStorage + mock fetch
- **Bundler moduleResolution quirks**: Subpath imports `@vicons/material/es/<Name>.js` for unreliable barrel exports
- **Library type exports**: `NLocale`, `NDateLocale` from naive-ui for `<n-config-provider>`
- **Type check command**: `npx vue-tsc --noEmit` → **0 errors**

## Constants Added for Avatar Data
- `COST_AP_BY_STAKE` — Array of `{ ncgStake, costAP }` for AP cost calculation
- `COST_AP_BY_STAKE_MIN` — Minimum AP cost (3)
- `STAGE_SPECIAL_PREFIX = '100000'` — Stage ID prefix for filtering special stages (replaced old `STAGE_MAX_NORMAL = 1000`)
- `AP_POTION_ID = 500000` — AP Potion item ID (special tradable/non-tradable handling)
- `AP_POTION_TRADABLE_OFFSET = 14000000` — Offset ID for tradable AP potion
- `DEFAULT_LEVEL_REQ = 888888` — Default level requirement when CSV data is missing
- `MAX_PURCHASE_COUNT = 40` — Max purchase count for world boss display
- `MAX_CHALLENGE_COUNT = 3` — Max challenge count for world boss display
- `AVATAR_DATA_CODE_GET_STATIC` — Static codeGet values for REST API
- `CODE_GET_RESPONSE_KEYS` — Response keys mapping for codeGet results
- `LOGIN_PREFILL_AGENT` — localStorage key for agent address prefill
- `LOGIN_PREFILL_AVATAR` — localStorage key for avatar address prefill
