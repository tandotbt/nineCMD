# Bối cảnh hiện tại

## Trọng tâm hiện tại

Dự án tập trung vào việc hiện đại hóa hệ thống Login, áp dụng Atomic Design cho giao diện nhân vật và chuẩn hóa việc quản lý tài sản (assets).

## Các thay đổi gần đây

- **Hiện đại hóa Hệ thống Login**:
  - Triển khai quy trình đăng nhập đa phương thức: Địa chỉ Agent, Địa chỉ Avatar, và Khám phá (Discovery) từ Arena API.
  - Tách biệt logic xác thực thành các hooks: `useAgentLookup`, `useAvatarLookup`, `useLoginLogic`.
  - Hỗ trợ "Reverse Lookup" để tìm Agent Address từ Avatar Address thông qua RPC hoặc 9cscan.
- **Áp dụng Atomic Design cho UI**:
  - Tái cấu trúc thư mục component thành `atoms`, `molecules`, `organisms`.
  - Tạo mới các component nguyên tử: `StatIcon.vue` (hợp nhất từ Star/Stat), `GradeBar.vue`, `ElementIcon.vue`.
  - Xây dựng các organism chuyên dụng: `EquipmentTable.vue`, `MaterialTable.vue`, `RuneTable.vue`.
- **Nâng cấp Logic Dữ liệu (Data Enrichment)**:
  - Cập nhật `AvatarData` để tích hợp sẵn dữ liệu `gifts` và `summons` đã được làm giàu.
  - Chuẩn hóa URL hình ảnh cho toàn bộ tài sản game thông qua `resolveAssetUrl` và hằng số `GAME_ASSETS`.
  - Cập nhật logic tính CP hỗ trợ `StatValue` (base + additional stats).
- **Refactor & Tối ưu hóa UI**:
  - `infoAllAvatarAddress.vue`: Loại bỏ bảng cũ, thay thế bằng hiển thị chi tiết Avatar với portrait frame chuyên nghiệp và các tab Season/Events được nâng cấp.
  - Khắc phục lỗi thiếu key i18n cho các loại Season Pass mới (`CouragePass`, `AdventureBossPass`, `WorldClearPass`).
  - Sửa lỗi cảnh báo `Extraneous non-props attributes` và đồng bộ i18n keys.
- **Đồng bộ hóa Kỹ thuật (Technical Sync)**:
  - Hoàn tất kiểm toán và khớp nối toàn bộ GraphQL Queries và logic Season Pass.
- **Dọn dẹp mã nguồn (Dead Code Elimination)**:
  - Loại bỏ các file logic cũ không còn sử dụng sau khi nâng cấp hệ thống Login (`useNameSearch.ts`).
  - Xóa bỏ các component nguyên tử mồ côi (`AvatarSearchAutocomplete.vue`).

## Các quyết định quan trọng

- **Atomic Design Consistency**: Mọi component giao diện mới phải tuân thủ cấu trúc nguyên tử để tối ưu khả năng tái sử dụng.
- **Zero `any` Policy**: Đảm bảo Type Safety tuyệt đối trong toàn bộ mã nguồn mới.
- **Planet-Isolated Data**: Reset trạng thái character store khi chuyển đổi hành tinh để đảm bảo tính nhất quán dữ liệu.
- **Asset Centralization**: Mọi URL hình ảnh phải được quản lý tập trung qua `GAME_ASSETS` và phân giải qua `assets.ts`.

## Các vấn đề đang giải quyết (Gaps)

- **Test Coverage**: Logic `ranking.ts` và các mappers mới trong `character.ts` chưa có unit test.
- **Automation Arena/World Boss**: Cần hoàn thiện logic thông báo dựa trên dữ liệu đã được làm giàu.

## Bước tiếp theo

1. **Bổ sung Unit Test**: Tập trung vào `src/logic/ranking.ts` và các hàm mapping dữ liệu mới.
2. **Hoàn thiện Automation Arena**: Tự động thông báo dựa trên trạng thái vé và mùa giải.
3. **Hoàn thiện Automation World Boss**: Tự động thông báo khi Boss xuất hiện hoặc hồi vé.
4. **Cải thiện Diff UI**: Hiển thị chi tiết thay đổi chỉ số/vật phẩm trong Dashboard.
