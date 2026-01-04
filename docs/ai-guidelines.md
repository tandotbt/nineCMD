# AI & Developer Collaboration Guidelines (Quy tắc cộng tác)

Tài liệu này thiết lập các quy tắc nghiêm ngặt cho AI LLM Agent và lập trình viên khi làm việc trên dự án này để đảm bảo tính nhất quán và khả năng bảo trì.

## 1. Ngôn ngữ (Language)

- **Tài liệu (.md):** Có thể sử dụng **Tiếng Việt** để giải thích ngữ cảnh, mục tiêu và hướng dẫn.
- **Mã nguồn (Code):** Toàn bộ mã nguồn (biến, hàm, class, types) phải sử dụng **Tiếng Anh**.
- **Comments:** Tất cả comment trong code phải sử dụng **Tiếng Anh**.
  - _Đúng:_ `// TODO: implement offline sync logic`
  - _Sai:_ `// Cần làm: thực hiện logic đồng bộ offline`

## 2. Quy chuẩn Comment đặc biệt (Standardized Markers)

Để dễ dàng tìm kiếm và quản lý các phần việc còn dang dở, sử dụng các từ khóa sau:

- `// TODO: [Description]` - Công việc cần thực hiện mới.
- `// FIXME: [Description]` - Sửa lỗi hoặc logic chưa chuẩn.
- `// UPDATE: [Description]` - Cập nhật logic cũ sang cấu trúc mới.
- `// NOTE: [Description]` - Ghi chú quan trọng về lý do tại sao code được viết như vậy.
- `// DEPRECATED: [Description]` - Đánh dấu code cũ sẽ bị xóa bỏ.

_Lưu ý: Luôn kèm theo mô tả ngắn gọn sau dấu hai chấm._

## 3. Quy trình Phát triển (Development Workflow)

1. **Automation-First:** Mọi logic xử lý tự động phải tuân thủ luồng: **Fetch -> Store -> Diff -> Decision -> Action** quy định tại [`RULE.md`](../RULE.md).
2. **Non-Blocking UI:** Tuyệt đối không thực hiện các phép so sánh (diff) object character lớn trực tiếp trên Main Thread. Sử dụng Web Worker.
3. **Phân tích trước khi viết:** Luôn kiểm tra các định nghĩa trong `src/core/` hoặc `src/logic/` trước khi thêm logic mới vào UI.
4. **Asynchronous Consistency:** Ưu tiên sử dụng `async/await` cho các tác vụ IO, Database hoặc API. Khi một hàm gọi một callback/hàm bất đồng bộ, bản thân hàm đó cũng phải là `async` và phải `await` kết quả để tránh race condition.
5. **Dependency Check:** Khi chỉnh sửa chữ ký hàm (signature) hoặc logic cốt lõi, bắt buộc phải kiểm tra và cập nhật tất cả các nơi đang sử dụng (dependencies) hàm đó.
6. **Type-Safety:** Không sử dụng `any`. Ưu tiên `interface` và `type` rõ ràng.
7. **Test-Driven Development (TDD):** Mọi logic nghiệp vụ mới hoặc hàm quan trọng phải có unit test đầy đủ bao phủ các trường hợp thành công và thất bại trước khi merge.

## 4. Cấu trúc Commit Message

Tuân thủ Conventional Commits:

- `feat:` Tính năng mới.
- `fix:` Sửa lỗi.
- `docs:` Thay đổi tài liệu.
- `refactor:` Tái cấu trúc mã nguồn.
- `test:` Thêm hoặc sửa test.
- `chore:` Cập nhật build, config, dependencies.

## 5. Quy tắc PWA & Offline

- Service Worker phải được kiểm tra kỹ khả năng caching để không làm cache dữ liệu block quá cũ.
- Logic offline trong `BlockTracker` phải độc lập với môi trường trình duyệt (không gọi trực tiếp `window.navigator.onLine` bên trong class, mà nhận vào như một tham số/state).
