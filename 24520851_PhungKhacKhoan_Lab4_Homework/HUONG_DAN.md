# Hướng dẫn Lab 4 — Homework (step by step + giải nghĩa)

> Phùng Khắc Khoan — 24520851 — MSIS207.R11.CTTT
> Ghi chú đánh số: slide 19–21 ghi "Homework 1, 1, 2", slide contract 30–33 ghi "Homework 3, 4, 4".
> Repo đặt theo thứ tự xuất hiện: **HW1 Gallery · HW2 Swipe Deck · HW3 Appeal Tribunal**.

## 0. Chạy dự án

```bash
cd 24520851_PhungKhacKhoan_Lab4_Homework
npm install
cp .env.example .env        # điền MONGODB_URI (MongoDB local hoặc Atlas)
npm run seed                # nạp 8 hồ sơ hẹn hò + 2 dossier (hạn SLA tính từ lúc seed)
npm run server              # Terminal 1: API http://localhost:3002
npm run dev                 # Terminal 2: Vite http://localhost:5174
npm test                    # 73 test
```
- HW1 (Gallery) chạy được **không cần** server.
- HW2, HW3 cần server + MongoDB. Thiếu `MONGODB_URI` server dừng ngay với thông báo `MONGODB_URI missing`.
- Cài MongoDB local nhanh nhất: `docker run -d -p 27017:27017 --name mongo mongo:8`.

### Cấu trúc thư mục
```
24520851_PhungKhacKhoan_Lab4_Homework/
├── project-rules.md · TASK_DECOMPOSITION.md · AI_FAILURE_AUDIT.md · .env.example
├── shared/                 # Luật dùng chung client + server
│   ├── swipeRules.js       #   HW2: action hợp lệ, trọng số điểm, validate payload
│   └── appealRules.js      #   HW3: lý do, kết quả, validate đơn (có cross-field)
├── server/
│   ├── app.js              # createApp({ models }) — tách khỏi listen() để test
│   ├── db.js               # Kết nối Mongoose 8, chặn thiếu MONGODB_URI
│   ├── models/             # Profile, Swipe, Dossier, Appeal
│   ├── routes/             # swipeRoutes.js, tribunalRoutes.js
│   ├── data/ · seed.js     # Dữ liệu giả lập + script seed
│   └── server.js
├── src/
│   ├── gallery/            # HW1
│   ├── swipe/              # HW2
│   ├── tribunal/           # HW3
│   ├── form/FormEngine.jsx # Context Form Engine dùng lại được
│   └── lib/                # api.js (fetchJson), useFetchJson.js
├── scripts/generate-photos.mjs
├── tests/                  # 11 file test
└── docs/                   # verification-log.md, screenshots/, lighthouse/
```

---

## HW1 — Production Multi-Route Photo & Evidence Gallery

**Yêu cầu:** deep link bằng `useSearchParams()` (lọc + ảnh đang mở), lightbox bằng `<dialog>`, WCAG 2.2 AA, Lighthouse 100.

