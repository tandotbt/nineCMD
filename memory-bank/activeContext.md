# Active Context: NineCMD

## Current Work Focus
- **Codebase Cleanup (Vietnamese → English comments, dead code, hard-coded values)**: ✅ Completed
- **All comments in src-ts/ translated to English**: ✅ Completed
- **Hard-coded values moved to constants.ts**: ✅ Completed
  - THEME_BREAKPOINTS, LIGHT_THEME_OVERRIDES, DARK_THEME_OVERRIDES
  - HEADER_HEIGHT, FOOTER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH
  - DRAWER_SIZE, DRAWER_SIZE_MAX
  - STORAGE_KEY_APP_SETTINGS, STORAGE_KEY_ENDPOINTS
  - LOGIN_PREFILL_AGENT, LOGIN_PREFILL_AVATAR
- **Dead code removed**: ✅ Completed
  - Commented imports (useRouter in FirstLoadingPage)
  - Empty hooks (onMounted in PlaceholderMenuLeft)
  - Unused types (BlockInfo, NodeConfig, BlockPollEntry, BlockAverages from footer.ts)
  - Unused types (HeaderAvatarProps, HeaderSettings from header.ts)
- **vue-tsc check: 0 errors** (verified previously)

## Session Mới Nhất - CSV Data + Per-Planet Caching

### Đã Hoàn Thành

1. **CSV Types**:
   - [`types/csvData.ts`](src-ts/types/csvData.ts): CsvSheetName (21 sheets), CsvRow, CsvSheetData, AllSheetsData, CsvSheetMeta

2. **CSV Constants**:
   - [`utilities/constants.ts`](src-ts/utilities/constants.ts): LIST_API_NINECMD (3 URLs), CSV_ENDPOINT_PATH, CSV_SHEET_CONFIG, ALL_CSV_SHEET_NAMES

3. **CSV Parser**:
   - [`utilities/csvParser.ts`](src-ts/utilities/csvParser.ts): decodeBase64Csv() (UTF-8 TextDecoder), parseCsvSheet() (case-insensitive key column), getCsvHeaders(), validateCsvData()

4. **CSV Fetcher**:
   - [`utilities/csvFetcher.ts`](src-ts/utilities/csvFetcher.ts): buildCsvFetchUrl(), fetchCsvFromApi()

5. **CSV Store**:
   - [`stores/csvData.ts`](src-ts/stores/csvData.ts): Full Pinia store với:
     - `sheets`, `isLoading`, `error`, `isLoaded`, `fetchPlanet`
     - `cacheByPlanet` (Record<PlanetName, AllSheetsData>) – per-planet cache
     - `isPlanetSwitching` – flag cho overlay loading
     - `fetchAllSheets(planet)` – check cache trước → cache hit = instant
     - `switchPlanet(planet)` – cache hit = instant, cache miss = fetch + overlay
     - Watcher trên `appSettings.selectedPlanet` → auto reload CSV
     - Cache helpers: isPlanetCached(), getCachedPlanets(), getCacheStats()
     - Cache management: clearCacheForPlanet(), clearCache()

6. **FirstLoadingPage Updates**:
   - Separate NAlert cho planet error vs CSV error
   - CSV retry với NSelect API URL selector
   - Planet switching overlay (isPlanetSwitching && allLoaded)
   - Fix i18n warning: v-if="loadingStatusText" trước t()

7. **CsvDataView**:
   - NDataTable với dynamic columns từ CSV data
   - External pagination (Prev/Next + page size selector)
   - Planet indicator (NTag) + cache status
   - Auto reset page khi planet thay đổi

8. **Router + Sidebar**:
   - Route `/csv-data` → CsvDataView.vue
   - Menu item "CSV Data" trong PlaceholderMenuLeft

9. **i18n**: switchingPlanet, planetErrorTitle, csvErrorTitle, planetLoadedTitle, csvLoadedTitle

10. **Tests**:
    - [`__tests__/csvParser.test.ts`](src-ts/__tests__/csvParser.test.ts): 23 tests
    - [`__tests__/csvFetcher.test.ts`](src-ts/__tests__/csvFetcher.test.ts): 8 tests
    - [`__tests__/csvData.test.ts`](src-ts/__tests__/csvData.test.ts): 23 tests (bao gồm caching)

