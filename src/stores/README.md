# Block Management & Persistence

Thư mục này quản lý trạng thái của các Block và đảm bảo dữ liệu được lưu trữ bền vững, đồng bộ giữa giao diện và tiến trình chạy ngầm (Service Worker).

## Luồng hoạt động (Sequence Diagram)

```mermaid
sequenceDiagram
    participant API as Nine Chronicles API
    participant SW as Service Worker (Background)
    participant DB as IndexedDB (Dexie)
    participant Store as Pinia Store (UI)
    participant App as App.vue (Lifecycle)

    Note over App, SW: Khởi tạo
    App->>Store: startAutoFetch()
    App->>SW: Register Periodic Sync (15m)

    rect rgb(240, 240, 240)
        Note over SW, API: Background Loop (Offline/Tab Closed)
        SW->>API: Fetch latest block
        API-->>SW: Block Data
        SW->>DB: Save to 'blocks' table
        SW->>DB: Check 'settings' for threshold
        alt Threshold Reached
            SW->>User: Show Web Notification
        end
    end

    rect rgb(220, 240, 220)
        Note over Store, DB: Foreground UI (Live Updates)
        DB-->>Store: Live Query (Observable)
        Store-->>UI: Reactive update blocks/latestBlock
    end
```

## Các thành phần chính

- `useBlockStore.ts`: Quản lý state và cung cấp các hành động (fetch, set marker).
- `src/db/index.ts`: Cấu hình Dexie DB.
- `src/sw.ts`: Logic chạy ngầm của Service Worker.

## Kiểm thử (Testing)

Mọi logic trong Store và Database đều được kiểm thử tại:

- `src/__tests__/BlockStore.test.ts`: Kiểm tra khởi tạo store và các action chính.
- `src/__tests__/Database.test.ts`: Kiểm tra việc lưu trữ, truy vấn và tính bền vững của dữ liệu trong IndexedDB.
