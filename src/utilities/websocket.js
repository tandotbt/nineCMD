export function useWebSocket(url, onMessageCallback) {
    let ws = null;
    let isConnected = false;

    function connect() {
        ws = new WebSocket(url);

        ws.addEventListener('open', () => {
            isConnected = true;
            console.log('Connected to WebSocket server');
            // Khởi động gửi Heartbeat mỗi 30 giây
            startHeartbeat();
        });

        ws.addEventListener('message', (event) => {
            // console.log('Received message:', event.data);
            if (typeof onMessageCallback === 'function') {
                onMessageCallback(event.data);
            }
        });

        ws.addEventListener('close', () => {
            isConnected = false;
            console.log('Disconnected from WebSocket server');
            // Dừng gửi Heartbeat khi ngắt kết nối
            stopHeartbeat();
            // Thử kết nối lại sau 5 giây
            setTimeout(connect, 5000);
        });

        ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    function startHeartbeat() {
        setInterval(() => {
            if (isConnected && ws) {
                console.log('Sending heartbeat');
                ws.send('ping');
            }
        }, 30000);
    }

    function stopHeartbeat() {
        clearInterval(startHeartbeat);
    }

    // Tự động kết nối khi tạo instance của WebSocket
    connect();
    return ws;
}
