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
  - All Vietnamese comments translated to English
  - Hard-coded values moved to constants.ts
  - Dead code removed (unused types, commented imports, empty hooks)
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

### Tests: 187+ Tests ✅
| Test File | Tests | Status |
|-----------|-------|--------|
| i18n.test.ts | 19 | ✅ |
| darkMode.test.ts | 19 | ✅ |
| router.test.ts | 13 | ✅ |
| appSettings.test.ts | 30 | ✅ |
| blockPolling.test.ts | 26 | ✅ |
| configURL.test.ts | 36 | ✅ |
| logger.test.ts | 21 | ✅ |
| csvParser.test.ts | 23 | ✅ |
| csvFetcher.test.ts | 8 | ✅ |
| csvData.test.ts | 23 | ✅ |
| **Total** | **218** | **✅** |

### Known Issues
- ✅ Tất cả lỗi vue-tsc đã được sửa (0 errors verified bằng `npx vue-tsc --noEmit`)
- ✅ ĐÃ SỬA: PlaceholderMenuLeft renderTag type, TableChartRound subpath import, CsvDataView row-key getter, App.vue locale/dateLocale type, FooterNodeManager align/justify
- 🔶 `@ts-expect-error` vẫn cần cho naive-ui NDataTable/NEmpty/NAlert imports dưới bundler moduleResolution

