# Quy tắc dự án Lab 4 — Homework

## Công nghệ
- React 19 + Vite, React Router v7 (`react-router`).
- Express 5 + Mongoose 8 (async/await, không callback), `cors`.
- Vitest + Testing Library + Supertest.

## Vòng lặp Contract-First
Contract (comment/endpoint/props) → Fail test → Implement → Refactor. Mỗi bước hoàn chỉnh = 1 commit.

## Frontend
- Không dùng API Router v5 (`Switch`, `Redirect`, `exact`, `component=`).
- State có thể suy ra thì **không** lưu vào state, không đồng bộ bằng `useEffect`.
- Trạng thái cần chia sẻ qua link (bộ lọc, ảnh đang mở) nằm trên URL (`useSearchParams`).
- Effect gọi mạng phải có `AbortController` + cleanup.
- WCAG 2.2 AA: label cho mọi input, `aria-label` cho nút chỉ có icon, focus nhìn thấy được,
  trả focus về phần tử kích hoạt khi đóng modal, tương phản ≥ 4.5:1, kích thước mục tiêu ≥ 24×24px.
- Ảnh có `width`/`height` cố định (CLS = 0) và `alt` mô tả.

## Backend
- `MONGODB_URI` chỉ đọc từ `process.env`; thiếu thì dừng server với thông báo rõ ràng.
- Không dùng cờ đã bỏ `useNewUrlParser`, `useUnifiedTopology`.
- Mọi query Mongoose dùng `await`; đọc danh sách dùng `.lean()`.
- Luật validate dùng chung client/server đặt trong `shared/`.
- Không spread `req.body` vào document; chỉ lấy field cho phép.
