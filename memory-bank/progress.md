# Progress: NineCMD UI Migration to TypeScript

## Overview
Chuyển đổi giao diện từ JavaScript sang TypeScript, chạy song song với hai entry points.

## Current Status
- **Giai đoạn 1 - Infrastructure + i18n + Testing**: ✅ Hoàn thành
- **Giai đoạn 2a - Vue Router + Layout + Modular Components**: ✅ Hoàn thành
- **Giai đoạn 2b - Block Polling + Pinia Stores + Settings**: ✅ Hoàn thành
- **Giai đoạn 2c - ConfigURL Store + FirstLoading Overlay + Endpoint Settings**: ✅ Hoàn thành
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

### Phase 2c: ConfigURL Store + FirstLoading Overlay + Endpoint Settings 🔶
- [x] [`stores/configURL.ts`](src-ts/stores/configURL.ts) - NEW: Fetch planet data từ URL_ALL_PLANET, dynamic RPC endpoints, endpoint selection (random/manual)
- [x] [`views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue) - NEW: Overlay semi-transparent backdrop, countdown 3s, loading/error/success states
- [x] [`App.vue`](src-ts/App.vue) - Import FirstLoadingOverlay bên trong n-config-provider
- [x] [`utilities/constants.ts`](src-ts/utilities/constants.ts) - + URL_ALL_PLANET, PlanetData, PlanetRpcEndpoints interfaces
- [x] [`stores/blockPolling.ts`](src-ts/stores/blockPolling.ts) - getMimirUrl() ưu tiên URL động từ configURL
- [x] [`stores/appSettings.ts`](src-ts/stores/appSettings.ts) - + setPlanet() validate, validatePlanetAvailability()
- [x] [`components/footer/FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - 4 tabs: Block Monitor, Settings, Endpoints, Actions + disable unavailable planets
- [x] [`i18n/locales/en.json`](src-ts/i18n/locales/en.json) + [`vi.json`](src-ts/i18n/locales/vi.json) - + firstLoading.*, endpoints.*
- [x] [`types/naive-ui.d.ts`](src-ts/types/naive-ui.d.ts) - + NCollapse, NCollapseItem, NRadioGroup, NRadioButton
- [x] [`types/ui.d.ts`](src-ts/types/ui.d.ts) - + useDark
- [x] [`router/index.ts`](src-ts/router/index.ts) - Giữ nguyên cấu trúc gốc
- [x] [`__tests__/router.test.ts`](src-ts/__tests__/router.test.ts) - Giữ nguyên

### Tests: 124/124 Pass ✅
| Test File | Tests | Status |
|-----------|-------|--------|
| i18n.test.ts | 12 | ✅ |
| darkMode.test.ts | 19 | ✅ |
| router.test.ts | 13 | ✅ |
| appSettings.test.ts | 22 | ✅ |
| blockPolling.test.ts | 22 | ✅ |
| configURL.test.ts | 36 | ✅ |
| **Total** | **124** | **✅** |

### Known Issues
- 🔶 Build `vue-tsc --noEmit` chưa verify thành công (task interrupted)
- 🔶 Dark mode overlay có thể cần test thêm

## File Structure
```
src-ts/
├ main.ts + App.vue (entry + FirstLoadingOverlay + watch store theme/lang)
├ router/index.ts (3 routes, / is home)
├ layouts/MainLayout.vue
├ stores/
│  ├── appSettings.ts (dark mode, planet, language, poll interval + validate)
│  ├── blockPolling.ts (GraphQL block polling, uses configURL for dynamic URLs)
│  └── configURL.ts (NEW: fetch planet data, dynamic RPC endpoints)
├ components/
│  ├── Placeholder{Header,MenuLeft,Footer,FloatButton}.vue
│  ├── header/{HeaderAvatar,HeaderProgress,HeaderBanner}.vue
│  └── footer/{FooterInfoBlock,FooterNodeManager}.vue (4 tabs)
├ views/
│  ├── FirstLoadingPage.vue (NEW: overlay)
│  ├── HomePage.vue, LoginPage.vue, NotFoundPage.vue
├ types/ + i18n/ + utilities/constants.ts + assets/
└ __tests__/ (88 tests)
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (88 tests) |

## Kế Hoạch Tương Lai
1. **Verify build**: Chạy `vue-tsc --noEmit` + fix lỗi
2. **Update tests**: Thêm test cho configURL store, endpoint selection
3. **Giai đoạn 3**: Stores JS → TypeScript (10 stores)
4. **Giai đoạn 4**: Utilities JS → TypeScript (15+ files)
5. **Giai đoạn 5**: Testing & Review → Merge src-ts/ vào src/
