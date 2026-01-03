# Danh sách Câu lệnh Scripts - Dự án Nine CMD

Dưới đây là các chuỗi câu lệnh `npm` được đề xuất để người dùng và AI Agent có thể thực hiện nhanh các bước trong quy trình phát triển dự án **Nine CMD**.

## 1. Cài đặt và Khởi tạo

```bash
# Cài đặt toàn bộ phụ thuộc
npm install
```

## 2. Phát triển (Development)

```bash
# Chạy ứng dụng ở chế độ local (Hỗ trợ Hot Reload)
npm run dev

# Chạy ứng dụng và mở trình duyệt tự động
npm run dev -- --open
```

## 3. Kiểm tra mã nguồn (Quality Assurance)

```bash
# Chạy Lint để kiểm tra lỗi cú pháp và chuẩn code
npm run lint

# Tự động sửa lỗi format với Prettier
npm run format

# Chạy Unit Test với Vitest (Chế độ Watch)
npm test

# Chạy Unit Test một lần duy nhất (Dùng cho CI)
npm run test:run

# Xem báo cáo độ phủ mã nguồn (Coverage)
npm run test:coverage
```

## 4. Xây dựng và Triển khai (Build & Deploy)

```bash
# Build dự án ra thư mục dist/ (Bao gồm cả PWA Service Worker)
npm run build

# Chạy thử bản build ở local
npm run preview

# Quy trình build nhanh cho deploy: Lint -> Test -> Build
npm run deploy:prep
```

## 5. Cấu hình chi tiết trong package.json

Bạn nên cập nhật phần `scripts` trong [`package.json`](package.json) như sau:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.vue --fix",
    "format": "prettier --write \"src/**/*.{ts,vue,json,md}\"",
    "deploy:prep": "npm run lint && npm run test:run && npm run build"
  }
}
```
