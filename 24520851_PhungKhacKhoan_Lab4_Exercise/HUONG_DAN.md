# Hướng dẫn Lab 4 — Exercise (step by step + giải nghĩa)

> Phùng Khắc Khoan — 24520851 — MSIS207.R11.CTTT
> React 19 · React Router v7 · Context Form Engine · Express 5 REST API

## 0. Chạy dự án

```bash
cd 24520851_PhungKhacKhoan_Lab4_Exercise
npm install
cp .env.example .env      # chỉnh PORT / CLIENT_ORIGIN / API_DELAY_MS nếu cần
npm run server            # Terminal 1: API http://localhost:3001
npm run dev               # Terminal 2: Vite http://localhost:5173
npm test                  # 47 test (Vitest + Testing Library + Supertest)
```

### Cấu trúc thư mục

```
24520851_PhungKhacKhoan_Lab4_Exercise/
├── project-rules.md          # Quy tắc code + vòng lặp Contract → Fail test → Implement → Refactor
├── TASK_DECOMPOSITION.md     # Chia task theo sprint (mỗi task = 1 commit)
├── AI_FAILURE_AUDIT.md       # Lỗi AI/slide đã gặp và cách sửa
├── .env.example              # Mẫu biến môi trường, không chứa secret
├── shared/messageRules.js    # Luật validate dùng chung client + server
├── server/                   # Express API (app.js tách khỏi server.js để test được)
├── src/
│   ├── App.jsx               # Toàn bộ bảng route
│   ├── components/           # Layout, Skeleton, CommitCounter
│   ├── people/               # Sprint 1: PeopleLayout, PersonDetail
│   ├── form/                 # Sprint 2: FormContext, InputField, SimpleForm, ShowData, legacy/
│   ├── forum/                # Sprint 3: useForumMessages, fetchWithRetry, ForumPage
│   └── auth/                 # Live Defense #4: AuthContext, RequireAuth, LoginPage
├── tests/                    # Test cho từng task
└── docs/                     # Phân tích Ex 1.3, log kiểm chứng, screenshot
```

---

## Sprint 1 — React Router v7

### Ex 1.2 & 1.2.1 — Từ `<Switch>` (v5) sang `<Routes>` (v7)
**File:** `src/App.jsx`, `src/components/Layout.jsx`, `src/main.jsx`

**Bước 1.** Bọc app trong `<BrowserRouter>` ở `main.jsx`. Router lắng nghe URL và cung cấp context cho mọi `Route`, `NavLink`, `useParams`...

**Bước 2.** Khai báo route lồng nhau:
```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```
**Giải nghĩa**
| v5 (cũ) | v7 (mới) | Vì sao đổi |
|---|---|---|
| `<Switch>` | `<Routes>` | v7 chọn route **cụ thể nhất**, không phụ thuộc thứ tự ⇒ bỏ được `exact` |
| `component={About}` | `element={<About />}` | Truyền JSX nên truyền props bình thường |
| `activeClassName="active"` | `className={({ isActive }) => ...}` | Một hàm cho phép style tùy ý theo trạng thái |
| `exact` trên link | `end` trên NavLink | Link "/" chỉ active khi URL đúng bằng "/" |

- `index`: route con mặc định khi URL đúng bằng đường dẫn của cha.
- `path="*"`: bắt mọi URL không khớp ⇒ trang 404.

**Bước 3.** Trong `Layout`, đặt `<Outlet />` ở chỗ muốn hiện trang con. Header/nav chỉ render một lần và **giữ nguyên** khi chuyển trang.

**Kiểm tra:** `tests/router.test.jsx` (Home active, About nằm trong Layout, 404).

### Ex 1.1 — Code splitting với `React.lazy` + `<Suspense>`
**File:** `src/App.jsx`, `src/components/Skeleton.jsx`

**Bước 1.** `const About = lazy(() => import("./pages/About.jsx"))`. Dấu `import()` động báo cho Vite tách file thành **chunk riêng** (`About-xxxx.js`), chỉ tải khi vào `/about` ⇒ bundle ban đầu nhẹ hơn.

**Bước 2.** Bọc component lazy trong `<Suspense fallback={<Skeleton ... />}>`. Khi chunk chưa tải xong, component lazy "treo" (throw promise), React hiện fallback.

**Bước 3.** Skeleton có `minHeight` bằng chiều cao nội dung thật ⇒ khi nội dung thay vào, trang **không nhảy** (CLS = 0). Thêm `role="status"`, `aria-busy="true"`, `aria-live="polite"` để trình đọc màn hình báo "đang tải" mà không cắt lời.

**Kiểm tra:** `npm run build` thấy các chunk `About-*.js`, `PersonDetail-*.js`, `FormPage-*.js`; `tests/lazy.test.jsx`.

### Ex 1.2.2 — Master-Detail (PeopleLayout + PersonDetail)
**File:** `src/people/*`, `src/data/people.js`, CSS `.people-frame`

