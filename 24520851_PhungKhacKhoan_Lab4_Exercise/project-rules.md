# Quy tắc dự án Lab 4 — Exercise

## Công nghệ
- React 19 + Vite, React Router v7 (import từ `react-router`).
- Express 5 + `cors` cho REST API.
- Vitest + Testing Library + Supertest cho kiểm thử.

## Vòng lặp 4 bước (Contract-First)
1. **Contract**: viết interface/props/endpoint trước.
2. **Fail test**: viết test mô tả hành vi, chạy để thấy test đỏ.
3. **Implement**: viết code tối thiểu để test xanh.
4. **Refactor**: làm gọn code, giữ test xanh.

## Quy tắc React
- Không dùng cú pháp Router v5: `<Switch>`, `<Redirect>`, `exact`, `component=`, `activeClassName`.
- Không dùng `Component.defaultProps`; dùng default parameter.
- Validation tính **đồng bộ trong render** (derived state), không dùng `useEffect` để validate.
- Mọi `useEffect` gọi mạng phải có `AbortController` và cleanup `controller.abort()`.
- Dependency array của `useEffect` phải đầy đủ.
- Dùng `useId()` để gắn `label` ↔ `input` ↔ thông báo lỗi.
- Nút chỉ có icon phải có `aria-label`.

## Quy tắc Server
- Không hardcode secret; đọc cấu hình từ `process.env` (xem `.env.example`).
- Validate payload POST ở server dù client đã validate.
- Trả mã lỗi đúng: 400 (payload sai), 404 (không tìm thấy), 201 (tạo mới).

## Git
- Commit nguyên tử theo từng task, dùng Conventional Commits: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.
