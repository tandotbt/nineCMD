# Active Context: NineCMD

## Current Work Focus
- **TypeScript Migration**: Giai đoạn 2c gần hoàn thành - ConfigURL Store + FirstLoading Overlay + Endpoint Settings.
- **ConfigURL Store**: Fetch dữ liệu planet từ `URL_ALL_PLANET`, lưu vào Pinia, cung cấp dynamic RPC endpoints.
- **FirstLoading Overlay**: Overlay che phủ trang web khi dữ liệu URL chưa load xong, countdown 3s trước khi chuyển.
- **Endpoint Settings**: Tab "Endpoints" trong FooterNodeManager cho phép chọn random/manual RPC endpoints.
- **Dynamic URLs**: Thay vì dùng URL const cố định, giờ dùng URL từ API response, fallback về static config.
- **Disable Planets**: Planet không có trong URL_ALL_PLANET sẽ bị disable trong UI selection.
- **88 Tests Pass** (chưa update test cho configURL/FirstLoading).
- **Tiếp theo**: Hoàn thiện dark mode cho overlay, cập nhật tests, chạy build verify.

## Session Mới Nhất - ConfigURL + FirstLoading Overlay + Endpoint Settings

### Đã Hoàn Thành

1. **constants.ts** ([`src-ts/utilities/constants.ts`](src-ts/utilities/constants.ts)):
   - `URL_ALL_PLANET = 'https://planets.nine-chronicles.com/planets/'`
   - `PlanetData` interface: id, name, genesisHash, rpcEndpoints, bridges
   - `PlanetRpcEndpoints` interface: dynamic endpoint keys (headless.gql, arena.gql, mimir.gql, etc.)

2. **configURL Store** ([`src-ts/stores/configURL.ts`](src-ts/stores/configURL.ts)):
   - `fetchPlanets()`: Fetch từ URL_ALL_PLANET, fallback về FALLBACK_PLANETS
   - `getRpcEndpoint(planet, key)`: Random/manual selection từ available endpoints
   - `getAvailableEndpoints(planet, key)`: List URLs available cho endpoint
   - `getActiveEndpoints(planet)`: Map endpointKey → URL đang dùng
   - `setEndpointMode(planet, key, mode)`: Chuyển random/manual
   - `setEndpointSelection(planet, key, url)`: Chọn URL cụ thể
   - Persist endpoint selections vào localStorage
   - `loadingStatus`: Status messages cho i18n trong overlay

3. **FirstLoading Overlay** ([`src-ts/views/FirstLoadingPage.vue`](src-ts/views/FirstLoadingPage.vue)):
   - Overlay semi-transparent backdrop (rgba + blur) che phủ hoàn toàn trang web
   - Countdown 3s trước khi chuyển trang
   - States: Loading (spinner + status), Error (retry button), Success (countdown)
   - Dark mode via `appSettings.isDarkMode` (không dùng useDark vì localStorage format khác)
   - KHÔNG dùng Teleport to="body" (giữ trong component tree cho naive-ui dark theme)

4. **App.vue** ([`src-ts/App.vue`](src-ts/App.vue)):
   - Import + render `<FirstLoadingOverlay />` bên trong `<n-config-provider>`

5. **FooterNodeManager.vue** ([`src-ts/components/footer/FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue)):
   - 4 tabs: Block Monitor, Settings, Endpoints, Actions
   - Tab "Endpoints": Hiển thị active endpoints, mode selector (random/manual), URL select
   - Disable planets không khả dụng từ configURL store

6. **blockPolling.ts** ([`src-ts/stores/blockPolling.ts`](src-ts/stores/blockPolling.ts)):
   - `getMimirUrl()` ưu tiên URL động từ configURL store, fallback PLANET_CONFIGS

7. **appSettings.ts** ([`src-ts/stores/appSettings.ts`](src-ts/stores/appSettings.ts)):
   - `setPlanet()` validate against available planets
   - `validatePlanetAvailability()` fallback planet không khả dụng

8. **i18n** ([`src-ts/i18n/locales/en.json`](src-ts/i18n/locales/en.json), [`src-ts/i18n/locales/vi.json`](src-ts/i18n/locales/vi.json)):
   - `firstLoading.*`: loading, error, success, step messages, countdown
   - `endpoints.*`: tab, planet, activeEndpoints, mode, random/manual, selectUrl

9. **naive-ui.d.ts**: Thêm NCollapse, NCollapseItem, NRadioGroup, NRadioButton
10. **ui.d.ts**: Thêm useDark type declaration
11. **router/index.ts**: Giữ nguyên cấu trúc gốc (/ là home)
12. **router.test.ts**: Giữ nguyên test cấu trúc gốc

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
├ App.vue                              # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                      # 3 routes trong MainLayout (/ is home)
├ layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts                  # Dark mode, planet, language, poll interval + validatePlanet
│  ├── blockPolling.ts                 # Block polling via GraphQL (uses configURL for dynamic URLs)
│  └── configURL.ts                    # NEW: Fetch planet data, dynamic RPC endpoints, endpoint selection
├ components/
│  ├── header/
│  │  ├── HeaderAvatar.vue
│  │  ├── HeaderProgress.vue
│  │  └── HeaderBanner.vue
│  └── footer/
│     ├── FooterInfoBlock.vue           # Block info từ blockPolling store
│     └── FooterNodeManager.vue         # 4 tabs: Block Monitor, Settings, Endpoints, Actions
├ views/
│  ├── FirstLoadingPage.vue            # NEW: Overlay che phủ khi data chưa load
│  ├── HomePage.vue
│  ├── LoginPage.vue
│  └── NotFoundPage.vue
├ types/
│  ├── naive-ui.d.ts                   # + NCollapse, NCollapseItem, NRadioGroup, NRadioButton
│  ├── ui.d.ts                         # + useDark
│  ├── header.ts
│  └── footer.ts
├ i18n/                                # + firstLoading.*, endpoints.*
├ utilities/constants.ts               # + URL_ALL_PLANET, PlanetData, PlanetRpcEndpoints
└ __tests__/                           # 88 tests
```

## Active Decisions
- **Overlay thay Router Loading**: Dùng overlay component (FirstLoadingPage.vue) trong App.vue thay vì route riêng, giữ / là home
- **No Teleport**: Overlay giữ trong component tree để naive-ui dark theme hoạt động
- **Dynamic URLs from API**: Fetch từ URL_ALL_PLANET, fallback về FALLBACK_PLANETS static
- **Endpoint Mode**: Random (mặc định) hoặc Manual (chọn URL cụ thể), persist vào localStorage
- **Dark Mode Overlay**: Dùng `appSettings.isDarkMode` (không useDark) vì localStorage format khác nhau

## Known Issues
- **Build chưa verify**: Chưa chạy `vue-tsc --noEmit` thành công (task bị interrupted)
- **Tests chưa update**: Chưa có test cho configURL store, FirstLoading overlay, endpoint settings
- **Dark mode overlay**: Có thể chưa hoàn hảo do naive-ui components trong overlay cần test thêm
