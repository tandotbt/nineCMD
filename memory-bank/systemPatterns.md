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
