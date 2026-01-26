# Bối cảnh hiện tại

## Trọng tâm hiện tại
Dự án vừa hoàn tất việc đồng bộ hóa và chuẩn hóa toàn bộ hệ thống Logic, Hằng số và GraphQL Queries. Trọng tâm hiện tại là mở rộng các tính năng automation nâng cao (Arena, World Boss) và tối ưu hóa trải nghiệm người dùng trong việc theo dõi các thay đổi của nhân vật.

## Các thay đổi gần đây
- **Chuẩn hóa Logic Nhân vật**: Tách biệt hoàn toàn xử lý CP, AP, Resolve Names vào `src/logic/character.ts`.
- **Nâng cấp Hệ thống Automation**:
  - Triển khai `src/logic/decision.ts` và `src/logic/diff.ts` để đưa ra quyết định dựa trên sự thay đổi trạng thái (State Changes).
  - Tích hợp cơ chế Exponential Backoff cho thông báo để tránh làm phiền người dùng.
  - Cập nhật `useAutomationStore.ts` để quản lý vòng lặp automation dựa trên block index một cách chính xác.
- **Đồng bộ hóa Service Worker**:
  - Cập nhật `src/sw.ts` để sử dụng chung logic đánh giá automation với Main Thread.
  - Hỗ trợ ước lượng block ảo khi mất kết nối để duy trì thông báo.
- **Mở rộng Cơ sở dữ liệu (Dexie v3)**:
  - Cập nhật bảng `character_history` để lưu trữ thông tin theo hành tinh (`planet`), cho phép theo dõi lịch sử nhân vật trên nhiều môi trường khác nhau.
- **Tối ưu hóa Kiểm thử**:
  - Hoàn thiện bộ Test Suite hai tầng.
  - Tự động hóa việc lấy dữ liệu mẫu (fixtures) từ blockchain.
- **Chuẩn hóa Giao diện**:
  - Cập nhật `AutomationView.vue` với các metrics trực quan và nhật ký hoạt động chi tiết.

## Các quyết định quan trọng
- **Framework-Agnostic Logic**: Duy trì logic nghiệp vụ thuần túy (Pure TS) để đảm bảo khả năng chạy nền trong Service Worker.
- **Planet-Aware History**: Mọi dữ liệu lịch sử phải gắn liền với ID hành tinh để tránh nhầm lẫn dữ liệu khi người dùng chuyển đổi RPC.
- **Notification Backoff**: Chỉ gửi thông báo lặp lại sau một khoảng thời gian tăng dần nếu điều kiện automation vẫn chưa được xử lý.

## Các vấn đề đang giải quyết
- **Hiệu năng Batch GraphQL**: Tối ưu hóa việc query cho các agent có số lượng Avatar cực lớn (>100).
- **Độ trễ của Service Worker**: Điều chỉnh khoảng thời gian Periodic Sync để cân bằng giữa thời gian thực và tiêu thụ pin/tài nguyên OS.

## Bước tiếp theo
1. **Phát triển Automation Arena**: Tự động thông báo khi có vé Arena hoặc khi kết thúc mùa giải.
2. **Phát triển Automation World Boss**: Tự động thông báo khi World Boss xuất hiện hoặc hồi phục vé.
3. **Cải thiện Diff UI**: Hiển thị chi tiết các món đồ mới nhận được hoặc các chỉ số vừa thay đổi trong Dashboard.
4. **Stress Test**: Kiểm tra độ ổn định của hệ thống với dữ liệu thực tế quy mô lớn.
