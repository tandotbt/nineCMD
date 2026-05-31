# Active Context: NineCMD

## Current Work Focus
- **TypeScript Migration**: Giai đoạn 2b hoàn thành - Block Polling + App Settings Pinia stores + Planet selection + Dark mode store integration.
- **Block Polling**: Thay thế WebSocket (đã ngưng hoạt động) bằng GraphQL polling qua Mimir endpoint, tính avg block time từ block index diff.
- **Pinia Stores**: `appSettings` (dark mode, planet, language, poll interval) + `blockPolling` (block data, polling control).
- **Footer UI**: Tab "Block Monitor" với planet selection, poll interval settings, block stats; Tab "Setting" với dark mode toggle, language.
- **88 Tests Pass**: appSettings (22) + blockPolling (22) + darkMode (19) + i18n (12) + router (13).
- **Tiếp theo**: Chuyển stores/utilities từ JS sang TypeScript, thêm routes cho Arena/Shop.

## Session Mới Nhất - Block Polling + Pinia Stores

### Đã Hoàn Thành
1. **Pinia Store: appSettings** ([`src-ts/stores/appSettings.ts`](src-ts/stores/appSettings.ts)):
   - Dark mode state + toggle/set
   - Planet selection (odin/heimdall/thor) + label
   - Language (en/vi)
   - Poll interval (5s–60s)
   - Persist to localStorage via direct `localStorage.setItem`

2. **Pinia Store: blockPolling** ([`src-ts/stores/blockPolling.ts`](src-ts/stores/blockPolling.ts)):
   - GraphQL query `blocks(take: 1) { items { object { index } } }` exact match Python `get_block_now()`
   - Mimir endpoint per planet: `https://odin-mimir.9c.gg/graphql`, `https://heimdall-mimir.9c.gg/graphql`
   - Poll cycle: configurable interval (default 10s), auto-start on store creation
   - Avg block time: calculated from block index diff between polls
   - Stats: pollCount, successCount, failCount, successRate, historyLength
   - Watch planet/interval changes from appSettings store

3. **Planet Constants** ([`src-ts/utilities/constants.ts`](src-ts/utilities/constants.ts)):
   - `PlanetName` type: `'odin' | 'heimdall' | 'thor'`
   - `PlanetConfig` interface: id, label, mimirUrl, headlessGql
   - `PLANET_CONFIGS`, `PLANET_OPTIONS`, `POLL_INTERVAL_OPTIONS`
   - `QUERY_GET_BLOCK_NOW`: exact Python GraphQL query

4. **Updated Components**:
   - [`FooterInfoBlock.vue`](src-ts/components/footer/FooterInfoBlock.vue) - Hiển thị #block, avg time, planet từ blockPolling store
   - [`FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Tab "Block Monitor" (planet select, poll interval, stats, start/stop); Tab "Setting" (dark mode switch, language select)
   - [`App.vue`](src-ts/App.vue) - Watch `appSettings.isDarkMode`/`appSettings.lang` to apply theme/language

5. **Updated Types** ([`src-ts/types/footer.ts`](src-ts/types/footer.ts)):
   - `FooterSettings.pollIntervalMs`
   - `BlockPollEntry`, `BlockAverages`

6. **Updated naive-ui.d.ts**: Thêm `NSpin`, `NTooltip` declarations

7. **Test Cases** (88 total):
   - [`appSettings.test.ts`](src-ts/__tests__/appSettings.test.ts) - 22 tests: dark mode, language, planet, poll interval, persistence, integration
   - [`blockPolling.test.ts`](src-ts/__tests__/blockPolling.test.ts) - 22 tests: initial state, planet, interval, polling control, GraphQL query format, error handling, integration
   - [`darkMode.test.ts`](src-ts/__tests__/darkMode.test.ts) - 19 tests: theme logic, localStorage, Pinia store integration, i18n config

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build:ts # Build TS version
npm run test     # Vitest (88 tests, src-ts/)
```

## File Structure src-ts/ (Latest)
```
src-ts/
├ main.ts                              # Entry: Vue 3 + Pinia + i18n + Router
├ App.vue                              # ConfigProvider + watch store for theme/lang
├ router/index.ts                      # 3 routes trong MainLayout
├ layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├ stores/                              # Pinia stores
│  ├── appSettings.ts                  # Dark mode, planet, language, poll interval
│  └── blockPolling.ts                 # Block polling via GraphQL, avg block time
├ components/
│  ├── PlaceholderHeader.vue           # Grid 24 responsive
│  ├── PlaceholderMenuLeft.vue         # Menu + lang + dark mode (sidebar)
│  ├── PlaceholderFooter.vue           # InfoBlock + NodeManager
│  ├── PlaceholderFloatButton.vue      # Float button
│  ├── header/
│  │  ├── HeaderAvatar.vue
│  │  ├── HeaderProgress.vue
│  │  └── HeaderBanner.vue
│  └── footer/
│     ├── FooterInfoBlock.vue           # Block info từ blockPolling store
│     └── FooterNodeManager.vue         # Block Monitor tab + Settings tab
├ views/
│  ├── HomePage.vue
│  ├── LoginPage.vue
│  └── NotFoundPage.vue
├ types/
│  ├── header.ts
│  ├── footer.ts                       # + BlockPollEntry, BlockAverages
│  ├── naive-ui.d.ts                   # + NSpin, NTooltip
│  └── ui.d.ts
├ i18n/                                # locales, numberFormats, datetimeFormats
├ utilities/constants.ts               # + Planet configs, poll intervals, GraphQL query
├ assets/base.css
└ __tests__/                           # 88 tests
   ├── i18n.test.ts (12)
   ├── darkMode.test.ts (19)
   ├── router.test.ts (13)
   ├── appSettings.test.ts (22)
   └── blockPolling.test.ts (22)
```

## Active Decisions
- **GraphQL polling thay WebSocket**: `blocks(take: 1)` query giống Python, poll mỗi N giây
- **Pinia stores thay composable singleton**: `appSettings` + `blockPolling` stores, share state across components
- **localStorage persistence**: Direct `localStorage.setItem` trong store actions (không dùng `useStorage` vì sync issues trong tests)
- **Relative imports trong src-ts/**: Tránh conflict `@/` alias (map tới `src/`)
- **isPolling là ref**: Để reactive updates, không dùng computed từ module-scope variable

## Next Steps
1. **Chuyển stores JS → TypeScript** (10 stores từ src/stores/)
2. **Chuyển utilities JS → TypeScript** (15+ files từ src/utilities/)
3. **Thêm routes** cho Arena, Shop
4. **Điền logic vào placeholder views** (HomePage, LoginPage)
