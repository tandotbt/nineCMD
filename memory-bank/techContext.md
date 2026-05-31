# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Library**: Naive UI (tree-shaking, direct imports)
- **State Management**: Pinia 3.0.4
- **Routing**: Vue Router 5.0.7
- **Internationalization**: Vue-i18n ^11.4.4
- **Block Data**: GraphQL queries tới Mimir endpoint (thay WebSocket)
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
- **Pinia stores**: `src-ts/stores/` cho appSettings + blockPolling (thay WebSocket stores)
- **Gradual Migration**: `allowJs: true` + `checkJs: false` cho过渡期
- **Relative imports**: Dùng `../` thay `@/` trong src-ts/ (vì `@/` map tới `src/`)

## Technical Constraints
- **Hiệu suất**: Ứng dụng chạy mượt trên thiết bị cấu hình thấp (iPhone 6)
- **Tương thích**: Chrome, Firefox, Safari, Edge
- **API**: Nine Chronicles GraphQL (Mimir) + REST endpoints
- **Đa hành tinh**: Odin/Heimdall/Thor với config riêng
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
npm run test     # Vitest (88 tests)
```

## TypeScript File Structure
```
src-ts/                           # TS version (self-contained)
├ main.ts                        # Entry: Vue 3 + Pinia + i18n
├ App.vue                        # ConfigProvider + watch store
├ router/index.ts                # 3 routes
├ layouts/MainLayout.vue         # Header+Sidebar+Content+Footer
├ stores/                        # Pinia stores (NEW)
│  ├── appSettings.ts            # Dark mode, planet, language, poll interval
│  └── blockPolling.ts           # GraphQL block polling
├ components/
│  ├── Placeholder*.vue          # Placeholder components
│  ├── header/                   # HeaderAvatar, HeaderProgress, HeaderBanner
│  └── footer/
│     ├── FooterInfoBlock.vue    # Block info từ blockPolling store
│     └── FooterNodeManager.vue  # Block Monitor + Settings tabs
├ views/                         # HomePage, LoginPage, NotFoundPage
├ types/
│  ├── header.ts                 # Header component types
│  ├── footer.ts                 # + BlockPollEntry, BlockAverages
│  ├── naive-ui.d.ts             # + NSpin, NTooltip (36+ exports)
│  └── ui.d.ts                   # @vicons/material + vue-i18n + @vueuse/core
├ i18n/                          # locales, numberFormats, datetimeFormats
├ utilities/constants.ts         # + Planet configs, poll intervals, GraphQL query
├ assets/base.css                # CSS + transitions
└ __tests__/                     # 88 tests (5 files)
```

## Key Patterns
- **Naive UI tree-shaking**: Import components individually
- **Dark Mode**: Pinia store `appSettings.isDarkMode` → watch in App.vue → apply theme
- **i18n**: vue-i18n + Naive UI locale (enUS/viVN) + localStorage persistence via Pinia store
- **Block Polling**: GraphQL `blocks(take: 1)` → Mimir endpoint → calculate avg from index diff
- **Planet Selection**: Pinia store shared between FooterNodeManager (UI) + blockPolling (data)
- **Test Setup**: `setActivePinia(createPinia())` + mock localStorage + mock fetch
