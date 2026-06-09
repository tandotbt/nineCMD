# System Patterns: NineCMD

## System Architecture
NineCMD sử dụng kiến trúc client-side với Vue.js 3 + TypeScript. Ứng dụng tương tác với Nine Chronicles thông qua GraphQL (Mimir endpoint), REST APIs, và CSV data từ 9CMD API.

### Component Relationships
- **App.vue**: ConfigProvider + FirstLoadingOverlay + watch Pinia stores để apply theme/language
- **MainLayout.vue**: Header+Sidebar+Content+Footer layout
- **PlaceholderMenuLeft.vue**: Sidebar menu + language selector + dark mode toggle + CSV Data shortcut
- **PlaceholderHeader.vue**: Grid 24 responsive header
- **PlaceholderFooter.vue**: FooterInfoBlock (block info) + FooterNodeManager (drawer với 4 tabs)

### Critical Implementation Paths
- **First Loading**: Overlay semi-transparent backdrop che phủ trang web khi dữ liệu URL + CSV chưa load xong
- **ConfigURL Fetch**: Fetch từ `https://planets.nine-chronicles.com/planets/` → parse → store planet data
- **CSV Data Fetch**: Fetch 21 CSV sheets từ 9CMD API → base64 decode → PapaParse → Pinia store
- **Block Polling**: GraphQL query `blocks(take: 1)` tới Mimir endpoint per planet, poll mỗi N giây
- **Dynamic URLs**: RPC endpoints lấy từ API response (random selection), fallback về static PLANET_CONFIGS
- **Endpoint Settings**: User có thể chọn random hoặc manual endpoint trong FooterNodeManager tab "Endpoints"
- **Planet Validation**: Disable planets không có trong URL_ALL_PLANET, auto-fallback planet không khả dụng
- **Per-Planet CSV Cache**: Cache CSV data theo từng planet trong memory, tái sử dụng khi chuyển planet

## Design Patterns
- **MVVM**: Vue.js 3 Composition API
- **Singleton Pattern**: Pinia stores (appSettings, blockPolling, configURL, csvData) là singletons
- **Observer Pattern**: Vue reactivity system + Pinia computed/watch
- **Dependency Injection**: Vue provide/inject (theme, lang) + Pinia store injection
- **Polling Pattern**: setInterval + GraphQL query thay WebSocket
- **Fallback Pattern**: API data → fallback static data khi fetch thất bại
- **localStorage Persistence**: Store actions trực tiếp persist via `localStorage.setItem`
- **Logger Pattern**: createLogger({ module }) → structured logging với module prefix, level filtering, history
- **Component Decomposition**: FooterNodeManager tách thành 6 components riêng
- **Auto-start Pattern**: watch + { immediate: true } để auto-start polling từ persisted state
- **CSV Cache Pattern**: `cacheByPlanet: Record<PlanetName, AllSheetsData>` → check cache trước khi fetch
- **Planet Change Watcher**: csvData watch `appSettings.selectedPlanet` → auto switchPlanet() (pattern giống blockPolling)
- **Case-Insensitive Header Matching**: CSV parser matching key columns với toLowerCase()