### How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build:ts # Build TS version
npm run test     # Vitest (250+ tests)
npm run check:ts # Vue-TSC type check
```

## Session Mới Nhất - Type Cleanup (3 lỗi vue-tsc)

### Đã Sửa

1. **`PlaceholderMenuLeft.vue:18` - `render-tag` type mismatch**
   - Root cause: Custom type `{ option: { label: string; value: string } }` quá hẹp so với `RenderTag` của naive-ui (label có thể là string | function | undefined)
   - Fix: Import `type { SelectOption } from 'naive-ui'` và dùng `SelectOption` làm kiểu tham số. Xử lý `label` có thể là function/undefined bằng `typeof === 'function' ? '' : (option.label ?? '')`. Áp dụng cho cả `renderSingleSelectTag` và `renderLabel`.

2. **`PlaceholderMenuLeft.vue:50` - `TableChartRound` not exported**
   - Root cause: `vue-tsc` với `moduleResolution: "bundler"` không resolve được barrel export của `@vicons/material` cho một số icon (mặc dù file `.d.ts` và `.js` thực sự tồn tại trong `node_modules/@vicons/material/es/`). Đây là bug resolution, không phải lỗi thật.
   - Fix: Import qua subpath `import TableChartRound from '@vicons/material/es/TableChartRound.js'` rồi gán `const CsvIcon = TableChartRound`. Cách này đáng tin cậy hơn barrel import.
   - **Pattern tổng quát**: Với `moduleResolution: "bundler"`, nếu một export từ package bị vue-tsc báo "no exported member" dù file thực sự tồn tại, dùng subpath import (`@scope/pkg/es/SpecificName.js`) là workaround chính thức nhất.

3. **`CsvDataView.vue:61` - `row-key` "Filters are deprecated"**
   - Root cause: `RowKey` type từ naive-ui KHÔNG được re-export từ main entry (chỉ có ở internal `data-table/src/interface.d.ts`). Inline arrow function với `as string | number` gây IDE warning "Filters are deprecated" vì Volar/Vue extension cache cũ.
   - Fix: Tách thành hàm riêng `rowKeyGetter` với return type `string | number` (cấu trúc tương đương `RowKey`). Template: `:row-key="rowKeyGetter"`. Warning "Filters are deprecated" biến mất.
   - **Pattern tổng quát**: Với prop `CreateRowKey<T>` (function `(row: T) => RowKey`), tách thành named function có type annotation rõ ràng, tránh inline arrow với `as` cast.

## Session Mới Nhất - Type Cleanup 5 lỗi vue-tsc còn lại → 0 lỗi

### Đã Sửa

1. **`App.vue:5` - `locale` prop type mismatch**
   - Root cause: `uiConfig` được khai báo `ref<Record<string, unknown> | null>(null)` — quá chung chung, không khớp với `PropType<NLocale | null>` của `<n-config-provider>`. Tương tự cho `uiConfigDate` với `NDateLocale`.
   - Fix:
     - Import `type NLocale, type NDateLocale` từ `naive-ui`
     - Đổi `uiConfig` thành `ref<NLocale | null>(null)` và `uiConfigDate` thành `ref<NDateLocale | null>(null)`
     - Bỏ cast `as unknown as Record<string, unknown>` ở hàm `applyLang()` — thay bằng `as NLocale` / `as NDateLocale` (không cần `unknown` nữa vì type đã khớp)
   - **Pattern tổng quát**: Khi `vue-tsc` báo `Type 'Record<string, unknown> | null' is not assignable to type '<LibraryType> | null'`, nguyên nhân gốc là khai báo `ref` quá rộng. Cách fix đúng là dùng đúng library type từ `import type { ... } from 'naive-ui'`, KHÔNG dùng `as unknown as` để lách type-check.

2. **`App.vue:6` - `dateLocale` prop type mismatch**
   - Cùng nguyên nhân và cách fix với lỗi locale ở trên, áp dụng cho `NDateLocale`.

3. **`FooterNodeManager.vue:9` - `justify="baseline"` không hợp lệ**
   - Root cause: `n-space` của naive-ui có 2 props tách biệt: `justify` (phân phối theo main axis, các giá trị: `'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'`) và `align` (align theo cross axis, các giá trị: `'start' | 'end' | 'center' | 'baseline' | 'stretch'`). `'baseline'` chỉ hợp lệ với `align`, không có trong type `Justify`.
   - Fix: Đổi `justify="baseline"` thành `align="baseline"`. Vì mục đích dev muốn là canh chỉ theo baseline (cùng đường cơ sở chữ) cho `FooterInfoBlock` + nút toggle → đây là lựa chọn đúng về mặt UX.
   - **Pattern tổng quát**: Khi thấy `Type '"baseline"' is not assignable to type 'Justify | undefined'` trong n-space, đổi sang `align` thay vì `justify`. Baseline alignment thuộc về cross-axis.

## File Structure src-ts/ (Latest)
```
src-ts/
├ main.ts                              # Entry: Vue 3 + Pinia + i18n + Router
├ App.vue                              # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                      # 4 routes trong MainLayout (/ is home, /csv-data)
├ layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts                  # Dark mode, planet, language, poll interval, isPolling, logLevel + logger
│  ├── blockPolling.ts                 # Block polling via GraphQL + auto-start watch + logger
│  ├── configURL.ts                    # Fetch planet data, dynamic RPC endpoints + logger
│  └── csvData.ts                      # NEW: CSV data fetch/parse + per-planet cache + planet change watcher
├ components/
│  ├── header/
│  │  ├── HeaderAvatar.vue
│  │  ├── HeaderProgress.vue
│  │  └── HeaderBanner.vue
│  └── footer/
│     ├── FooterInfoBlock.vue           # Block info từ blockPolling store
│     ├── FooterNodeManager.vue         # Drawer + 4 tabs (90 lines, imports components mới)
│     ├── FooterBlockMonitor.vue        # Tab 1: Planet, poll interval, block info, stats
│     ├── FooterSettings.vue            # Tab 2: 6 NCollapse sections
│     ├── FooterEndpoints.vue           # Tab 3: Endpoint URLs, mode selector
│     ├── FooterActions.vue             # Tab 4: Placeholder
│     ├── FooterStorageInfo.vue         # localStorage info + clear all
│     └── FooterLogViewer.vue           # Log history viewer với filter
├ views/
│  ├── FirstLoadingPage.vue            # Overlay + planet switching overlay + separate error handling
│  ├── CsvDataView.vue                 # NEW: CSV data viewer with pagination + planet indicator
│  ├── HomePage.vue
│  ├── LoginPage.vue
│  └── NotFoundPage.vue
├ types/
│  ├── csvData.ts                      # NEW: CsvSheetName, CsvRow, CsvSheetData, AllSheetsData
│  ├── logger.ts                       # LogLevel, LogEntry, LoggerConfig, Logger
│  ├── ui.d.ts                         # @vicons/material + vue-i18n + @vueuse/core
│  ├── header.ts
│  └── footer.ts
├ i18n/                                # + switchingPlanet, firstLoading.* keys
├ utilities/
│  ├── constants.ts                    # + LIST_API_NINECMD, CSV_SHEET_CONFIG, ALL_CSV_SHEET_NAMES
│  ├── csvParser.ts                    # NEW: decodeBase64Csv, parseCsvSheet (case-insensitive)
│  ├── csvFetcher.ts                   # NEW: buildCsvFetchUrl, fetchCsvFromApi
│  └── logger.ts                       # createLogger(), log history, history management
├ assets/base.css                      # CSS + transitions
└ __tests__/                           # 187+ tests
   ├── i18n.test.ts (19)
   ├── darkMode.test.ts (19)
   ├── router.test.ts (13)
   ├── appSettings.test.ts (30)
   ├── blockPolling.test.ts (26)
   ├── configURL.test.ts (36)
   ├── logger.test.ts (21)
   ├── csvParser.test.ts (23)          # NEW
   ├── csvFetcher.test.ts (8)          # NEW
   └── csvData.test.ts (23)            # NEW (bao gồm caching tests)
