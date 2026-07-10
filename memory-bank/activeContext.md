# Active Context: NineCMD

## Current Work Focus
- **Avatar Data Display Feature**: ✅ Hoàn thành (Phase 2k)
- **Login → Avatar Data Flow**: ✅ Hoàn thành (localStorage prefill)
- **Double-unwrap Fix**: ✅ Hoàn thành (graphqlQuery<T> already unwraps json.data)
- **Code Optimization (Post-Phase 2k)**: ✅ Hoàn thành
- **Code Optimization v2 + Test Coverage**: ✅ Hoàn thành (Object.keys, fillCostumes Map, +24 tests)
- **Code Optimization v3 + Test Coverage v2**: ✅ Hoàn thành (case-insensitive statAndSkillOption, extract mergeMaterialCounts, +10 tests)
- **Code Optimization v4 + Test Coverage v3**: ✅ Hoàn thành (parseSheetWithFields DRY, query fragments, +57 tests)

## Session Mới Nhất - Code Optimization v3 + Test Coverage v2

### Đã Hoàn Thành

1. **[`avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts)** — `statAndSkillOption()` optimization:
   - Redundant uppercase: `statMain` was built with mixed casing then `.toUpperCase()` called again
   - Case-insensitive statsMap comparison: `'hP'` vs `'HP'` caused optionStat subtraction to fail silently
   - Fix: Normalize `statKey = stat.statType.toUpperCase()` once, use `key.toUpperCase()` for comparison
   - Ensures correct subtraction regardless of statsMap key casing (hP/HP, aTK/ATK, etc.)

2. **[`avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts)** — Extract `mergeMaterialCounts()`:
   - Duplicated material update logic in `fetchStep1` (AP potion special case appeared 2x)
   - Extracted to standalone `mergeMaterialCounts()` helper function
   - Handles AP potion tradable/non-tradable split + batch update pattern
   - `fillEquipments`: Removed redundant `as unknown as` double cast

3. **[`avatarDataHelpers.test.ts`](src-ts/__tests__/avatarDataHelpers.test.ts)** — +6 tests:
   - `statAndSkillOption` case-insensitive: uppercase keys, mixed-case keys, uppercase statType input
   - `buildCodeGetList` edge cases: blockNow=0, very large blockNow

4. **[`avatarDataDisplay.test.ts`](src-ts/__tests__/avatarDataDisplay.test.ts)** — +4 tests:
   - `mergeMaterialCounts`: AP potion tradable split via fetchStep1, Query B failure graceful fallback
   - `fillCostumes` with CostumeStatSheet data: Map-based lookup verification
   - `fetchStep2` REST API processing: equipment sets, rune sets, patrol reward, adventure CP, claimed gifts

### Kết Quả
- **510 tests pass** (tăng từ 500 → 510, +10 tests)
- **18 test files** all green
- Code optimization: case-insensitive statAndSkillOption + extracted mergeMaterialCounts

### Patterns Mới
- **Case-insensitive stat comparison**: Dùng `toUpperCase()` normalize cả statType lẫn statsMap keys trước khi so sánh. Tránh silent bug khi CSV data dùng key casing khác nhau.
- **Extract duplicated logic into named helper**: Khi cùng 1 block code (material update + AP potion split) xuất hiện 2 lần → extract thành `mergeMaterialCounts()`.
- **Mock timing trong Pinia store tests**: `vi.mock` factory trả về object mới mỗi call. Store capture reference khi `defineStore` chạy. Override mock SAU store creation → KHÔNG ảnh hưởng store. Fix: dùng `mockReturnValue()` TRƯỚC khi tạo store, hoặc test gián tiếp qua flow.

## Session Cũ Hơn - Code Optimization v2 (Test Coverage + Code Cleanup)

### Đã Hoàn Thành

1. **[`avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts)** — Cleanup:
   - `statAndSkillOption()`: `for...in` + `Object.prototype.hasOwnProperty.call()` → `Object.keys()` (cleaner, modern API)

2. **[`avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts)** — Optimize `fillCostumes()`:
   - Pre-build `Map<costumeId, Map<statType, statValue>>` from CostumeStatSheet ONCE
   - Per-costume lookup O(1) thay vì O(n) scan toàn sheet mỗi costume
   - Giảm complexity từ O(n*m) → O(n+m)

