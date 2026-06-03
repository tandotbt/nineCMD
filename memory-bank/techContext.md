# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Library**: Naive UI (tree-shaking, direct imports)
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 5.0.7
- **Internationalization**: Vue-i18n ^11.4.4
- **Block Data**: GraphQL queries tới Mimir endpoint (thay WebSocket)
- **Planet Data**: Fetch từ `https://planets.nine-chronicles.com/planets/` (URL_ALL_PLANET)
- **Build Tool**: Vite 8.0.13
- **Testing**: Vitest 4.1.7
- **TypeScript**: TypeScript 6.0.3 (strict mode)
- **Utility Libraries**: `@vueuse/core` 14.3.0 (useStorage, refDebounced, onClickOutside)
- **Data Parsing**: PapaParse 5.5.3

## Development Setup
- **TypeScript**: `strict: true`, `noImplicitAny: true`, `isolatedModules: true`, `moduleResolution: bundler`
- **Dual Entry Points**: 
  - `index.html` → `src/main.js` (JS version, port 1414)
  - `index-ts.html` → `src-ts/main.ts` (TS version, port 1415)
- **Vite Configs**:
  - `vite.config.js` - JS version (alias `@/` → `src/`)
  - `vite-ts.config.js` - TS version (alias `@/` → `src-ts/`, plugin redirect)
- **ESLint**: `typescript-eslint` (parser + plugin)
- **Naive UI**: Direct imports (tree-shaking), KHÔNG dùng `app.use(naive)`

## TypeScript Migration Strategy
- **Dual version approach**: JS version giữ nguyên, TS version chạy song song trong `src-ts/`
- **Self-contained src-ts/**: Tự có types, constants, i18n - không import từ `src/`
- **Pinia stores**: `src-ts/stores/` cho appSettings + blockPolling + configURL
- **Gradual Migration**: `allowJs: true` + `checkJs: false` cho过渡期
- **Relative imports**: Dùng `../` thay `@/` trong src-ts/ (vì `@/` map tới `src/`)

## Technical Constraints
- **Hiệu suất**: Ứng dụng chạy mượt trên thiết bị cấu hình thấp (iPhone 6)
- **Tương thích**: Chrome, Firefox, Safari, Edge
- **API**: Nine Chronicles GraphQL (Mimir) + REST + URL_ALL_PLANET endpoints
- **Đa hành tinh**: Odin/Heimdall/Thor với config riêng, dynamic từ API
- **TypeScript Strict Mode**: `strict: true` enforced

## Dependencies
### Runtime
- `vue` 3.5.34, `vue-router` 5.0.7, `vue-i18n` ^11.4.4
- `pinia` 3.0.4, `naive-ui` ^2.44.1
- `@vueuse/core` 14.3.0, `crypto-js` 4.2.0
- `papaparse` 5.5.3, `nanoid` 5.1.11

### Dev
- `typescript` ^6.0.3, `vite` ^8.0.13
- `@vitejs/plugin-vue` ^6.0.7, `@vitejs/plugin-vue-jsx` ^5.1.5
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`
- `vitest` ^4.1.7, `@vitest/ui`, `@vitest/coverage-v8`

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build    # Build JS version
npm run build:ts # Build TS version
npm run lint     # ESLint
npm run test     # Vitest (124 tests)
```

## TypeScript File Structure
```
src-ts/                           # TS version (self-contained)
├ main.ts                        # Entry: Vue 3 + Pinia + i18n
├ App.vue                        # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                # 3 routes (/ is home)
├ layouts/MainLayout.vue         # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts            # Dark mode, planet, language, poll interval + validate
│  ├── blockPolling.ts           # GraphQL block polling (uses configURL for dynamic URLs)
│  └── configURL.ts              # Fetch planet data, dynamic RPC endpoints, endpoint selection
├ components/
│  ├── Placeholder*.vue          # Placeholder components
│  ├── header/                   # HeaderAvatar, HeaderProgress, HeaderBanner
│  └── footer/
│     ├── FooterInfoBlock.vue    # Block info từ blockPolling store
│     └── FooterNodeManager.vue  # 4 tabs: Block Monitor, Settings, Endpoints, Actions
├ views/
│  ├── FirstLoadingPage.vue      # Overlay semi-transparent backdrop
│  ├── HomePage.vue, LoginPage.vue, NotFoundPage.vue
├ types/
│  ├── header.ts                 # Header component types
│  ├── footer.ts                 # + BlockPollEntry, BlockAverages
│  ├── naive-ui.d.ts             # 40+ component exports
│  └── ui.d.ts                   # @vicons/material + vue-i18n + @vueuse/core
├ i18n/                          # + firstLoading.*, endpoints.*
├ utilities/constants.ts         # + URL_ALL_PLANET, PlanetData, PlanetRpcEndpoints
├ assets/base.css                # CSS + transitions
└ __tests__/                     # 124 tests (6 files)
   ├── i18n.test.ts (12)
   ├── darkMode.test.ts (19)
   ├── router.test.ts (13)
   ├── appSettings.test.ts (22)
   ├── blockPolling.test.ts (22)
   └── configURL.test.ts (36)    # NEW
```

## Key Patterns
- **Naive UI tree-shaking**: Import components individually
- **Dark Mode**: Pinia store `appSettings.isDarkMode` → watch in App.vue → apply theme
- **i18n**: vue-i18n + Naive UI locale (enUS/viVN) + localStorage persistence via Pinia store
- **Block Polling**: GraphQL `blocks(take: 1)` → Mimir endpoint → calculate avg from index diff
- **ConfigURL**: Fetch từ URL_ALL_PLANET → dynamic RPC endpoints → random/manual selection
- **FirstLoading**: Overlay backdrop → countdown 3s → redirect home
- **Planet Selection**: Pinia stores shared between FooterNodeManager (UI) + blockPolling (data) + configURL (URLs)
- **Test Setup**: `setActivePinia(createPinia())` + mock localStorage + mock fetch
