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
  - **REST**: Tương tác với 9cmd API và các dịch vụ bổ trợ khác.

## Các mẫu thiết kế (Design Patterns)

- **Modular Logic Separation**: Logic nghiệp vụ được tách thành các module thuần túy trong `src/logic/` (ví dụ: `character.ts`, `decision.ts`, `diff.ts`). Điều này cho phép Service Worker sử dụng chung logic với UI mà không cần phụ thuộc vào Vue/Pinia.
- **Lazy Data Enrichment Pattern**: Các dữ liệu mang tính hiển thị và phụ thuộc vào locale (như tên vật phẩm) được xử lý "lazy" tại lớp giao diện (UI Layer) thay vì xử lý đồng bộ hàng loạt trong Store. Điều này giúp ngăn chặn việc chặn luồng chính (Main Thread Blocking) khi làm việc với tập dữ liệu lớn.
- **State Diffing Pattern**: Sử dụng `microdiff` trong `src/logic/diff.ts` để phát hiện các thay đổi trạng thái quan trọng. Chỉ các thay đổi "có ý nghĩa" mới kích hoạt logic quyết định hoặc thông báo.
- **Decision Engine (Fetch -> Store -> Diff -> Decision -> Action)**:
  - **Fetch**: Lấy dữ liệu mới nhất.
  - **Store**: Lưu vào database/state.
  - **Diff**: So sánh với trạng thái cũ.
  - **Decision**: Đưa ra quyết định dựa trên trạng thái hiện tại và các thay đổi.
  - **Action**: Thực hiện hành động (Thông báo, Giao dịch).
- **Two-Tier Testing Architecture**:
  - **Tier 1 (Network-Dependent)**: Kiểm thử tích hợp với dữ liệu thật từ blockchain thông qua fixtures.
  - **Tier 2 (Pure Logic)**: Kiểm thử unit cho logic nghiệp vụ cô lập sử dụng factories. Cần đảm bảo factories luôn cập nhật đồng bộ với interface `AvatarData` để tránh lỗi type-check.
- **Centralized Constants & Queries**: Toàn bộ hằng số, Storage Keys và GQL Queries được tập trung tại `src/constants/index.ts` để đảm bảo tính nhất quán toàn dự án.

## Luồng Automation (Mô hình Dual-Execution)

Hệ thống automation hoạt động theo cơ chế song song:

1. **UI Thread (Active Mode)**:
   - Chạy khi người dùng mở ứng dụng.
   - `useAutomationStore` lắng nghe thay đổi từ `blockStore`.
   - Thực hiện chu trình đánh giá và cập nhật nhật ký (Logs) trực quan.
2. **Background Thread (Passive Mode)**:
   - Chạy thông qua Service Worker (Periodic Sync hoặc manual trigger).
   - Tự động fetch block mới hoặc ước lượng block ảo khi offline.
   - Sử dụng chung logic `evaluateAutomation` để gửi thông báo hệ thống.

## Database Schema (Dexie v3)

- `blocks`: `id, object.index, object.timestamp`
- `settings`: `key`
- `character_history`: `++id, agentAddress, avatarAddress, timestamp, planet` (Hỗ trợ truy vấn lịch sử theo hành tinh).