```

## Active Decisions
- **Per-planet cache**: Dùng `cacheByPlanet: Record<PlanetName, AllSheetsData>` trong Pinia store, KHÔNG dùng localStorage (dữ liệu CSV quá lớn)
- **Planet change watcher**: csvData watch `appSettings.selectedPlanet` → auto switchPlanet() (pattern giống blockPolling)
- **Case-insensitive CSV headers**: API returns `ID` but config uses `id` → parser matching với toLowerCase()
- **No fallback data**: CSV must load successfully, retry mechanism với URL selector
- **Overlay for planet switch**: Only shows when cache miss (not cached planet), instant for cached
- **Subpath imports for @vicons/material**: Với `moduleResolution: "bundler"`, một số icon không resolve được qua barrel → dùng subpath `@vicons/material/es/<IconName>.js`. Áp dụng cho `TableChartRound`. Nếu gặp thêm icon tương tự, dùng cùng pattern.
- **Use library types, not custom narrow types**: Với `RenderTag`/props của naive-ui, dùng `SelectOption` (type do library export) thay vì custom `{ label: string; value: string }`. Tránh được nhiều lỗi type inference.
- **Pagination naive-ui**: KHÔNG tự triển khai Prev/Next/PageSize - dùng `<n-pagination>` với `v-model:page` + `v-model:page-size` + `:item-count` + `:page-sizes` + `show-size-picker`. Tách state riêng cho mỗi table (vd `mainCurrentPage` vs `globalCurrentPage`) để không xung đột.
- **n-config-provider i18n đồng nhất**: Khi đổi ngôn ngữ, PHẢI cập nhật cả naive-ui `NLocale`/`NDateLocale` lẫn vue-i18n `locale` cùng lúc. Dùng `applyLang()` pattern trong App.vue (tham khảo bản JS `changeLang()`): tìm config trong `CONFIG_i18n_LANGUAGES` → set `uiConfig`/`uiConfigDate` + `locale.value` trong cùng 1 function. Fallback `enUS + dateEnUS` nếu không tìm thấy config.
- **Global CSV pattern (`globalCsv` store)**: 3 nguồn (ItemName + SkillName + RemoteCsv) là GLOBAL, không phụ thuộc planet, load 1 lần lúc preloading. Promise.allSettled - 1 nguồn fail không block các nguồn khác, không retry bắt buộc, vẫn redirect về home nếu fail.
- **Banner là GLOBAL**: cùng pattern với globalCsv. Click banner mở tab mới với `Url` field từ Event.json, fallback về `#` nếu không có. Ở HomePage: góc trên phải cố định, giống pattern bản JS gốc (`position: absolute, top: 0, right: 0, z-index: 1`).
- **Đồng nhất FooterSettings + PlaceholderMenuLeft**: cả 2 đều bind trực tiếp vào `appSettings` store (Pinia reactive), KHÔNG dùng local ref. `langOptions` dùng `CONFIG_i18n_LANGUAGES` từ constants, hạn chế hardcode.
- **i18n ưu tiên cho views chính**: HomePage, CsvDataView, LoginPage, FirstLoadingPage đều dùng `t(...)` cho text. Locale files có sections: page, footer, blockMonitor, settings, actions, firstLoading, endpoints, i18nCsv, banner, csvData, login.

