# Cấu trúc mã nguồn (src)

Thư mục này chứa toàn bộ mã nguồn của ứng dụng **Nine CMD Automation**.

## 📂 Các thư mục chính

- **[`api/`](api/)**: Quản lý các cuộc gọi API và định nghĩa endpoint.
- **[`components/`](components/)**: Các Vue components được phân loại theo chức năng. Tận dụng `unplugin-vue-components` để auto-import.
- **[`constants/`](constants/)**: Định nghĩa các hằng số, cấu hình hệ thống (ví dụ: `BLOCK_CONFIG`, `i18n` settings).
- **[`core/`](core/)**: Logic nghiệp vụ cốt lõi không phụ thuộc vào UI (ví dụ: `BlockManager`).
- **[`i18n/`](i18n/)**: Cấu hình đa ngôn ngữ (Tiếng Anh, Tiếng Việt).
- **[`router/`](router/)**: Cấu hình các tuyến đường (routes) của ứng dụng.
- **[`stores/`](stores/)**: Quản lý trạng thái (state management) bằng Pinia.
- **[`types/`](types/)**: Định nghĩa các TypeScript interfaces và types.
- **[`views/`](views/)**: Các trang (pages) chính của ứng dụng.

## 🚀 Công nghệ sử dụng

- **Vue 3 (Composition API)**
- **Naive UI**: UI Component Library (On-demand import).
- **Pinia**: State Management.
- **Dexie.js**: Tầng lưu trữ IndexedDB bền vững, đồng bộ giữa UI và Service Worker.
- **Vite PWA**: Hỗ trợ chạy ngầm (Background Sync) và Offline-first.
- **VueUse**: Collection of essential Vue Composition Utilities.
- **Unplugin Auto Import**: Tự động import các API của Vue, Vue-Router, và Naive UI.

## 🛠 Lưu ý khi phát triển

- Không cần import thủ công các component từ Naive UI hoặc các component trong thư mục `components/`.
- Các composable như `ref`, `computed`, `onMounted`,... cũng được tự động import.
- Tuân thủ quy tắc TypeScript để đảm bảo tính ổn định của hệ thống.
