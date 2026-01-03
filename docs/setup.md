# Hướng dẫn Thiết lập và Kiến trúc - Dự án Nine CMD

Tài liệu này cung cấp cái nhìn tổng quan về cách thiết lập môi trường, cấu trúc thư mục và kiến trúc của module logic lõi của dự án **Nine CMD**.

> **Lưu ý quan trọng:** LLM Agent và Developer cần đọc kỹ file [`RULE.md`](../RULE.md) trước khi chỉnh sửa logic automation.

## 1. Thiết lập môi trường

### Yêu cầu hệ thống

- Node.js ^20.19.0 hoặc >=22.12.0
- npm

### Cài đặt nhanh

```bash
# Cài đặt các phụ thuộc
npm install

# Chạy ở chế độ phát triển
npm run dev

# Chạy kiểm thử
npm run test:unit

# Build dự án
npm run build
```

## 2. Cấu trúc thư mục (Root)

```text
/
├── .github/workflows/    # Quy trình CI/CD (GitHub Actions)
├── docs/                 # Tài liệu hướng dẫn chi tiết
├── public/               # Tài sản tĩnh và Manifest PWA
├── src/
│   ├── api/              # API Services (Axios, GraphQL, TanStack Query)
│   ├── db/               # Database Layer (Dexie.js)
│   ├── logic/            # Business & Automation Logic
│   │   ├── diff.ts       # So sánh dữ liệu (microdiff)
│   │   ├── decision.ts   # Luật chọn lệnh
│   │   └── automation.ts # Controller vòng lặp
│   ├── workers/          # Web Workers cho xử lý ngầm
│   ├── core/             # Logic nghiệp vụ lõi (Pure TS)
│   ├── components/       # UI Components (Naive UI)
│   ├── stores/           # Pinia stores (State management)
│   ├── __tests__/        # Kiểm thử với Vitest
│   └── main.ts
├── tsconfig.json         # Cấu hình TypeScript
├── vite.config.ts        # Cấu hình Vite & PWA Plugin
└── package.json
```

## 3. Kiến trúc Core Module

Module `BlockManager` được thiết kế theo dạng Class để dễ dàng quản lý trạng thái và testing:

- **State**: Lưu trữ danh sách các block gần nhất, thời gian trung bình, và trạng thái online/offline.
- **Logic Offline**: Khi `isOffline = true`, hệ thống sử dụng `setInterval` để tự động tăng block index dựa trên `averageBlockTime`.
- **Logic Online**: Khi quay lại trực tuyến, hệ thống fetch dữ liệu thực tế từ GraphQL/WSS và tính toán lại `averageBlockTime`.

## 4. Quy trình PWA

Dự án sử dụng `vite-plugin-pwa` để tự động tạo Service Worker.

- **Offline Support**: Cache các tài sản tĩnh và logic tăng block ảo.
- **Manifest**: Cấu hình trong `public/manifest.json` để cho phép cài đặt ứng dụng.

## 5. Quy tắc dành cho AI LLM Agent

Để đảm bảo tính nhất quán khi phát triển dự án **Nine CMD**, các AI Agent cần tuân thủ:

1. **Ngôn ngữ**: Luôn giao tiếp và suy nghĩ bằng tiếng Việt.
2. **TypeScript**: Mọi logic nghiệp vụ mới phải được viết bằng TypeScript và đặt trong thư mục `src/core/`.
3. **Kiểm thử**: Mọi hàm logic trong `src/core/` phải có unit test tương ứng trong thư mục `src/__tests__/` sử dụng **Vitest**.
4. **Định dạng**: Tuân thủ cấu hình ESLint và Prettier đã thiết lập. Không tự ý thay đổi quy tắc format.
5. **PWA**: Luôn đảm bảo các thay đổi không làm hỏng tính năng Offline và Service Worker.
6. **Tên dự án**: Luôn sử dụng tên chính thức là **Nine CMD** trong mọi tài liệu và giao diện.

## 6. Checklist "Đã làm gì chưa"

- [x] Xác định tên dự án thống nhất: **Nine CMD**.
- [x] Thiết lập quy tắc cho LLM Agent.
- [ ] Cấu hình `tsconfig.json` hỗ trợ Strict Mode?
- [ ] Thiết lập `eslint` và `prettier`?
- [ ] Viết Unit Test cho logic tính thời gian trung bình?
- [ ] Kiểm tra Service Worker chạy được ở localhost?
- [ ] Cấu hình GitHub Actions tự động chạy test khi push?
