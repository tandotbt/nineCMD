# Tiến độ dự án

## Các giai đoạn phát triển

### Giai đoạn 1: Hạ tầng & Quy chuẩn
- [x] Thiết lập file `RULE.md`.
- [x] Cập nhật hướng dẫn cộng tác AI tại `ai-guidelines.md`.
- [x] Chuẩn hóa cấu trúc thư mục tại `setup.md`.

### Giai đoạn 2: Cấu trúc Dữ liệu & Lưu trữ
- [x] Thiết lập Dexie.js schema cơ bản cho `blocks` và `settings`.
- [x] Hỗ trợ đa hành tinh (Planets) và RPC động.
- [x] Thêm bảng `character_history` vào Dexie.
- [x] Cập nhật Dexie Schema v3 (Thêm trường `planet` vào lịch sử).
- [x] Triển khai Service Worker và Periodic Sync.
- [x] Refactoring hệ thống Character (Tách biệt Types, Logic, Queries).
- [x] Triển khai `src/logic/diff.ts` cho state diffing.

### Giai đoạn 3: Automation Engine
- [x] Chuyển đổi cơ chế fetch block sang App.vue/Service Worker.
- [x] Xây dựng Pinia store `useAutomationStore` (State Machine).
- [x] Hoàn thành logic quyết định cơ bản trong `decision.ts` (AP Refill).
- [x] Triển khai cơ chế Exponential Backoff cho thông báo.
- [ ] Mở rộng logic Automation cho Arena & World Boss.
- [ ] Nghiên cứu và triển khai `automation.worker.ts` nếu cần thiết cho hiệu năng.

### Giai đoạn 4: UI & Integration
- [x] Triển khai tính năng `infoAllAvatarAddress` (Batch GraphQL).
- [x] Thiết kế Dashboard điều khiển Automation (`AutomationView.vue`).
- [x] Tích hợp hệ thống thông báo (Notification) thời gian thực.
- [x] Cải thiện UI Automation với metrics và logs chi tiết.
- [ ] Cải thiện UI hiển thị lịch sử thay đổi nhân vật (Diff viewer).

### Giai đoạn 5: Kiểm thử & Tối ưu
- [x] Viết unit test cho logic `decision.ts` và `character.ts`.
- [x] Triển khai chiến lược Kiểm thử Hai Tầng (Network-Dependent & Pure Logic).
- [x] Tự động hóa quy trình Scanner & Fetcher cho test fixtures.
- [x] Đồng bộ hóa và chuẩn hóa GraphQL queries từ dự án mẫu.
- [x] Vượt qua kiểm tra `npm run type-check` và `npm run lint`.
- [ ] Kiểm tra hiệu năng PWA trên Mobile thực tế.
- [ ] Stress test với số lượng nhân vật lớn.

## Trạng thái hiện tại
- **Tiến độ tổng thể**: ~75%
- **Trọng tâm hiện tại**: Giai đoạn 3 (Automation Engine) - Mở rộng tính năng cho Arena/World Boss.

## Các mốc quan trọng đã đạt được
- Khởi tạo thành công Memory Bank (2026-01-11).
- Hoàn thành Batch GraphQL cho Avatar Data.
- Triển khai thành công Automation Engine cốt lõi và Dashboard điều khiển.
- Chuẩn hóa toàn bộ hệ thống Logic và Kiểm thử (2026-01-25).
