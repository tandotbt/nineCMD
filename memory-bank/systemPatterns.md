# Kiến trúc hệ thống

## Kiến trúc tổng thể

Nine CMD là một ứng dụng PWA được xây dựng bằng Vue 3, sử dụng mô hình Client-side Heavy để xử lý logic automation trực tiếp trên trình duyệt của người dùng. Hệ thống được thiết kế theo nguyên tắc tách biệt logic nghiệp vụ khỏi framework (Framework-Agnostic Logic) để có thể chạy đồng nhất trên cả Main Thread và Service Worker.

## Các thành phần chính

- **Frontend Framework**: Vue 3 với Naive UI cho giao diện người dùng.
- **State Management**: Pinia quản lý trạng thái ứng dụng.
- **Local Database (Dexie.js)**:
  - `blocks`: Lưu trữ cache các block blockchain.
  - `settings`: Lưu trữ cấu hình người dùng, trạng thái automation.
  - `character_history`: Lưu trữ lịch sử trạng thái nhân vật theo thời gian và theo hành tinh (Planet).
- **Background Processing**:
  - **Service Worker**: Xử lý cache offline, fetch block nền và thực hiện logic đánh giá thông báo/automation định kỳ (Periodic Sync).
- **API Layer**:
  - **GraphQL**: Truy vấn dữ liệu blockchain phức tạp (Batching).
  - **REST**: Tương tác với 9cmd API, 9cscan và các dịch vụ bổ trợ khác.

## Các mẫu thiết kế (Design Patterns)

- **Atomic Design (UI Layer)**: Tổ chức component theo các cấp độ:
  - **Atoms**: Các phần tử cơ bản (`StatIcon.vue`, `GradeBar.vue`).
  - **Molecules**: Tổ hợp các atoms (`StarSystem.vue`, `ItemTooltip.vue`).
  - **Organisms**: Các khối chức năng phức tạp (`EquipmentTable.vue`, `EquippedSlotsDisplay.vue`).
- **Modular Logic Separation**: Logic nghiệp vụ được tách thành các module thuần túy trong `src/logic/` (ví dụ: `character.ts`, `decision.ts`, `diff.ts`).
- **Composition-based Architecture**: Sử dụng các custom hooks (composables) để quản lý logic phức tạp, ví dụ hệ thống Login mới: `useLoginLogic`, `useAgentLookup`, `useAvatarLookup`.
- **Lazy Data Enrichment Pattern**: Các dữ liệu mang tính hiển thị và phụ thuộc vào locale (như tên vật phẩm) được xử lý "lazy" tại lớp giao diện (UI Layer) thông qua các mappers chuyên biệt (`mapEquipmentToDisplayData`).
- **Reactive Data Fetching Pattern (Auto-executing Reactive Fetch)**: Sử dụng `useFetch` của VueUse kết hợp với `computed` URL và tùy chọn `{ refetch: true }`. Khi tham số đầu vào (hành tinh, season) thay đổi, hệ thống tự động trigger API mới.
- **Centralized Constants & Asset Management**: Toàn bộ hằng số, GQL Queries và đường dẫn tài sản (`GAME_ASSETS`) được tập trung tại `src/constants/index.ts`. Việc phân giải URL hình ảnh được chuẩn hóa qua `src/logic/assets.ts`.

## Luồng Automation (Mô hình Dual-Execution)

Hệ thống automation hoạt động theo cơ chế song song:

1. **UI Thread (Active Mode)**:
   - Chạy khi người dùng mở ứng dụng.
   - `useAutomationStore` lắng nghe thay đổi từ `blockStore`.
2. **Background Thread (Passive Mode)**:
   - Chạy thông qua Service Worker.
   - Sử dụng chung logic `evaluateAutomation` để gửi thông báo.

## Database Schema (Dexie v3)

- `blocks`: `id, object.index, object.timestamp`
- `settings`: `key`
- `character_history`: `++id, agentAddress, avatarAddress, timestamp, planet` (Hỗ trợ truy vấn lịch sử theo hành tinh).