**Bước 1 — Route 2 cấp:**
```jsx
<Route path="people" element={<PeopleLayout people={PEOPLE} />}>
  <Route index element={<PeopleIndex />} />
  <Route path=":id" element={<PersonDetail people={PEOPLE} />} />
</Route>
```
`:id` là **tham số động**: `/people/p02` ⇒ `id = "p02"`.

**Bước 2 — PeopleLayout:** sidebar là danh sách `NavLink` (Master), vùng phải là `<Outlet />` (Detail).

**Bước 3 — PersonDetail:**
1. `const { id } = useParams()` — lấy `id` từ URL (luôn là **string**, nên dữ liệu mẫu dùng id dạng chuỗi để so sánh `===` không bị lệch kiểu).
2. `people.find((p) => p.id === id)` — có thể trả `undefined`.
3. **Guard 404** trước khi đọc `person.name` ⇒ tránh `TypeError: Cannot read properties of undefined`.
4. Hiển thị bằng `<dl><dt>Thuộc tính</dt><dd>Giá trị</dd></dl>` — thẻ đúng nghĩa cho cặp khóa–giá trị.

**Bước 4 — CSS Grid:** `grid-template-columns: minmax(280px, 1fr) 2fr` ⇒ cột trái không nhỏ hơn 280px, cột phải rộng gấp đôi; màn hình < 720px chuyển 1 cột.

**Kiểm tra:** `tests/people-layout.test.jsx`, `tests/person-detail.test.jsx` (id sai ⇒ 404, NavLink active).

---

## Sprint 2 — Context Form Engine

### Ex 1.3 — Vì sao chuỗi 5 `useEffect` là anti-pattern
Đọc `docs/ex1.3-anti-pattern.md`. Tóm tắt: mỗi `setState` trong `useEffect` = 1 lần render + commit nữa.
Đo thật: **form cũ 4 commit/phím, form mới 1 commit/phím** (trang `/form`, khối "So sánh số commit").

### Bước 1 — FormContext (`feat: form context`)
**File:** `src/form/FormContext.js`, `src/form/validateForm.js`
- `createContext(null)` + hook `useFormContext()` ném lỗi rõ ràng nếu dùng ngoài Provider.
- `validateForm(values)` là **hàm thuần**: chỉ tính toán, không side effect ⇒ gọi trong render thoải mái.

### Bước 2 — SimpleForm + InputField (`feat: input field validation`)
**File:** `src/form/SimpleForm.jsx`, `src/form/InputField.jsx`
```jsx
const [values, setValues] = useState(INITIAL_VALUES);   // state gốc
const errors = validateForm(values);                     // DERIVED: tính trong render
const isValid = Object.keys(errors).length === 0;        // DERIVED
```
**Giải nghĩa:** `errors` luôn khớp với `values` của **chính lần render đó** ⇒ không có trạng thái trung gian sai, không cần `useEffect`.

- Chỉ hiện lỗi khi field đã `blur` hoặc đã bấm Gửi (`touched`, `submitAttempted`) ⇒ người dùng không bị báo lỗi khi chưa kịp gõ.
- `InputField` **không có state riêng**, đọc `values`/`errors` từ Context.
- `useId()` sinh id ổn định, duy nhất ⇒ `<label htmlFor>` ↔ `<input id>` ↔ `<span id={errorId}>`.
- `aria-invalid` báo field lỗi; `aria-describedby` trỏ tới gợi ý + lỗi ⇒ trình đọc màn hình đọc lỗi khi focus.
- Submit lỗi: focus vào field lỗi đầu tiên **trong event handler** (side effect đặt đúng chỗ).

### Bước 3 — ShowData (`feat: inspector output`)
**File:** `src/form/ShowData.jsx`, `src/pages/FormPage.jsx`
- Submit hợp lệ ⇒ lưu snapshot ⇒ `<ShowData data={submitted} />` hiển thị bằng `<dl>` (mỗi cặp bọc `<div>`), mật khẩu được che.

**Kiểm tra:** `tests/validate-form.test.js`, `tests/input-field.test.jsx` (bao gồm test **đúng 1 commit / phím**), `tests/show-data.test.jsx`.

---

## Sprint 3 — Full-stack

### Bước 1 — Express REST API
**File:** `server/app.js`, `server/db.js`, `server/server.js`, `shared/messageRules.js`

| Method | URL | Kết quả |
|---|---|---|
| GET | `/api/forums` | 200 danh sách kênh |
| GET | `/api/messages/:forum` | 200 mảng tin nhắn · 404 kênh lạ |
| POST | `/api/messages/:forum` | 201 tin nhắn mới · 400 thiếu field · 404 kênh lạ |