3. **[`avatarDataHelpers.test.ts`](src-ts/__tests__/avatarDataHelpers.test.ts)** — +18 tests:
   - `statAndSkillOption` edge cases: all 6 stat types (hP, aTK, dEF, sPD, hIT, cRI), empty statsMap, multiple skills
   - `processInventoryFromGraphQL` tradableId undefined + missing property
   - `calculateAPCost` large numbers, float, NaN string
   - `combatPotion` all stats non-zero + skill buff
   - `parseWorldBossSheet` / `parseEventScheduleSheet` empty object + mixed types

4. **[`avatarDataGraphQL.test.ts`](src-ts/__tests__/avatarDataGraphQL.test.ts)** — +1 test:
   - `fetchGetDataGraphql` network error (fetch throws)

5. **[`avatarDataDisplay.test.ts`](src-ts/__tests__/avatarDataDisplay.test.ts)** — +5 tests:
   - `extractPatrolReward` via fetchStep2: error string, message string, null, no data wrapper (direct format)
   - `reset` after full data load (verifies complete state clear)

### Kết Quả
- **500 tests pass** (tăng từ 476 → 500, +24 tests)
- **18 test files** all green
- Code optimization: `Object.keys()` + `fillCostumes` Map lookup

## Session Cũ Hơn - Code Optimization (Post-Phase 2k)

### Đã Hoàn Thành

Rà soát toàn bộ diff bằng MCP git, phát hiện và sửa các vấn đề hardcode, dead code, debug logging, inline functions.

**Files modified (5 files):**

1. **[`constants.ts`](src-ts/utilities/constants.ts)** — Thêm constants mới:
   - `STAGE_SPECIAL_PREFIX = '100000'` (thay thế `STAGE_MAX_NORMAL = 1000` sai giá trị + hardcode `'100000'`)
   - `DEFAULT_LEVEL_REQ = 888888` (thay hardcode trong store)
   - `MAX_PURCHASE_COUNT = 40` (thay hardcode `/ 40` trong template)
   - `MAX_CHALLENGE_COUNT = 3` (thay hardcode `/ 3` trong template)

2. **[`avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts)** — Cleanup + extract:
   - Xóa `getPatrolRewardInfo()` (dead code, không được gọi)
   - Xóa 10 block comment `Ref:` tham khảo file cũ
   - Thêm `parseWorldBossSheet()` / `parseEventScheduleSheet()` (extract từ store)
   - Thêm interfaces `ParsedWorldBossRow` / `ParsedEventScheduleRow`
   - Dùng `STAGE_SPECIAL_PREFIX` thay string literal

3. **[`avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts)** — Cleanup + optimize:
   - Xóa `skillNameSheet` dead code
   - Dùng `DEFAULT_LEVEL_REQ` thay hardcode `888888`
   - Dùng `parseWorldBossSheet()` / `parseEventScheduleSheet()` thay inline
   - Giảm debug logging verbosity

4. **[`avatarDataGraphQL.ts`](src-ts/utilities/avatarDataGraphQL.ts)** — Fix null return:
   - `fetchQueryB()` throw error khi `graphqlQuery()` trả null

5. **[`AvatarDataGraphqlTable.vue`](src-ts/components/avatarData/AvatarDataGraphqlTable.vue)** — Locale + constants:
   - Thêm `fmtNum()` helper dùng `toLocaleString(locale)` từ `appSettings.lang`
   - Thay 7x `.toLocaleString()` → `fmtNum()`
   - Thay hardcode `/ 3`, `/ 40` → constants

---

Tính năng mới cho phép user xem chi tiết avatar (character info, inventory, materials, consumables) bằng cách nhập agent + avatar address.

**Files mới (9 files):**

1. **Types** [`types/avatarData.ts`](src-ts/types/avatarData.ts):
   - AgentBalance, StakeState, StageMap, RuneEntry, EquipmentStat, EquipmentSkill
   - StatsMap, EquipmentItem, EnrichedEquipment (enriched with CSV data)
   - CostumeItem, EnrichedCostume (enriched with CostumeStatSheet)
   - MaterialItem, ConsumableItem, DedupedConsumable
   - InventoryData, CombinationSlot, ItemMap
   - AvatarGraphQL (full GraphQL response shape)
   - CharacterInfo (computed from raw data)
   - CpRankingData, StatSkillResult, PatrolRewardInfo
   - GetDataGraphqlResponse (REST API response)

