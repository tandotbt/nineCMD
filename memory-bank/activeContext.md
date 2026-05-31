# Active Context: NineCMD

## Current Work Focus
- **TypeScript Migration**: Giai đoạn 2a hoàn thành - Vue Router + placeholder components với layout responsive.
- **Vue Router**: Đã tích hợp với 3 routes (main layout, login, 404), transitions trong content area.
- **Modular Components**: Header/Footer đã modularize thành các sub-components type-safe.
- **Dark Mode + i18n**: Hoạt động qua provide/inject pattern từ App.vue.
- **Tiếp theo**: Điền logic vào placeholder components, chuyển stores/utilities sang TypeScript.

## Session Mới Nhất - Vue Router + Modular Components

### Đã Hoàn Thành
1. **Vue Router Integration**:
   - [`src-ts/router/index.ts`](src-ts/router/index.ts) - 3 routes trong MainLayout, transitions fade
   - Tất cả routes là children của MainLayout để có header/sidebar/footer一致

2. **Main Layout**:
   - [`src-ts/layouts/MainLayout.vue`](src-ts/layouts/MainLayout.vue) - Khung header+sidebar+content+footer replica JS version
   - Sidebar collapse với onClickOutside, router-view với Transition

3. **Modular Header Components**:
   - [`PlaceholderHeader.vue`](src-ts/components/PlaceholderHeader.vue) - Grid 24 columns responsive
   - [`header/HeaderAvatar.vue`](src-ts/components/header/HeaderAvatar.vue) - Avatar với router-link
   - [`header/HeaderProgress.vue`](src-ts/components/header/HeaderProgress.vue) - Progress bars type-safe
   - [`header/HeaderBanner.vue`](src-ts/components/header/HeaderBanner.vue) - Carousel banners

4. **Modular Footer Components**:
   - [`PlaceholderFooter.vue`](src-ts/components/PlaceholderFooter.vue) - InfoBlock + NodeManager
   - [`footer/FooterInfoBlock.vue`](src-ts/components/footer/FooterInfoBlock.vue) - Block info placeholder
   - [`footer/FooterNodeManager.vue`](src-ts/components/footer/FooterNodeManager.vue) - Drawer với tabs

5. **Sidebar (MenuLeft)**:
   - [`PlaceholderMenuLeft.vue`](src-ts/components/PlaceholderMenuLeft.vue) - Menu + language selector + dark mode toggle
   - Dark mode/lang via provide/inject từ App.vue

6. **Type Definitions**:
   - [`types/header.ts`](src-ts/types/header.ts) - HeaderAvatarProps, HeaderProgressItem, HeaderBannerItem, HeaderSettings
   - [`types/footer.ts`](src-ts/types/footer.ts) - BlockInfo, NodeConfig, FooterSettings

7. **i18n Keys**:
   - Thêm `page.home`, `page.login`, `page.notFound`, `page-notFound.detail` vào en.json/vi.json

8. **TypeScript Fixes** (Total: 16):
   - Thêm NMenu, NLayoutSider, NBadge, NEllipsis, NDrawer, NDrawerContent, NTabs, NTabPane, NFlex vào naive-ui.d.ts
   - Thêm FullscreenRound, FormatListBulletedRound, HomeRound, LogInRound vào ui.d.ts
   - Fix FooterSettings type (thêm lastPlanet field)
   - Provide/inject cho dark mode (thay vì emit qua router-view)

## How To Run
```bash
npm run dev      # JS version (port 1414)
npm run dev:ts   # TS version (port 1415)
npm run build:ts # Build TS version
npm run test     # Vitest (24 tests, src-ts/)
```

## File Structure src-ts/ (Latest)
```
src-ts/
├── main.ts                              # Entry: Vue 3 + Pinia + i18n + Router
├── App.vue                              # ConfigProvider + provide theme/lang
├── router/index.ts                      # 3 routes trong MainLayout
├── layouts/MainLayout.vue               # Header+Sidebar+Content+Footer
├── components/
│   ├── PlaceholderHeader.vue            # Grid 24 responsive (JS-like)
│   ├── PlaceholderMenuLeft.vue          # Menu + lang + dark mode (sidebar)
│   ├── PlaceholderFooter.vue            # InfoBlock + NodeManager
│   ├── PlaceholderFloatButton.vue       # Float button
│   ├── header/
│   │   ├── HeaderAvatar.vue             # Avatar placeholder
│   │   ├── HeaderProgress.vue           # Progress bar placeholder
│   │   └── HeaderBanner.vue             # Banner carousel placeholder
│   └── footer/
│       ├── FooterInfoBlock.vue           # Block info placeholder
│       └── FooterNodeManager.vue         # Drawer với tabs
├── views/
│   ├── HomePage.vue                     # Trang chủ placeholder
│   ├── LoginPage.vue                    # Login placeholder
│   └── NotFoundPage.vue                 # 404 placeholder
├── types/
│   ├── header.ts                        # Header component types
│   ├── footer.ts                        # Footer component types
│   ├── naive-ui.d.ts                    # 34+ naive-ui exports
│   └── ui.d.ts                          # @vicons/material + vue-i18n + @vueuse/core
├── i18n/                                # locales, numberFormats, datetimeFormats
├── utilities/constants.ts               # Constants cho i18n
├── assets/base.css                      # CSS + transitions (fade, slide-right)
└── __tests__/                           # 24 tests
```

## Active Decisions
- **Provide/Inject cho theme**: App.vue provide `toggleTheme`/`changeLang`, sidebar inject
- **All routes as children of MainLayout**: Đảm bảo header/sidebar/footer一致
- **Relative imports cho src-ts types**: Tránh conflict `@/` alias (map tới src/)
- **Modular Header/Footer**: Phân nhỏ thành sub-components để dễ bảo trì
- **Responsive Grid**: n-grid 24 cols với item-responsive giống JS version

## Next Steps
1. **Điền logic vào placeholder** - Chuyển real logic từ JS HeaderNineCMD, FooterBlock
2. **Chuyển stores** → TypeScript (10 stores)
3. **Chuyển utilities** → TypeScript (15+ files)
4. **Thêm routes** cho Arena, Shop
