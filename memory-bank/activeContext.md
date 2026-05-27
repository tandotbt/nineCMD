# Active Context: NineCMD

## Current Work Focus
- **Tính năng hiện tại**: Đang triển khai các tính năng cơ bản như refill AP và Arena PvP.
- **Tính năng đang phát triển**: Mua bán trang bị, craft, upgrade, Worldboss, và nhận thưởng Patrol.
- **Cải tiến giao diện**: Tối ưu hóa giao diện để phù hợp với các thiết bị di động.
- **Quản lý trạng thái người dùng**: Sử dụng Pinia để quản lý trạng thái người dùng, bao gồm fetch dữ liệu người dùng từ API và xử lý các API liên quan đến Arena và trang bị.

## Recent Changes
- **Cập nhật giao diện người dùng**: Sử dụng Naive UI để cải thiện giao diện và trải nghiệm người dùng.
- **Thêm hỗ trợ đa ngôn ngữ**: Sử dụng Vue-i18n để hỗ trợ nhiều ngôn ngữ.
- **Tối ưu hóa WebSocket**: Cải thiện hiệu suất tương tác với API của Nine Chronicles.
- **Lưu trữ thiết lập**: Sử dụng localStorage để lưu trữ các thiết lập cá nhân của người dùng.
- **Quản lý trạng thái người dùng**: Sử dụng `useFetchDataUser9CStore` để fetch dữ liệu người dùng và quản lý các thông tin liên quan đến trang bị, Arena, và các tính năng khác.
- **Tính toán và chuyển đổi dữ liệu**: Sử dụng các hàm như `combatPotion`, `statAndSkillOption`, `statsMapConvert`, `statAndSkillOption_shop`, và `convertToArenaParticipants` để xử lý và chuyển đổi dữ liệu.

## Next Steps
- **Hoàn thiện tính năng mua bán trang bị**: Thêm chức năng mua bán trang bị, rune, và đồ ăn.
- **Thêm tính năng craft và upgrade**: Cung cấp các tính năng craft và upgrade cho trang bị.
- **Thêm tính năng Worldboss**: Cho phép người dùng tham gia Worldboss và nhận thưởng.
- **Thêm tính năng Patrol**: Cho phép người dùng nhận thưởng Patrol tự động.
- **Cải thiện hiệu suất**: Tối ưu hóa ứng dụng để chạy mượt mà trên các thiết bị có cấu hình thấp.
- **Tự động cập nhật trạng thái người dùng**: Sử dụng `useTimeoutPoll` để tự động cập nhật trạng thái người dùng khi có thay đổi trong giao dịch.

## Active Decisions and Considerations
- **Sử dụng Vue.js và Naive UI**: Đảm bảo giao diện người dùng thân thiện và hiện đại.
- **Tương tác với API**: Sử dụng WebSocket và RPC endpoints để tương tác với Nine Chronicles.
- **Hỗ trợ đa ngôn ngữ**: Đảm bảo ứng dụng có thể hỗ trợ nhiều ngôn ngữ khác nhau.
- **Lưu trữ thiết lập**: Sử dụng localStorage để lưu trữ các thiết lập cá nhân của người dùng.
- **Quản lý trạng thái**: Sử dụng Pinia để quản lý trạng thái toàn cầu, bao gồm việc fetch dữ liệu người dùng và xử lý các API liên quan đến Arena và trang bị.
- **Cập nhật tự động**: Sử dụng `useTimeoutPoll` để tự động cập nhật trạng thái người dùng khi có thay đổi trong giao dịch.
- **Xử lý lỗi**: Sử dụng `useFetch` để tối ưu hóa việc fetch dữ liệu và xử lý lỗi một cách hiệu quả.

## Learnings and Project Insights
- **Tối ưu hóa hiệu suất**: Đảm bảo ứng dụng hoạt động mượt mà trên các thiết bị có cấu hình thấp.
- **Trải nghiệm người dùng**: Giao diện đơn giản và dễ sử dụng là yếu tố quan trọng.
- **Tương tác với API**: Cần phải tối ưu hóa để giảm thời gian phản hồi và tăng độ tin cậy.
- **Quản lý trạng thái**: Sử dụng Pinia để quản lý trạng thái toàn cầu, bao gồm việc fetch dữ liệu người dùng và xử lý các API liên quan đến Arena và trang bị.
- **Cập nhật tự động**: Sử dụng `useTimeoutPoll` để tự động cập nhật trạng thái người dùng khi có thay đổi trong giao dịch.
- **Xử lý lỗi**: Sử dụng `useFetch` và `onFetchError` để tối ưu hóa việc fetch dữ liệu và xử lý lỗi một cách hiệu quả.
- **Tính toán và chuyển đổi dữ liệu**: Sử dụng các hàm hỗ trợ như `combatPotion`, `convertToArenaParticipants`, và các hàm liên quan để xử lý thông tin trang bị và Arena.