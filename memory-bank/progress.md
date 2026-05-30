# Progress: NineCMD UI Migration to TypeScript

## Overview
Chuyển đổi giao diện từ JavaScript sang TypeScript, chạy song song với hai entry points.

## Current Status
- **Giai đoạn 1 - Planning**: ✅ Hoàn thành
- **Giai đoạn 1 - Infrastructure**: ✅ Hoàn thành (Build pass, vue-tsc 0 errors)
- **Giai đoạn 1b - Simple TS UI + i18n**: ✅ Hoàn thành
- **Giai đoạn 1c - Testing**: ✅ Hoàn thành (24/24 tests pass, vue-tsc 0 errors)
- **Giai đoạn 2**: Chuyển components/stores/router/utilities sang TypeScript

## Đã Hoàn Thành

### Phase 1: Infrastructure
- [x] `src/env.d.ts` - Vue/Vite type shims
- [x] `src/types/index.ts` - Comprehensive TypeScript interfaces
- [x] `tsconfig.json` - Strict mode, bundler resolution
- [x] `eslint.config.js` - TypeScript support

### Phase 1b: Simple TS UI + Dark Mode + i18n
- [x] [`index-ts.html`](index-ts.html) - HTML entry point cho TS version
- [x] [`vite-ts.config.js`](vite-ts.config.js) - Vite config riêng (port 1415, alias `@/` → `src-ts/`)
- [x] [`src-ts/main.ts`](src-ts/main.ts) - Entry point: Vue 3 + Pinia + i18n
- [x] [`src-ts/App.vue`](src-ts/App.vue) - Giao diện: Header + Language selector + Dark mode toggle + Card content
- [x] [`src-ts/i18n/index.ts`](src-ts/i18n/index.ts) - vue-i18n setup với Naive UI locales
- [x] [`src-ts/utilities/constants.ts`](src-ts/utilities/constants.ts) - Constants cho i18n
- [x] [`src-ts/types/naive-ui.d.ts`](src-ts/types/naive-ui.d.ts) - Naive UI type augmentations (18 components)
- [x] [`src-ts/types/ui.d.ts`](src-ts/types/ui.d.ts) - Module declarations (vue-i18n, @vueuse/core, *.json)
- [x] [`src-ts/assets/base.css`](src-ts/assets/base.css) & [`main.css`](src-ts/assets/main.css) - CSS assets
- [x] [`package.json`](package.json) - Thêm scripts `dev:ts`, `build:ts`, `test`

### Phase 1c: Testing (Latest)
- [x] [`src-ts/vitest.config.ts`](src-ts/vitest.config.ts) - Vitest config với alias `@/` → `src-ts/`, jsdom environment
- [x] [`src-ts/__tests__/i18n.test.ts`](src-ts/__tests__/i18n.test.ts) - 12 tests: locale switching, translations, CONFIG_i18n_LANGUAGES
- [x] [`src-ts/__tests__/darkMode.test.ts`](src-ts/__tests__/darkMode.test.ts) - 12 tests: theme toggle, localStorage persistence, naive-ui themes
- [x] Fix 29 TypeScript errors → 0 errors (vue-tsc --noEmit pass)
- [x] Cài `jsdom` dependency cho vitest

### Issues Resolved (Total: 12)
1. ✅ Vite conflict khi chạy 2 version → Plugin redirect trong `vite-ts.config.js`
2. ✅ `n-global-style` warning → Import `NGlobalStyle` từ naive-ui
3. ✅ `src/main.ts` trùng lặp → Xóa file
4. ✅ `index.html` trỏ sai → Phục hồi trỏ `src/main.js`
5. ✅ Dọn dẹp TS files - Xóa `app.d.ts`, `test-app.html`
6. ✅ Vitest jsdom missing → Cài `jsdom` dependency
7. ✅ `useI18n()` outside Vue setup → Dùng `i18n.global.t()` trong tests
8. ✅ `localStorage.clear()` not a function → Mock localStorage
9. ✅ Naive UI component exports missing → Thêm 18 component exports
10. ✅ `createI18n` not in vue-i18n declarations → Thêm `I18n` interface + `Plugin` type
11. ✅ JSON imports no module → Thêm `.json` extension + `declare module '*.json'`
12. ✅ `NLocale`/`NDateLocale` type mismatch → Cast qua `unknown`

### Files Đã Xóa
| File | Lý Do |
|------|-------|
| `src/types/app.d.ts` | Trùng lặp với `src/types/index.ts` |
| `src-ts/test-app.html` | Thay thế bằng `index-ts.html` |
| `src/main.ts` | Trùng lặp với `src/main.js` |

## TS Files Currently In Project

### `src/` (JS version - TS infrastructure)
```
src/
├── env.d.ts                    # Vue/Vite type shims (shared)
├── types/
│   ├── index.ts                # Comprehensive interfaces + theme overrides
│   ├── naive-ui.d.ts           # Naive UI type augmentations
│   └── stores.d.ts             # Module declarations cho JS stores
├── utilities/
│   └── constants.ts            # Constants với Naive UI locales
└── [JS files - stores/router/i18n still .js]
```

### `src-ts/` (TS version - self-contained)
```
src-ts/
├── main.ts                     # Entry: Vue 3 + Pinia + i18n
├── App.vue                     # Header + Language + Dark Mode
├── vitest.config.ts            # Vitest config (alias @/ → src-ts/)
├── assets/
│   ├── base.css                # CSS cơ bản + transitions
│   └── main.css                # Import base.css
├── i18n/
│   ├── index.ts                # vue-i18n setup
│   ├── locales/
│   │   ├── en.json             # English translations
│   │   └── vi.json             # Vietnamese translations
│   ├── numberFormats/
│   │   ├── en.json             # English number formats
│   │   └── vi.json             # Vietnamese number formats
│   └── datetimeFormats/
│       ├── en.json             # English datetime formats
│       └── vi.json             # Vietnamese datetime formats
├── types/
│   ├── naive-ui.d.ts           # Naive UI type augmentations (18 components)
│   └── ui.d.ts                 # Module declarations
├── utilities/
│   └── constants.ts            # Constants cho i18n
└── __tests__/
    ├── i18n.test.ts            # 12 tests: locale switching
    └── darkMode.test.ts        # 12 tests: theme toggle
```

## npm Scripts
| Command | Mô tả |
|---------|-------|
| `npm run dev` | JS version (port 1414) |
| `npm run dev:ts` | TS version (port 1415) |
| `npm run build` | Build JS version |
| `npm run build:ts` | Build TS version |
| `npm run test` | Vitest (24 tests, src-ts/) |
| `npm run test:watch` | Vitest watch mode |

## Kế Hoạch Tương Lai

### Giai đoạn 2: Components
- [ ] Chuyển HeaderNineCMD.vue → TypeScript
- [ ] Chuyển MenuLeft.vue → TypeScript
- [ ] Chuyển FooterBlock.vue → TypeScript
- [ ] Chuyển FloatButtonSetting.vue → TypeScript
- [ ] Chuyển view components → TypeScript

### Giai đoạn 3: Stores & Router
- [ ] Chuyển stores → TypeScript (10 stores)
- [ ] Chuyển router → TypeScript

### Giai đoạn 4: Utilities
- [ ] Chuyển utilities → TypeScript (15+ files)

### Giai đoạn 5: Testing & Review
- [ ] Thêm unit tests cho components
- [ ] Review và refactor
- [ ] Xóa `src-ts/` (merge vào src/)
