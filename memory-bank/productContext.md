# Bối cảnh sản phẩm

## Tại sao dự án này tồn tại?
Nine CMD được phát triển để giải quyết các hạn chế của việc tương tác thủ công với game blockchain Nine Chronicles. Người chơi cần một công cụ có thể theo dõi trạng thái game liên tục, nhận thông báo tức thì về các sự kiện quan trọng và thực hiện các hành động tự động mà không cần phải mở ứng dụng liên tục.

## Các vấn đề cần giải quyết
- **Sự gián đoạn kết nối**: Người dùng di động thường xuyên gặp vấn đề về mạng hoặc ứng dụng bị tạm dừng khi chạy ngầm, làm bỏ lỡ các thời điểm hồi phục AP hoặc sự kiện.
- **Phức tạp trong quản lý**: Việc theo dõi nhiều Avatar trên nhiều hành tinh (Odin, Heimdall, Thor) tốn nhiều thời gian và công sức.
- **Tính thời gian thực**: Các hành động trong game phụ thuộc vào sự xuất hiện của các block mới trên blockchain, yêu cầu hệ thống phải luôn đồng bộ.
- **Độ tin cậy của dữ liệu**: Đảm bảo dữ liệu hiển thị và logic tự động hóa luôn khớp với trạng thái thực tế trên blockchain.

## Mục tiêu trải nghiệm người dùng
- **Tiện lợi**: Giao diện Dashboard trực quan, dễ dàng theo dõi trạng thái tất cả Avatar và cấu hình các tính năng tự động.
- **Tin cậy**: Hệ thống tự động hóa hoạt động chính xác dựa trên các quy tắc (Rules) đã được kiểm thử nghiêm ngặt với dữ liệu thật.
- **Liên tục**: Hỗ trợ chạy ngầm và thông báo định kỳ thông qua Service Worker, ngay cả khi trình duyệt đã đóng.
- **Linh hoạt**: Dễ dàng thay đổi cấu hình RPC, chuyển đổi giữa các hành tinh và tùy chỉnh các ngưỡng kích hoạt (Thresholds) cho mỗi Avatar.
- **Minh bạch**: Cung cấp nhật ký (Logs) chi tiết về các quyết định tự động hóa và các thay đổi trạng thái của nhân vật.
