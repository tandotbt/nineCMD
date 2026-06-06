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
│  └── csvData.ts (CSV data fetch/parse + per-planet cache + planet change watcher)
├ components/
│  ├── Placeholder{Header,MenuLeft,Footer,FloatButton}.vue
│  ├── header/{HeaderAvatar,HeaderProgress,HeaderBanner}.vue
│  └── footer/
│     ├── FooterInfoBlock.vue
│     ├── FooterNodeManager.vue (drawer + 4 tabs, 90 lines)
│     ├── FooterBlockMonitor.vue (Tab 1)
│     ├── FooterSettings.vue (Tab 2: 6 sections)
│     ├── FooterEndpoints.vue (Tab 3)
│     ├── FooterActions.vue (Tab 4)
│     ├── FooterStorageInfo.vue (storage info)
│     └── FooterLogViewer.vue (log viewer)
├ views/ (FirstLoadingPage, CsvDataView, HomePage, LoginPage, NotFoundPage)
├ types/ (csvData.ts, logger.ts, ui.d.ts, header.ts, footer.ts)
├ i18n/ (+ switchingPlanet, firstLoading.* keys)
├ utilities/ (constants.ts, csvParser.ts, csvFetcher.ts, logger.ts)
└ __tests__/ (218 tests, 10 files)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (218 tests) |
| `npm run check:ts` | Vue-TSC type check |

## Kế Hoạch Tương Lai
1. **Giai đoạn 3**: Stores JS → TypeScript (10 stores)
2. **Giai đoạn 4**: Utilities JS → TypeScript (15+ files)
3. **Giai đoạn 5**: Testing & Review → Merge src-ts/ vào src/