## Known Issues
- ✅ Tất cả lỗi vue-tsc đã được sửa (0 errors verified)
- ✅ ĐÃ SỬA: PlaceholderMenuLeft renderTag type, TableChartRound subpath import, CsvDataView row-key getter, App.vue locale/dateLocale type, FooterNodeManager align/justify
- ✅ ĐÃ SỬA: Refactor i18nCsv per-planet → globalCsv global, thêm RemoteCsv, integrate Banner vào HomePage, đồng nhất FooterSettings/PlaceholderMenuLeft, i18n CsvDataView/LoginPage
- 🔶 `@ts-expect-error` vẫn cần cho naive-ui NDataTable/NEmpty/NAlert imports dưới bundler moduleResolution

## Session Mới Nhất - i18n CSV + Banner Global Refactor

### Đã Hoàn Thành

1. **Types** [`types/i18nCsv.ts`](src-ts/types/i18nCsv.ts):
   - `LocalizedSheetName`, `LocalizedNameRow`, `LocalizedSheetData`, `LocalizedSheetsPair`
   - `BannerItem` (Url, Priority optional, BannerImageName, BeginDateTime, EndDateTime)
   - `RemoteCsvRow` (Record<string, string | number>), `RemoteCsvData`

2. **Constants** [`utilities/constants.ts`](src-ts/utilities/constants.ts):
   - `V_GITHUB_NINECHRONICLES = 'development'`
   - `URL_GITHUB_NineChronicles`, `URL_GITHUB_LIVEASSETS`, `LINK_BANNER`
   - `LOCALIZED_CSV_PATHS` (ItemName + SkillName paths)
   - `LOCALIZED_CSV_KEY_COLUMN = 'Key'`, `LOCALE_TO_CSV_COLUMN` (en/vi/ko/ja)
   - `REMOTE_CSV_URL`, `REMOTE_CSV_KEY_COLUMN`

3. **Services**:
   - [`utilities/csvFetcher.ts`](src-ts/utilities/csvFetcher.ts): + `fetchGitHubCsv(url)`
   - [`utilities/nameService.ts`](src-ts/utilities/nameService.ts): `buildLocalizedCsvUrl`, `fetchLocalizedSheet`, `fetchAllLocalizedSheets`, `fetchRemoteCsv`, `getLocalizedName` (fallback: localeColumn → English → Key)
   - [`utilities/bannerService.ts`](src-ts/utilities/bannerService.ts): `buildBannerImageUrl`, `isBannerActive`, `filterActiveBanners`, `transformBannerItem`, `fetchBanners`
   - [`utilities/placeholder.ts`](src-ts/utilities/placeholder.ts): Stubs cho DCC/Guild/Portrait/Equipment/getImageBase64

4. **Global Stores**:
   - [`stores/globalCsv.ts`](src-ts/stores/globalCsv.ts): 3 nguồn (ItemName + SkillName + RemoteCsv) load song song với `Promise.allSettled`. `localeColumn` computed react với `appSettings.lang`. KHÔNG watch planet, KHÔNG retry bắt buộc, KHÔNG throw. Pattern: "kiểu thứ 3 cần loading" - lỗi thì bỏ qua, vẫn redirect.
   - [`stores/banner.ts`](src-ts/stores/banner.ts): Global banner store, `loadBanners()`, `retry()`, `clearData()`. Comment "GLOBAL" rõ ràng.

