# Bối cảnh kỹ thuật

## Công nghệ sử dụng

- **Ngôn ngữ**: TypeScript 5.9.3 (Strict Mode).
- **Framework**: Vue 3.5.26 (Composition API).
- **UI Library**: Naive UI 2.43.2.
- **State Management**: Pinia 3.0.4.
- **Database**: Dexie.js 4.2.1 (IndexedDB wrapper).
- **Build Tool**: Vite 7.3.0.
- **Testing**: Vitest 4.0.16.
- **PWA**: vite-plugin-pwa 1.2.0.
- **Other Core Libraries**:
  - Axios 1.13.2 (REST API).
  - @tanstack/vue-query 5.92.5 (API State management).
  - microdiff 1.5.0 (Object diffing).
  - RxJS 7.8.2 (Stream handling).
  - date-fns 4.1.0 (Date processing).
  - lodash-es 4.17.22.
  - papaparse 5.5.3 (CSV processing).

## Môi trường phát triển

- **Node.js**: ^20.19.0 hoặc >=22.12.0.
- **Quản lý gói**: npm.
- **Linting & Formatting**: ESLint 9 + Prettier 3.
- **CI/CD**: GitHub Actions (Tự động chạy test/lint/type-check).

## Ràng buộc kỹ thuật

- **Offline First**: Logic automation phải hỗ trợ block ảo khi mất kết nối mạng.
- **Background Continuity**: Duy trì hoạt động thông qua Service Worker Periodic Sync (tối thiểu 15 phút theo giới hạn trình duyệt).
- **Type Safety**: Tuyệt đối tránh sử dụng `any`. Mọi dữ liệu từ API/GQL phải được định nghĩa interface rõ ràng.
- **Logic Portability**: Logic nghiệp vụ cốt lõi không được phụ thuộc vào Vue/Pinia để có thể chạy trong Service Worker.
- **Performance**: Tối ưu hóa Batch GraphQL và xử lý diffing để tránh làm lag UI thread.

## Quy ước phát triển

- **Cấu trúc thư mục**:
  - `src/core/` & `src/logic/`: Logic nghiệp vụ thuần túy.
  - `src/api/`: Định nghĩa các hàm gọi API và Queries.
  - `src/types/`: Định nghĩa kiểu dữ liệu tập trung.
  - `src/constants/`: Hằng số và cấu hình.
- **Kiểm thử**:
  - Mọi logic mới phải có unit test tương ứng.
  - Sử dụng `scripts/fetch-test-data.cjs` để cập nhật dữ liệu mẫu khi có thay đổi trong cấu trúc blockchain.
- **Tài liệu**: Cập nhật Memory Bank sau mỗi thay đổi đáng kể về kiến trúc hoặc tính năng.
