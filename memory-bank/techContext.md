# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Library**: Naive UI (tree-shaking, direct imports)
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 5.0.7
- **Internationalization**: Vue-i18n ^11.4.4
- **Block Data**: GraphQL queries tới Mimir endpoint (thay WebSocket)
- **CSV Data**: 9CMD API `/getGraphqlCSV` → base64 → PapaParse → Pinia store
- **Planet Data**: Fetch từ `https://planets.nine-chronicles.com/planets/` (URL_ALL_PLANET)
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
- **Pinia stores**: `src-ts/stores/` cho appSettings + blockPolling + configURL + csvData
- **Gradual Migration**: `allowJs: true` + `checkJs: false` cho过渡期
- **Relative imports**: Dùng `../` thay `@/` trong src-ts/ (vì `@/` map tới `src/`)

## Technical Constraints
- **Hiệu suất**: Ứng dụng chạy mượt trên thiết bị cấu hình thấp (iPhone 6)
- **Tương thích**: Chrome, Firefox, Safari, Edge
- **API**: Nine Chronicles GraphQL (Mimir) + REST + URL_ALL_PLANET + 9CMD CSV endpoints
- **Đa hành tinh**: Odin/Heimdall/Thor với config riêng, dynamic từ API
- **TypeScript Strict Mode**: `strict: true` enforced
- **CSV Data Size**: 21 sheets, dữ liệu lớn → cache trong memory, KHÔNG localStorage

## Codebase Cleanup (Phase 2f)

