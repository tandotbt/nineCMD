# Active Context: NineCMD

## Current Work Focus
- **Logger System + Settings Tab + Code Refactor**: Giai đoạn 2d hoàn thành
- **Logger**: `createLogger({ module })` thay thế console.log/warn/error, log history max 200 entries
- **Settings Tab mới**: 6 sections trong FooterNodeManager (General, Polling, Endpoints, Storage, Logger, About)
- **localStorage Audit**: Fix PlaceholderMenuLeft dùng Pinia store thay useStorage, thêm isPolling + logLevel persistence
- **Auto-start Polling**: blockPolling watch `appSettings.isPolling` với `{ immediate: true }` → tự động poll sau reload
- **Code Reorganization**: Tách FooterNodeManager (350→90 lines) thành 6 components riêng

## Session Mới Nhất - Logger + Settings + Refactor

### Đã Hoàn Thành

1. **Logger System**:
   - [`types/logger.ts`](src-ts/types/logger.ts): LogLevel, LogEntry, LoggerConfig, Logger interfaces
   - [`utilities/logger.ts`](src-ts/utilities/logger.ts): createLogger(), log history (max 200), format `[HH:MM:SS] [module] LEVEL: message`
   - [`__tests__/logger.test.ts`](src-ts/__tests__/logger.test.ts): 21 tests

2. **Stores cập nhật dùng logger**:
   - [`appSettings.ts`](src-ts/stores/appSettings.ts): +logger, +isPolling, +logLevel persistence
   - [`configURL.ts`](src-ts/stores/configURL.ts): +logger thay console
   - [`blockPolling.ts`](src-ts/stores/blockPolling.ts): +logger, +persist isPolling, +auto-start watch

3. **localStorage Fix**:
   - [`PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue): Bỏ useStorage, dùng useAppSettingsStore
   - isPolling + logLevel thêm vào PersistedSettings interface

4. **Footer Components tách mới**:
   - [`FooterBlockMonitor.vue`](src-ts/components/footer/FooterBlockMonitor.vue): Tab 1 content
   - [`FooterSettings.vue`](src-ts/components/footer/FooterSettings.vue): Tab 2 mở rộng (6 NCollapse sections)
   - [`FooterEndpoints.vue`](src-ts/components/footer/FooterEndpoints.vue): Tab 3 content
   - [`FooterActions.vue`](src-ts/components/footer/FooterActions.vue): Tab 4 content
   - [`FooterStorageInfo.vue`](src-ts/components/footer/FooterStorageInfo.vue): Storage info section
   - [`FooterLogViewer.vue`](src-ts/components/footer/FooterLogViewer.vue): Log viewer section

5. **FooterNodeManager refactor**: 350→90 lines, chỉ còn drawer + tabs + imports

6. **i18n updates**: Thêm settings.general.*, settings.polling.*, settings.storage.*, settings.logger.*, settings.about.* keys (en + vi)

7. **Auto-start Polling**: blockPolling watch `appSettings.isPolling` → auto-start/stop

8. **Tests**: 164/164 pass (tăng từ 124 → 164)

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build:ts # Build TS version
npm run test     # Vitest (164 tests, src-ts/)
```

## File Structure src-ts/ (Latest)
```
src-ts/
├ main.ts                              # Entry: Vue 3 + Pinia + i18n + Router
├ App.vue                              # ConfigProvider + FirstLoadingOverlay + watch store
├ router/index.ts                      # 3 routes trong MainLayout (/ is home)
├ layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├ stores/
│  ├── appSettings.ts                  # Dark mode, planet, language, poll interval, isPolling, logLevel + logger
│  ├── blockPolling.ts                 # Block polling via GraphQL + auto-start watch + logger
│  └── configURL.ts                    # Fetch planet data, dynamic RPC endpoints + logger
├ components/
│  ├── header/
│  │  ├── HeaderAvatar.vue
│  │  ├── HeaderProgress.vue
│  │  └── HeaderBanner.vue
│  └── footer/
│     ├── FooterInfoBlock.vue           # Block info từ blockPolling store
│     ├── FooterNodeManager.vue         # Drawer + 4 tabs (90 lines, imports components mới)
│     ├── FooterBlockMonitor.vue        # Tab 1: Planet, poll interval, block info, stats
│     ├── FooterSettings.vue            # Tab 2: 6 NCollapse sections (General, Polling, Endpoints, Storage, Logger, About)
│     ├── FooterEndpoints.vue           # Tab 3: Endpoint URLs, mode selector
│     ├── FooterActions.vue             # Tab 4: Placeholder
│     ├── FooterStorageInfo.vue         # localStorage info + clear all
│     └── FooterLogViewer.vue           # Log history viewer với filter
├ views/
│  ├── FirstLoadingPage.vue            # Overlay che phủ khi data chưa load
│  ├── HomePage.vue
│  ├── LoginPage.vue
│  └── NotFoundPage.vue
├ types/
│  ├── logger.ts                       # NEW: LogLevel, LogEntry, LoggerConfig, Logger
│  ├── naive-ui.d.ts                   # 40+ component exports
│  ├── ui.d.ts                         # @vicons/material + vue-i18n + @vueuse/core
│  ├── header.ts
│  └── footer.ts
├ i18n/                                # + settings.*, logger.* keys
├ utilities/
│  ├── constants.ts                    # Planet configs, Mimir URLs, poll interval options
│  └── logger.ts                       # NEW: createLogger(), log history, history management
├ assets/base.css                      # CSS + transitions
└ __tests__/                           # 164 tests
   ├── i18n.test.ts (19)
   ├── darkMode.test.ts (19)
   ├── router.test.ts (13)
   ├── appSettings.test.ts (30)        # +8 tests (isPolling, logLevel)
   ├── blockPolling.test.ts (26)       # +4 tests (auto-start)
   ├── configURL.test.ts (36)
   └── logger.test.ts (21)             # NEW
```

## Active Decisions
- **Logger singleton history**: Global logHistory ref shared across all logger instances → hiển thị trong Settings tab
- **Auto-start via watch**: blockPolling watch `appSettings.isPolling` với `{ immediate: true }` thay vì init check
- **isPolling persist**: Đảm bảo trạng thái poll giữ nguyên sau page reload
- **Footer tab refactor**: Tách content ra components riêng để dễ maintain, FooterNodeManager chỉ còn drawer logic

## Known Issues
