# Project Brief: NineCMD

## Overview
NineCMD là một ứng dụng web cho phép người dùng chơi Nine Chronicles trên trình duyệt Chrome, đặc biệt là trên thiết bị di động như iPhone 6. Dự án này cung cấp các tính năng hỗ trợ cho trò chơi như refill AP, Arena PvP và các tính năng tương lai như mua bán trang bị, craft, upgrade, và tham gia Worldboss.

## Core Requirements
- **Tính năng hiện có**:
  - Refill AP
  - Arena PvP

- **Tính năng đang phát triển**:
  - Buy / sell gear, rune, food
  - Repeat / Sweep stage
  - Craft / upgrade gear, food
  - Worldboss
  - Receive Patrol reward

## Scope
- **Frontend**: Vue.js 3 với Naive UI cho giao diện người dùng.
- **Backend**: Tương tác với các API của Nine Chronicles thông qua WebSocket và RPC endpoints.
- **Local Storage**: Lưu trữ các thiết lập người dùng như ngôn ngữ, chế độ tối, và hành tinh được chọn.
- **Multi-language Support**: Hỗ trợ nhiều ngôn ngữ thông qua Vue-i18n.

## Goals
- Tạo một giao diện người dùng thân thiện và dễ sử dụng.
- Tối ưu hóa hiệu suất và trải nghiệm người dùng trên thiết bị di động.
- Cung cấp các tính năng mở rộng cho trò chơi Nine Chronicles.