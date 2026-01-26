# Nine CMD - Tóm tắt dự án

## Mục tiêu cốt lõi
Dự án **Nine CMD** nhằm mục đích xây dựng một công cụ hỗ trợ và tự động hóa (Automation) cho người chơi của trò chơi blockchain Nine Chronicles. Mục tiêu chính là tối ưu hóa trải nghiệm người dùng trên cả trình duyệt web và thiết bị di động thông qua các tính năng tự động hóa thông minh và thông báo thời gian thực.

## Phạm vi dự án
- **Chuyển đổi hạ tầng**: Di chuyển từ cấu trúc cũ sang hệ thống Automation mới linh hoạt, an toàn kiểu dữ liệu (Type Safety) và dễ mở rộng.
- **Hỗ trợ đa nền tảng**: Đảm bảo hoạt động ổn định trên Web và Mobile dưới dạng PWA (Progressive Web App).
- **Tự động hóa thông minh**: Triển khai các vòng lặp tự động (Automation Loops) dựa trên dữ liệu block thời gian thực, có khả năng so sánh trạng thái (State Diffing) để đưa ra quyết định.
- **Quản lý dữ liệu**: Hỗ trợ đa hành tinh (Odin, Heimdall, Thor) với khả năng chuyển đổi RPC động và lưu trữ lịch sử nhân vật bền vững.
- **Hệ thống Kiểm thử**: Xây dựng bộ test suite hai tầng (Network-Dependent và Pure Logic) để đảm bảo độ tin cậy của logic nghiệp vụ.

## Giá trị mang lại
- Giảm thiểu thao tác thủ công cho người dùng (Auto Refill AP, Auto Arena/World Boss - đang phát triển).
- Cung cấp thông tin chi tiết, lịch sử thay đổi và so sánh các chỉ số của nhân vật (Avatar).
- Duy trì trạng thái hoạt động và thông báo liên tục ngay cả khi thiết bị ở chế độ ngoại tuyến (thông qua block ảo) hoặc chạy ngầm (Service Worker).