**Giải nghĩa từng phần**
- `cors({ origin: CLIENT_ORIGIN })`: trình duyệt chặn gọi API khác origin (5173 → 3001) nếu server không trả header `Access-Control-Allow-Origin`. Chỉ cho đúng origin, không dùng `*`.
- `express.json()`: không có thì `req.body` là `undefined` (xem Audit #1).
- **Validate ở server** dù client đã validate — client có thể bị bỏ qua (Postman, curl).
- **Whitelist field**, không spread `...req.body` (Audit #2).
- `createApp()` tách khỏi `listen()` ⇒ Supertest gọi thẳng app không cần mở port.
- `API_DELAY_MS` giả lập mạng chậm; `req.on("close")` ghi log `[aborted]` khi client hủy.

### Bước 2 — Hook `useForumMessages`
**File:** `src/forum/useForumMessages.js`, `src/forum/api.js`
```js
useEffect(() => {
  const controller = new AbortController();
  fetchMessages(controller.signal);      // gắn signal vào fetch
  return () => controller.abort();       // cleanup: đổi kênh/unmount => hủy request cũ
}, [forumId, ...]);
```
**Giải nghĩa — race condition:** bấm `nasa` rồi `notNasa` liền nhau; nếu không hủy, response `nasa` về muộn sẽ ghi đè danh sách `notNasa`. Có 2 lớp bảo vệ:
1. `controller.abort()` hủy request ở tầng mạng (DevTools hiện *canceled*).
2. `if (!controller.signal.aborted) setState(...)` — chặn ghi state nếu response lọt về.

Thêm: kiểm tra `res.ok` (fetch không tự reject khi 404/500), `loading` là derived state, `postMessage` xong thì refetch.

### Bước 3 — Trang đổi kênh
**File:** `src/forum/ForumPage.jsx` — URL `/forum/:channel` (`nasa`, `esports-tribunal`, `notNasa`)
- Tin nhắn render bằng `<dl>` + `<Fragment key={msg.id}>` (nhóm `dt`+`dd` không thêm thẻ thừa).
- Form soạn tin dùng **chung** `validateMessagePayload` với server ⇒ client/server validation parity.

**Kiểm tra trên trình duyệt (yêu cầu Sprint 3):**
1. `npm run server` (delay mặc định 1200ms) + `npm run dev`.
2. DevTools → Network → **Slow 3G**.
3. Bấm nhanh `#nasa` → `#esports-tribunal` → `#notNasa`: request cũ có trạng thái **(canceled)**, terminal server in `[aborted] GET ...`.
4. Kết quả của mình đã lưu ở `docs/verification-log.md` + `docs/screenshots/sprint3-forum.png`.

---

## Live Defense Challenge Bank (luyện trước cho phần vấn đáp 3 phút)

| # | Challenge | File | Ý chính để trình bày |
|---|---|---|---|
| 1 | URL Search Params Sync | `src/people/PeopleLayout.jsx` | Bộ lọc `?q=&team=` nằm trên URL ⇒ F5/copy link giữ trạng thái; danh sách là derived từ URL; `replace: true` để không làm đầy lịch sử; link chi tiết giữ nguyên query |
| 2 | Cross-Field Validation | `src/form/validateForm.js` | Rule nhận `(value, allValues)`; đổi `password` thì lỗi `confirmPassword` cập nhật trong **cùng lần render**, không `useEffect` |
| 3 | Auto-Retry Backoff | `src/forum/fetchWithRetry.js` | Chờ `base × 2ⁿ` + jitter; chỉ retry lỗi tạm thời (mạng, 5xx, 429), **không** retry 4xx; `sleep()` hủy được bằng signal. Thử: gọi `/api/messages/nasa?fail=1` |
| 4 | Protected Route Guard | `src/auth/RequireAuth.jsx` | Layout route không path bọc các route cần bảo vệ; `<Navigate to="/login" replace state={{ from: location }} />`; login xong `navigate(from)`. Nhớ: guard client chỉ ẩn UI, server vẫn phải kiểm tra quyền |

**Gợi ý khi bị "inject bug" lúc vấn đáp:** xem console trước (lỗi đỏ/stack), rồi kiểm tra theo thứ tự: dependency array → cleanup của effect → `key` của list → kiểu dữ liệu `useParams()` (string) → `res.ok`.

## Lịch sử commit (Exercise)

```
chore(lab4-ex): khởi tạo Vite React 19, Router v7, Express và quy tắc dự án
feat(ex1.2): router layout v7 với Routes, Outlet và NavLink isActive
feat(ex1.1): tách chunk route bằng React.lazy và Suspense skeleton
feat(sprint1): router layout PeopleLayout với sidebar NavLink và Outlet
feat(sprint1): detail route handling với useParams, 404 và dl semantic
docs(ex1.3): phân tích useEffect waterfall và demo đo số commit
feat(sprint2): form context và validateForm thuần tính đồng bộ
feat(sprint2): input field validation với useId, aria-invalid và aria-describedby
feat(sprint2): inspector output ShowData và trang so sánh commit
feat(sprint3): Express REST API với CORS, validate payload và log request bị hủy
feat(sprint3): hook useForumMessages hủy request cũ bằng AbortController
feat(sprint3): trang đổi kênh live và log kiểm chứng hủy request
feat(defense): đồng bộ bộ lọc nhân sự với URL bằng useSearchParams
feat(defense): validate chéo nhập lại mật khẩu bằng derived state
feat(defense): tự retry exponential backoff tôn trọng AbortSignal
feat(defense): route guard RequireAuth chuyển hướng login và giữ URL đích
docs(lab4-ex): hướng dẫn step by step và AI failure audit
```