2. **Helpers** [`utilities/avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts):
   - `calculateAPCost(stake)` — AP cost từ COST_AP_BY_STAKE table
   - `getLatestStageClearedId(stages)` — ID stage cao nhất đã clear (dùng STAGE_SPECIAL_PREFIX)
   - `combatPotion(rune)` — Combat potion stats từ rune data
   - `statAndSkillOption(skill, localeColumn, globalCsv)` — Stat/skill display text
   - `getActiveWorldBossId(worldBosses)` — Active world boss ID
   - `getActiveEventDungeon(eventDungeons)` — Active event dungeon ID
   - `processMaterials(materials)` — Count unique materials
   - `dedupConsumables(consumables)` — Dedup consumables with count
   - `processInventoryFromGraphQL(inventory)` — Process Query B response (AP potion split)
   - `buildCodeGetList(worldBoss, eventSchedule, block)` — Build REST API codeGet params
   - `parseWorldBossSheet(sheet)` — Parse CSV sheet → typed rows (extracted from store)
   - `parseEventScheduleSheet(sheet)` — Parse CSV sheet → typed rows (extracted from store)

3. **GraphQL** [`utilities/avatarDataGraphQL.ts`](src-ts/utilities/avatarDataGraphQL.ts):
   - `buildQueryA(agent, avatar)` — Single GraphQL query for all node data (inventory, staking, stages, runes, costumes, combinations, world bosses, event dungeons, etc.)
   - `fetchQueryA(agent, avatar)` — Uses `mimirGraphql.graphqlQuery<T>()` which already returns `json.data` (DO NOT double-unwrap)
   - `buildQueryB(avatar, materialIds)` — Dynamic material count query (optional)
   - `fetchGetDataGraphql(agent, avatar)` — REST API fetch for getDataGraphql endpoint
   - **IMPORTANT docstring**: "graphqlQuery() already unwraps `json.data`. Do NOT access `response['data']` again"

4. **Store** [`stores/avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts):
   - Pinia Composition API store (pattern giống arenaLookup.ts)
   - State: rawGraphQL, rawRestApi, characterInfo, equipment, costumes, runes, materials, consumables, combinationSlots
   - Loading states: isLoading, error
   - `fetchStep1(agent, avatar)` — Calls fetchQueryA, processes rawGraphQL
   - `fetchStep2(agent, avatar)` — Calls fetchGetDataGraphql, processes rawRestApi
   - `fetchAvatarData(agent, avatar)` — Orchestrates step1 + step2
   - `fillEquipments(data)` — Enriches equipment with CSV names, CP, skills, statArray, levelReq
   - `fillCostumes(data)` — Enriches costumes with CostumeStatSheet statsMap
   - `reset()` — Clears all data
   - Uses: globalCsv (getItemName/getSkillName), csvData (getSheet/getSheetRow), blockPolling, appSettings, configURL

5. **Components** (5 files trong [`components/avatarData/`](src-ts/components/avatarData/)):
   - [`AvatarDataForm.vue`](src-ts/components/avatarData/AvatarDataForm.vue) — Form agent + avatar address inputs, reads prefill from localStorage on mount + auto-fetches if both present
   - [`AvatarDataInfoTable.vue`](src-ts/components/avatarData/AvatarDataInfoTable.vue) — n-descriptions bordered component for character info display
   - [`AvatarDataInventoryTable.vue`](src-ts/components/avatarData/AvatarDataInventoryTable.vue) — 5 tabs: Equipments, Costumes, Runes, Combination Slots, Equipped Summary. Uses n-data-table with typed columns
   - [`AvatarDataMaterialTable.vue`](src-ts/components/avatarData/AvatarDataMaterialTable.vue) — 2 tabs: Materials, Consumables. Accesses `store.rawGraphQL['stateQuery']` directly (fixed double-unwrap)
   - [`AvatarDataGraphqlTable.vue`](src-ts/components/avatarData/AvatarDataGraphqlTable.vue) — Tabs for REST API data (TODO placeholders) + Raw JSON viewer

6. **View** [`views/AvatarDataView.vue`](src-ts/views/AvatarDataView.vue):
   - Layout: Form → Loading/Error/NoData/Results
   - Imports all 5 avatar data components

**Files modified (6 files):**

