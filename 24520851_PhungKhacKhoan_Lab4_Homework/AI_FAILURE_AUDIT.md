# AI Failure Audit — Lab 4 Homework

Ghi lại code AI sinh ra / code mẫu trong slide **không chạy đúng**, bằng chứng và cách sửa đã kiểm chứng.

---

## HW1 — Photo & Evidence Gallery

### 1. `onClose={() => setSearchParams({})}` xóa luôn bộ lọc và làm hỏng nút Forward (slide 30)
**Vấn đề**
- `setSearchParams({})` xóa **mọi** tham số, kể cả `?category=` ⇒ đóng ảnh là mất bộ lọc.
- Khi người dùng bấm **Back**, URL đã hết `?photo` ⇒ effect gọi `dialog.close()` ⇒ sự kiện `close`
  ⇒ `onClose` lại `navigate` thêm một mục lịch sử ⇒ nút **Forward** không còn dùng được.

**Cách sửa** (`src/gallery/GalleryPage.jsx`)
- Cập nhật kiểu functional: `next = new URLSearchParams(prev); next.delete("photo")` ⇒ giữ `category`.
- Chỉ navigate nếu URL **vẫn còn** `photo` (đóng do Back thì không làm gì thêm).
- Mở ảnh = push (Back đóng ảnh); chuyển ảnh ←/→ = `replace` (không làm dài lịch sử).

**Bằng chứng sau khi sửa** (Playwright, `docs/verification-log.md`): Back ⇒ dialog đóng, Forward ⇒ mở lại đúng ảnh.

### 2. Alt text không khớp nội dung ảnh
**Vấn đề:** bản đầu ghi alt "Mặt hồ phản chiếu…", "Cây cầu dây văng…", "Biểu đồ độ trễ…" trong khi ảnh SVG
sinh ra thực tế là núi, dãy nhà và biên bản. Alt sai còn tệ hơn không có alt với người dùng trình đọc màn hình.
**Phát hiện:** render 12 ảnh ra screenshot rồi so với alt.
**Cách sửa:** viết lại alt và tiêu đề mô tả đúng hình.

### 3. Test focus `<dialog>` trong jsdom
`dialog.focus()` không có tác dụng vì `<dialog>` không focusable ⇒ test phím mũi tên fail.
Sửa test: focus vào nút "Đóng ảnh" bên trong dialog (giống trình duyệt thật với `autoFocus`).

---

## HW2 — Card-Swipe Deck

### 4. `handlePointerUp` đọc `startPos.x` khi `startPos` có thể là `null` (slide 31)
**Vấn đề:** pointerup tới mà không có pointerdown trước (bắt đầu kéo từ ngoài lá bài, multi-touch)
⇒ `TypeError: Cannot read properties of null (reading 'x')`.
**Cách sửa:** guard `if (!drag || e.pointerId !== drag.pointerId) return;` + `setPointerCapture`.
Test: `pointerup không có pointerdown trước đó không gây crash`.

### 5. Công thức điểm `LIKE ? +10 : -5` trừ điểm cả "siêu thích" (slide 31)
Mọi action khác LIKE đều bị −5, nên ArrowUp (superlike) lại bị **trừ** điểm.
**Cách sửa:** bảng trọng số tường minh dùng chung client/server `SCORE_WEIGHTS = { like: 10, superlike: 25, nope: -5 }`.

### 6. `Swipe.create(req.body)` — mass assignment (slide 32)
Client gửi được field tùy ý vào document. **Sửa:** validate bằng `shared/swipeRules.js` rồi chỉ lấy
`clientId, sessionId, profileId, action`.

### 7. Race condition: Undo có thể tới server TRƯỚC lệnh lưu
**Vấn đề:** swipe rồi bấm Backspace ngay ⇒ `POST` và `DELETE` chạy song song; nếu `DELETE` tới trước,
server xóa "không có gì" rồi `POST` mới ghi ⇒ lượt đã hoàn tác vẫn nằm trong DB, F5 thấy lại.
**Cách sửa:** hàng đợi ghi tuần tự (promise chain) trong `useSwipeDeck` + `clientId` do client sinh để DELETE
không phải chờ `_id` từ server. Test: `swipe rồi undo thật nhanh: DELETE luôn gửi SAU POST`.

