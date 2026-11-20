// Sprint 2 — Hàm validate THUẦN (pure function): cùng input => cùng output, không side effect.
// Vì thuần nên gọi được ngay trong render mà không gây render thêm,
// và test được không cần DOM.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Mỗi rule nhận (value, allValues) và trả về chuỗi lỗi hoặc "" nếu hợp lệ.
// Tham số allValues cho phép rule phụ thuộc nhiều field (cross-field).
export const RULES = {
  fullName: (v) => {
    const name = v.trim();
    if (!name) return "Vui lòng nhập họ tên.";
    if (name.length < 2) return "Họ tên cần ít nhất 2 ký tự.";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Vui lòng nhập email.";
    return EMAIL_RE.test(v.trim()) ? "" : "Email chưa đúng định dạng (vd: ten@uit.edu.vn).";
  },
  age: (v) => {
    if (v === "") return "Vui lòng nhập tuổi.";
    const n = Number(v);
    if (!Number.isInteger(n)) return "Tuổi phải là số nguyên.";
    if (n < 16 || n > 100) return "Tuổi phải từ 16 đến 100.";
    return "";
  },
  password: (v) => {
    if (v.length < 8) return "Mật khẩu cần ít nhất 8 ký tự.";
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Mật khẩu cần có cả chữ và số.";
    return "";
  },
  // Live Defense #2 — Cross-field validation: rule đọc field khác qua tham số thứ 2.
  // Vẫn là hàm thuần trong render => đổi "password" thì lỗi "confirmPassword"
  // cập nhật NGAY trong cùng lần render, không cần useEffect theo dõi password.
  confirmPassword: (v, all) => {
    if (!v) return "Vui lòng nhập lại mật khẩu.";
    return v === all.password ? "" : "Mật khẩu nhập lại không khớp.";
  },
};

export const INITIAL_VALUES = { fullName: "", email: "", age: "", password: "", confirmPassword: "" };

// Trả về object chỉ chứa các field đang lỗi: { email: "..." }.
// Object rỗng => form hợp lệ.
export function validateForm(values, rules = RULES) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field] ?? "", values);
    if (message) errors[field] = message;
  }
  return errors;
}
