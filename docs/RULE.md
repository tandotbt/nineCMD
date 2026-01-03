# Nine CMD Automation Rules & Guidelines

Tài liệu này định nghĩa các quy tắc cốt lõi cho hệ thống tự động hóa (Automation) của dự án **Nine CMD**. Mọi LLM Agent hoặc Developer khi tham gia phát triển cần tuân thủ nghiêm ngặt luồng dữ liệu và cấu trúc này.

## 1. Nguyên tắc thiết kế (Design Principles)

- **Offline-First & Durable:** Ứng dụng phải duy trì được trạng thái và logic ngay cả khi mất kết nối tạm thời hoặc chạy trên thiết bị di động (Mobile).
- **Non-Blocking UI:** Mọi tính toán nặng (so sánh dữ liệu lớn, tính toán chiến thuật) phải được thực hiện trong **Web Worker**.
- **State Persistence:** Dữ liệu nhân vật và lịch sử lệnh phải được lưu trữ vào **IndexedDB (via Dexie)** để so sánh giữa các phiên chạy.

## 2. Luồng xử lý dữ liệu (Data Flow)

Hệ thống hoạt động dựa trên vòng lặp Block (Block-based Loop):

1.  **Watch:** Theo dõi sự thay đổi của Block (qua WebSocket hoặc API polling).
2.  **Fetch:** Khi đạt điều kiện (ví dụ: mỗi 5 blocks), gọi API lấy dữ liệu nhân vật mới nhất.
3.  **Store & Diff:**
    - Lưu dữ liệu mới vào Dexie.
    - Gửi dữ liệu cũ và mới vào Web Worker để so sánh (dùng `microdiff`).
4.  **Decision:** Worker dựa trên kết quả diff và cấu hình người dùng để đưa ra quyết định thực hiện lệnh (Lệnh A, B, C hoặc Idle).
5.  **Action:** Main thread nhận lệnh từ Worker và thực hiện gọi API Action.

## 3. Cấu trúc thư mục chuẩn (Standard Directory Structure)

```text
src/
├── api/              # API Services (Axios, GraphQL, TanStack Query)
├── db/               # Database Layer (Dexie schema & helpers)
├── logic/            # Business & Decision Logic
│   ├── diff.ts       # Logic so sánh object dữ liệu
│   ├── decision.ts   # Bộ quy tắc chọn lệnh (Decision Tree/Matrix)
│   └── automation.ts # Controller điều phối vòng lặp
├── workers/          # Web Workers (Xử lý diff và logic ngầm)
├── stores/           # Pinia stores (Automation state, Settings)
└── composables/      # Vue Composables (useWakeLock, useBlockWatcher)
```

## 4. Quy tắc cho LLM Agent

- **Language:** Code và Comment sử dụng **English**. Tài liệu hướng dẫn sử dụng **Tiếng Việt**.
- **Type Safety:** Định nghĩa rõ ràng `interface` cho mọi dữ liệu character và kết quả diff. Tuyệt đối không dùng `any`.
- **Consistency:** Khi chỉnh sửa logic automation, phải đảm bảo không ảnh hưởng đến khả năng chạy ngầm (PWA/Service Worker).
- **Mobile Optimization:** Luôn tích hợp `useWakeLock` khi vòng lặp automation đang bật (`isRunning = true`).
- **Test-Driven Refinement:** Mọi logic xử lý dữ liệu (`diff.ts`, `decision.ts`) và logic nghiệp vụ cốt lõi phải có file test tương ứng trong thư mục `src/__tests__/`. Bộ test phải bao phủ đầy đủ các trường hợp khả dĩ (success, failure, edge cases). Phải chạy test thành công trước khi coi là hoàn thành task.
- **Centralized Constants:** Tuyệt đối không hardcode các giá trị cấu hình (URL, ID, Threshold, Interval...) trong component hoặc store. Tất cả phải được định nghĩa tập trung tại `src/constants/index.ts`.
- **Internationalization (i18n):** Tuyệt đối không sử dụng chuỗi văn bản cứng (hardcoded strings) trong UI. Tất cả văn bản hiển thị phải được định nghĩa trong `src/i18n/locales/`. Khi thêm văn bản mới, bắt buộc phải cập nhật đồng thời cả `en.json` và `vi.json` với tiền tố component tương ứng (ví dụ: `app_header_title`, `home_form_label`).
- **Documentation Persistence:** Mọi thư mục chức năng chính phải có file `README.md` chứa `sequenceDiagram` (Mermaid) mô tả luồng hoạt động. Điều này giúp kiểm soát logic, dễ hiểu và tránh xung đột khi phát triển các tính năng mới.
- **Review & Confirmation:** Các đoạn mã cần xác nhận từ người dùng, cần đặt tên lại hoặc cần review kỹ lưỡng phải được đánh dấu bằng comment `// TODO: [Mô tả yêu cầu]`. Người dùng sẽ dựa vào nhãn này để tìm kiếm và thực hiện điều chỉnh thủ công.