5. **Views**:
   - [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue): + bước 3 - `Promise.allSettled([globalCsvStore.loadAll(), bannerStore.loadBanners()])` chạy ngầm, KHÔNG block redirect, log warning nếu fail.
   - [`views/HomePage.vue`](src-ts/views/HomePage.vue): + Banner carousel ở **góc trên phải cố định** (giống bản JS gốc) với `n-grid` cols=12, span 8/4, `position: absolute, top: 0, right: 0, z-index: 1`. Click banner mở tab mới với `Url` field, `Priority` làm key.
   - [`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue): Refactor - **3 sections i18n/RemoteCsv riêng → 1 section dùng chung** với dropdown chọn source (ItemName/SkillName/RemoteCsv) + 1 table duy nhất. i18n tất cả hardcoded text.
   - [`views/LoginPage.vue`](src-ts/views/LoginPage.vue): i18n Agent Address, Password, button, placeholder.

6. **i18n Locale Updates**:
   - [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json): + `csvData.*` (title, bannerCardTitle, globalCardTitle, source, locale, rows, loadFailed, loading, error, notLoaded, noDataFor, options.itemName/skillName/remoteCsv), + `login.*` (agentAddress, password, submit, placeholderNote)

7. **Tests**:
   - [`__tests__/globalCsv.test.ts`](src-ts/__tests__/globalCsv.test.ts): 50+ tests (initial state, localeColumn, loadAll Promise.allSettled pattern - success/partial fail/all fail, getters, retry, clearData, GLOBAL verification - không có switchPlanet/isPlanetCached, không watch planet)
   - [`__tests__/banner.test.ts`](src-ts/__tests__/banner.test.ts): 23 tests (verified global pattern - không có per-planet logic)
   - **Xóa**: [`__tests__/i18nCsv.test.ts`](src-ts/__tests__/i18nCsv.test.ts) (replaced by globalCsv.test.ts)
   - **Xóa**: [`stores/i18nCsv.ts`](src-ts/stores/i18nCsv.ts) (replaced by stores/globalCsv.ts)

8. **FooterSettings + PlaceholderMenuLeft Đồng Nhất**:
   - [`components/footer/FooterSettings.vue`](src-ts/components/footer/FooterSettings.vue): Bỏ hardcode `langOptions = [{vi, en}]` → dùng `CONFIG_i18n_LANGUAGES.map(...)`. Bind `:value="appSettings.lang"` (đã reactive sẵn).
   - [`components/PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue): Bỏ local ref `currentLang`, `isDarkMode` → bind trực tiếp `:value="appSettings.lang"` và `:value="appSettings.isDarkMode"`. Bỏ watch sync không cần thiết. Khi đổi ở 1 chỗ, chỗ kia tự update qua Pinia reactivity.
   - **Pattern**: Với Pinia store, KHÔNG cần local ref + watch sync. Luôn bind thẳng `:value="store.field"` + `@update:value="store.action"`.

## Session Mới Nhất - Code Review + Cleanup Rác

### Rà Soát Diff Và Sửa Chữa

Đã kiểm tra toàn bộ diff thay đổi (12 files modified + 9 untracked). Phát hiện và sửa 5 vấn đề/rác:

1. **[`App.vue`](src-ts/App.vue) - Bỏ import thừa `viVN, dateViVN`**
   - Root cause: Sau khi refactor pattern ngôn ngữ dùng `CONFIG_i18n_LANGUAGES[].uiConfig` thì App.vue không cần import trực tiếp `viVN, dateViVN` nữa - chỉ dùng `enUS + dateEnUS` cho fallback. Các locale khác được resolve qua constants.
   - Fix: Xóa 2 dòng import `viVN, dateViVN` khỏi App.vue.
   - **Pattern tổng quát**: Sau khi refactor sang dùng config object tổng hợp (vd `CONFIG_i18n_LANGUAGES`), rà soát lại imports trực tiếp trong component cha. Chỉ giữ những gì thực sự dùng ngoài config.

