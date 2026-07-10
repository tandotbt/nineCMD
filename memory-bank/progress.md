# Progress: NineCMD UI Migration to TypeScript

## Overview
Chuyển đổi giao diện từ JavaScript sang TypeScript, chạy song song với hai entry points.

## Current Status
- **Giai đoạn 1 - Infrastructure + i18n + Testing**: ✅ Hoàn thành
- **Giai đoạn 2a - Vue Router + Layout + Modular Components**: ✅ Hoàn thành
- **Giai đoạn 2b - Block Polling + Pinia Stores + Settings**: ✅ Hoàn thành
- **Giai đoạn 2c - ConfigURL Store + FirstLoading Overlay + Endpoint Settings**: ✅ Hoàn thành
- **Giai đoạn 2d - Logger System + Settings Tab + Code Refactor**: ✅ Hoàn thành
- **Giai đoạn 2e - CSV Data Processing + Per-Planet Caching**: ✅ Hoàn thành
- **Giai đoạn 2f - Codebase Cleanup**: ✅ Hoàn thành
- **Giai đoạn 2g - i18n CSV + Banner Global Refactor**: ✅ Hoàn thành
- **Giai đoạn 2h - Pagination naive-ui + App.vue i18n Đồng Nhất**: ✅ Hoàn thành
- **Giai đoạn 2i - Code Review + Cleanup Rác (sau refactor)**: ✅ Hoàn thành
- **Giai đoạn 2j - Arena Lookup Feature + Cleanup Rác (v2)**: ✅ Hoàn thành
- **Giai đoạn 2k - Avatar Data Display Feature**: ✅ Hoàn thành
- **Giai đoạn 3**: Chuyển stores JS → TypeScript (10 stores)
- **Giai đoạn 4**: Chuyển utilities JS → TypeScript (15+ files)
- **Giai đoạn 5**: Testing & Review → Merge src-ts/ vào src/

## Đã Hoàn Thành

### Phase 1: Infrastructure + i18n + Testing
- [x] TS infrastructure, i18n, dark mode, 24 tests

### Phase 2a: Vue Router + Layout + Modular Components ✅
- [x] [`router/index.ts`](src-ts/router/index.ts) - 3 routes trong MainLayout
- [x] [`layouts/MainLayout.vue`](src-ts/layouts/MainLayout.vue) - Header+Sidebar+Content+Footer
- [x] Modular Header: PlaceholderHeader + HeaderAvatar/Progress/Banner
- [x] Sidebar: PlaceholderMenuLeft (menu + lang + dark mode via provide/inject)
- [x] Modular Footer: PlaceholderFooter + FooterInfoBlock/NodeManager (drawer toggle 70%↔100%)
- [x] Views: HomePage, LoginPage, NotFoundPage
- [x] Types: header.ts, footer.ts
- [x] i18n keys: page.home, page.login, page.notFound
- [x] CSS transitions (fade, slide-right)
- [x] [`__tests__/router.test.ts`](src-ts/__tests__/router.test.ts) - 13 tests

