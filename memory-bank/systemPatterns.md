# System Patterns: NineCMD

## System Architecture
NineCMD sử dụng kiến trúc client-side với Vue.js 3 + TypeScript. Ứng dụng tương tác với Nine Chronicles thông qua GraphQL (Mimir endpoint) và REST APIs.

### Component Relationships
- **App.vue**: ConfigProvider + watch Pinia stores để apply theme/language
- **MainLayout.vue**: Header+Sidebar+Content+Footer layout
- **PlaceholderMenuLeft.vue**: Sidebar menu + language selector + dark mode toggle
- **PlaceholderHeader.vue**: Grid 24 responsive header
- **PlaceholderFooter.vue**: FooterInfoBlock (block info) + FooterNodeManager (drawer)

### Critical Implementation Paths
- **Block Polling**: GraphQL query `blocks(take: 1)` tới Mimir endpoint per planet, poll mỗi N giây
- **Pinia Stores**: `appSettings` (global settings) + `blockPolling` (block data) share state across components
- **Vue Router**: Quản lý views trong MainLayout
- **Vue-i18n**: Đa ngôn ngữ (en/vi)
- **Arena Data Conversion**: `convertToArenaParticipants` (JS version)
- **Arena Season Management**: `arenaSeason` store (JS version)

## Design Patterns
- **MVVM**: Vue.js 3 Composition API
- **Singleton Pattern**: Pinia stores (appSettings, blockPolling) là singletons
- **Observer Pattern**: Vue reactivity system + Pinia computed/watch
- **Dependency Injection**: Vue provide/inject (theme, lang) + Pinia store injection
- **Polling Pattern**: setInterval + GraphQL query thay WebSocket
- **localStorage Persistence**: Store actions trực tiếp persist via `localStorage.setItem`

## Key Technical Decisions
- **GraphQL thay WebSocket**: WebSocket đã ngưng hoạt động, dùng `blocks(take: 1)` query tới Mimir GraphQL endpoint
- **Pinia Stores thay Composable Singleton**: Dùng Pinia để share state giữa components, test được
- **Relative imports trong src-ts/**: `@/` alias map tới `src/` (JS), dùng `../` cho imports trong src-ts/
- **Direct localStorage thay useStorage**: Tránh sync issues giữa `useStorage` + `watch` trong test environment
- **isPolling là ref**: Reactive state cho polling status, không dùng computed từ module-scope variable

## Stores Architecture (src-ts/)
```
appSettings Store                    blockPolling Store
├ isDarkMode (ref)                  ├ currentBlockIndex (ref)
├ lang (ref)                        ├ blockHistory (ref<BlockPollEntry[]>)
├ selectedPlanet (ref<PlanetName>)  ├ isLoading (ref)
├ planetLabel (ref)                 ├ error (ref)
├ pollIntervalMs (ref)              ├ isPolling (ref)
├ toggleDarkMode()                  ├ avgBlockTime (computed)
├ setDarkMode()                     ├ successRate (computed)
├ setLang()                         ├ planetLabel (computed)
├ setPlanet()                       ├ startPolling()
└ setPollInterval()                 ├ stopPolling()
    ↑ persist to localStorage       ├ refresh()
                                    └ watch appSettings changes
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

## Planet Configuration
| Planet | Mimir URL | Headless GQL |
|--------|-----------|--------------|
| Odin | `https://odin-mimir.9c.gg/graphql` | `https://odin-rpc-2.nine-chronicles.com/graphql` |
| Heimdall | `https://heimdall-mimir.9c.gg/graphql` | `https://heimdall-rpc-2.nine-chronicles.com/graphql` |
| Thor | (no mimir) | `https://thor-rpc-1.nine-chronicles.com/graphql` |

## Testing Patterns
- **Pinia stores**: `setActivePinia(createPinia())` trong beforeEach
- **localStorage mock**: Custom mock object với vi.stubGlobal
- **Fetch mock**: `mockFetch.mockResolvedValue(...)` cho GraphQL responses
- **Async operations**: `await store.refresh()` (returns Promise) cho pollOnce
- **Store auto-start**: blockPolling auto-starts, call `store.stopPolling()` trước khi test state
