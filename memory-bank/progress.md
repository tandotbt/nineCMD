# Tiến độ dự án

## Các giai đoạn phát triển

### Giai đoạn 1: Hạ tầng & Quy chuẩn (Hoàn thành)

- [x] Thiết lập file `RULE.md` và `ai-guidelines.md`.
- [x] Chuẩn hóa cấu trúc thư mục.

### Giai đoạn 2: Cấu trúc Dữ liệu & Lưu trữ (Hoàn thành)

- [x] Thiết lập Dexie.js schema v3 (hỗ trợ đa hành tinh).
- [x] Triển khai Service Worker và Periodic Sync.
- [x] Triển khai `src/logic/diff.ts` cho state diffing.

### Giai đoạn 3: Automation Engine (Đang thực hiện)

- [x] Xây dựng `useAutomationStore` (State Machine).
- [x] Hoàn thành logic AP Refill với Exponential Backoff.
- [x] Mở rộng làm giàu dữ liệu (Data Enrichment) cho Arena & World Boss.
- [x] Tích hợp Gifts và Summons vào luồng dữ liệu.
- [ ] Triển khai logic thông báo nâng cao cho Arena/World Boss.

### Giai đoạn 4: UI & Integration (Hoàn thành phần lớn)

- [x] Hiện đại hóa Quản lý Nhân vật (Atomic Design).
- [x] Nâng cấp hệ thống Login & Tìm kiếm (Đa phương thức).
- [x] Triển khai dịch vụ Khám phá Avatar (Avatar Discovery).
- [x] Refactor `infoAllAvatarAddress.vue` với UI chuyên nghiệp.
- [ ] Cải thiện UI hiển thị lịch sử thay đổi nhân vật (Diff viewer).

### Giai đoạn 5: Kiểm thử & Tối ưu (Đang thực hiện)

- [x] Chiến lược Kiểm thử Hai Tầng.
- [x] Đồng bộ hóa GraphQL queries từ dự án mẫu.
- [x] Vượt qua `type-check` và `lint`.
- [ ] **Bổ sung Unit Test cho logic Ranking và Mappers mới.**
- [ ] Stress test với số lượng nhân vật lớn.

## Trạng thái hiện tại

- **Tiến độ tổng thể**: ~85%
- **Trọng tâm hiện tại**: Giai đoạn 5 (Kiểm thử) - Lấp đầy khoảng trống coverage cho các logic mới và Giai đoạn 3 - Hoàn thiện automation Arena/World Boss.

## Các mốc quan trọng gần đây

- **2026-02-08**: Dọn dẹp dead code: Xóa `useNameSearch.ts` và `AvatarSearchAutocomplete.vue`.
- **2026-02-05**: Hoàn thành áp dụng Atomic Design và Refactor hệ thống Login.
- **2026-02-05**: Hợp nhất và tối ưu hóa Atomic Components (`StatIcon`).