7. [`router/index.ts`](src-ts/router/index.ts) — + route `/avatar-data` before not-found
8. [`components/PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue) — + PersonSearchRound icon (subpath import) + "Avatar Data" menu item
9. [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) — + `avatarData.*` section (form, info, inventory, material, graphql)
10. [`views/LoginPage.vue`](src-ts/views/LoginPage.vue) — onSubmit saves agent+avatar to localStorage + navigates to avatar-data
11. [`utilities/constants.ts`](src-ts/utilities/constants.ts) — + COST_AP_BY_STAKE, COST_AP_BY_STAKE_MIN, STAGE_SPECIAL_PREFIX, AP_POTION_ID, AP_POTION_TRADABLE_OFFSET, DEFAULT_LEVEL_REQ, MAX_PURCHASE_COUNT, MAX_CHALLENGE_COUNT, AVATAR_DATA_CODE_GET_STATIC, CODE_GET_RESPONSE_KEYS

### Bugs Fixed

1. **TypeScript `skills` type mismatch** (avatarDataDisplay.ts:127):
   - Error: `Type 'EquipmentSkill[]' is not assignable to type '{ [key: string]: unknown; id: number; }[]'`
   - Fix: Changed `statAndSkillOption` param type from `[key: string]: unknown` to explicit optional EquipmentSkill properties

2. **Double-unwrap GraphQL response** (user-identified):
   - `mimirGraphql.graphqlQuery<T>()` returns `json.data` (already unwrapped)
   - `avatarDataGraphQL.fetchQueryA()` returns `graphqlQuery()` result (already `data`)
   - `avatarDataDisplay.fetchStep1()` was doing `response['data']['stateQuery']` — DOUBLE unwrap
   - Fix: Changed to `response['stateQuery']` directly in 2 files:
     - `avatarDataDisplay.ts:236` — `const stateQuery = (response as Record<string, unknown>)?.['stateQuery']`
     - `AvatarDataMaterialTable.vue:42-61` — Removed `data?.['data']` layer
   - Also updated `avatarDataGraphQL.ts` docstring to warn future developers

3. **Pre-existing alias errors** (36 errors from `tsc --noEmit`):
   - Root cause: Running `tsc` from root directory, `@/` alias doesn't resolve to `src-ts/`
   - NOT actual code errors — all existing stores have the same issue
   - Vue-tsc with proper config resolves correctly (0 errors)

### TODO Items

- [x] Write tests for avatarDataHelpers (119 tests), avatarDataGraphQL (45 tests), constants (40 tests)
- [ ] REST API Step 3: Implement real data tabs in AvatarDataGraphqlTable.vue (currently TODO placeholders)

## Session Optimization (Post-Phase 2k) — Đã Hoàn Thành

### Đã Sửa (5 files)

1. **[`constants.ts`](src-ts/utilities/constants.ts)** — Xóa `STAGE_MAX_NORMAL = 1000` (unused + sai giá trị), thêm `STAGE_SPECIAL_PREFIX = '100000'`, `DEFAULT_LEVEL_REQ = 888888`, `MAX_PURCHASE_COUNT = 40`, `MAX_CHALLENGE_COUNT = 3`

2. **[`avatarDataHelpers.ts`](src-ts/utilities/avatarDataHelpers.ts)** — Xóa `getPatrolRewardInfo()` (dead code), xóa 10 blocks comment `Ref:`, thêm `parseWorldBossSheet()` / `parseEventScheduleSheet()` (extract từ store), dùng `STAGE_SPECIAL_PREFIX`

3. **[`avatarDataDisplay.ts`](src-ts/stores/avatarDataDisplay.ts)** — Xóa `skillNameSheet` dead code, dùng `DEFAULT_LEVEL_REQ`, dùng parse helpers thay inline, giảm debug logging verbosity

4. **[`avatarDataGraphQL.ts`](src-ts/utilities/avatarDataGraphQL.ts)** — Fix `fetchQueryB()` throw error khi null thay vì return null (type safety)

5. **[`AvatarDataGraphqlTable.vue`](src-ts/components/avatarData/AvatarDataGraphqlTable.vue)** — Thêm `fmtNum()` locale-aware helper, thay 7x `toLocaleString()`, dùng constants thay hardcode `/ 3`, `/ 40`

### Patterns Mới

- **Locale-aware number formatting**: Dùng `toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')` thay vì `toLocaleString()` không locale. Helper `fmtNum()` trong component.
- **Extract CSV parsing helpers**: Khi inline CSV row mapping phức tạp (nhiều fallback keys), extract thành helper functions trong `*Helpers.ts` để test independently.
- **Null safety cho graphqlQuery**: `graphqlQuery<T>()` có thể trả null → caller PHẢO check null và throw thay vì return null khi function declare `Promise<Record<string, unknown>>`.

## File Structure src-ts/ (Latest)
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
│  ├── Placeholder{FloatButton,Header,MenuLeft,Footer}.vue
│  ├── header/{HeaderAvatar,HeaderProgress,HeaderBanner}.vue
│  ├── footer/{FooterInfoBlock,FooterNodeManager,FooterBlockMonitor,FooterSettings,FooterEndpoints,FooterActions,FooterStorageInfo,FooterLogViewer}.vue
│  └── avatarData/                     # NEW: Avatar Data Display components
│     ├── AvatarDataForm.vue           # Form agent + avatar address
│     ├── AvatarDataInfoTable.vue      # Character info (n-descriptions)
│     ├── AvatarDataInventoryTable.vue # 5 tabs: Equipment, Costumes, Runes, Combos, Summary
│     ├── AvatarDataMaterialTable.vue  # 2 tabs: Materials, Consumables
│     └── AvatarDataGraphqlTable.vue   # REST API data + Raw JSON viewer
├ views/
│  ├── FirstLoadingPage.vue            # Overlay + planet switching overlay
│  ├── CsvDataView.vue                 # CSV data viewer with pagination + planet indicator
│  ├── ArenaLookupPage.vue             # Arena leaderboard search + "Dùng để đăng nhập"
│  ├── AvatarDataView.vue              # NEW: Avatar data display (Form → Loading/Results)
│  ├── HomePage.vue + Banner carousel
│  ├── LoginPage.vue                   # Login form + agent/avatar lookup + prefill to avatar-data
│  └── NotFoundPage.vue
├ types/
│  ├── arenaLookup.ts
│  ├── avatarData.ts                   # NEW: 30+ interfaces
│  ├── csvData.ts, footer.ts, header.ts, i18nCsv.ts, logger.ts, ui.d.ts
├ i18n/locales/en.json, vi.json       # + avatarData.* section
├ utilities/
│  ├── arenaGql.ts
│  ├── avatarDataGraphQL.ts            # NEW: buildQueryA/B, fetchQueryA, fetchGetDataGraphql
│  ├── avatarDataHelpers.ts            # NEW: Pure helpers (9 functions)
│  ├── bannerService.ts, constants.ts  # +COST_AP_BY_STAKE, +LOGIN_PREFILL_*
│  ├── csvFetcher.ts, csvParser.ts, logger.ts, mimirGraphql.ts
│  ├── nameService.ts, placeholder.ts
└ __tests__/                           # 500 tests (18 files)
```

## Active Decisions
- **GraphQL response unwrapping**: `mimirGraphql.graphqlQuery<T>()` already returns `json.data`. All callers (fetchQueryA, fetchLeaderboard, etc.) return already-unwrapped data. Do NOT access `response['data']` again in store/component layer.
- **Cross-page prefill via localStorage**: Login → Avatar Data uses `LOGIN_PREFILL_AGENT` / `LOGIN_PREFILL_AVATAR` constants. Arena Lookup → Login uses same pattern. One-shot: read once + remove immediately.
- **CSV enrichment pattern**: Store receives raw GraphQL data → `fillEquipments()` / `fillCostumes()` enriches items with names (globalCsv.getItemName), CP (csvData.CpsSheet), skills (globalCsv.getSkillName), statArray (csvData.EquipmentStatSheet), levelReq (csvData.RequirementSheet).
- **REST API TODO**: `fetchGetDataGraphql()` and AvatarDataGraphqlTable are currently placeholder/TODO. Real data tabs will be implemented when REST API response structure is finalized.
- **Subpath imports for @vicons/material**: Pattern established (TableChartRound, PersonSearchRound). Any new icon that fails barrel import → use `@vicons/material/es/<IconName>.js`.

## Known Issues
- ✅ Vue-tsc: 0 errors (verified with proper config)
- ✅ Pre-existing `tsc --noEmit` from root = 36 alias errors (NOT real errors, `@/` resolves correctly via vite-ts.config.js)
- 🔶 REST API Step 3 (getDataGraphql tabs) — TODO placeholders
- ✅ Tests for avatar data feature — 582 tests total (helpers 119, graphql 45, constants 40, display 19)

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build:ts # Build TS version
npm run test     # Vitest (500 tests)
npm run check:ts # Vue-TSC type check (0 errors)
```
