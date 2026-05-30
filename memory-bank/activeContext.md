# Active Context: NineCMD

## Current Work Focus
- **TypeScript Migration**: Đã hoàn thành Giai đoạn 1 - giao diện TypeScript đơn giản với Dark Mode + i18n chạy song song.
- **Testing**: Đã thêm unit tests cho i18n language switching và dark mode (24/24 pass, vue-tsc 0 errors).
- **Tiếp theo**: Giai đoạn 2 - chuyển tiếp components, stores, utilities, router sang TypeScript.

## Session Mới Nhất - TypeScript Testing & Fix

### Đã Hoàn Thành
1. **Viết unit tests** cho `src-ts/`:
   - [`src-ts/__tests__/i18n.test.ts`](src-ts/__tests__/i18n.test.ts) - 12 tests: locale switching, translations, CONFIG_i18n_LANGUAGES
   - [`src-ts/__tests__/darkMode.test.ts`](src-ts/__tests__/darkMode.test.ts) - 12 tests: theme toggle, localStorage persistence, naive-ui themes

2. **Fix TypeScript errors** (29 → 0):
   - Cài `jsdom` dependency cho vitest
   - Fix `useI18n()` outside Vue setup → Dùng `i18n.global.t()` trong tests
   - Fix `localStorage.clear()` not a function → Mock localStorage
   - Thêm 18 component exports vào [`naive-ui.d.ts`](src-ts/types/naive-ui.d.ts)
   - Thêm `I18n` interface + `Plugin` type cho vue-i18n declarations
   - Thêm `.json` extension + `declare module '*.json'`
   - Cast `NLocale`/`NDateLocale` qua `unknown` trong [`App.vue`](src-ts/App.vue)

3. **Fix vitest config**:
   - Thêm alias `@/` → `src-ts/` vào [`vitest.config.ts`](src-ts/vitest.config.ts)
   - Script `test` trong [`package.json`](package.json) trỏ `--config src-ts/vitest.config.ts`

### Session Trước - Giao diện TypeScript + i18n
1. **Tạo giao diện TS chạy song song** với JS version:
   - [`index-ts.html`](index-ts.html) - HTML entry point trỏ `src-ts/main.ts`
   - [`vite-ts.config.js`](vite-ts.config.js) - Vite config riêng, alias `@/` → `src-ts/`, port 1415/2829

2. **Thêm i18n** (vue-i18n + Naive UI locales):
   - [`src-ts/i18n/index.ts`](src-ts/i18n/index.ts) - vue-i18n setup
   - [`src-ts/utilities/constants.ts`](src-ts/utilities/constants.ts) - Constants cho i18n

### Files TS Trong `src-ts/` (Tự chứa, không phụ thuộc src/)
| File | Mô tả |
|------|-------|
| `src-ts/main.ts` | Entry point: Vue 3 + Pinia + i18n |
| `src-ts/App.vue` | Giao diện: Header + Language selector + Dark mode + Card content |
| `src-ts/i18n/index.ts` | vue-i18n setup với Naive UI locales |
| `src-ts/utilities/constants.ts` | Constants cho i18n |
| `src-ts/types/naive-ui.d.ts` | Naive UI type augmentations (components + types) |
| `src-ts/types/ui.d.ts` | Module declarations cho vue-i18n, @vueuse/core, @vicons/material, *.json |
| `src-ts/vitest.config.ts` | Vitest config với alias `@/` → `src-ts/` |
| `src-ts/__tests__/i18n.test.ts` | 12 tests: locale switching, translations |
| `src-ts/__tests__/darkMode.test.ts` | 12 tests: theme toggle, localStorage |

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build    # Build JS version
npm run build:ts # Build TS version
npm run test     # Vitest (24 tests, src-ts/)
```

## Issues Resolved (Total: 12)
1. ✅ Vite conflict khi chạy 2 version song song → Plugin redirect
2. ✅ `n-global-style` warning → Import `NGlobalStyle` từ naive-ui
3. ✅ `src/main.ts` trùng lặp → Xóa, phục hồi `index.html` trỏ `src/main.js`
4. ✅ Naive UI Plugin type error → Direct imports (tree-shaking)
5. ✅ `any` types → Proper interfaces everywhere
6. ✅ Vitest jsdom missing → Cài `jsdom` dependency
7. ✅ `useI18n()` outside Vue setup → Dùng `i18n.global.t()` trong tests
8. ✅ `localStorage.clear()` not a function → Mock localStorage trong tests
9. ✅ Naive UI component exports missing → Thêm 18 component exports vào `naive-ui.d.ts`
10. ✅ `createI18n` not in vue-i18n declarations → Thêm `I18n` interface + `Plugin` type
11. ✅ JSON imports no module → Thêm `.json` extension + `declare module '*.json'`
12. ✅ `NLocale`/`NDateLocale` type mismatch → Cast qua `unknown` trong `App.vue`

## Test Files (New)
| File | Mô tả |
|------|-------|
| `src-ts/__tests__/i18n.test.ts` | 12 tests: locale switching, translations, CONFIG_i18n_LANGUAGES |
| `src-ts/__tests__/darkMode.test.ts` | 12 tests: theme toggle, localStorage persistence, naive-ui themes |

## Next Steps (Giai đoạn 2)
1. **Chuyển components** - HeaderNineCMD, MenuLeft, FooterBlock, FloatButtonSetting → TypeScript
2. **Chuyển router** `src/router/index.js` → `src/router/index.ts`
3. **Chuyển stores** `src/stores/*.js` → `*.ts` (10 stores)
4. **Chuyển utilities** `src/utilities/*.js` → `*.ts` (15+ utilities)

## Active Decisions
- **Dual entry points**: `index.html` → JS, `index-ts.html` → TS, chạy song song
- **Naive UI darkTheme**: `n-config-provider :theme="darkTheme"` + `:locale` cho i18n
- **No global naive-ui plugin**: Direct imports để avoid Plugin type issues + tree-shaking
- **Self-contained src-ts/**: Không import từ src/, tự có types/constants/i18n
- **localStorage**: `useStorage()` persist dark mode + language preference
- **Vitest config**: `src-ts/vitest.config.ts` với alias `@/` → `src-ts/`, script `test` trỏ `--config src-ts/vitest.config.ts`
- **JSON imports**: Luôn dùng `.json` extension trong imports để vue-tsc recognize
- **Type casting NLocale**: Dùng `as unknown as Record<string, unknown>` khi cần convert NLocale types
- **Vitest config**: `src-ts/vitest.config.ts` với alias `@/` → `src-ts/`, script `test` trỏ `--config src-ts/vitest.config.ts`
- **JSON imports**: Luôn dùng `.json` extension trong imports để vue-tsc recognize
- **Type casting NLocale**: Dùng `as unknown as Record<string, unknown>` khi cần convert NLocale types
