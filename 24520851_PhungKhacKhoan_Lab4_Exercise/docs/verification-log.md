# Nhật ký kiểm chứng — Lab 4 Exercise

## Sprint 3 — Hủy request khi đổi kênh nhanh (2026-11-20)

**Cách chạy**: `API_DELAY_MS=1500 npm run server` + `npm run dev`, mở `/forum/nasa`,
bấm `#esports-tribunal` rồi `#notNasa` trong vòng < 1,5 giây (trước khi response về).
Có thể làm tay bằng Chrome DevTools → Network → **Slow 3G**; ở đây dùng Playwright + Chrome headless để tự động hóa.

**Network phía trình duyệt** (Playwright `requestfailed` / `requestfinished`):
```
FAILED http://localhost:3001/api/messages/nasa -> net::ERR_ABORTED
FAILED http://localhost:3001/api/messages/nasa -> net::ERR_ABORTED
FAILED http://localhost:3001/api/messages/esports-tribunal -> net::ERR_ABORTED
FAILED http://localhost:3001/api/messages/esports-tribunal -> net::ERR_ABORTED
FAILED http://localhost:3001/api/messages/notNasa -> net::ERR_ABORTED
OK     http://localhost:3001/api/messages/notNasa
OK     http://localhost:3001/api/messages/notNasa   (POST tin nhắn mới)
OK     http://localhost:3001/api/messages/notNasa   (refetch sau POST)
```
> Mỗi kênh bị hủy 2 lần vì ở chế độ dev `<StrictMode>` cố ý chạy effect → cleanup → effect một lần.
> Đây là hành vi mong đợi: nó chứng minh cleanup `controller.abort()` hoạt động. Bản build production không có lần chạy kép này.

**Log phía server** (`[aborted]` do `req.on("close")` trong `server/app.js`):
```
API chạy tại http://localhost:3001 (CORS: http://localhost:5173, delay: 1500ms)
[aborted] GET /api/messages/nasa — client đã hủy request
[aborted] GET /api/messages/nasa — client đã hủy request
[aborted] GET /api/messages/esports-tribunal — client đã hủy request
[aborted] GET /api/messages/notNasa — client đã hủy request
```

**Kết quả UI**: chỉ hiện tin nhắn của `#notNasa` (không bị dữ liệu nasa về muộn ghi đè).
POST "Test POST từ Playwright" trả 201 và danh sách tự refetch — xem `screenshots/sprint3-forum.png`.

**Console**: không có warning/error của React. (Lỗi 404 duy nhất là `/favicon.ico`, đã sửa bằng `<link rel="icon" href="data:,">`.)

## Ex 1.3 — Số commit / 1 phím
- Form cũ (5 useEffect): **4 commit** (test `tests/legacy-cascade.test.jsx`; React 19 gộp 2 setState cùng nhịp nên không đủ 5).
- Form mới (derived state): **1 commit** (test `tests/input-field.test.jsx`).
