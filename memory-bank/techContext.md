# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3
- **UI Library**: Naive UI
- **State Management**: Pinia
- **Routing**: Vue Router (JS version only for now)
- **Internationalization**: Vue-i18n (both versions)
- **WebSocket**: Tương tác thời gian thực với server Nine Chronicles
- **Build Tool**: Vite 8.0.13
- **Testing**: Vitest
- **TypeScript**: TypeScript 6.0.3
- **Utility Libraries**: `@vueuse/core` (useStorage, refDebounced, useTimeoutPoll, onClickOutside)
- **Data Parsing**: PapaParse

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
- **Naive UI darkTheme**: `n-config-provider :theme="darkTheme"` + `:locale` + `:date-locale`
- **Gradual Migration**: `allowJs: true` + `checkJs: false` cho过渡期
- **Type Definitions**: 
  - `src/env.d.ts` (shared Vue/Vite shims)
  - `src-ts/types/naive-ui.d.ts` (Naive UI module declarations)
  - `src-ts/types/ui.d.ts` (Additional module declarations)

## Technical Constraints
- **Hiệu suất**: Ứng dụng chạy mượt trên thiết bị cấu hình thấp (iPhone 6)
- **Tương thích**: Chrome, Firefox, Safari, Edge
- **API**: Nine Chronicles WebSocket + RPC endpoints
- **Đa hành tinh**: Odin/Heimdall với config riêng
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
npm run test     # Vitest
```

## TypeScript File Structure
```
src/                              # JS version (TS infrastructure only)
├── env.d.ts                      # Vue/Vite type shims
├── types/
│   ├── index.ts                  # Interfaces + theme overrides
│   ├── naive-ui.d.ts             # Naive UI module declarations
│   └── stores.d.ts               # JS store module declarations
├── utilities/
│   └── constants.ts              # Constants với Naive UI locales
├── App.vue                       # lang="ts" - full type annotations
└── main.js                       # Entry point (JS)

src-ts/                           # TS version (self-contained)
├── main.ts                       # Entry: Vue 3 + Pinia + i18n
├── App.vue                       # Header + Language selector + Dark Mode
├── assets/
│   ├── base.css                  # CSS + transitions
│   └── main.css                  # Import base.css
├── i18n/
│   ├── index.ts                  # vue-i18n setup
│   ├── locales/{en,vi}.json      # Translations
│   ├── numberFormats/{en,vi}.json
│   └── datetimeFormats/{en,vi}.json
├── types/
│   ├── naive-ui.d.ts             # Naive UI module declarations
│   └── ui.d.ts                   # Additional module declarations
└── utilities/
    └── constants.ts              # Constants cho i18n

Root Config Files:
├── index.html                    # JS entry (→ src/main.js)
├── index-ts.html                 # TS entry (→ src-ts/main.ts)
├── vite.config.js                # JS Vite config (port 1414)
├── vite-ts.config.js             # TS Vite config (port 1415)
├── tsconfig.json                 # Shared TS config
└── eslint.config.js              # ESLint + TypeScript
```

## Key Patterns
- **Naive UI tree-shaking**: Import components individually, KHÔNG dùng global plugin
- **Dark Mode**: `darkTheme` từ naive-ui + CSS transitions
- **i18n**: vue-i18n + Naive UI locale (enUS/viVN) + localStorage persistence
- **useStorage**: `@vueuse/core` persist dark mode + language preference
- **onClickOutside**: Đóng sidebar khi click ra ngoài
