# System Patterns: NineCMD

## System Architecture
NineCMD sử dụng một kiến trúc client-side với Vue.js 3 làm framework chính. Ứng dụng tương tác với các API của Nine Chronicles thông qua WebSocket và RPC endpoints.

### Component Relationships
- **App.vue**: Giao diện chính của ứng dụng.
- **MenuLeft.vue**: Menu bên trái cho các chức năng chính.
- **HeaderNineCMD.vue**: Header cho giao diện người dùng.
- **FooterBlock.vue**: Footer cho giao diện người dùng.
- **FloatButtonSetting.vue**: Các nút điều khiển nổi.

### Critical Implementation Paths
- **Tương tác WebSocket**: Sử dụng WebSocket để kết nối với server Nine Chronicles.
- **Pinia Stores**: Sử dụng Pinia để quản lý trạng thái toàn cầu.
- **Vue Router**: Quản lý các view và chuyển đổi giữa các trang.
- **Vue-i18n**: Hỗ trợ đa ngôn ngữ.
- **Arena Data Conversion**: Sử dụng hàm `convertToArenaParticipants` để chuyển đổi dữ liệu từ API Arena thành đối tượng tham gia Arena.
- **Arena Season Management**: Sử dụng store `arenaSeason` để quản lý thông tin về mùa giải Arena.
- **WebSocket Block Management**: Sử dụng store `webSocketBlock` để quản lý thông tin block và tính toán các thông số liên quan đến block hiện tại và trung bình.

## Design Patterns
- **MVVM (Model-View-ViewModel)**: Sử dụng Vue.js để quản lý trạng thái và giao diện.
- **Singleton Pattern**: Sử dụng Pinia để quản lý trạng thái toàn cầu.
- **Observer Pattern**: Sử dụng Vue's reactivity system để cập nhật giao diện khi trạng thái thay đổi.
- **Dependency Injection**: Sử dụng Vue's Composition API để quản lý các phụ thuộc.
- **Lazy Loading**: Sử dụng `useFetch` và `useStorage` từ `@vueuse/core` để tải dữ liệu và lưu trữ trạng thái một cách hiệu quả.
- **Debounce**: Sử dụng `refDebounced` để tối ưu hóa việc fetch dữ liệu khi thay đổi hành tinh.
- **CSV Parsing**: Sử dụng `PapaParse` để phân tích và chuyển đổi dữ liệu CSV thành đối tượng có thể truy cập.
- **Error Handling**: Sử dụng `onFetchError` để xử lý lỗi một cách hiệu quả và cung cấp dữ liệu fallback khi cần thiết.
- **Utility Functions**: Sử dụng các hàm hỗ trợ như `combatPotion`, `statAndSkillOption`, `statsMapConvert`, `statAndSkillOption_shop`, `convertToArenaParticipants`, và các hàm liên quan đến quản lý mùa giải Arena và block.

## Key Technical Decisions
- **Vue.js 3**: Lựa chọn framework để xây dựng giao diện người dùng.
- **Naive UI**: Thư viện UI để tạo giao diện người dùng hiện đại và thân thiện.
- **Pinia**: Thư viện quản lý trạng thái thay thế cho Vuex.
- **Vue-i18n**: Thư viện hỗ trợ đa ngôn ngữ.
- **WebSocket**: Sử dụng để tương tác thời gian thực với server Nine Chronicles.
- **Pinia Stores**: Sử dụng để quản lý các trạng thái liên quan đến dữ liệu người dùng, Arena, trang bị, và các tính năng khác.
- **WebSocket Block Store**: Sử dụng để quản lý thông tin block và tính toán các thông số liên quan đến block hiện tại và trung bình.
- **Season Management**: Sử dụng store `arenaSeason` để quản lý thông tin về mùa giải Arena.
- **Data Fetching and Processing**: Sử dụng `useFetchDataUser9CStore` để fetch và xử lý dữ liệu người dùng, bao gồm trang bị, Arena, và các tính năng khác.

## Stores and Utilities
- **Arena Season Store**: Quản lý thông tin về mùa giải Arena, bao gồm tính toán thời gian còn lại cho từng mùa giải và vòng đấu hiện tại.
- **WebSocket Block Store**: Quản lý thông tin về block hiện tại và tính toán các thông số liên quan như block hiện tại, block trung bình, và thời gian chuyển đổi.
- **Config URL Store**: Quản lý các URL và cấu hình liên quan đến API và dữ liệu game.
- **Fetch Data User Store**: Quản lý việc fetch và xử lý dữ liệu người dùng, bao gồm trang bị, Arena, và các thông tin liên quan.
- **Utility Functions**: Các hàm hỗ trợ như `combatPotion`, `convertToArenaParticipants`, và các hàm liên quan để xử lý thông tin trang bị và Arena.