### 8. Lá bài trên cùng bị trong suốt (lỗi phát sinh khi làm)
**Vấn đề:** `<article style={{ "--hue": hue, ...rest.style }} {...rest}>` — `{...rest}` đứng sau nên `rest.style`
(kể cả `undefined`) **ghi đè** toàn bộ `style`, mất biến `--hue` ⇒ nền trong suốt, chữ chồng lên lá phía sau.
**Phát hiện:** screenshot Playwright khi kéo (test jsdom vẫn xanh vì jsdom không vẽ CSS).
**Cách sửa:** tách `style` ra khỏi `rest` rồi gộp; thêm test hồi quy kiểm tra `--hue`.

---

## HW3 — Appeal Tribunal

### 9. `resyncTimerWithServer()` không tồn tại và listener không được gỡ (slide 33)
**Vấn đề:**
- Hàm `resyncTimerWithServer` không được định nghĩa ở đâu (API "ảo").
- `document.addEventListener("visibilitychange", …)` gọi trực tiếp, không cleanup ⇒ mỗi lần mount thêm một listener (rò rỉ).

**Cách sửa:** `useAppealSlaTimer` tự đo offset qua `GET /api/time` (bù RTT/2), đăng ký listener trong `useEffect`
và `removeEventListener` + `abort()` trong cleanup.

### 10. Route viết cứng cho từng người chơi (slide 33)
`<Route path="/dossier/himass">`, `<Route path="/dossier/tanvuu">` — thêm người chơi phải sửa code.
**Sửa:** một route động `/dossier/:playerID` + `useParams()` + 404 khi không có hồ sơ (đúng yêu cầu spec).

### 11. Ma trận tính trung vị trên giá trị đã làm tròn
**Vấn đề:** ratio 7/3 được làm tròn 2.33 **trước** khi lấy trung vị ⇒ sai số lan sang chỉ số.
Đồng thời test viết tay kỳ vọng chỉ số Himass = 3.5 (tính nhẩm sai).
**Bằng chứng:** chạy `computeMatrix` thật cho ra 3.66 (làm tròn trước) / 3.65 (giá trị thô).
**Sửa:** tính trên số thô, chỉ làm tròn khi hiển thị; test dùng số tính lại bằng code.

### 12. Test "zero-drift" ban đầu đặt kỳ vọng sai
So `remaining` với `Date.now()` tại thời điểm bất kỳ ⇒ lệch ~220 ms vì UI chỉ cập nhật theo nhịp giây
(đúng thiết kế). Sửa test: đo **sai số tối đa < 1 nhịp và không tăng** sau 120 nhịp bị trễ 37 ms
(kiểu trừ dồn sẽ lệch ≈ 4,4 s).

### 13. 404 cho trạng thái "chưa nộp đơn" làm bẩn console
`GET /api/appeals/:id` trả 404 khi chưa có đơn ⇒ Chrome in 2 dòng đỏ "Failed to load resource".
"Chưa nộp" là trạng thái bình thường ⇒ đổi sang **200 + `null`**.

### 14. Tương phản màu dưới 4.5:1
Lighthouse báo `color-contrast` trên mã vụ trong sidebar (`opacity: 0.85` ⇒ 4.32:1). Bỏ opacity ⇒ Accessibility 100.

---

## Giới hạn kiểm chứng (ghi trung thực)
- Môi trường làm bài không tải được MongoDB (`fastdl.mongodb.org` bị chặn) nên **chưa chạy với MongoDB thật**.
  Đã kiểm chứng: API qua Supertest với model giả có cùng interface, schema Mongoose 8 bằng `validateSync()`,
  server dừng đúng khi thiếu `MONGODB_URI` và báo `MongooseServerSelectionError` khi không có DB.
  Cần chạy lại `npm run seed && npm run server` với MongoDB thật trước khi nộp (xem `HUONG_DAN.md`).
- Lighthouse Accessibility 100 chỉ bao gồm kiểm tra tự động; phần bàn phím/focus đã kiểm tra bằng Playwright,
  chưa thử với trình đọc màn hình thật (NVDA/VoiceOver).
