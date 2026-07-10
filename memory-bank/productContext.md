# Product Context: NineCMD

## Why This Project Exists
NineCMD được phát triển để cung cấp một giải pháp cho người chơi Nine Chronicles muốn tiếp tục trải nghiệm trò chơi trên các thiết bị di động như iPhone 6, đặc biệt là khi không thể truy cập được các tính năng đầy đủ trên các nền tảng khác.

## Problems It Solves
1. **Không có giao diện web cho Nine Chronicles**: Người chơi thường phải sử dụng các ứng dụng di động hoặc máy tính để tiếp cận trò chơi.
2. **Khó khăn trong việc quản lý AP**: Người chơi cần một cách thuận tiện để refill AP.
3. **Thiếu tính năng hỗ trợ Arena PvP**: Người chơi muốn tham gia các trận đấu Arena một cách dễ dàng và hiệu quả.
4. **Không có tính năng mở rộng**: Người chơi muốn có thể mua bán trang bị, craft, upgrade, và tham gia các hoạt động khác như Worldboss.
5. **Không có cách xem chi tiết avatar**: Người chơi muốn xem thông tin chi tiết về avatar (character info, inventory, materials, consumables) mà không cần mở game.

## How It Should Work
- **Trải nghiệm người dùng thân thiện**: Giao diện đơn giản và dễ sử dụng, tối ưu hóa cho các thiết bị di động.
- **Tương tác với API của Nine Chronicles**: Sử dụng GraphQL (Mimir + Headless) và REST APIs để lấy và gửi dữ liệu.
- **Hỗ trợ đa ngôn ngữ**: Người dùng có thể chọn ngôn ngữ phù hợp với mình.
- **Lưu trữ thiết lập cá nhân**: Lưu trữ các thiết lập như ngôn ngữ, chế độ tối, hành tinh được chọn, và các thông tin khác trong localStorage.
- **Tra cứu nhanh Agent ↔ Avatar**: Cho phép người dùng tìm kiếm avatar thông qua arena leaderboard hoặc nhập address trực tiếp.
- **Xem chi tiết Avatar**: Nhập agent + avatar address để xem character info, inventory (equipment, costumes, runes), materials, consumables, và REST API data.

## User Experience Goals
- **Tối ưu hóa hiệu suất**: Đảm bảo ứng dụng chạy mượt mà trên các thiết bị có cấu hình thấp.
- **Trải nghiệm người dùng đồng nhất**: Giao diện và chức năng hoạt động tương tự trên tất cả các thiết bị.
- **Hỗ trợ cộng đồng**: Cung cấp các tính năng mở rộng để người chơi có thể tham gia vào các hoạt động trong trò chơi một cách dễ dàng.
- **Dữ liệu phong phú**: Hiển thị thông tin chi tiết về avatar với dữ liệu được làm giàu từ CSV (tên vật phẩm, CP, skills, stats).
- **Kết nối liền mạch**: Luồng dữ liệu từ Login → Avatar Data tự động, không cần nhập lại address.
