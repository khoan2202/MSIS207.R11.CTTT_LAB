# Exercise 1.3 — Phân tích anti-pattern "useEffect waterfall"

## 1. Code cũ làm gì?
`src/form/legacy/LegacyForm.jsx` tái hiện chuỗi trong slide:

| # | Vị trí | Việc làm | Hệ quả |
|---|--------|----------|--------|
| 1 | InputField | `useEffect(() => onSync(value), [value])` | Cha chỉ biết giá trị **sau** khi con đã commit → cha render thêm 1 lần |
| 2 | SimpleForm | `useEffect(() => setErrors(validate(values)), [values])` | Lỗi được tính trễ 1 nhịp → thêm 1 render |
| 3 | SimpleForm | `useEffect(() => setIsValid(!errors.x), [errors])` | Validity trễ thêm 1 nhịp → thêm 1 render |
| 4 | InputField | `useEffect(() => setLocalError(error), [error])` | Sao chép props vào state → thêm 1 render, dễ lệch dữ liệu |
| 5 | SimpleForm | `useEffect(scrollToError, [errors])` | Đọc DOM sau mỗi lần errors đổi |

**Kết quả đo** (trang `/form`, khối "So sánh số commit", gõ 1 ký tự rồi bấm "Xem số commit"):
form cũ tạo khoảng **4–5 commit / 1 phím**, form mới chỉ **1 commit / 1 phím** (số đo thật ghi trong `docs/verification-log.md`).

## 2. Vì sao nguy hiểm?
- **Cascading re-render**: mỗi `setState` trong effect là một vòng render + commit mới.
- **Trạng thái trung gian sai**: giữa các nhịp, UI có thể hiện `isValid = true` trong khi `errors` đã có lỗi (dữ liệu "rách").
- **Vòng lặp vô hạn**: nếu effect #4 gọi ngược `onSync`, hoặc thiếu dependency array, React ném `Maximum update depth exceeded`.
- **Race condition**: nếu validate là async, kết quả của phím cũ có thể về sau phím mới và ghi đè.

## 3. Cách sửa (Sprint 2)
- **Một nguồn sự thật**: `values` chỉ nằm ở `SimpleForm`; `InputField` đọc qua Context, không có state riêng.
- **Derived state**: `const errors = validateForm(values)` tính ngay **trong render** → luôn đồng bộ với values, không cần effect.
- `isValid = Object.keys(errors).length === 0` cũng là giá trị suy ra.
- Cuộn/focus vào lỗi chỉ làm trong **event handler** `onSubmit`, không làm trong effect.

> Quy tắc nhớ: *"Nếu một giá trị tính được từ props/state hiện có, đừng lưu nó vào state và đừng đồng bộ nó bằng useEffect."*