### Bước 1 — Dữ liệu và ảnh (`src/gallery/photos.js`, `scripts/generate-photos.mjs`)
- 12 ảnh SVG tự sinh (1–9 KB/ảnh) ⇒ tải rất nhanh, không phụ thuộc mạng ngoài.
- Mỗi ảnh có `width/height` ⇒ trình duyệt giữ chỗ trước khi ảnh tải ⇒ **CLS = 0**.
- `alt` mô tả đúng nội dung hình (kiểm tra bằng screenshot — xem Audit #2).

### Bước 2 — Lọc bằng URL (`GalleryPage.jsx`)
```js
const [searchParams] = useSearchParams();
const category = searchParams.get("category");          // đọc từ URL
const visible = filterPhotos(PHOTOS, category);         // DERIVED, không useState
```
**Giải nghĩa:** URL là nguồn sự thật ⇒ copy link `/gallery?category=city` gửi người khác thấy đúng bộ lọc, F5 không mất.
Chip lọc là `<Link>` thật (có `aria-current="page"` cho chip đang chọn) nên mở tab mới / chuột giữa vẫn hoạt động.

### Bước 3 — Lightbox `<dialog>` (`Lightbox.jsx`)
- `?photo=c2` trên URL ⇒ `selected` (derived) ⇒ effect gọi `dialog.showModal()`.
  Đây là trường hợp **đúng** để dùng `useEffect`: đồng bộ React với API bên ngoài (DOM), không phải để tính state.
- `showModal()` cho sẵn: focus trap, phần còn lại của trang thành inert, Esc để đóng, `aria-modal`.
- Đóng ⇒ xóa `photo` nhưng **giữ** `category`; trả focus về đúng thumbnail (WCAG 2.4.3 Focus Order).
- ←/→ chuyển ảnh theo vòng (`replace: true` để không làm dài lịch sử); nút chỉ có icon đều có `aria-label`.
- Back của trình duyệt đóng ảnh, Forward mở lại (xem Audit #1 về lỗi của code slide).

### Bước 4 — Kiểm tra
- `npm run build && npm run preview` → Lighthouse: **100/100/100/100**, CLS 0 (`docs/lighthouse/`).
- Bàn phím: Tab tới ảnh → Enter mở → ←/→ → Esc đóng → focus quay lại ảnh.

---

## HW2 — Full-Stack Card-Swipe Deck ("Hẹn Hò Nhưng Không Yêu")

**Yêu cầu:** bàn phím + pointer, undo stack LIFO, điểm bất đối xứng là derived state, Express + Mongoose 8 async/await.

### Bước 1 — Logic thuần (`src/swipe/swipeLogic.js`)
Nguồn sự thật **duy nhất** là `history` — một stack:
```js
history = [{ clientId, profileId, action }, ...]   // phần tử cuối = lượt mới nhất
remaining = profiles chưa có trong history           // derived
score     = Σ SCORE_WEIGHTS[action]                  // derived: like +10, superlike +25, nope −5
undo      = history.slice(0, -1)                     // pop — LIFO
```
**Giải nghĩa:** vì bộ bài và điểm đều *suy ra* từ history, undo chỉ cần pop 1 phần tử — lá bài tự quay lại,
điểm tự tính lại, không thể lệch nhau. `useReducer(historyReducer)` gom mọi thay đổi vào một chỗ.

### Bước 2 — Backend Mongoose 8 (`server/`)
| Method | URL | Ý nghĩa |
|---|---|---|
| GET | `/api/profiles` | `Profile.find().sort({ order: 1 }).lean()` |
| GET | `/api/swipes?sessionId=` | Khôi phục lịch sử phiên sau F5 |
| POST | `/api/swipes` (alias `/api/swipe`) | 201 mới · 200 trùng `clientId` (idempotent) · 409 swipe trùng hồ sơ |
| DELETE | `/api/swipes/:clientId` | Undo — 204, gọi lại vẫn 204 |

Điểm cần nói khi vấn đáp:
- `mongoose.connect(process.env.MONGODB_URI)` — **không** `useNewUrlParser/useUnifiedTopology` (đã bỏ).
- Mọi query dùng `await`, **không** callback (`.exec((err, doc) => …)` đã bị xóa ở Mongoose 7+).
- `.lean()` trả object thuần ⇒ nhanh hơn khi chỉ đọc.
- Unique index `(sessionId, profileId)` chặn swipe trùng ở tầng DB; lỗi `11000` được dịch thành 200/409.
- `createApp({ models })` nhận model qua tham số ⇒ test dùng model giả, không cần DB.

### Bước 3 — Hook `useSwipeDeck` (optimistic + hàng đợi)
- Swipe/undo cập nhật UI **ngay**, gọi server ở nền; server lỗi ⇒ rollback + thông báo.
- Hàng đợi tuần tự `queue = queue.then(task)` ⇒ DELETE luôn chạy sau POST (Audit #7).
- `clientId = crypto.randomUUID()` sinh ở client ⇒ undo không phải chờ server trả `_id`.

### Bước 4 — Giao diện (`SwipePage.jsx`)
- **Bàn phím** trên vùng bộ bài (`tabIndex={0}`): ← bỏ qua, → thích, ↑ siêu thích, Backspace hoàn tác.
- **Pointer Events** (chuột + cảm ứng + bút dùng chung): `pointerdown` → `setPointerCapture` → `pointermove` dịch lá bài
  → `pointerup` đổi độ dời thành action qua `gestureToAction` (ngưỡng 100px). CSS `touch-action: none` để kéo không cuộn trang.
- `aria-live` thông báo "Thích Lan (+10). Điểm: 10." sau mỗi thao tác; các nút có nhãn chữ + `aria-keyshortcuts`.

---

## HW3 — Full-Stack Esports Fair-Play Appeal Tribunal

> Dữ liệu vụ việc là **case study giả lập** (ghi rõ trên giao diện), không phản ánh sự việc có thật.

### Bước 1 — Contract dùng chung (`shared/appealRules.js`)
Một hàm `validateAppeal(values)` chạy ở **cả** client (báo lỗi real-time) và server (không tin client).
Có cross-field: chọn lý do "Có bằng chứng mới" thì `evidenceUrl` bắt buộc và phải là `https://`.

### Bước 2 — Backend
| Method | URL | Ý nghĩa |
|---|---|---|
| GET | `/api/time` | `{ now }` — đồng hồ chuẩn, `Cache-Control: no-store` |
| GET | `/api/dossiers`, `/api/dossiers/:playerID` | Hồ sơ (không phân biệt hoa thường) |
| GET | `/api/appeals/:playerID` | Đơn đã nộp hoặc `null` |
| POST | `/api/appeals` | 201 · 400 (fields) · 404 · 409 đã nộp · **422 quá hạn theo đồng hồ server** |

### Bước 3 — Route động + ma trận (`DossierLayout.jsx`, `DossierView.jsx`, `matrix.js`)
- `/dossier` (layout + sidebar) → `index` | `:playerID` (`useParams`), id lạ ⇒ 404.
- **Ma trận bất tương xứng**: `ratio = ngày cấm / bậc nghiêm trọng`; `chỉ số = ratio hiện tại / trung vị ratio tiền lệ`;
  > 1.5 ⇒ cảnh báo. Tính bằng `useMemo(() => computeMatrix(dossier), [dossier])` — derived, không state.
  Himass: 7 / 1.92 ≈ **3.65** (bất tương xứng) · TanVuu: 2 / 1.5 ≈ **1.33** (trong khoảng tiền lệ).

### Bước 4 — `useAppealSlaTimer` zero-drift
```js
remaining = deadline - (Date.now() + offset)    // tính lại mỗi render, KHÔNG trừ dồn
offset    = serverNow + RTT/2 - t1               // đo qua GET /api/time
```
- Nhịp `setTimeout` chỉ để "nhắc render", hẹn đúng vào ranh giới giây của `remaining`.
- `visibilitychange → visible`: tính lại ngay + đồng bộ lại server (tab nền bị trình duyệt hãm timer).
- Listener được gỡ và request được `abort()` trong cleanup.
- Con số đổi mỗi giây không nằm trong `aria-live`; chỉ thông báo khi đổi mức (còn < 1 giờ, < 10 phút, hết hạn).

### Bước 5 — Form khiếu nại (`src/form/FormEngine.jsx`, `AppealForm.jsx`)
- `FormEngine` (Context): `errors = validate(values)` trong render, field đọc qua `useFormEngine()`, `useId` + `aria-invalid` + `aria-describedby`.
- Lỗi 400 từ server gắn vào đúng field và tự xóa khi người dùng sửa field đó.
- `expired` lấy từ hook timer ⇒ hết hạn thì form bị khóa; server vẫn chặn 422 nếu client cố gửi.
- Nộp xong hiện biên nhận; F5 vẫn thấy (đọc `GET /api/appeals/:playerID`).

---

## Lịch sử commit (Homework)
```
chore(lab4-hw): khởi tạo Vite React 19, Router v7, Express, Mongoose 8 và quy tắc dự án
feat(hw1): dữ liệu ảnh và script sinh ảnh SVG có kích thước cố định
feat(hw1): lưới ảnh và bộ lọc category đồng bộ useSearchParams
feat(hw1): lightbox dialog deep link ?photo, trả focus và điều hướng phím mũi tên
docs(hw1): lưu kết quả Lighthouse 100 và kiểm tra bàn phím lightbox
feat(hw2): undo stack LIFO và điểm bất đối xứng dạng derived state
feat(hw2): Mongoose 8 models và Express API swipe idempotent, chặn thiếu MONGODB_URI
feat(hw2): hook useSwipeDeck optimistic update, hàng đợi ghi tuần tự và khôi phục phiên
feat(hw2): giao diện swipe bàn phím và pointer kéo thả, bảng điểm và lịch sử
feat(hw3): contract đơn khiếu nại, luật validate dùng chung và ma trận bất tương xứng
feat(hw3): Dossier/Appeal models, API thời gian server và chặn khiếu nại quá hạn SLA
feat(hw3): route động /dossier/:playerID và bảng ma trận bất tương xứng
feat(hw3): hook useAppealSlaTimer zero-drift đồng bộ đồng hồ server và visibilitychange
feat(hw3): form khiếu nại Context validate real-time, gửi server và hiện biên nhận
fix(hw3): tăng tương phản mã vụ trong sidebar đạt WCAG AA và lưu kết quả Lighthouse
docs(lab4-hw): hướng dẫn step by step và AI failure audit
```
