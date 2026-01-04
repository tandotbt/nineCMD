# Nine CMD Transition & Automation Plan

Tài liệu này vạch ra lộ trình chuyển đổi từ bộ khung cũ sang cấu trúc Automation mới, tối ưu cho trình duyệt và thiết bị di động.

## Giai đoạn 1: Hạ tầng & Quy chuẩn (Hoàn thành)

- [x] Thiết lập file [`RULE.md`](../RULE.md) định nghĩa luồng Automation.
- [x] Cập nhật hướng dẫn cộng tác AI tại [`ai-guidelines.md`](ai-guidelines.md).
- [x] Chuẩn hóa cấu trúc thư mục tại [`setup.md`](setup.md).

## Giai đoạn 2: Cấu trúc Dữ liệu & Lưu trữ (Đang thực hiện)

- [x] Thiết lập **Dexie.js** schema cơ bản cho `blocks` và `settings`.
- [x] Mở rộng hệ thống để hỗ trợ đa hành tinh (**Planets**) và chuyển đổi RPC động.
- [ ] Mở rộng bảng `characters` và `actions` cho hệ thống Automation.
- [ ] Tạo module `src/logic/diff.ts` tích hợp `microdiff`.
- [x] Triển khai **Service Worker** hỗ trợ chạy ngầm và Periodic Sync.

## Giai đoạn 3: Automation Engine (Trọng tâm)

- [x] Chuyển đổi cơ chế fetch block từ Store sang App.vue và Service Worker.
- [ ] Triển khai **Web Worker** (`src/workers/automation.worker.ts`):
  - Nhận tín hiệu block mới.
  - Thực hiện so sánh dữ liệu ngầm.
  - Trả về quyết định (Decision).
- [ ] Tích hợp **Wake Lock API** để ngăn Mobile ngủ đông.
- [ ] Xây dựng Pinia store `useAutomationStore` để điều khiển (Start/Stop/X blocks).

## Giai đoạn 4: UI & Integration

- [ ] Thiết kế Dashboard điều khiển Automation bằng Naive UI.
- [ ] Tích hợp hệ thống thông báo (Notification) để theo dõi kết quả lệnh trong thời gian thực.

## Giai đoạn 5: Kiểm thử & Tối ưu

- [ ] Viết unit test cho logic `decision.ts` (đảm bảo chọn đúng lệnh theo điều kiện).
- [ ] Kiểm tra hiệu năng PWA trên thiết bị Mobile thực tế.
