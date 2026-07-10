# System Patterns: NineCMD

## System Architecture
NineCMD sử dụng kiến trúc client-side với Vue.js 3 + TypeScript. Ứng dụng tương tác với Nine Chronicles thông qua GraphQL (Mimir endpoint), REST APIs, và CSV data từ 9CMD API.

### Component Relationships
- **App.vue**: ConfigProvider + FirstLoadingOverlay + watch Pinia stores để apply theme/language
- **MainLayout.vue**: Header+Sidebar+Content+Footer layout
- **PlaceholderMenuLeft.vue**: Sidebar menu + language selector + dark mode toggle + CSV Data + Avatar Data shortcuts
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
- **Avatar Data Display**: GraphQL query → fetch raw data → enrich with CSV data (names, CP, skills, stats) → display in tabs
- **Login → Avatar Data Flow**: onSubmit saves agent+avatar to localStorage → navigates to /avatar-data → onMounted reads prefill + auto-fetches

## Design Patterns
- **MVVM**: Vue.js 3 Composition API
- **Singleton Pattern**: Pinia stores (appSettings, blockPolling, configURL, csvData, globalCsv, banner, arenaLookup, avatarDataDisplay) là singletons
- **Observer Pattern**: Vue reactivity system + Pinia computed/watch
- **Dependency Injection**: Vue provide/inject (theme, lang) + Pinia store injection
- **Polling Pattern**: setInterval + GraphQL query thay WebSocket
- **Fallback Pattern**: API data → fallback static data khi fetch thất bại
- **localStorage Persistence**: Store actions trực tiếp persist via `localStorage.setItem`
- **Logger Pattern**: createLogger({ module }) → structured logging với module prefix, level filtering, history
- **Component Decomposition**: FooterNodeManager tách thành 6 components, AvatarData tách thành 5 components
- **Auto-start Pattern**: watch + { immediate: true } để auto-start polling từ persisted state
- **CSV Cache Pattern**: `cacheByPlanet: Record<PlanetName, AllSheetsData>` → check cache trước khi fetch
- **Planet Change Watcher**: csvData watch `appSettings.selectedPlanet` → auto switchPlanet()
- **Case-Insensitive Header Matching**: CSV parser matching key columns với toLowerCase()
- **Centralized Constants Pattern**: All hard-coded values extracted to `constants.ts`
- **English-Only Comments**: All code comments in src-ts/ are in English
- **Cross-Page Prefill via localStorage**: One-shot data passing between pages (ArenaLookup→Login, Login→AvatarData)
- **GraphQL Response Unwrapping**: `mimirGraphql.graphqlQuery<T>()` returns `json.data` — callers must NOT double-unwrap
- **CSV Enrichment Pattern**: Raw GraphQL data → helper functions enrich with CSV names/skills/stats via globalCsv + csvData stores
- **Pure Helper Functions**: Stateless transformations in `*Helpers.ts` files (avatarDataHelpers, nameService), testable independently

