# Tech Context: NineCMD

## Technologies Used
- **Framework**: Vue.js 3
- **UI Library**: Naive UI
- **State Management**: Pinia
- **Routing**: Vue Router
- **Internationalization**: Vue-i18n
- **WebSocket**: Tương tác thời gian thực với server Nine Chronicles
- **Build Tool**: Vite
- **Testing**: Vitest
- **TypeScript**: TypeScript 6.0.3
- **Utility Libraries**: `@vueuse/core` (bao gồm `useFetch`, `useStorage`, `refDebounced`, `useTimeoutPoll`)
- **Data Parsing**: PapaParse, Array to Indexed Object

## Development Setup
- **Node.js**: Sử dụng Node.js để chạy các lệnh npm.
- **npm**: Quản lý các dependencies và scripts.
- **Vite**: Công cụ build nhanh và hiệu quả.
- **ESLint và Prettier**: Đảm bảo mã nguồn tuân thủ các quy tắc định dạng và chất lượng mã.
- **PapaParse**: Phân tích và chuyển đổi dữ liệu CSV.
- **Constants**: Các hằng số liên quan đến cấu hình API, URL, và các thông số game như `API_URL_MERGE_ARENA`, `URL_API_MIMIR`, `CONFIG_GAME_CONFIG_SHEET`, `CONFIG_ARENA_SHEET`.

## Technical Constraints
- **Hiệu suất**: Ứng dụng phải chạy mượt mà trên các thiết bị có cấu hình thấp.
- **Tương thích**: Đảm bảo ứng dụng hoạt động trên các trình duyệt phổ biến như Chrome, Firefox, Safari, và Edge.
- **API**: Tương tác với các API của Nine Chronicles thông qua WebSocket và RPC endpoints.
- **Hỗ trợ đa hành tinh**: Cấu hình API và URL khác nhau cho các hành tinh như Odin và Heimdall.

## Dependencies
### Dependencies
- **@intlify/core-base**: Hỗ trợ quốc tế hóa.
- **@vueuse/core**: Các công cụ hữu ích cho Vue.js, bao gồm `useFetch`, `useStorage`, `refDebounced`, và `useTimeoutPoll`.
- **crypto-js**: Thư viện mã hóa.
- **nanoid**: Tạo ID duy nhất.
- **papaparse**: Parse và format dữ liệu CSV.
- **pinia**: Quản lý trạng thái toàn cầu.
- **vue**: Vue.js 3.
- **vue-i18n**: Hỗ trợ đa ngôn ngữ.
- **vue-router**: Quản lý routing.
- **PapaParse**: Thư viện phân tích CSV.
- **Array to Indexed Object**: Chuyển đổi mảng thành đối tượng có thể truy cập theo khóa.

### Dev Dependencies
- **@rushstack/eslint-patch**: Các patch cho ESLint.
- **@types/jest, @types/node, @types/papaparse, @types/vue, @types/vue-router**: Type definitions.
- **@vicons/material**: Icon library.
- **@vitejs/plugin-vue, @vitejs/plugin-vue-jsx**: Plugin cho Vite.
- **@vitest/coverage-v8, @vitest/ui**: Testing và UI cho Vitest.
- **eslint, eslint-plugin-vue**: ESLint và plugin cho Vue.
- **naive-ui**: Thư viện UI.
- **prettier**: Công cụ định dạng mã.
- **terser**: Minify mã.
- **typescript**: TypeScript.
- **vite, vite-plugin-vue-devtools**: Vite và plugin cho Vue DevTools.
- **vitest**: Testing framework.

## Key Constants and Configurations
- **API URLs**: Các URL API cho các hành tinh Odin và Heimdall, bao gồm các endpoint như `headless.gql`, `arena.gql`, `9cscan.rest`.
- **Game Configurations**: Các cấu hình game như `CONFIG_GAME_CONFIG_SHEET` và `CONFIG_ARENA_SHEET` cho các thông số liên quan đến Arena, điểm thưởng, và các thông số khác.
- **Planet Configurations**: Các cấu hình khác nhau cho từng hành tinh như `URL_NINE_CHRONICLES_SERVER`, `CONFIG_URL_ALL_PLANET`.

## Tool Usage Patterns
- **Vite**: Sử dụng để build và phát triển ứng dụng nhanh chóng.
- **Vitest**: Sử dụng để viết và chạy các test unit và integration.
- **ESLint và Prettier**: Đảm bảo mã nguồn tuân thủ các quy tắc định dạng và chất lượng.
- **Vue DevTools**: Phát triển và debug ứng dụng Vue.js.
- **PapaParse**: Phân tích và chuyển đổi dữ liệu CSV.
- **@vueuse/core**: Sử dụng các công cụ như `useFetch` và `useTimeoutPoll` để tối ưu hóa việc fetch và cập nhật dữ liệu.
- **Constants Management**: Sử dụng các hằng số để quản lý cấu hình API và game, đảm bảo tính nhất quán và dễ bảo trì.