# Active Context: NineCMD

## Current Work Focus
- **CSV Data Processing + Per-Planet Caching**: Hoàn thành
- **CSV Store**: `csvData` Pinia store fetch/parse 21 CSV sheets từ 9CMD API, per-planet cache
- **CSV Parser**: PapaParse + base64 decode với UTF-8 support, case-insensitive header matching
- **FirstLoadingPage**: Separate error handling cho planet vs CSV, planet switching overlay
- **CsvDataView**: Debug view hiển thị CSV tables với pagination + planet indicator
- **Type Cleanup (5 lỗi vue-tsc → 0 lỗi)**: Hoàn thành
  - PlaceholderMenuLeft renderTag type, TableChartRound subpath import, CsvDataView row-key getter
  - App.vue locale/dateLocale type, FooterNodeManager n-space align/justify
- **vue-tsc check: 0 errors** (verified bằng `npx vue-tsc --noEmit`)

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
npm run test     # Vitest (218 tests)
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

## Known Issues
- ✅ Tất cả lỗi vue-tsc đã được sửa (0 errors verified)
- ✅ ĐÃ SỬA: PlaceholderMenuLeft renderTag type, TableChartRound subpath import, CsvDataView row-key getter, App.vue locale/dateLocale type, FooterNodeManager align/justify
- 🔶 `@ts-expect-error` vẫn cần cho naive-ui NDataTable/NEmpty/NAlert imports dưới bundler moduleResolution