## Key Technical Decisions
- **Overlay thay Router Loading**: Dùng overlay component trong App.vue thay route riêng, giữ `/` là home
- **No Teleport**: Overlay giữ trong component tree để naive-ui dark theme hoạt động
- **GraphQL thay WebSocket**: WebSocket đã ngưng hoạt động, dùng `blocks(take: 1)` query
- **Dynamic URLs from API**: Fetch từ URL_ALL_PLANET, fallback về FALLBACK_PLANETS
- **Endpoint Mode**: Random (mặc định) hoặc Manual (chọn URL cụ thể), persist vào localStorage
- **Relative imports trong src-ts/**: `@/` alias map tới `src/` (JS), dùng `../` cho imports trong src-ts/
- **Per-Planet Cache in Memory**: CSV data cache trong Pinia store memory, KHÔNG localStorage (dữ liệu quá lớn)
- **No Fallback CSV Data**: CSV phải load thành công, retry mechanism với URL selector
- **UTF-8 Base64 Decode**: TextDecoder('utf-8') thay atob() để hỗ trợ ký tự tiếng Việt
- **TS Type Workarounds**: `// @ts-expect-error` cho naive-ui imports bị lỗi under bundler moduleResolution
- **Subpath imports cho @vicons/material**: Với `moduleResolution: "bundler"`, một số icon (`TableChartRound`, v.v.) bị vue-tsc báo "no exported member" dù file thực sự tồn tại. Workaround: import subpath `@vicons/material/es/<IconName>.js` thay vì barrel `@vicons/material`.
- **Dùng library types thay vì custom narrow types**: Với `RenderTag` của naive-ui, dùng `SelectOption` (exported type) thay vì custom `{ label: string; value: string }`. Tránh được nhiều lỗi type inference.
- **Tách row-key getter thành named function**: Với `CreateRowKey<T>` của NDataTable, tách thành hàm riêng `(row): string | number => ...` thay vì inline arrow. Inline arrow có thể trigger IDE warning "Filters are deprecated" do Volar cache cũ.
- **`RowKey` không re-export từ naive-ui main entry**: Type này chỉ có ở internal `data-table/src/interface.d.ts`. Khi cần dùng, dùng structural type `string | number` thay vì `import type { RowKey } from 'naive-ui'`.
- **Dùng đúng library types thay vì `Record<string, unknown>` + `as unknown as` cast**: Khi `vue-tsc` báo `Type 'Record<string, unknown> | null' is not assignable to type '<LibraryType> | null'` (vd `<n-config-provider :locale>`, `:date-locale>`), root cause là khai báo `ref` quá rộng. Cách fix đúng: import `type { NLocale, NDateLocale }` (hoặc type phù hợp) từ `naive-ui`, khai báo `ref<NLocale | null>(null)`, và thay `as unknown as Record<string, unknown>` bằng `as NLocale` (không cần `unknown` vì type đã khớp). KHÔNG dùng `as unknown as` để lách type-check.
- **n-space `align` vs `justify`**: `n-space` của naive-ui có 2 props tách biệt: `justify` (phân phối theo **main axis**, giá trị: `'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'`) và `align` (align theo **cross axis**, giá trị: `'start' | 'end' | 'center' | 'baseline' | 'stretch'`). `'baseline'` chỉ hợp lệ với `align`. Khi thấy `Type '"baseline"' is not assignable to type 'Justify | undefined'` trong n-space, đổi sang `align` thay vì `justify` — baseline alignment thuộc về cross-axis.

## Stores Architecture (src-ts/)
```
configURL Store                      appSettings Store                    blockPolling Store
├ planets (ref<PlanetData[]>)       ├ isDarkMode (ref)                   ├ currentBlockIndex (ref)
├ isLoading (ref)                   ├ lang (ref)                         ├ blockHistory (ref)
├ error (ref)                       ├ selectedPlanet (ref<PlanetName>)   ├ isLoading (ref)
├ isLoaded (ref)                    ├ planetLabel (ref)                  ├ error (ref)
├ loadingStatus (ref)               ├ pollIntervalMs (ref)               ├ isPolling (ref)
├ fetchPlanets()                    ├ isPolling (ref)                    ├ avgBlockTime (computed)
├ retry()                           ├ logLevel (ref)                     ├ successRate (computed)
├ isPlanetAvailable()               ├ toggleDarkMode()                   ├ startPolling()
├ getPlanetData()                   ├ setDarkMode()                      ├ stopPolling()
├ getRpcEndpoint()                  ├ setLang()                          ├ refresh()
├ getMimirUrl()                     ├ setPlanet() ← validate            └ watch appSettings changes
├ getAvailableEndpoints()           ├ setIsPolling()                     └ auto-start watch isPolling
├ getActiveEndpoints()              ├ setLogLevel()
├ setEndpointMode()                 └ validatePlanetAvailability()
├ setEndpointSelection()               ↑ persist to localStorage
    ↑ persist to localStorage

csvData Store (NEW)
├ sheets (ref<AllSheetsData>)       # Current active planet data
├ cacheByPlanet (ref<Record>)       # Per-planet cache (odin, heimdall, thor)
├ isLoading (ref)
├ error (ref)
├ isLoaded (ref)
├ isPlanetSwitching (ref)           # Flag cho overlay loading
├ fetchPlanet (ref<PlanetName>)
├ fetchAllSheets(planet)            # Check cache → hit=instant, miss=fetch
├ switchPlanet(planet)              # Cache hit=instant, miss=fetch+overlay
├ retry()                           # Rotate API URL
├ isPlanetCached(planet)
├ getCachedPlanets()
├ getCacheStats(planet)
├ clearCacheForPlanet(planet)
├ clearCache()
└ watch appSettings.selectedPlanet  # Auto reload khi đổi planet
```

## CSV Data Architecture
```
9CMD API (/getGraphqlCSV)
├ Request: ?network=odin&csv=Sheet1&csv=Sheet2&...&encodeAsBase64=true
├ Response: { "GameConfigSheet": "base64...", "ItemRequirementSheet": "base64...", ... }
│
├→ decodeBase64Csv() → CSV string (UTF-8 TextDecoder)
├→ parseCsvSheet(csv, keyColumn, { unique }) → CsvSheetData (keyed by keyColumn)
├→ validateCsvData() → check if keyColumn exists in headers
│
├→ csvData store:
│  ├── sheets.value = parsedSheets (current planet)
│  ├── cacheByPlanet.value[planet] = parsedSheets (cached)
│  └── watcher: appSettings.selectedPlanet → switchPlanet()
│
└→ CsvDataView.vue: NDataTable + pagination + planet indicator
```

## Logger Architecture
```
createLogger({ module: 'configURL' })
├ debug/info/warn/error methods
├ Format: [HH:MM:SS] [module] LEVEL: message
├ Global logHistory ref (max 200 entries)
├ getLogHistory() → array of LogEntry
├ getLogHistoryByLevel() → filtered
├ getLogHistoryByModule() → filtered
└ FooterLogViewer.vue displays history
```

## Footer Component Architecture
```
FooterNodeManager.vue (drawer + tabs, 90 lines)
├ FooterBlockMonitor.vue (Tab 1: planet, poll, stats)
├ FooterSettings.vue (Tab 2: 6 NCollapse sections)
│  ├── General: dark mode, language, planet
│  ├── Polling: interval, auto-start
│  ├── Endpoints: summary (read-only)
│  ├── Storage: localStorage info + clear
│  ├── Logger: level selector + log viewer
│  └── About: version info
├ FooterEndpoints.vue (Tab 3: endpoint URLs, mode)
└ FooterActions.vue (Tab 4: placeholder)
```

## GraphQL Query Pattern
```graphql
# Exact match Python get_block_now()
# Endpoint: https://{planet}-mimir.9c.gg/graphql
query {
  blocks(take: 1) {
    items {
      object {
        index
      }
    }
  }
}
# Response: response["data"]["blocks"]["items"][0]["object"]["index"]
```

## URL_ALL_PLANET Pattern
```
GET https://planets.nine-chronicles.com/planets/
Response: PlanetData[] → [
  {
    id: "0x000000000000",
    name: "odin",
    genesisHash: "...",
    rpcEndpoints: {
      "headless.gql": ["url1", "url2"],
      "arena.gql": ["url1"],
      "mimir.gql": ["url1"],
      ...
    }
  }
]
→ Store in configURL.planets
→ getRpcEndpoint() picks random from list (or manual if set)
→ Fallback: PLANET_CONFIGS static if API unavailable
```

## Planet Configuration
| Planet | Mimir URL (Dynamic) | Headless GQL (Dynamic) |
|--------|-----------|--------------|
| Odin | From API → `odin-mimir.9c.gg` | From API → `odin-rpc-{1,2}.nine-chronicles.com` |
| Heimdall | From API → `heimdall-mimir.9c.gg` | From API → `heimdall-rpc-{1,2}.nine-chronicles.com` |
| Thor | (no mimir) | From API → `thor-rpc-1.nine-chronicles.com` |

## Testing Patterns
- **Pinia stores**: `setActivePinia(createPinia())` trong beforeEach
- **localStorage mock**: Custom mock object với vi.stubGlobal
- **Fetch mock**: `mockFetch.mockResolvedValue(...)` cho API responses
- **Async operations**: `await store.fetchPlanets()` (returns Promise)
- **Store auto-start**: blockPolling auto-starts, call `store.stopPolling()` trước khi test state
- **CSV cache tests**: Manually inject cacheByPlanet data, test cache hit/miss/switchPlanet

## Code Review Cleanup Patterns (Rút ra từ session rà soát)

- **Bỏ import thừa sau refactor**: Sau khi refactor sang dùng config object tổng hợp (vd `CONFIG_i18n_LANGUAGES[].uiConfig`) hoặc thay đổi flow control (bỏ qua store, đổi sang onMounted trực tiếp), rà soát lại imports trong component. Chỉ giữ những gì thực sự dùng. Import thừa → potential `no-unused-vars` ESM error + cognitive overhead.
- **Pagination tách rõ data source vs display**: Khi dùng `n-pagination`, tách rõ (1) `data` = all rows, (2) `pagedData` = computed slice(start, end), (3) `:item-count` = full count. KHÔNG hard-code slice limit trong data source computed (vd `.slice(0, 100)`) — sẽ mâu thuẫn với row count + pagination thực tế. `n-pagination` tự handle khi `item-count <= page-size` (không cần `v-if` wrapper ở pagination).
- **v-else chain cần wrapper**: Khi cấu trúc `v-if` / `v-else-if` / `v-else` cho nhiều element kết quả, mỗi nhánh nên là MỘT root element (hoặc `<template v-if>` wrapper) để chain không bị ngắt. Nếu chen 1 element không có v-if vào giữa chain, v-else sau đó sẽ lỗi "no adjacent v-if".
- **Watch effect phải match data source**: Khi có 2+ pagination state tách biệt (vd `mainCurrentPage` cho main table, `globalCurrentPage` cho global table), watch effect reset page PHẢI match đúng data source trigger. Copy-paste watch body dễ nhầm field name → reset sai table.
- **Luôn dùng `createLogger` thay `console.*`**: KHÔNG dùng `console.log/warn/error` trong `src-ts/`. Luôn `import { createLogger } from '../utilities/logger'` + `const logger = createLogger({ module: '<moduleName>' })` rồi `logger.info/warn/error(...)`. Lợi ích: module prefix, level filter, history tracking (xem FooterLogViewer), đồng nhất. `console.*` chỉ dùng trong test files hoặc bên trong `utilities/logger.ts` (để log ra console cho dev).
- **Pinia store reference qua closure**: Khi Pinia store function (vd `globalCsvStore.loadAll()`) cần reference store khác (vd `useAppSettingsStore()`), PHẢI gọi bên trong `defineStore` callback (composition API), KHÔNG gọi ở module top-level. Ví dụ đúng: `export const useGlobalCsvStore = defineStore('globalCsv', () => { const appSettings = useAppSettingsStore(); ... })`. Ví dụ sai: `const appSettings = useAppSettingsStore(); export const useGlobalCsvStore = ...` → appSettings undefined khi store created.
- **i18n keys refactor pattern**: Khi i18n keys tăng theo từng feature (vd `banner.*`, `csvData.*`, `login.*`), pattern tổng quát:
  - Mỗi feature có section riêng (`banner: { loading, error, ... }`, `csvData: { title, options, ... }`)
  - Sub-section dùng nested object (vd `csvData.options.itemName`)
  - Hardcoded text trong template → `{{ t('section.key') }}` qua vue-i18n
  - Đồng bộ cả `en.json` + `vi.json` (fail nếu 1 file thiếu key)
  - Xem [`utilities/placeholder.ts`](src-ts/utilities/placeholder.ts) cho stub pattern khi chưa refactor store cũ.
- **GitHub CSV raw URL + cache busting**: Khi fetch CSV từ `raw.githubusercontent.com`, có thể append `#${planet}` ở cuối URL để browser cache-bust khi switch planet (vd `?...item_name.csv#odin`). Hash không ảnh hưởng network request nhưng browser coi là khác URL → cache riêng. Hữu ích khi cùng file CSV cho nhiều planet context.
- **Promise.allSettled cho best-effort parallel fetch**: Khi load N nguồn data mà KHÔNG muốn 1 nguồn fail block các nguồn khác (vd `globalCsv` load 3 nguồn CSV), dùng `Promise.allSettled([...])` thay `Promise.all([...])`. Xử lý từng `result.status` riêng: `fulfilled` → lấy `value`, `rejected` → lấy `reason` lưu `sourceErrors`. Pattern đặc biệt hữu ích cho preloading: vẫn redirect về home nếu chỉ fail best-effort, không block UI chính.
- **Banner carousel ở góc cố định**: Khi muốn banner ở góc trên phải cố định (không scroll), dùng `position: absolute, top: 0, right: 0, z-index: 1` cho container. Bên trong dùng `n-grid` với `cols=12` + 2 grid-item (span 8/4) → responsive. CSS `.liveAssets-carousel { width: 33.33% }` cho width cố định (1/3 viewport). Bắt buộc có container relative (`.home-page-container { position: relative }`) để absolute positioning hoạt động đúng.
- **n-space `align` vs `justify`**: `n-space` của naive-ui có 2 props tách biệt: `justify` (phân phối theo **main axis**, giá trị: `'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'`) và `align` (align theo **cross axis**, giá trị: `'start' | 'end' | 'center' | 'baseline' | 'stretch'`). `'baseline'` chỉ hợp lệ với `align`. Khi thấy `Type '"baseline"' is not assignable to type 'Justify | undefined'` trong n-space, đổi sang `align` thay vì `justify` — baseline alignment thuộc về cross-axis.
- **Library type exports (NLocale/NDateLocale)**: Config types cho `<n-config-provider>` được export từ naive-ui main entry: `NLocale` (cho prop `locale`), `NDateLocale` (cho prop `dateLocale`). Khi khai báo `ref` cho các prop này, import `import type { NLocale, NDateLocale } from 'naive-ui'` và dùng `ref<NLocale | null>(null)`. KHÔNG dùng `ref<Record<string, unknown> | null>(null)` rồi cast `as unknown as` — vừa mất type-safety, vừa trigger lỗi vue-tsc.
- **Component-converted `.value` in `<script setup>`** (cho template): Sau khi dùng `const csvData = useCsvDataStore()` (Pinia setup store), component template truy cập store state qua store instance (vd `csvData.isLoading`) KHÔNG cần `.value`. Trong script thì `csvData.isLoading` (reactive proxy). Trong template thì `csvData.isLoading` cũng OK vì template auto-unwrap.
- **Naive UI `<n-grid>` với `cols=12` + `span` props**: Pattern grid 12 columns cho responsive layout. Item có `:span="8"` chiếm 8/12 = 2/3 viewport, `:span="4"` chiếm 4/12 = 1/3. Kết hợp `item-responsive` + `responsive="screen"` cho adaptive theo breakpoint. Item rỗng (placeholder) dùng `:suffix="false"` để tránh ghost spacing.
- **Naive UI `<n-pagination>` props tổng hợp**:
  - `v-model:page` + `v-model:page-size` (2-way binding)
  - `:item-count` = tổng số rows (full, không slice)
  - `:page-sizes` = array of number (vd `[20, 50, 100, 200]`) — KHÔNG phải object `{label, value}`
  - `show-size-picker` = hiện dropdown chọn page size
  - KHÔNG cần `v-if` wrapper khi `item-count <= page-size` (component tự handle)
- **Bỏ hard-coded slice 100 trong Global table**: Pattern cũ dùng `globalSourceSampleRows = ...slice(0, 100)` chỉ lấy 100 rows đầu → pagination không thật (max 5 trang @ 20/page). Sửa: bỏ slice trong data source, slice trong `pagedRows` computed, dùng `:item-count` = full count. Đổi tên `sampleRows` → `allRows` cho rõ intent.
- **`<template v-else-if>` wrapper cho multi-element branch**: Khi 1 branch của v-if chain có NHIỀU element (vd table + pagination), bọc trong `<template v-else-if="...">`. V-else-if chỉ chấp nhận 1 root element; template wrapper giữ đúng cấu trúc chain.
- **Type guard cho PlanetName (csvData store)**: `csvData.fetchPlanet: ref<PlanetName | null>` (default null khi chưa fetch). Check `v-if="csvData.fetchPlanet"` trước khi dùng. Compute `isCurrentPlanetCached` cũng phải check `if (!csvData.fetchPlanet) return false`.
- **Per-source error tracking pattern**: Khi load N nguồn parallel (vd `globalCsv` với `localized` + `remote`), track lỗi riêng từng nguồn qua `sourceErrors: ref<{ source1: string|null, source2: string|null }>`. UI có thể hiển thị error tag cho source user đang xem (vd trong CsvDataView, ItemName+SkillName share `localized` error, RemoteCsv có `remote` error riêng). Pattern giúp user biết chính xác nguồn nào fail, không chỉ "All sources failed".
- **Computed `*Count` cho Pinia store**: Tách `itemNameCount`/`skillNameCount`/`remoteCsvCount` thành computed riêng thay vì gọi `Object.keys(sheet).length` inline nhiều lần. Reactive + cache tự động qua Vue computed. Đặc biệt hữu ích khi nhiều template cùng bind count.
- **ItemName + SkillName share 1 fetch (gộp localized)**: Trong `nameService.ts`, `fetchAllLocalizedSheets(planet)` gộp 2 sheet (ItemName + SkillName) vào 1 Promise.all → 1 lần cache-bust URL = 2 sheet. RemoteCsv tách riêng. → 2 Promise.allSettled promises total: `localized` (covers 2 sheets) + `remote` (covers 1 sheet). UI hiển thị 1 error cho cả ItemName + SkillName.
- **Banner carousel không dùng `:loop` của n-carousel** (mặc định true), dùng `:autoplay` + `:interval` (ms) + `draggable` (cho user swipe). Mỗi banner là `<a>` wrap `<img>` với `:href="banner.Url || '#'"` + `target="_blank"`. Key dùng `banner.Priority ?? banner.BannerImageName` (Priority optional).
- **`@ts-expect-error` scope ngắn cho naive-ui**: Với `moduleResolution: "bundler"`, một số naive-ui imports bị vue-tsc báo "no exported member" dù file thực sự tồn tại (vd `RowKey`, `CreateRowKey` ở internal `data-table/src/interface.d.ts`). Dùng `// @ts-expect-error` ngay trước dòng import. Comment giải thích lý do (vd `// RowKey not re-exported from main entry`).
- **Avoid cross-store `watch` ở globalCsv**: `globalCsv` KHÔNG watch `appSettings.selectedPlanet` (vì là GLOBAL). Chỉ react với `appSettings.lang` qua `localeColumn` computed. Verified bằng test "does not watch planet changes" - mock `setPlanet` 3 lần, đảm bảo `fetchSpy` không được gọi.

## Code Review Cleanup Patterns (v2 - Sau Arena Lookup Feature)
- **Bỏ comment `Ref:` tham khảo file khác khi ổn định**: Khi tạo utility mới, block comment `Ref:` liệt kê file khác (vd `blockPolling.ts:55 sendRequestQuery()`) chỉ có giá trị lúc đang implement. Sau khi ổn định, các tham khảo này trở thành rác (cognitive overhead, dễ stale khi file được rename/move/di chuyển). Pattern: giữ ngắn gọn phần giải thích tính năng chính ở đầu file, bỏ phần "Ref:" ở cuối.
- **Bỏ comment tham khảo "bản JS cũ"**: Sau khi codebase mới đã ổn định, các comment nhắc đến "JS cũ" hoặc "không cần store fetchDataUser9C" chỉ tạo cognitive overhead. Implementer mới đọc code không cần biết về bản JS cũ. Pattern: comment giải thích logic hiện tại, KHÔNG nhắc đến bản cũ.
- **Bỏ `console.*` debug log khi TODO placeholder**: Khi handler chỉ có placeholder (TODO chưa implement action thực), KHÔNG thêm `console.info/log` "để biết là đã gọi". Khi implement thật, action sẽ tự có side-effect rõ ràng (network call, state change, navigation). Log placeholder chỉ là rác. Pattern: giữ TODO comment làm intent, bỏ `console.*` debug.
- **Helper validation ở store level (expose public)**: Với helper validate (vd `isValidAddressFormat`) dùng ở nhiều nơi (component validator, store action guard, tests), đặt ở store expose qua public API. Component gọi `store.isValidAddressFormat(value)` thay vì duplicate regex. Lý do: single source of truth, dễ thay đổi rule, dễ test.

## Arena Lookup Feature Patterns
- **Cross-page prefill qua localStorage (không cần store)**: Khi cần prefill form ở Page B từ action ở Page A (vd click "Dùng để đăng nhập" ở ArenaLookupPage → fill LoginPage), dùng `localStorage.setItem('login-prefill-X', value)` ở Page A + `onMounted` ở Page B đọc + `localStorage.removeItem` ngay sau khi dùng. Đơn giản hơn dùng Pinia store + router query params. Đặc biệt phù hợp với prefill 1 lần (one-shot).
- **Mimir `GetAgent.avatarAddresses` map key/value ngược**: Mimir thực tế trả về `{ key: <index number>, value: <address string> }` (KHÔNG phải `key: address, value: name` như plan cũ). Để lấy danh sách address: `agent.avatarAddresses.map((a) => a.value)`. Bug thường gặp: tin plan cũ, dùng `a.key` → nhận được number index, không phải address. → Verify bằng response thực tế từ Mimir.
- **`GetAvatars` build query inline, KHÔNG dùng GraphQL variables cho array**: Mimir có thể không hỗ trợ truyền `Address![]` qua variables cho query này, hoặc response alias bị lệch khi dùng variable array. Inline trực tiếp address vào query string đảm bảo alias `avatar_<index>` luôn map đúng tới address tại index đó. Body gửi đi: `{ query, variables: {} }` (variables rỗng). Cú pháp: mỗi avatar thêm 1 field alias `avatar_<i>: avatar(address: "<addr>") { ... }`.
- **Auto-fetch leaderboard khi block ready (1 lần)**: Pattern dùng `watch(isBlockReady, (ready) => { if (ready && !autoFetched) { autoFetched = true; fetchLeaderboard() } }, { immediate: true })`. Khi block ready + chưa auto-fetch → fetch 1 lần, set flag. Watchers riêng planet change reset flag để re-fetch khi đổi planet. Tránh polling liên tục.
- **Per-planet cache cho lookup data**: Khi fetch data từ API theo planet (vd leaderboard arena), cache trong `Record<PlanetName, T>` ref. Watcher trên `selectedPlanet` → check cache hit → dùng cache, miss → fetch. Pattern: `cache.value[planet] = { list, seasonId, fetchedAt: Date.now() }`. KHÔNG dùng localStorage (dữ liệu có thể lớn, và cần fresh data).
- **Search/filter computed từ list + query**: Với search input bind thẳng `store.searchQuery` (KHÔNG cần local ref + sync), computed `filtered = computed(() => list.filter(item => match(query, item)))` tự react khi query đổi. Pattern tổng quát cho filter UI.
- **Computed options cho `<n-select>` với priority**: Với nhiều nguồn options (vd leaderboard + agent lookup), dùng computed `options = computed(() => source1.length > 0 ? source1 : source2)`. UI dùng thẳng `:options="options"`. Pattern: priority order trong computed, KHÔNG dùng v-if để swap data source.
- **Naive UI `<n-select>` client-side filter qua prop `filter`**: Khi cần filter options theo pattern (search), dùng `:filter="(pattern, option) => boolean"` thay vì pre-filter options. Component tự apply filter, không cần computed. Pattern: filter function match name/agent/avatar đều OK.
- **Naive UI `<n-select>` custom render label qua prop `render-label`**: Khi cần hiển thị option với format đặc biệt (vd `avatarname + (0xABCD suffix)`), dùng `:render-label="(option) => [text, h('span', ...)]"` trả về array of VNode. Pattern cho rich label mà KHÔNG cần custom component.
- **Form validation cross-field với store helper**: Khi validator cần dùng logic từ store (vd `isValidAddressFormat`), dùng `computed<FormRules>(() => ({ field: [{ validator: (_, value) => store.helper(value) ? true : new Error(...) }] }))`. Validator là computed vì có thể depend vào store state. `FormRules` type từ naive-ui: `import type { FormRules } from 'naive-ui'`.