### Changes Made
- **All src-ts/ files**: Vietnamese comments → English (50+ files)
- **constants.ts**: Added THEME_BREAKPOINTS, LIGHT_THEME_OVERRIDES, DARK_THEME_OVERRIDES, HEADER_HEIGHT, FOOTER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH, DRAWER_SIZE, DRAWER_SIZE_MAX, STORAGE_KEY_APP_SETTINGS, STORAGE_KEY_ENDPOINTS, LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR
- **App.vue**: Uses THEME_BREAKPOINTS, LIGHT_THEME_OVERRIDES, DARK_THEME_OVERRIDES from constants
- **stores/appSettings.ts**: Uses STORAGE_KEY_APP_SETTINGS from constants
- **stores/configURL.ts**: Uses STORAGE_KEY_ENDPOINTS from constants
- **ArenaLookupPage.vue**: Uses LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR from constants
- **LoginPage.vue**: Uses LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR from constants
- **FooterStorageInfo.vue**: Uses STORAGE_KEY_APP_SETTINGS, STORAGE_KEY_ENDPOINTS from constants
- **types/footer.ts**: Removed unused BlockInfo, NodeConfig, BlockPollEntry, BlockAverages
- **types/header.ts**: Removed unused HeaderAvatarProps, HeaderSettings
- **FirstLoadingPage.vue**: Removed commented useRouter import
- **PlaceholderMenuLeft.vue**: Removed empty onMounted hook

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
npm run test     # Vitest (218 tests)
npm run check:ts # Vue-TSC type check
```

## TypeScript File Structure
```
src-ts/                           # TS version (self-contained)
├ main.ts                        # Entry: Vue 3 + Pinia + i18n
├ App.vue                        # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                # 4 routes (/ is home, /csv-data)
├ layouts/MainLayout.vue         # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts            # Dark mode, planet, language, poll, isPolling, logLevel + logger
│  ├── blockPolling.ts           # GraphQL block polling + auto-start watch + logger
│  ├── configURL.ts              # Fetch planet data, dynamic RPC endpoints + logger
│  └── csvData.ts                # CSV data fetch/parse + per-planet cache + planet change watcher
├ components/
│  ├── Placeholder*.vue          # Placeholder components
│  ├── header/                   # HeaderAvatar, HeaderProgress, HeaderBanner
│  └── footer/
│     ├── FooterInfoBlock.vue    # Block info từ blockPolling store
│     ├── FooterNodeManager.vue  # Drawer + 4 tabs (90 lines)
│     ├── FooterBlockMonitor.vue # Tab 1: planet, poll, stats
│     ├── FooterSettings.vue     # Tab 2: 6 NCollapse sections
│     ├── FooterEndpoints.vue    # Tab 3: endpoint URLs, mode
│     ├── FooterActions.vue      # Tab 4: placeholder
│     ├── FooterStorageInfo.vue  # localStorage info + clear
│     └── FooterLogViewer.vue    # Log history viewer
├ views/
│  ├── FirstLoadingPage.vue      # Overlay + planet switching overlay + separate error handling
│  ├── CsvDataView.vue           # CSV data viewer with pagination + planet indicator
│  ├── HomePage.vue, LoginPage.vue, NotFoundPage.vue
├ types/
│  ├── csvData.ts                # CsvSheetName (21 sheets), CsvRow, CsvSheetData, AllSheetsData
│  ├── logger.ts                 # LogLevel, LogEntry, LoggerConfig, Logger
│  ├── header.ts                 # Header component types
│  ├── footer.ts                 # + BlockPollEntry, BlockAverages
│  └── ui.d.ts                   # @vicons/material + vue-i18n + @vueuse/core
├ i18n/                          # + switchingPlanet, firstLoading.* keys
├ utilities/
│  ├── constants.ts              # + LIST_API_NINECMD, CSV_SHEET_CONFIG, ALL_CSV_SHEET_NAMES
│  ├── csvParser.ts              # decodeBase64Csv (UTF-8), parseCsvSheet (case-insensitive)
│  ├── csvFetcher.ts             # buildCsvFetchUrl, fetchCsvFromApi
│  └── logger.ts                 # createLogger(), log history, history management
├ assets/base.css                # CSS + transitions
└ __tests__/                     # 218 tests (10 files)
   ├── i18n.test.ts (19)
   ├── darkMode.test.ts (19)
   ├── router.test.ts (13)
   ├── appSettings.test.ts (30)
   ├── blockPolling.test.ts (26)
   ├── configURL.test.ts (36)
   ├── logger.test.ts (21)
   ├── csvParser.test.ts (23)
   ├── csvFetcher.test.ts (8)
   └── csvData.test.ts (23)
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
- **Test Setup**: `setActivePinia(createPinia())` + mock localStorage + mock fetch
- **Bundler moduleResolution quirks**: Với `moduleResolution: "bundler"` trong tsconfig, vue-tsc có thể không resolve một số barrel exports của package (vd `@vicons/material` → `TableChartRound`) dù file `.d.ts`/`.js` tồn tại. Workaround: dùng subpath `@scope/pkg/es/<Name>.js` (path cụ thể trỏ tới file). Verify lỗi bằng cách mở file `.d.ts` trong `node_modules/<pkg>/es/` để xác nhận symbol có tồn tại.
- **Library type exports**: Một số type của naive-ui (vd `RowKey`, `SelectOption`) có ở internal `data-table/src/interface.d.ts` nhưng KHÔNG re-export từ main entry. Dùng structural type khi cần (`string | number` thay vì `RowKey`).
- **Naive UI exported config types**: Config types cho `<n-config-provider>` được export từ main entry: `NLocale` (cho prop `locale`), `NDateLocale` (cho prop `dateLocale`). Khi khai báo `ref` cho các prop này, import `import type { NLocale, NDateLocale } from 'naive-ui'` và dùng `ref<NLocale | null>(null)`. KHÔNG dùng `ref<Record<string, unknown> | null>(null)` rồi cast `as unknown as` — vừa mất type-safety, vừa trigger lỗi vue-tsc.
- **Type check command**: `npx vue-tsc --noEmit` (alias `npm run check:ts`) - lệnh chính thức. Trên PowerShell dùng `;` thay `&&` để chain commands. Trạng thái hiện tại: **0 errors** sau khi fix 5 lỗi (App.vue locale/dateLocale, FooterNodeManager justify/align).
