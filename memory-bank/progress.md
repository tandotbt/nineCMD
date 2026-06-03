# Progress: NineCMD UI Migration to TypeScript

## Overview
Chuyển đổi giao diện từ JavaScript sang TypeScript, chạy song song với hai entry points.

## Current Status
- **Giai đoạn 1 - Infrastructure + i18n + Testing**: ✅ Hoàn thành
- **Giai đoạn 2a - Vue Router + Layout + Modular Components**: ✅ Hoàn thành
- **Giai đoạn 2b - Block Polling + Pinia Stores + Settings**: ✅ Hoàn thành
- **Giai đoạn 2c - ConfigURL Store + FirstLoading Overlay + Endpoint Settings**: ✅ Hoàn thành
- **Giai đoạn 2d - Logger System + Settings Tab + Code Refactor**: ✅ Hoàn thành
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

### Tests: 164/164 Pass ✅
| Test File | Tests | Status |
|-----------|-------|--------|
| i18n.test.ts | 19 | ✅ |
| darkMode.test.ts | 19 | ✅ |
| router.test.ts | 13 | ✅ |
| appSettings.test.ts | 30 | ✅ |
| blockPolling.test.ts | 26 | ✅ |
| configURL.test.ts | 36 | ✅ |
| logger.test.ts | 21 | ✅ |
| **Total** | **164** | **✅** |

### Known Issues
- 🔶 Build `vue-tsc --noEmit` chưa verify (task interrupted lần trước)

## File Structure
```
src-ts/
├ main.ts + App.vue (entry + FirstLoadingOverlay + watch store theme/lang)
├ router/index.ts (3 routes, / is home)
├ layouts/MainLayout.vue
├ stores/
│  ├── appSettings.ts (dark mode, planet, language, poll interval, isPolling, logLevel + logger)
│  ├── blockPolling.ts (GraphQL block polling + auto-start watch + logger)
│  └── configURL.ts (fetch planet data, dynamic RPC endpoints + logger)
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
├ views/ (FirstLoadingPage, HomePage, LoginPage, NotFoundPage)
├ types/ (logger.ts, naive-ui.d.ts, ui.d.ts, header.ts, footer.ts)
├ i18n/ (+ settings.*, logger.* keys)
├ utilities/ (constants.ts, logger.ts)
└ __tests__/ (164 tests, 7 files)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (164 tests) |

## Kế Hoạch Tương Lai
1. **Verify build**: Chạy `vue-tsc --noEmit` + fix lỗi
2. **Giai đoạn 3**: Stores JS → TypeScript (10 stores)
3. **Giai đoạn 4**: Utilities JS → TypeScript (15+ files)
4. **Giai đoạn 5**: Testing & Review → Merge src-ts/ vào src/
