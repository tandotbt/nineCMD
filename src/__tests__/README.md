# Nine CMD Test Suite

Cấu trúc thư mục test được tổ chức lại để đảm bảo tính nhất quán và dễ bảo trì.

## Cấu trúc thư mục

- `integration/`: Chứa các test tích hợp (Type 1). Truy vấn dữ liệu thật từ các API và so sánh cấu trúc với fixtures.
- `logic/`: Chứa các test logic nghiệp vụ (Type 2). Sử dụng dữ liệu mock từ fixtures để kiểm tra logic xử lý của Store và Service.
- `unit/`: Chứa các unit test cho các hàm tiện ích, quản lý block, parser, v.v.
- `helpers/`: Các công cụ hỗ trợ test (Validator, Network Mocker).
- `fixtures/`: Chứa dữ liệu mẫu (JSON/CSV) dùng cho các bài test. Dữ liệu được tổ chức theo hành tinh (`odin/`, `heimdall/`).

## Cập nhật Fixtures

Để cập nhật dữ liệu mẫu từ các API thật, hãy chạy script:
```bash
node scripts/fetch-test-data.cjs
```
Script này sẽ tải dữ liệu cho cả Odin và Heimdall, đồng thời cắt bớt các mảng quá lớn (tối đa 30 phần tử) để giữ dung lượng nhẹ.

## Các loại Test

### 1. Test Tích hợp cấu trúc (Type 1)
- **File**: `integration/RealDataConsistency.test.ts`
- **Mục tiêu**: Đảm bảo các API (Headless GQL, Mimir GQL, 9cmd API, 9c Season) không thay đổi cấu trúc dữ liệu làm hỏng ứng dụng.
- **Cách chạy**: `npm run test:unit src/__tests__/integration/RealDataConsistency.test.ts`

### 2. Test Logic Nghiệp vụ (Type 2)
- **File**: `logic/MockLogic.test.ts`
- **Mục tiêu**: Kiểm tra logic nghiệp vụ (CP, AP, Stage) bằng dữ liệu thật đã được lưu trong fixtures.
- **Cách chạy**: `npm run test:unit src/__tests__/logic/MockLogic.test.ts`

## Cách thêm Test mới
1. Đối với logic mới: Thêm vào `logic/`.
2. Đối với API mới: Thêm case vào `integration/RealDataConsistency.test.ts`.
3. Đối với utility: Thêm vào `unit/`.