## Key Technical Decisions
- **Overlay thay Router Loading**: Dùng overlay component trong App.vue thay route riêng, giữ `/` là home
- **No Teleport**: Overlay giữ trong component tree để naive-ui dark theme hoạt động
- **GraphQL thay WebSocket**: WebSocket đã ngưng hoạt động, dùng `blocks(take: 1)` query
- **Dynamic URLs from API**: Fetch từ URL_ALL_PLANET, fallback về FALLBACK_PLANETS
- **Endpoint Mode**: Random (mặc định) hoặc Manual (chọn URL cụ thể), persist vào localStorage
- **Relative imports trong src-ts/**: `@/` alias map tới `src/` (JS), dùng `../` cho imports trong src-ts/
- **Per-Planet Cache in Memory**: CSV data cache trong Pinia store memory, KHÔNG localStorage
- **No Fallback CSV Data**: CSV phải load thành công, retry mechanism với URL selector
- **UTF-8 Base64 Decode**: TextDecoder('utf-8') thay atob() để hỗ trợ ký tự tiếng Việt
- **TS Type Workarounds**: `// @ts-expect-error` cho naive-ui imports bị lỗi under bundler moduleResolution
- **Subpath imports cho @vicons/material**: Dùng `@vicons/material/es/<IconName>.js` thay barrel import
- **Dùng library types thay vì custom narrow types**: `SelectOption` thay `{ label: string; value: string }`
- **Tách row-key getter thành named function**: Tránh IDE warning "Filters are deprecated"
- **`RowKey` không re-export từ naive-ui main entry**: Dùng structural type `string | number`
- **Dùng đúng library types**: `NLocale`, `NDateLocale` cho `<n-config-provider>`, KHÔNG `Record<string, unknown>` + `as unknown as`
- **n-space `align` vs `justify`**: `baseline` thuộc cross-axis → dùng `align`, KHÔNG `justify`
- **GraphQL query inline (không variables cho array)**: Mimir có thể không hỗ trợ truyền `Address![]` qua variables → inline address vào query string
- **Cross-page prefill qua localStorage (không cần store)**: One-shot data passing, read once + remove immediately

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

csvData Store                       globalCsv Store                      banner Store
├ sheets (ref<AllSheetsData>)       ├ itemName (ref)                     ├ banners (ref<BannerItem[]>)
├ cacheByPlanet (ref<Record>)       ├ skillName (ref)                    ├ isLoading (ref)
├ isLoading (ref)                   ├ remoteCsv (ref)                    ├ error (ref)
├ error (ref)                       ├ isLoading (ref)                    ├ isLoaded (ref)
├ isLoaded (ref)                    ├ error (ref)                        ├ loadBanners()
├ isPlanetSwitching (ref)           ├ localeColumn (computed)            ├ retry()
├ fetchAllSheets(planet)            ├ loadAll() → Promise.allSettled     └ clearData()
├ switchPlanet(planet)              ├ getItemName(id, locale)
├ isPlanetCached(planet)            ├ getSkillName(id, locale)
└ watch appSettings.selectedPlanet  └ GLOBAL: KHÔNG watch planet

arenaLookup Store                   avatarDataDisplay Store (NEW)
├ leaderboardList (ref)             ├ rawGraphQL (ref)                   # Step 1: GraphQL data
├ isFetchingLeaderboard             ├ rawRestApi (ref)                   # Step 2: REST API data
├ leaderboardCache (per-planet)     ├ characterInfo (computed)           # Enriched character info
├ lookedUpAgent/Avatars             ├ equipment (ref<EnrichedEquipment[]>)
├ searchQuery                       ├ costumes (ref<EnrichedCostume[]>)
├ leaderboardFiltered (computed)    ├ runes, materials, consumables
├ fetchLeaderboard()                ├ combinationSlots
├ lookupAgent(addr)                 ├ isLoading, error
├ lookupAvatar(addr)                ├ fetchAvatarData(agent, avatar)
└ isValidAddressFormat()            ├ fetchStep1(agent, avatar)          # GraphQL → process
                                    ├ fetchStep2(agent, avatar)          # REST API
                                    ├ fillEquipments(data)               # Enrich with CSV
                                    ├ fillCostumes(data)                 # Enrich with CostumeStatSheet
                                    └ reset()
```

## Avatar Data Display Architecture
```
User Input (agent + avatar address)
│
├→ fetchStep1(agent, avatar)
│  ├── buildQueryA(agent, avatar)        # Single GraphQL query for all node data
│  ├── fetchQueryA(agent, avatar)         # Uses mimirGraphql.graphqlQuery<T>()
│  │                                      # IMPORTANT: graphqlQuery<T>() returns json.data
│  │                                      # DO NOT unwrap response['data'] again!
│  ├── Process stateQuery:
│  │   ├── inventory.equipment → fillEquipments() → EnrichedEquipment[]
│  │   │   ├── CSV: globalCsv.getItemName(id) → display name
│  │   │   ├── CSV: csvData.CpsSheet → CP value
│  │   │   ├── CSV: csvData.EquipmentStatSheet → statArray
│  │   │   ├── CSV: csvData.RequirementSheet → levelReq
│  │   │   └── Helper: statAndSkillOption() → skills with localized names
│  │   ├── inventory.costumes → fillCostumes() → EnrichedCostume[]
│  │   │   └── CSV: csvData.CostumeStatSheet → statsMap
│  │   ├── inventory.runes → RuneEntry[]
│  │   ├── inventory.combinationSlots → CombinationSlot[]
│  │   ├── staking → StakeState (calculateAPCost)
│  │   ├── stages → StageMap (getLatestStageClearedId)
│  │   ├── worldBosses, eventDungeons → active IDs
│  │   └── avatar, gold, crystal, material → balances
│  └── Compute characterInfo (CharacterInfo)
│
├→ fetchStep2(agent, avatar)
│  ├── fetchGetDataGraphql(agent, avatar)  # REST API
│  └── Process: cpRanking, statSkill, patrolReward
│
└→ Display in 5 components:
   ├── AvatarDataForm           # Input form
   ├── AvatarDataInfoTable      # Character info (n-descriptions)
   ├── AvatarDataInventoryTable # 5 tabs (n-data-table per tab)
   ├── AvatarDataMaterialTable  # 2 tabs (materials + consumables)
   └── AvatarDataGraphqlTable   # REST API data + raw JSON
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

## Avatar Data GraphQL Query Pattern
```graphql
# buildQueryA() — single query for ALL node data
# Endpoint: https://{planet}-headless.9c.gg/graphql
query {
  stateQuery {
    agent(address: "0x...") {
      avatarAddresses           # { key: index, value: address }
      gold, crystal, ...
    }
    inventory(agentAddress: "0x...", avatarAddress: "0x...") {
      equipment { id, skills { id, skillRow, stat }, costumeId, ... }
      costumes { id, costumeId, stats { id, stat } }
      runes { ... }
      combinationSlots { ... }
    }
    staking(agentAddress: "0x...") { deposit, receivedBlockIndex, stakeRewardAmount, ... }
    worldBossList2 { id, ... }
    eventDungeonList { id, ... }
    # + gold, crystal, material balances
  }
}
# IMPORTANT: mimirGraphql.graphqlQuery<T>() returns json.data directly
# So response = { stateQuery: { ... } }, NOT { data: { stateQuery: { ... } } }
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

## Code Review Cleanup Patterns

### v1 (sau refactor i18nCsv + Banner)
- **Bỏ import thừa sau refactor** — rà soát imports khi thay đổi flow control
- **Pagination tách data source vs display** — không hard-code slice limit trong computed data
- **v-else chain cần wrapper** — mỗi nhánh là 1 root element hoặc `<template v-if>`
- **Watch effect phải match data source** — copy-paste watch dễ nhầm field
- **Luôn dùng `createLogger` thay `console.*`** — module prefix + level filter + history
- **Pinia store reference qua closure** — gọi `useAppSettingsStore()` bên trong defineStore callback
- **i18n keys refactor pattern** — mỗi feature có section riêng + sub-section nested
- **GitHub CSV raw URL + cache busting** — dùng `#${planet}` ở cuối URL
- **Promise.allSettled cho best-effort parallel fetch** — không block UI khi 1 nguồn fail
- **Banner carousel ở góc cố định** — position absolute + n-grid 12 cols + 2 items span 8/4
- **Bỏ comment `Ref:` tham khảo file khác khi ổn định**
- **Bỏ comment "bản JS cũ"** — implementer mới không cần biết
- **Bỏ `console.*` debug khi TODO placeholder**
- **Helper `isValidAddressFormat` ở store level** — single source of truth
- **n-space `align` vs `justify`** — baseline thuộc cross-axis
- **Library type exports** — NLocale/NDateLocale cho n-config-provider
- **Naive UI `<n-pagination>` props** — v-model:page, v-model:page-size, :item-count, :page-sizes, show-size-picker
- **`<template v-else-if>` wrapper** — multi-element branch trong v-if chain
- **Type guard cho PlanetName** — csvData.fetchPlanet có thể null
- **Per-source error tracking** — track lỗi riêng từng nguồn
- **Computed `*Count` cho Pinia store** — reactive + cache tự động
- **ItemName + SkillName share 1 fetch** — gộp localized vào 1 Promise.all

### v2 (sau Arena Lookup Feature)
- **Bỏ comment `Ref:` tham khảo file khác khi ổn định**
- **Bỏ comment tham khảo "bản JS cũ"**
- **Bỏ `console.*` debug log khi TODO placeholder**
- **Helper validation ở store level (expose public)**

### v3 (sau Avatar Data Display Feature)
- **GraphQL response unwrapping chain**: Khi có nhiều lớp wrapper (mimirGraphql.graphqlQuery → fetchQueryA → store.fetchStep1), PHẢI verify ở mỗi lớp data có bị unwrap không. `graphqlQuery<T>()` trả về `json.data` → fetchQueryA trả về kết quả → store PHẢO access `response['stateQuery']` trực tiếp, KHÔNG `response['data']['stateQuery']`.
- **Subpath imports cho new icons**: Khi thêm icon mới từ `@vicons/material`, nếu barrel import fail với vue-tc, dùng subpath `@vicons/material/es/<IconName>.js` ngay từ đầu (không cần thử barrel trước). Pattern đã xác nhận với TableChartRound, PersonSearchRound.
- **Cross-page prefill pattern**: Login → AvatarData dùng `LOGIN_PREFILL_AGENT`/`LOGIN_PREFILL_AVATAR` constants. onMounted: `localStorage.getItem()` → fill form → `localStorage.removeItem()` immediately. Auto-fetch nếu cả 2 address đều có. Pattern giống ArenaLookup → Login.
- **Pure helper functions cho game logic**: Các hàm tính toán game (calculateAPCost, combatPotion, processMaterials, dedupConsumables) đặt trong `*Helpers.ts` files, KHÔNG trong store. Store chỉ gọi helper. Pattern: helper là pure function (input → output, không side-effect), dễ test independently.
- **Enrichment pattern (raw → enriched)**: Store nhận raw data từ GraphQL → helper functions enrich với CSV data (names, CP, skills, stats) → tạo enriched objects (EnrichedEquipment, EnrichedCostume). Tách rõ raw vs enriched trong type system.

### v4 (sau Code Optimization Session)
- **Locale-aware number formatting**: Dùng `toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')` thay vì `toLocaleString()` không locale. Tạo helper `fmtNum()` trong component để format số theo ngôn ngữ user.
- **Extract CSV parsing helpers**: Khi inline CSV row mapping phức tạp (nhiều fallback keys snake_case/camelCase), extract thành helper functions (`parseWorldBossSheet()`, `parseEventScheduleSheet()`) trong `*Helpers.ts`. Helper có interface riêng với `[key: string]: unknown` index signature.
- **Null safety cho graphqlQuery**: `graphqlQuery<T>()` có thể trả null. Khi function declare `Promise<Record<string, unknown>>` (không nullable), caller PHẢO check null và throw error thay vì return null. Tránh type mismatch.
- **Hardcode constant extraction**: Với giá trị magic number xuất hiện nhiều lần (888888, 40, 3, '100000'), extract thành named constant. Đảm bảo constant ĐƯỢC DÙNG (tránh tạo constant nhưng code dùng giá trị khác).
- **Debug logging verbosity**: Giữ debug logging ngắn gọn — log count thay vì JSON.stringify toàn bộ data. Ví dụ: `logger.debug(\`Sheet=${sheet ? Object.keys(sheet).length + ' rows' : 'null'}\`)`.

### v5 (sau Code Optimization v2 Session)
- **`Object.keys()` thay `for...in` + `hasOwnProperty.call()`**: Khi iterate object keys, dùng `for (const key of Object.keys(obj))` thay `for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { ... } }`. Modern, cleaner, ít verbose. `Object.keys()` chỉ trả own enumerable keys nên không cần check thêm.
- **Pre-build Map cho repeated CSV lookups**: Khi cần lookup CSV sheet data cho N items (vd costumeStatSheet cho N costumes), pre-build `Map<id, Map<field, value>>` ONCE trước loop, rồi per-item lookup O(1). Thay vì scan toàn sheet mỗi item → giảm O(n*m) → O(n+m).
- **Test coverage cho edge cases**: Luôn test: (1) all enum/stat types, (2) empty/null input, (3) boundary values, (4) type coercion (string→number, undefined→default), (5) error paths (network error, null response). Đặc biệt quan trọng cho helper functions thuần túy.

### v6 (sau Code Optimization v3 Session)
- **Case-insensitive stat comparison**: Normalize both sides to uppercase trước khi compare. `statKey = statType.toUpperCase()`, `upperKey = key.toUpperCase()`. Tránh silent bug khi CSV data dùng key casing khác nhau (hP vs HP, aTK vs ATK).
- **Extract duplicated logic into named helper**: Khi cùng 1 block code (vd material update + AP potion split) xuất hiện 2 lần → extract thành named helper function. Giảm cognitive overhead, single source of truth, dễ test.
- **Mock timing trong Pinia store tests**: `vi.mock` factory có thể trả về object mới mỗi call. Store capture reference khi `defineStore` chạy (lazily). Override mock SAU store creation → KHÔNG ảnh hưởng store's captured reference. Fix: (1) dùng `mockReturnValue()` TRƯỚC khi tạo store, hoặc (2) test gián间接 qua flow thay vì override mock trực tiếp.
