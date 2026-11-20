# AI Failure Audit — Lab 4 Exercise

Ghi lại các đoạn code (do AI sinh ra hoặc lấy nguyên từ slide) **không chạy đúng**,
bằng chứng phát hiện và cách sửa đã kiểm chứng. Mỗi mục có: Vấn đề → Bằng chứng → Cách sửa.

---

## 1. Thiếu `express.json()` ⇒ `req.body` là `undefined` (slide 27)

### Vấn đề
Code server trong slide đọc `req.body.text` nhưng không đăng ký middleware parse JSON.
Express 5 để `req.body` là `undefined` ⇒ handler ném `TypeError` trước khi kịp trả 400.

### Bằng chứng
Chạy đúng đoạn code slide với Supertest:
```
no express.json(): 500 <!DOCTYPE html> ... <title>Error</title>
TypeError: Cannot read properties of undefined (reading 'text')
```

### Cách sửa
`app.use(express.json({ limit: "10kb" }))` + middleware lỗi trả `400 JSON không hợp lệ`
cho body hỏng (test `JSON hỏng => 400 thay vì 500` trong `tests/server.test.js`).

---

## 2. Mass assignment: `{ id: randomUUID(), ...req.body }` (slide 27)

### Vấn đề
Spread `...req.body` **sau** `id` nên client gửi kèm `id`/`forum` là ghi đè được dữ liệu do server sinh.

### Bằng chứng
```
POST {"text":"a","author":"b","id":"hacked"}  =>  201, body.id = "hacked"
```

### Cách sửa
Whitelist từng field (`author`, `text`), server tự sinh `id`, `forum`, `timestamp`.
Test `POST hợp lệ => 201, id do server sinh (không cho client ghi đè)`.

---

## 3. Ba endpoint khác nhau cho cùng một chức năng (slide 16, 26, 27)

### Vấn đề
- Slide 16: `/api/channels/${channelId}/messages`
- Slide 26: `/api/forums/${forumId}/messages`
- Slide 27 (server): `/api/messages/:forum`

Nếu chép nguyên, client gọi URL mà server không có ⇒ 404 toàn bộ.

### Cách sửa
Chọn **contract của server** (`/api/messages/:forum`) làm nguồn sự thật, ghi trong
comment đầu `server/app.js`, và client dùng đúng URL đó.

---

## 4. Hook trong slide 26 coi response lỗi là dữ liệu và không bật lại `loading`

### Vấn đề
- `fetch()` **không reject** khi server trả 404/500 ⇒ `{ error: "..." }` bị `setData` như một mảng tin nhắn, `data.map` sẽ crash.
- `loading` khởi tạo `true` và chỉ được set `false`; đổi kênh lần 2 thì không còn hiện trạng thái đang tải.

### Cách sửa
- `fetchJson()` kiểm tra `res.ok`, ném `HttpError(status, body)`.
- Lưu kết quả kèm `key = forumId#version`; `loading = result.key !== requestKey` là **derived state**
  ⇒ không cần `setLoading(true)` trong effect.
- Test: `HTTP 404 được đưa vào error thay vì coi là dữ liệu`.

---

## 5. JSX không hợp lệ trong slide 10 và 22

### Vấn đề
- Slide 10: `Layout` trả về `<nav>` và `<Outlet />` là hai phần tử ngang hàng không bọc Fragment ⇒ lỗi cú pháp JSX.
- Slide 10: `<NavLink>` không có prop `to` ⇒ React Router báo lỗi.
- Slide 22: dòng `// Render layout frame wrapping child routes` nằm **trong JSX** ⇒ được render thành chữ trên màn hình.

### Cách sửa
Bọc bằng `<>...</>`, luôn truyền `to`, comment trong JSX viết dạng `{/* ... */}`.

---

## 6. Trùng `id` khi render 2 form trên cùng trang (lỗi phát sinh khi làm)

### Vấn đề
Bản đầu của `SimpleForm` dùng `id="form-title"` cố định cho `aria-labelledby`.
Trang `/form` render 2 `SimpleForm` (form chính + form đo commit) ⇒ trùng id, sai tên accessible.

### Bằng chứng
```
TestingLibraryElementError: Unable to find role="form" and name "Form mới (Context + derived state)"
```

### Cách sửa
`const titleId = useId()` + prop `title`. Đây đúng là lý do slide nhấn mạnh `useId()`.

---

## 7. Số commit của anti-pattern không đúng như slide (Ex 1.3)

### Vấn đề
Slide ghi "5 re-renders / 1 keypress". Đo thật bằng `<Profiler>` trên React 19 ra **4 commit**
vì React gộp hai `setState` xảy ra trong cùng một nhịp effect.

### Cách xử lý
Ghi đúng số đo thật (4 commit cũ so với 1 commit mới) trong `docs/verification-log.md`;
test chỉ khẳng định `>= 4`, không chép số của slide.

---

## 8. Không phải bug: mỗi request bị hủy 2 lần ở chế độ dev

### Quan sát
Khi kiểm tra mạng, mỗi kênh có 2 request `ERR_ABORTED`.

### Phân tích
`<StrictMode>` (chỉ ở dev) cố ý chạy effect → cleanup → effect để phát hiện thiếu cleanup.
Request đầu bị `abort()` đúng như thiết kế. Build production không có lần chạy kép.

---

## 9. `scrollIntoView` không tồn tại trong jsdom

### Vấn đề
Test trang `/form` báo `Unhandled TypeError: scrollIntoView is not a function`.

### Cách sửa
Giả lập trong `tests/setup.js` (chỉ môi trường test, có guard `typeof Element`
để test server chạy ở môi trường `node` không lỗi).