### Phase 2b: Block Polling + Pinia Stores + Settings ✅
- [x] [`stores/appSettings.ts`](src-ts/stores/appSettings.ts) - Pinia store: dark mode, planet, language, poll interval + localStorage persistence
- [x] [`stores/blockPolling.ts`](src-ts/stores/blockPolling.ts) - Pinia store: GraphQL block polling, avg block time, planet-specific Mimir URLs
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - Planet configs, Mimir URLs, poll interval options, GraphQL query
- [x] [`types/footer.ts`](src-ts/types/footer.ts) - FooterSettings.pollIntervalMs, BlockPollEntry, BlockAverages
- [x] [`types/naive-ui.d.ts`](src-ts/types/naive-ui.d.ts) - NSpin, NTooltip
- [x] [`FooterInfoBlock.vue`](src-ts/components/footer/FooterInfoBlock.vue) - Block info từ blockPolling store
- [x] [`FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Tab "Block Monitor" + Tab "Setting"
- [x] [`App.vue`](src-ts/App.vue) - Watch store for theme/language apply
- [x] Tests: appSettings (22) + blockPolling (22) + darkMode (19)

### Phase 2c: ConfigURL Store + FirstLoading Overlay + Endpoint Settings ✅
- [x] [`stores/configURL.ts`](src-ts/stores/configURL.ts) - Fetch planet data từ URL_ALL_PLANET, dynamic RPC endpoints
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - Overlay semi-transparent backdrop
- [x] [`App.vue`](src-ts/App.vue) - Import FirstLoadingOverlay
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - + URL_ALL_PLANET, PlanetData interfaces
- [x] [`stores/blockPolling.ts`](src-ts/stores/blockPolling.ts) - getMimirUrl() ưu tiên URL động
- [x] [`stores/appSettings.ts`](src-ts/stores/appSettings.ts) - + setPlanet() validate
- [x] [`FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - 4 tabs + disable unavailable planets
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + firstLoading.*, endpoints.*
- [x] Tests: configURL (36)

### Phase 2d: Logger System + Settings Tab + Code Refactor ✅
- [x] [`types/logger.ts`](src-ts/types/logger.ts) - LogLevel, LogEntry, LoggerConfig, Logger interfaces
- [x] [`utilities/logger.ts`](src-ts/utilities/logger.ts) - createLogger(), log history (max 200), format [HH:MM:SS] [module] LEVEL: message
- [x] [`__tests__/logger.test.ts`](src-ts/__tests__/logger.test.ts) - 21 tests
- [x] [`stores/appSettings.ts`](src-ts/stores/appSettings.ts) - +logger, +isPolling persistence, +logLevel persistence
- [x] [`stores/configURL.ts`](src-ts/stores/configURL.ts) - +logger thay console
- [x] [`stores/blockPolling.ts`](src-ts/stores/blockPolling.ts) - +logger, +persist isPolling, +auto-start watch
- [x] [`PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue) - Fix: bỏ useStorage direct, dùng Pinia store
- [x] [`FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Refactor: 350→90 lines, tách content
- [x] [`FooterBlockMonitor.vue`](src-ts/components/footer/FooterBlockMonitor.vue) - Tab 1: Planet, poll interval, block info, stats
- [x] [`FooterSettings.vue`](src-ts/components/footer/FooterSettings.vue) - Tab 2: 6 NCollapse sections
- [x] [`FooterEndpoints.vue`](src-ts/components/footer/FooterEndpoints.vue) - Tab 3: Endpoint URLs, mode selector
- [x] [`FooterActions.vue`](src-ts/components/footer/FooterActions.vue) - Tab 4: Placeholder
- [x] [`FooterStorageInfo.vue`](src-ts/components/footer/FooterStorageInfo.vue) - localStorage info + clear all
- [x] [`FooterLogViewer.vue`](src-ts/components/footer/FooterLogViewer.vue) - Log history viewer với filter
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + settings.*, logger.* keys
- [x] Auto-start polling: watch appSettings.isPolling → auto start/stop
- [x] Tests: appSettings (30) + blockPolling (26) + logger (21)

### Phase 2e: CSV Data Processing + Per-Planet Caching ✅
- [x] [`types/csvData.ts`](src-ts/types/csvData.ts) - CsvSheetName (21 sheets), CsvRow, CsvSheetData, AllSheetsData, CsvSheetMeta
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - + LIST_API_NINECMD, CSV_ENDPOINT_PATH, CSV_SHEET_CONFIG, ALL_CSV_SHEET_NAMES
- [x] [`utilities/csvParser.ts`](src-ts/utilities/csvParser.ts) - decodeBase64Csv() UTF-8, parseCsvSheet() case-insensitive, getCsvHeaders(), validateCsvData()
- [x] [`utilities/csvFetcher.ts`](src-ts/utilities/csvFetcher.ts) - buildCsvFetchUrl(), fetchCsvFromApi()
- [x] [`stores/csvData.ts`](src-ts/stores/csvData.ts) - Full Pinia store: fetch/parse/cache 21 sheets, per-planet cache, planet change watcher
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - Separate error handling (planet vs CSV), CSV retry with URL selector, planet switching overlay
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - CSV data viewer: NDataTable, dynamic columns, pagination, planet indicator + cache status
- [x] [`router/index.ts`](src-ts/router/index.ts) - + route `/csv-data`
- [x] [`PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue) - + "CSV Data" menu item
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + switchingPlanet, planetErrorTitle, csvErrorTitle, planetLoadedTitle, csvLoadedTitle
- [x] Tests: csvParser (23) + csvFetcher (8) + csvData (23, including caching)

### Phase 2f: i18n CSV + Banner Global Refactor + Đồng Nhất UI ✅
- [x] [`types/i18nCsv.ts`](src-ts/types/i18nCsv.ts) - LocalizedSheetName, LocalizedNameRow, LocalizedSheetData, BannerItem (Url, Priority), RemoteCsvRow, RemoteCsvData
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - + V_GITHUB_NINECHRONICLES, URL_GITHUB_NineChronicles, URL_GITHUB_LIVEASSETS, LINK_BANNER, LOCALIZED_CSV_PATHS, LOCALIZED_CSV_KEY_COLUMN, LOCALIZED_CSV_LOCALES, LOCALE_TO_CSV_COLUMN, REMOTE_CSV_URL, REMOTE_CSV_KEY_COLUMN
- [x] [`utilities/csvFetcher.ts`](src-ts/utilities/csvFetcher.ts) - + fetchGitHubCsv(url) helper
- [x] [`utilities/nameService.ts`](src-ts/utilities/nameService.ts) - buildLocalizedCsvUrl, fetchLocalizedSheet, fetchAllLocalizedSheets, fetchRemoteCsv, getLocalizedName (fallback chain)
- [x] [`utilities/bannerService.ts`](src-ts/utilities/bannerService.ts) - buildBannerImageUrl, isBannerActive, filterActiveBanners, transformBannerItem, fetchBanners
- [x] [`utilities/placeholder.ts`](src-ts/utilities/placeholder.ts) - Stubs DCC/Guild/Portrait/Equipment/getImageBase64
- [x] [`stores/globalCsv.ts`](src-ts/stores/globalCsv.ts) - **GLOBAL pattern**: 3 nguồn (ItemName+SkillName+RemoteCsv) load song song với Promise.allSettled, KHÔNG watch planet, KHÔNG retry bắt buộc. localeColumn react với appSettings.lang.
- [x] [`stores/banner.ts`](src-ts/stores/banner.ts) - **GLOBAL** banner store, clickable với Url field
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - + Bước 3: Promise.allSettled load globalCsv+banner chạy ngầm, KHÔNG block redirect
- [x] [`views/HomePage.vue`](src-ts/views/HomePage.vue) - + Banner carousel ở **góc trên phải cố định** (giống JS gốc), click mở tab mới với Url
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Refactor: 3 sections i18n/RemoteCsv → 1 section dùng chung với dropdown source + 1 table. i18n tất cả hardcoded text.
- [x] [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - i18n Agent Address, Password, button, placeholder
- [x] **Đồng nhất** FooterSettings + PlaceholderMenuLeft: bind trực tiếp appSettings (Pinia reactive), bỏ local ref + watch sync. langOptions dùng CONFIG_i18n_LANGUAGES
- [x] **Xóa**: stores/i18nCsv.ts + __tests__/i18nCsv.test.ts (replaced by stores/globalCsv.ts + __tests__/globalCsv.test.ts)
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + csvData.*, + login.*
- [x] Tests: globalCsv (50+ tests) + banner (23 tests, verified global)

### Phase 2g: Pagination naive-ui + App.vue i18n Đồng Nhất ✅
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Replace pagination tự triển khai → `<n-pagination>` của naive-ui
- [x] [`App.vue`](src-ts/App.vue) - n-config-provider i18n đồng nhất

### Phase 2h: Code Review + Cleanup Rác (sau refactor i18nCsv + Banner) ✅
- [x] [`App.vue`](src-ts/App.vue) - Bỏ import thừa `viVN, dateViVN`
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Bỏ import thừa `useAppSettingsStore`
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Fix bug pagination Global CSV: bỏ `.slice(0, 100)`
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Fix bug watch sai table (globalCurrentPage thay mainCurrentPage)
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - Dùng `createLogger` thay `console.warn`

### Phase 2i: Arena Lookup Feature + Cleanup Rác (v2) ✅
- [x] [`types/arenaLookup.ts`](src-ts/types/arenaLookup.ts) - Arena types, Mimir types, Internal types
- [x] [`utilities/arenaGql.ts`](src-ts/utilities/arenaGql.ts) - fetchSeasons, findMostRecentCompletedSeason, fetchLeaderboard, mapLeaderboardToAvatarOption, stripHtmlTags
- [x] [`utilities/mimirGraphql.ts`](src-ts/utilities/mimirGraphql.ts) - graphqlQuery helper, getAgent, getAvatars (inline query), getAvatar
- [x] [`stores/arenaLookup.ts`](src-ts/stores/arenaLookup.ts) - Full Pinia store: leaderboard cache per-planet, manual lookup, search/filter, computed options
- [x] [`views/ArenaLookupPage.vue`](src-ts/views/ArenaLookupPage.vue) - Search + NDataTable + "Dùng để đăng nhập" → prefill LoginPage
- [x] [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - Refactor: form agent/avatar, n-select, auto-lookup onBlur
- [x] [`router/index.ts`](src-ts/router/index.ts) - + route `/arena-lookup`
- [x] Tests: mimirGraphql (16) + arenaGql (17) + arenaLookup (16) = 49 tests mới
- [x] Cleanup rác: 5 sửa đổi (bỏ console.info debug, bỏ comment Ref:, bỏ comment "bản JS cũ")

### Phase 2k: Avatar Data Display Feature ✅

#### Files Mới (9 files)
- [x] [`types/avatarData.ts`](src-ts/types/avatarData.ts) - TypeScript interfaces: AgentBalance, StakeState, StageMap, RuneEntry, EquipmentStat, EquipmentSkill, StatsMap, EquipmentItem, EnrichedEquipment, CostumeItem, EnrichedCostume, MaterialItem, ConsumableItem, DedupedConsumable, InventoryData, CombinationSlot, ItemMap, AvatarGraphQL, CharacterInfo, CpRankingData, StatSkillResult, PatrolRewardInfo, GetDataGraphqlResponse
- [x] [`utilities/avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts) - Pure helper functions: calculateAPCost, getLatestStageClearedId, combatPotion, statAndSkillOption, getActiveWorldBossId, getActiveEventDungeon, getPatrolRewardInfo, processMaterials, dedupConsumables
- [x] [`utilities/avatarDataGraphQL.ts`](src-ts/utilities/avatarDataGraphQL.ts) - GraphQL queries: buildQueryA (single query for all node data), fetchQueryA (uses mimirGraphql.graphqlQuery<T>, returns already-unwrapped json.data), buildQueryB (dynamic material count query), fetchGetDataGraphql (REST API)
- [x] [`stores/avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts) - Pinia Composition API store: fetchStep1 (GraphQL), fetchStep2 (REST API), fillEquipments (enrich with CSV names/CP/skills), fillCostumes (enrich with CostumeStatSheet), uses globalCsv + csvData + blockPolling + appSettings + configURL
- [x] [`components/avatarData/AvatarDataForm.vue`](src-ts/components/avatarData/AvatarDataForm.vue) - Form agent + avatar address, reads prefill from localStorage on mount + auto-fetches
- [x] [`components/avatarData/AvatarDataInfoTable.vue`](src-ts/components/avatarData/AvatarDataInfoTable.vue) - n-descriptions bordered component for character info
- [x] [`components/avatarData/AvatarDataInventoryTable.vue`](src-ts/components/avatarData/AvatarDataInventoryTable.vue) - 5 tabs: Equipments, Costumes, Runes, Combination Slots, Equipped Summary
- [x] [`components/avatarData/AvatarDataMaterialTable.vue`](src-ts/components/avatarData/AvatarDataMaterialTable.vue) - 2 tabs: Materials, Consumables
- [x] [`components/avatarData/AvatarDataGraphqlTable.vue`](src-ts/components/avatarData/AvatarDataGraphqlTable.vue) - Tabs for REST API data (TODO placeholders) + Raw JSON viewer

#### Files Modified (6 files)
- [x] [`views/AvatarDataView.vue`](src-ts/views/AvatarDataView.vue) - Layout: Form → Loading/Error/NoData/Results, imports all 5 avatar data components
- [x] [`router/index.ts`](src-ts/router/index.ts) - + route `/avatar-data` before not-found
- [x] [`components/PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue) - + PersonSearchRound icon import (subpath), + "Avatar Data" menu item
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + `avatarData.*` section (form, info, inventory, material, graphql)
- [x] [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - onSubmit saves agent+avatar to localStorage + navigates to avatar-data
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - + COST_AP_BY_STAKE array, COST_AP_BY_STAKE_MIN

#### Bugs Fixed
- [x] **TypeScript `skills` type mismatch** trong avatarDataDisplay.ts - Fix: dùng explicit EquipmentSkill properties thay vì `[key: string]: unknown`
- [x] **Double-unwrap GraphQL response** - `graphqlQuery<T>()` đã trả về `json.data`, KHÔNG cần unwrap lần nữa. Fix ở avatarDataDisplay.ts (fetchStep1) + AvatarDataMaterialTable.vue
- [x] **PersonSearchRound subpath import** - Dùng `@vicons/material/es/PersonSearchRound.js` thay barrel import (pattern giống TableChartRound)

#### TODO Items (chưa implement)
- [ ] REST API Step 3: getDataGraphql tabs với real data (hiện tại là TODO placeholders)
- [x] Tests cho avatarDataHelpers, avatarDataGraphQL, avatarDataDisplay store (510 tests)

### Phase 2k-Optimization v3: Case-Insensitive Stats + Extract Helper + Test Coverage v2 ✅

- [x] **avatarDataHelpers.ts** — `statAndSkillOption()`: Case-insensitive statsMap comparison. Normalize `statKey = stat.statType.toUpperCase()`, use `key.toUpperCase()` for comparison. Fixes silent bug when statsMap uses different casing (hP vs HP).
- [x] **avatarDataDisplay.ts** — Extract `mergeMaterialCounts()` helper: Deduplicated material update logic (AP potion special case appeared 2x in fetchStep1). Removed redundant `as unknown as` double cast in `fillEquipments`.
- [x] **avatarDataHelpers.test.ts** — +6 tests: statAndSkillOption case-insensitive (uppercase keys, mixed-case, uppercase statType input), buildCodeGetList edge cases (blockNow=0, large values)
- [x] **avatarDataDisplay.test.ts** — +4 tests: mergeMaterialCounts (AP potion tradable split, Query B failure fallback), fillCostumes with CostumeStatSheet data, fetchStep2 REST API processing
- [x] **Kết quả**: 510 tests (từ 500), 18 test files

### Code Optimization v4 + Test Coverage v3 ✅
- [x] **avatarDataHelpers.ts** — Extract `resolveField()` + `parseSheetWithFields<T>()` shared helpers (DRY up CSV parsing)
- [x] **avatarDataGraphQL.ts** — Split `buildQueryA` into `AGENT_FIELDS`, `EQUIPMENT_FIELDS`, `buildAvatarFragment()` composable parts
- [x] **constants.test.ts** — NEW FILE, 40 tests covering all constants (i18n, planet, block polling, CSV, avatar data, GitHub URLs, theme/layout, type guards)
- [x] **avatarDataGraphQL.test.ts** — +17 tests (query structure validation, large inputs, URL encoding, fetch URL/query verification)
- [x] **Kết quả**: 582 tests (từ 525), 19 test files
- [x] **Git commit**: `1bdaedc`

### Phase 2k-Optimization v2: Code Optimization + Test Coverage ✅

- [x] **avatarDataHelpers.ts** — `statAndSkillOption()`: `for...in` + `Object.prototype.hasOwnProperty.call()` → `Object.keys()` (cleaner, modern API)
- [x] **avatarDataDisplay.ts** — `fillCostumes()`: Pre-build `Map<costumeId, Map<statType, statValue>>` từ CostumeStatSheet, per-costume lookup O(1) thay O(n) scan. Giảm complexity O(n*m) → O(n+m)
- [x] **avatarDataHelpers.test.ts** — +18 tests: statAndSkillOption edge cases (all 6 stat types, empty statsMap, multiple skills), processInventoryFromGraphQL tradableId undefined, calculateAPCost edge cases (large numbers, float, NaN), combatPotion all stats, parseWorldBossSheet/parseEventScheduleSheet edge cases
- [x] **avatarDataGraphQL.test.ts** — +1 test: fetchGetDataGraphql network error
- [x] **avatarDataDisplay.test.ts** — +5 tests: extractPatrolReward error/message strings, no data wrapper format, null fields, reset after full data load
- [x] **Kết quả**: 500 tests (từ 476), 18 test files

### Phase 2k-Optimization v1: Code Optimization (Post-Phase 2k) ✅

Đã rà soát toàn bộ diff bằng MCP git, phát hiện và sửa:

- [x] **constants.ts** — Xóa `STAGE_MAX_NORMAL = 1000`, thêm `STAGE_SPECIAL_PREFIX`, `DEFAULT_LEVEL_REQ`, `MAX_PURCHASE_COUNT`, `MAX_CHALLENGE_COUNT`
- [x] **avatarDataHelpers.ts** — Xóa dead code, extract `parseWorldBossSheet()` / `parseEventScheduleSheet()`, dùng `STAGE_SPECIAL_PREFIX`
- [x] **avatarDataDisplay.ts** — Xóa dead code, dùng constants, dùng parse helpers thay inline
- [x] **avatarDataGraphQL.ts** — Fix `fetchQueryB()` throw error khi null
- [x] **AvatarDataGraphqlTable.vue** — Thêm `fmtNum()` locale-aware, dùng constants

## File Structure (Latest)
```
src-ts/
├ main.ts                              # Entry: Vue 3 + Pinia + i18n + Router
├ App.vue                              # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                      # 6 routes trong MainLayout
├ layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts                  # Dark mode, planet, language, poll interval, isPolling, logLevel + logger
│  ├── blockPolling.ts                 # Block polling via GraphQL + auto-start watch + logger
│  ├── configURL.ts                    # Fetch planet data, dynamic RPC endpoints + logger
│  ├── csvData.ts                      # CSV data fetch/parse + per-planet cache + planet change watcher
│  ├── globalCsv.ts                    # 3 nguồn global (ItemName+SkillName+RemoteCsv), Promise.allSettled
│  ├── banner.ts                       # Global banner từ Event.json, clickable
│  ├── arenaLookup.ts                  # Arena leaderboard + manual lookup agent/avatar + search/filter
│  └── avatarDataDisplay.ts            # NEW: Avatar data display (GraphQL + REST API + CSV enrichment)
├ components/
│  ├── PlaceholderFloatButton.vue
│  ├── PlaceholderFooter.vue
│  ├── PlaceholderHeader.vue
│  ├── PlaceholderMenuLeft.vue         # Sidebar menu + lang + dark mode + CSV Data + Avatar Data items
│  ├── header/
│  │  ├── HeaderAvatar.vue
│  │  ├── HeaderBanner.vue
│  │  └── HeaderProgress.vue
│  ├── footer/
│  │  ├── FooterActions.vue
│  │  ├── FooterBlockMonitor.vue
│  │  ├── FooterEndpoints.vue
│  │  ├── FooterInfoBlock.vue
│  │  ├── FooterLogViewer.vue
│  │  ├── FooterNodeManager.vue       # Drawer + 4 tabs (90 lines)
│  │  ├── FooterSettings.vue          # Tab 2: 6 NCollapse sections
│  │  └── FooterStorageInfo.vue
│  └── avatarData/                     # NEW: Avatar Data Display components
│     ├── AvatarDataForm.vue           # Form agent + avatar address
│     ├── AvatarDataInfoTable.vue      # Character info (n-descriptions)
│     ├── AvatarDataInventoryTable.vue # 5 tabs: Equipment, Costumes, Runes, Combos, Summary
│     ├── AvatarDataMaterialTable.vue  # 2 tabs: Materials, Consumables
│     └── AvatarDataGraphqlTable.vue   # REST API data + Raw JSON viewer
├ views/
│  ├── FirstLoadingPage.vue            # Overlay + planet switching overlay + separate error handling
│  ├── CsvDataView.vue                 # CSV data viewer with pagination + planet indicator
│  ├── ArenaLookupPage.vue             # Arena leaderboard search + "Dùng để đăng nhập"
│  ├── AvatarDataView.vue              # NEW: Avatar data display (Form → Loading/Results)
│  ├── HomePage.vue                    # Home page + Banner carousel
│  ├── LoginPage.vue                   # Login form + agent/avatar lookup
│  └── NotFoundPage.vue
├ types/
│  ├── arenaLookup.ts                  # Arena + Mimir + Internal types
│  ├── avatarData.ts                   # NEW: All avatar data interfaces (30+ types)
│  ├── csvData.ts                      # CsvSheetName, CsvRow, CsvSheetData, AllSheetsData
│  ├── footer.ts
│  ├── header.ts
│  ├── i18nCsv.ts                      # LocalizedSheetName, BannerItem, RemoteCsv
│  ├── logger.ts                       # LogLevel, LogEntry, LoggerConfig, Logger
│  └── ui.d.ts                         # @vicons/material + vue-i18n + @vueuse/core
├ i18n/
│  ├── index.ts
│  ├── locales/en.json                 # English translations (avatarData.* section)
│  ├── locales/vi.json                 # Vietnamese translations (avatarData.* section)
│  ├── datetimeFormats/*.json
│  └── numberFormats/*.json
├ utilities/
│  ├── arenaGql.ts                     # Arena GraphQL: fetchSeasons, fetchLeaderboard, mapLeaderboard
│  ├── avatarDataGraphQL.ts            # NEW: buildQueryA/B, fetchQueryA, fetchGetDataGraphql
│  ├── avatarDataHelpers.ts            # NEW: Pure helpers (calculateAPCost, combatPotion, etc.)
│  ├── bannerService.ts                # Banner fetch + transform
│  ├── constants.ts                    # +COST_AP_BY_STAKE, +LOGIN_PREFILL_*, +CSV_SHEET_CONFIG
│  ├── csvFetcher.ts                   # buildCsvFetchUrl, fetchCsvFromApi, fetchGitHubCsv
│  ├── csvParser.ts                    # decodeBase64Csv (UTF-8), parseCsvSheet (case-insensitive)
│  ├── logger.ts                       # createLogger(), log history, history management
│  ├── mimirGraphql.ts                 # graphqlQuery<T> helper, getAgent, getAvatars, getAvatar
│  ├── nameService.ts                  # Localized name resolution (ItemName + SkillName + RemoteCsv)
│  └── placeholder.ts                  # Stubs for DCC/Guild/Portrait/Equipment
├ assets/
│  ├── base.css
│  └── main.css
└ __tests__/                           # 582 tests (19 files)
   ├── appSettings.test.ts             (30)
   ├── arenaGql.test.ts                (17)
   ├── arenaLookup.test.ts             (16)
   ├── banner.test.ts                  (23)
   ├── blockPolling.test.ts            (26)
   ├── configURL.test.ts               (36)
   ├── csvData.test.ts                 (23)
   ├── csvFetcher.test.ts              (8)
   ├── csvParser.test.ts               (23)
   ├── darkMode.test.ts                (19)
   ├── globalCsv.test.ts               (50+)
   ├── i18n.test.ts                    (19)
   ├── logger.test.ts                  (21)
   ├── mimirGraphql.test.ts            (16)
   └── router.test.ts                  (13)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (582 tests) |
| `npm run check:ts` | Vue-TSC type check |

## Kế Hoạch Tương Lai
1. **Phase 2k TODO**: Implement REST API Step 3 (getDataGraphql tabs với real data)
2. **Phase 2k TODO**: Viết tests cho avatarDataHelpers, avatarDataGraphQL, avatarDataDisplay store
3. **Phase 3**: Stores JS → TypeScript (10 stores)
4. **Phase 4**: Utilities JS → TypeScript (15+ files)
5. **Phase 5**: Testing & Review → Merge src-ts/ vào src/
