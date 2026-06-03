# System Patterns: NineCMD

## System Architecture
NineCMD sử dụng kiến trúc client-side với Vue.js 3 + TypeScript. Ứng dụng tương tác với Nine Chronicles thông qua GraphQL (Mimir endpoint) và REST APIs.

### Component Relationships
- **App.vue**: ConfigProvider + FirstLoadingOverlay + watch Pinia stores để apply theme/language
- **MainLayout.vue**: Header+Sidebar+Content+Footer layout
- **PlaceholderMenuLeft.vue**: Sidebar menu + language selector + dark mode toggle
- **PlaceholderHeader.vue**: Grid 24 responsive header
- **PlaceholderFooter.vue**: FooterInfoBlock (block info) + FooterNodeManager (drawer với 4 tabs)

### Critical Implementation Paths
- **First Loading**: Overlay semi-transparent backdrop che phủ trang web khi dữ liệu URL chưa load xong
- **ConfigURL Fetch**: Fetch từ `https://planets.nine-chronicles.com/planets/` → parse → store planet data
- **Block Polling**: GraphQL query `blocks(take: 1)` tới Mimir endpoint per planet, poll mỗi N giây
- **Dynamic URLs**: RPC endpoints lấy từ API response (random selection), fallback về static PLANET_CONFIGS
- **Endpoint Settings**: User có thể chọn random hoặc manual endpoint trong FooterNodeManager tab "Endpoints"
- **Planet Validation**: Disable planets không có trong URL_ALL_PLANET, auto-fallback planet không khả dụng

## Design Patterns
- **MVVM**: Vue.js 3 Composition API
- **Singleton Pattern**: Pinia stores (appSettings, blockPolling, configURL) là singletons
- **Observer Pattern**: Vue reactivity system + Pinia computed/watch
- **Dependency Injection**: Vue provide/inject (theme, lang) + Pinia store injection
- **Polling Pattern**: setInterval + GraphQL query thay WebSocket
- **Fallback Pattern**: API data → fallback static data khi fetch thất bại
- **localStorage Persistence**: Store actions trực tiếp persist via `localStorage.setItem`
- **Logger Pattern**: createLogger({ module }) → structured logging với module prefix, level filtering, history
- **Component Decomposition**: FooterNodeManager tách thành 6 components riêng (Monitor, Settings, Endpoints, Actions, StorageInfo, LogViewer)
- **Auto-start Pattern**: watch + { immediate: true } để auto-start polling từ persisted state

## Key Technical Decisions
- **Overlay thay Router Loading**: Dùng overlay component trong App.vue thay route riêng, giữ `/` là home
- **No Teleport**: Overlay giữ trong component tree để naive-ui dark theme hoạt động
- **GraphQL thay WebSocket**: WebSocket đã ngưng hoạt động, dùng `blocks(take: 1)` query
- **Dynamic URLs from API**: Fetch từ URL_ALL_PLANET, fallback về FALLBACK_PLANETS
- **Endpoint Mode**: Random (mặc định) hoặc Manual (chọn URL cụ thể), persist vào localStorage
- **Relative imports trong src-ts/**: `@/` alias map tới `src/` (JS), dùng `../` cho imports trong src-ts/

## Stores Architecture (src-ts/)
```
configURL Store                      appSettings Store                    blockPolling Store
├ planets (ref<PlanetData[]>)       ├ isDarkMode (ref)                   ├ currentBlockIndex (ref)
├ isLoading (ref)                   ├ lang (ref)                         ├ blockHistory (ref)
├ error (ref)                       ├ selectedPlanet (ref<PlanetName>)   ├ isLoading (ref)
├ isLoaded (ref)                    ├ planetLabel (ref)                  ├ error (ref)
├ loadingStatus (ref)               ├ pollIntervalMs (ref)               ├ isPolling (ref)
├ fetchPlanets()                    ├ isPolling (ref) ← NEW              ├ avgBlockTime (computed)
├ retry()                           ├ logLevel (ref) ← NEW               ├ successRate (computed)
├ isPlanetAvailable()               ├ toggleDarkMode()                   ├ startPolling()
├ getPlanetData()                   ├ setDarkMode()                      ├ stopPolling()
├ getRpcEndpoint()                  ├ setLang()                          ├ refresh()
├ getMimirUrl()                     ├ setPlanet() ← validate            └ watch appSettings changes
├ getAvailableEndpoints()           ├ setIsPolling() ← NEW               └ auto-start watch isPolling
├ getActiveEndpoints()              ├ setLogLevel() ← NEW
├ setEndpointMode()                 └ validatePlanetAvailability()
├ setEndpointSelection()               ↑ persist to localStorage
    ↑ persist to localStorage
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