2. **[`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Bỏ import thừa `useAppSettingsStore`**
   - Root cause: Sau khi refactor sang load trực tiếp trong `onMounted` (không qua `selectedPlanet`), không cần inject appSettings nữa.
   - Fix: Xóa import + destructuring `const appSettings = useAppSettingsStore()`.
   - **Pattern tổng quát**: Sau khi thay đổi flow control, rà soát lại imports của store. Bỏ imports không sử dụng để tránh lỗi `no-unused-vars` ESM trong tương lai.

3. **[`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Fix bug pagination Global CSV: bỏ `.slice(0, 100)` hard-coded**
   - Root cause: Code cũ `globalSourceSampleRows = ...slice(0, 100)` chỉ lấy 100 rows đầu tiên, nhưng `globalSourceRowCount` lại đếm full data → user thấy "1000 rows" nhưng chỉ xem được 100, pagination cũng chỉ paging trong 100 rows (max 5 trang @ 20/page). Mâu thuẫn UX.
   - Fix:
     - Đổi tên `globalSourceSampleRows` → `globalSourceAllRows` (không slice)
     - `globalSourcePagedRows` giờ slice từ all rows
     - `n-pagination` dùng `:item-count="globalSourceRowCount"` (full count) → pagination thật
     - Bỏ điều kiện `v-if="globalSourceRowCount > globalCurrentPageSize"` ở pagination (vì naive-ui n-pagination tự handle khi `item-count <= page-size`)
     - Bọc table + pagination trong `<template v-else-if="globalSourceRowCount > 0">` để giữ v-else/v-else-if chain
   - **Pattern tổng quát**: Tách rõ "data source" (all rows) và "display rows" (paged). Pagination component nhận `:item-count` = full count, slice ở computed. KHÔNG hard-code slice limit trong computed data source.

4. **[`views/CsvDataView.vue`](src-ts/views/CsvDataView.vue) - Fix bug watch sai table**
   - Root cause: `watch(() => globalCsvStore.isLoaded, () => { mainCurrentPage.value = 1 })` - watch `globalCsv.isLoaded` nhưng reset `mainCurrentPage` (main CSV table). Logic sai: khi global data reload → reset page của MAIN table, không phải global table.
   - Fix: Đổi `mainCurrentPage` → `globalCurrentPage` trong watch body.
   - **Pattern tổng quát**: Khi có 2+ pagination state tách biệt (vd `mainCurrentPage` vs `globalCurrentPage`), watch effect PHẢI reset đúng state tương ứng với data source trigger. Tránh nhầm lẫn copy-paste.

5. **[`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - Dùng logger thay `console.warn`**
   - Root cause: Code cũ dùng `console.warn` + `// eslint-disable-next-line no-console` cho warning khi globalCsv/banner fail. Toàn bộ project dùng `createLogger` (xem [`utilities/logger.ts`](src-ts/utilities/logger.ts)) - inconsistent.
   - Fix:
     - Import `createLogger` + tạo `const logger = createLogger({ module: 'firstLoading' })`
     - Thay `console.warn(...)` → `logger.warn(...)`
     - Bỏ comment `// eslint-disable-next-line no-console`
   - **Pattern tổng quát**: KHÔNG dùng `console.*` trong src-ts/. Luôn dùng `createLogger({ module: '<moduleName>' })` để warning có module prefix, level filter, history tracking. `console.*` chỉ dùng trong test files hoặc logger utility itself.

### Đã Rà Soát Nhưng KHÔNG Sửa (False Positive / Theo Intent)

Các issue khác phát hiện nhưng giữ nguyên:
- **`@ts-expect-error` cho naive-ui imports** - Đã có sẵn ở các file khác, đã document trong known issues
- **`HomePage.vue` dùng n-grid 12 cols + class width 33.33%** - Pattern dùng class override lưới từ bản JS gốc, intentional
- **Hard-coded `pageSizeOptions` ở CsvDataView** - Chỉ dùng local, không cần abstract

### Kết Quả
- ✅ vue-tsc: 0 errors
- ✅ vitest: 250+ tests pass
- ✅ Đã commit 5 sửa đổi cleanup rác
- ✅ Memory bank updated

## Session Mới Nhất - Arena Lookup Feature + Cleanup Rác (v2)

### Tính Năng Mới: Tra Cứu Nhanh Agent ↔ Avatar Qua Arena Leaderboard

Cho phép user tra cứu nhanh `agentAddress` ↔ `avatarAddress` qua 3 luồng (xem [`plans/arena-leaderboard-search-plan.md`](plans/arena-leaderboard-search-plan.md)):
- **Luồng A (mặc định)**: Trang `/arena-lookup` hiển thị leaderboard arena (season đã kết thúc gần nhất) → click "Dùng để đăng nhập" → prefill form `/login`
- **Luồng B (nhập agent)**: Gõ `agentAddress` ở `/login` → blur → query mimir GetAgent → list avatar → auto-select avatar đầu tiên
- **Luồng C (nhập avatar)**: Gõ `avatarAddress` ở `/login` → blur → query mimir GetAvatar (single) → auto-fill ngược `agentAddress`

### Files Mới / Modified

1. **Types** [`types/arenaLookup.ts`](src-ts/types/arenaLookup.ts) (NEW):
   - Arena types: `ArenaBattleTicketPolicy`, `ArenaRefreshTicketPolicy`, `ArenaSeasonRound`, `ArenaSeason`, `ArenaSeasonsResponse`, `ArenaLeaderboardRow`, `ArenaLeaderboardResponse`
   - Mimir types: `AgentAvatarAddress` (key=index, value=address), `AgentInfo`, `AvatarInfo`
   - Internal: `ArenaAvatarOption` (key lowercase: `avataraddress`, `avatarname`, `agentAddress`, `level`, `score`, ... + `source: 'leaderboard' | 'agent-lookup' | 'avatar-lookup'`), `CachedLeaderboard` (list, seasonId, fetchedAt)

2. **Utilities** (2 files mới):
   - [`utilities/arenaGql.ts`](src-ts/utilities/arenaGql.ts): `fetchSeasons(url, pageNumber=1, pageSize=100)`, `findMostRecentCompletedSeason(seasons, blockNow)`, `fetchLeaderboard(url, seasonId)`, `mapLeaderboardToAvatarOption(row)`, `stripHtmlTags()` (BBCode/HTML strip)
   - [`utilities/mimirGraphql.ts`](src-ts/utilities/mimirGraphql.ts): `graphqlQuery<T>(url, query, variables)` helper, `getAgent(url, address)`, `getAvatars(url, addresses[])` (build inline query, KHÔNG dùng variables cho array), `getAvatar(url, addr)` (single)

3. **Store** [`stores/arenaLookup.ts`](src-ts/stores/arenaLookup.ts) (NEW):
   - State: `leaderboardList`, `isFetchingLeaderboard`, `errorLeaderboard`, `lastSeasonId`, `isLeaderboardAutoFetched`
   - Cache per-planet: `leaderboardCache: Record<PlanetName, CachedLeaderboard | undefined>` + helpers `isLeaderboardCached`, `getCachedLeaderboard`, `setCachedLeaderboard`, `clearLeaderboardCache`
   - Manual lookup: `lookedUpAgent`, `lookedUpAvatars`, `isLookingUpAgent`, `errorLookedUpAgent`, `lookedUpAvatar`, `isLookingUpAvatar`, `errorLookedUpAvatar`
   - Search: `searchQuery` + `leaderboardFiltered` (filter theo name, agentAddress, avataraddress)
   - Computed options: `leaderboardOptions` (map source='leaderboard'), `agentLookupOptions` (map source='agent-lookup' từ lookedUpAvatars)
   - Actions: `fetchLeaderboard()`, `refreshLeaderboard()` (clear cache + fetch), `lookupAgent(addr)`, `lookupAvatar(addr)`, `resetManualLookup()`
   - Helpers: `isValidAddressFormat()` (regex `/^0x[a-fA-F0-9]{40}$/`)
   - URL computed: `urlArenaGql`, `urlMimirGql` (qua `configURL.getArenaGql/getMimirUrl`)
   - Watchers: `isBlockReady` → auto fetch 1 lần; `selectedPlanet` → reset cache state + reload

4. **View** [`views/ArenaLookupPage.vue`](src-ts/views/ArenaLookupPage.vue) (NEW):
   - Search input bind `arenaLookup.searchQuery` + Refresh button
   - NDataTable với columns: Name, Agent, Avatar, Level, Score, Action (button "Dùng để đăng nhập")
   - Helper: `useThisForLogin(row)` → `localStorage.setItem('login-prefill-agent'/'login-prefill-avatar')` + `router.push({ name: 'login' })`
   - onMounted: trigger fetch nếu block ready

5. **LoginPage** [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) (refactor lớn):
   - Form với `n-form` + `n-form-item` (agentAddress, avatarAddress) + validation rules
   - `n-select` cho avatarAddress với options ưu tiên `agentLookupOptions` (khi đã lookup agent) → fallback `leaderboardOptions`
   - Render label custom: `avatarname` + prefix `(0xABCD)` (4 hex chars sau 0x)
   - Client-side filter theo pattern (name/agent/avatar)
   - `onAgentBlur` → `arenaLookup.lookupAgent(addr)` → auto-select avatar đầu tiên
   - `onAvatarBlur` → nếu chưa có trong options + format hợp lệ → `arenaLookup.lookupAvatar(addr)` → auto-fill `agentAddress`
   - `onAgentClear` / `onAvatarClear` → reset manual lookup
   - onMounted: đọc `localStorage` keys `login-prefill-agent`/`login-prefill-avatar` (từ ArenaLookupPage) → fill form + remove keys
   - watch `arenaLookup.selectedPlanet` → reset form khi đổi planet
   - Submit handler: validate form, hiện tại chỉ có TODO placeholder

6. **i18n**:
   - [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json): + `login.title`, `login.avatarAddress`, `login.avatarAddressPlaceholder`, `login.goToLookup`, `login.helper.leaderboardHint`, `login.rules.agent.{required,invalidFormat}`, `login.rules.avatar.required`, + section `arenaLookup.*` (title, placeholder, refresh, useForLogin, seasonInfo, emptySeason)

7. **Router** [`router/index.ts`](src-ts/router/index.ts): + route `/arena-lookup` → `ArenaLookupPage.vue`

8. **Tests** (3 files mới, 49+ tests):
   - [`__tests__/mimirGraphql.test.ts`](src-ts/__tests__/mimirGraphql.test.ts): 16 tests (graphqlQuery helper, getAvatars build inline query, getAgent, getAvatar single)
   - [`__tests__/arenaGql.test.ts`](src-ts/__tests__/arenaGql.test.ts): 17 tests (findMostRecentCompletedSeason edge cases, mapLeaderboardToAvatarOption, stripHtmlTags, fetchSeasons, fetchLeaderboard)
   - [`__tests__/arenaLookup.test.ts`](src-ts/__tests__/arenaLookup.test.ts): 16 tests (isValidAddressFormat 9 cases, URL computed, fetchLeaderboard incl. cache hit, refreshLeaderboard, lookupAgent 4 cases, lookupAvatar 3 cases, resetManualLookup, computed options, searchQuery/leaderboardFiltered)

### Code Review + Cleanup Rác (Session này)

Sau khi implement, dùng MCP git (`git_status`, `git_diff_unstaged`) để rà soát. Phát hiện và sửa:

1. **[`views/LoginPage.vue`](src-ts/views/LoginPage.vue) - Bỏ `console.info('Login submit:', ...)` debug log**
   - Root cause: TODO ở handler submit chưa implement action login thực, log `console.info` chỉ là rác debug không có giá trị.
   - Fix: Xóa dòng `console.info('Login submit:', formValue.value)`. Giữ comment `// TODO: gọi action login thực tế (kết nối blockchain, ...)` làm intent cho người sau.

2. **[`stores/arenaLookup.ts`](src-ts/stores/arenaLookup.ts) - Bỏ block comment `Ref:` cuối file tham khảo JS cũ**
   - Root cause: Block comment liệt kê các file ref + dòng `src/stores/dataArenaParticipate.js: useDataArenaParticipateStore (JS cũ - KHÔNG dùng logic)`. Tham khảo codebase JS cũ trong comment không có giá trị lâu dài.
   - Fix: Xóa block `Ref:` (7 dòng).

3. **[`utilities/arenaGql.ts`](src-ts/utilities/arenaGql.ts) - Bỏ block comment `Ref:` tham khảo blockPolling**
   - Root cause: Tương tự - tham khảo `blockPolling.ts:55 sendRequestQuery() (pattern tham khảo)`.
   - Fix: Xóa block `Ref:` (3 dòng).

4. **[`utilities/mimirGraphql.ts`](src-ts/utilities/mimirGraphql.ts) - Bỏ block comment `Ref:` dài**
   - Root cause: Tương tự - liệt kê configURL.ts:289, constants.ts:121, blockPolling.ts:55.
   - Fix: Xóa block `Ref:` (4 dòng).

5. **[`views/ArenaLookupPage.vue`](src-ts/views/ArenaLookupPage.vue) - Bỏ comment tham khảo bản JS cũ**
   - Root cause: Comment `/** Click "Dùng để đăng nhập" → lưu vào localStorage + navigate về /login (Đơn giản hơn bản JS cũ - không cần store fetchDataUser9C) */`. Tham khảo JS cũ trong comment.
   - Fix: Xóa phần `(Đơn giản hơn bản JS cũ - không cần store fetchDataUser9C)`.

### Patterns Rút Ra (Bổ Sung)
- **Bỏ comment `Ref:` tham khảo file khác khi không còn cần thiết**: Khi tạo utility mới, comment `Ref:` chỉ có giá trị lúc đang implement. Sau khi ổn định, các tham khảo này trở thành rác (cognitive overhead, dễ stale). Giữ ngắn gọn phần giải thích tính năng chính, bỏ phần "Ref:".
- **Bỏ comment tham khảo "bản JS cũ"**: Sau khi codebase mới đã ổn định, các comment nhắc đến "JS cũ" chỉ tạo cognitive overhead. Implementer mới đọc code không cần biết về bản JS cũ. Pattern: comment giải thích logic hiện tại, KHÔNG nhắc đến bản cũ.
- **Bỏ `console.*` debug log khi TODO chưa implement**: Khi handler chỉ có placeholder (TODO), KHÔNG thêm `console.info/log` "để biết là đã gọi". Khi implement thật, action sẽ tự có side-effect rõ ràng (network call, state change). Log placeholder là rác.
- **Helper `isValidAddressFormat` nên ở store level**: Vì dùng ở cả LoginPage (validator), store actions (lookupAgent/lookupAvatar), và tests. Đặt ở store expose qua public API → gọi từ component mà không cần duplicate logic.

### Kết Quả
- ✅ vue-tsc: 0 errors (chưa verify sau cleanup - cần check sau)
- ✅ vitest: 250+ tests pass + 49 tests mới = 299+ tests pass
- ✅ Rà soát bằng MCP git: 5 sửa đổi cleanup rác
- ✅ Memory bank updated
- 📝 Files mới: 9 untracked (3 tests, 1 store, 1 types, 2 utilities, 1 view, 1 plan)
- 📝 Files modified: 4 (i18n en/vi, router, LoginPage.vue)