### Phase 2f: Type Cleanup 5 lỗi vue-tsc còn lại ✅
- [x] [`App.vue`](src-ts/App.vue) - Import `type NLocale, type NDateLocale` từ `naive-ui`, đổi `uiConfig: ref<NLocale | null>(null)` và `uiConfigDate: ref<NDateLocale | null>(null)`. Bỏ cast `as unknown as Record<string, unknown>` ở `applyLang()`, thay bằng `as NLocale` / `as NDateLocale` (không cần `unknown` vì type khớp).
- [x] [`components/footer/FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Đổi `<n-space justify="baseline">` thành `<n-space align="baseline">` vì `baseline` không hợp lệ với `justify` (chỉ có trong `align` của n-space).
- [x] `npx vue-tsc --noEmit` → 0 errors

## File Structure
```
src-ts/
├ main.ts + App.vue (entry + FirstLoadingOverlay + watch store theme/lang)
├ router/index.ts (4 routes, / is home, /csv-data)
├ layouts/MainLayout.vue
├ stores/
│  ├── appSettings.ts (dark mode, planet, language, poll interval, isPolling, logLevel + logger)
│  ├── blockPolling.ts (GraphQL block polling + auto-start watch + logger)
│  ├── configURL.ts (fetch planet data, dynamic RPC endpoints + logger)
│  ├── csvData.ts (CSV data fetch/parse + per-planet cache + planet change watcher)
│  ├── globalCsv.ts (NEW: 3 nguồn global i18n+RemoteCsv, Promise.allSettled)
│  └── banner.ts (NEW: Global banner từ Event.json, clickable)
├ components/
│  ├── Placeholder{Header,MenuLeft,Footer,FloatButton}.vue
│  ├── header/{HeaderAvatar,HeaderProgress,HeaderBanner}.vue
│  └── footer/
│     ├── FooterInfoBlock.vue
│     ├── FooterNodeManager.vue (drawer + 4 tabs, 90 lines)
│     ├── FooterBlockMonitor.vue (Tab 1)
│     ├── FooterSettings.vue (Tab 2: 6 sections, langOptions dùng CONFIG_i18n_LANGUAGES)
│     ├── FooterEndpoints.vue (Tab 3)
│     ├── FooterActions.vue (Tab 4)
│     ├── FooterStorageInfo.vue (storage info)
│     └── FooterLogViewer.vue (log viewer)
├ views/ (FirstLoadingPage +bước 3, CsvDataView refactor dùng chung table, HomePage +Banner góc trên phải, LoginPage i18n, NotFoundPage)
├ types/ (csvData.ts, i18nCsv.ts, logger.ts, ui.d.ts, header.ts, footer.ts)
├ i18n/ (+ csvData.*, login.* keys)
├ utilities/ (constants.ts, csvParser.ts, csvFetcher.ts +fetchGitHubCsv, nameService.ts, bannerService.ts, placeholder.ts, logger.ts)
└ __tests__/ (250+ tests, 11 files)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (250+ tests) |
| `npm run check:ts` | Vue-TSC type check |

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
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + csvData.* (title, bannerCardTitle, globalCardTitle, source, locale, rows, loadFailed, loading, error, notLoaded, noDataFor, options), + login.* (agentAddress, password, submit, placeholderNote)
- [x] Tests: globalCsv (50+ tests) + banner (23 tests, verified global)

### Phase 2g: Pagination naive-ui + App.vue i18n Đồng Nhất ✅
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Replace pagination tự triển khai (Prev/Next/PageSize + n-text) → `<n-pagination>` của naive-ui với `v-model:page` + `v-model:page-size` + `:item-count` + `:page-sizes` + `show-size-picker`. Tách pagination state riêng cho 2 table: `mainCurrentPage`/`mainCurrentPageSize` (CSV chính 21 sheets) và `globalCurrentPage`/`globalCurrentPageSize` (Global CSV i18n/RemoteCsv) - không xung đột khi user chuyển source. Cleanup `totalPages`.
- [x] [`App.vue`](src-ts/App.vue) - n-config-provider i18n đồng nhất: thêm import `enUS, dateEnUS, viVN, dateViVN` (cho fallback), bỏ cast `as NLocale`/`as NDateLocale` (type của `langConfig.uiConfig` đã khớp), thêm fallback `enUS + dateEnUS` nếu `selectedLang` không có trong `CONFIG_i18n_LANGUAGES` (giống pattern JS). JSDoc giải thích flow đồng bộ: FooterSettings/MenuLeft → `appSettings.setLang()` → watcher → `applyLang()` → naive-ui + vue-i18n cập nhật cùng lúc.
- [x] Tests: 250+ pass, 0 errors vue-tsc (không cần thêm test mới vì pagination component của naive-ui, App.vue chỉ là wrapper)

### Phase 2h: Code Review + Cleanup Rác (sau refactor i18nCsv + Banner) ✅
Đã rà soát diff toàn bộ session refactor (12 files modified + 9 untracked) và phát hiện/sửa 5 vấn đề:

- [x] [`App.vue`](src-ts/App.vue) - **Bỏ import thừa** `viVN, dateViVN` (chỉ dùng qua `CONFIG_i18n_LANGUAGES[].uiConfig`, fallback chỉ cần `enUS, dateEnUS`)
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - **Bỏ import thừa** `useAppSettingsStore` (sau khi load trực tiếp trong onMounted)
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - **Fix bug pagination Global CSV**: bỏ `.slice(0, 100)` hard-coded trong data source (chỉ lấy 100 rows đầu nhưng đếm full → UX mâu thuẫn). Đổi tên `globalSourceSampleRows` → `globalSourceAllRows` (không slice), `globalSourcePagedRows` slice từ all, `n-pagination` dùng `:item-count` = full count, bọc table + pagination trong `<template v-else-if>` để giữ v-else chain
- [x] [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - **Fix bug watch sai table**: `watch(globalCsvStore.isLoaded, () => { mainCurrentPage.value = 1 })` → đổi thành `globalCurrentPage.value = 1` (watch global data mà reset main table = sai logic)
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - **Dùng `createLogger` thay `console.warn`**: import `createLogger`, tạo `const logger = createLogger({ module: 'firstLoading' })`, thay `console.warn` → `logger.warn`, bỏ `// eslint-disable-next-line no-console`
- [x] vue-tsc: 0 errors
- [x] vitest: 250+ pass

### Phase 2i: Arena Lookup Feature (Tra Cứu Agent ↔ Avatar) + Cleanup Rác (v2) ✅
- [x] [`types/arenaLookup.ts`](src-ts/types/arenaLookup.ts) - Arena types (ArenaSeason, ArenaLeaderboardRow, ...), Mimir types (AgentInfo, AvatarInfo, AgentAvatarAddress với key=index, value=address), Internal (ArenaAvatarOption, CachedLeaderboard)
- [x] [`utilities/arenaGql.ts`](src-ts/utilities/arenaGql.ts) - `fetchSeasons`, `findMostRecentCompletedSeason`, `fetchLeaderboard`, `mapLeaderboardToAvatarOption`, `stripHtmlTags` (BBCode/HTML)
- [x] [`utilities/mimirGraphql.ts`](src-ts/utilities/mimirGraphql.ts) - `graphqlQuery` helper, `getAgent`, `getAvatars` (build inline query, KHÔNG dùng variables cho array), `getAvatar` (single)
- [x] [`stores/arenaLookup.ts`](src-ts/stores/arenaLookup.ts) - Full Pinia store: leaderboard cache per-planet, manual lookup (agent/avatar), search/filter, computed options, watchers
- [x] [`views/ArenaLookupPage.vue`](src-ts/views/ArenaLookupPage.vue) - Search + NDataTable + "Dùng để đăng nhập" button → prefill LoginPage qua localStorage
- [x] [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - Refactor: form với agent/avatar address, n-select với leaderboard options, auto-lookup onBlur, watch planet change
- [x] [`router/index.ts`](src-ts/router/index.ts) - + route `/arena-lookup`
- [x] i18n: + `login.*` (title, avatarAddress, goToLookup, helper.leaderboardHint, rules.agent/avatar), + `arenaLookup.*` (title, placeholder, refresh, useForLogin, seasonInfo, emptySeason)
- [x] Tests: mimirGraphql (16) + arenaGql (17) + arenaLookup (16) = **49 tests mới, total 299+**
- [x] **Cleanup rác (MCP git rà soát)**:
  - [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - Bỏ `console.info('Login submit:', ...)` debug log (TODO chưa implement action login thực)
  - [`stores/arenaLookup.ts`](src-ts/stores/arenaLookup.ts) - Bỏ block comment `Ref:` tham khảo JS cũ (7 dòng)
  - [`utilities/arenaGql.ts`](src-ts/utilities/arenaGql.ts) - Bỏ block comment `Ref:` tham khảo blockPolling
  - [`utilities/mimirGraphql.ts`](src-ts/utilities/mimirGraphql.ts) - Bỏ block comment `Ref:` dài (4 dòng)
  - [`views/ArenaLookupPage.vue`](src-ts/views/ArenaLookupPage.vue) - Bỏ comment `(Đơn giản hơn bản JS cũ - không cần store fetchDataUser9C)`
- [x] Plan đầy đủ: [`plans/arena-leaderboard-search-plan.md`](plans/arena-leaderboard-search-plan.md) (2184 dòng, v4 final)

### Patterns Rút Ra Từ Code Review
Xem chi tiết trong [`systemPatterns.md`](memory-bank/systemPatterns.md) mục "Code Review Cleanup":
- **Bỏ import thừa sau refactor** - rà soát imports khi thay đổi flow control
- **Pagination tách data source vs display** - không hard-code slice limit trong computed data
- **v-else chain cần wrapper** - mỗi nhánh là 1 root element hoặc `<template v-if>`
- **Watch effect phải match data source** - copy-paste watch dễ nhầm field
- **Luôn dùng `createLogger` thay `console.*`** - module prefix + level filter + history
- **Pinia store reference qua closure** - gọi `useAppSettingsStore()` bên trong defineStore callback
- **i18n keys refactor pattern** - mỗi feature có section riêng + sub-section nested
- **GitHub CSV raw URL + cache busting** - dùng `#${planet}` ở cuối URL
- **Promise.allSettled cho best-effort parallel fetch** - không block UI khi 1 nguồn fail
- **Banner carousel ở góc cố định** - position absolute + n-grid 12 cols + 2 items span 8/4
- **Bỏ comment `Ref:` tham khảo file khác khi ổn định** - chỉ giữ phần giải thích tính năng chính
- **Bỏ comment "bản JS cũ"** - implementer mới không cần biết về bản cũ
- **Bỏ `console.*` debug khi TODO placeholder** - action thật sẽ có side-effect rõ ràng
- **Helper `isValidAddressFormat` ở store level** - dùng chung cho component + store actions + tests

## Kế Hoạch Tương Lai
1. **Giai đoạn 3**: Stores JS → TypeScript (10 stores)
2. **Giai đoạn 4**: Utilities JS → TypeScript (15+ files)
3. **Giai đoạn 5**: Testing & Review → Merge src-ts/ vào src/
