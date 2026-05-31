# Progress: NineCMD UI Migration to TypeScript

## Overview
Chuyển đổi giao diện từ JavaScript sang TypeScript, chạy song song với hai entry points.

## Current Status
- **Giai đoạn 1 - Infrastructure + i18n + Testing**: ✅ Hoàn thành
- **Giai đoạn 2a - Vue Router + Layout + Modular Components**: ✅ Hoàn thành
- **Giai đoạn 2b - Block Polling + Pinia Stores + Settings**: ✅ Hoàn thành
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
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - Planet configs (odin/heimdall/thor), Mimir URLs, poll interval options, GraphQL query
- [x] [`types/footer.ts`](src-ts/types/footer.ts) - FooterSettings.pollIntervalMs, BlockPollEntry, BlockAverages
- [x] [`types/naive-ui.d.ts`](src-ts/types/naive-ui.d.ts) - Thêm NSpin, NTooltip
- [x] [`FooterInfoBlock.vue`](src-ts/components/footer/FooterInfoBlock.vue) - Block info từ blockPolling store
- [x] [`FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Tab "Block Monitor" (planet, poll interval, stats); Tab "Setting" (dark mode, language)
- [x] [`App.vue`](src-ts/App.vue) - Watch store for theme/language apply
- [x] [`__tests__/appSettings.test.ts`](src-ts/__tests__/appSettings.test.ts) - 22 tests
- [x] [`__tests__/blockPolling.test.ts`](src-ts/__tests__/blockPolling.test.ts) - 22 tests
- [x] [`__tests__/darkMode.test.ts`](src-ts/__tests__/darkMode.test.ts) - Updated to 19 tests (thêm Pinia integration)

### Tests: 88/88 Pass ✅
| Test File | Tests | Status |
|-----------|-------|--------|
| i18n.test.ts | 12 | ✅ |
| darkMode.test.ts | 19 | ✅ |
| router.test.ts | 13 | ✅ |
| appSettings.test.ts | 22 | ✅ |
| blockPolling.test.ts | 22 | ✅ |
| **Total** | **88** | **✅** |

### Issues Resolved (Total: 19)
1-12. ✅ Previous issues (Vite, naive-ui, vitest, etc.)
13. ✅ @vicons/material missing icons
14. ✅ naive-ui missing NForm/NButton/NResult etc.
15. ✅ Missing i18n keys
16. ✅ Dark mode provide/inject pattern
17. ✅ FooterNodeManager drawer toggle (70%↔100%)
18. ✅ WebSocket replaced by GraphQL polling (Mimir endpoint)
19. ✅ Pinia stores for appSettings + blockPolling (replaced composable singleton + useStorage sync issues)

## File Structure
```
src-ts/
├ main.ts + App.vue (entry + watch store theme/lang)
├ router/index.ts (3 routes)
├ layouts/MainLayout.vue
├ stores/ (NEW)
│  ├── appSettings.ts (dark mode, planet, language, poll interval)
│  └── blockPolling.ts (GraphQL block polling, avg block time)
├ components/
│  ├── Placeholder{Header,MenuLeft,Footer,FloatButton}.vue
│  ├── header/{HeaderAvatar,HeaderProgress,HeaderBanner}.vue
│  └── footer/{FooterInfoBlock,FooterNodeManager}.vue (UPDATED: block monitor + settings)
├ views/{HomePage,LoginPage,NotFoundPage}.vue
├ types/{header,footer,naive-ui.d,ui.d}.ts (UPDATED: footer + naive-ui)
├ i18n/ + utilities/constants.ts (UPDATED: planet configs, poll intervals)
├ assets/
└ __tests__/{i18n,darkMode,router,appSettings,blockPolling}.test.ts (88 tests)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (88 tests) |

## Kế Hoạch Tương Lai
### Giai đoạn 3: Stores JS → TypeScript (10 stores)
### Giai đoạn 4: Utilities JS → TypeScript (15+ files)
### Giai đoạn 5: Testing & Review → Merge src-ts/ vào src/
