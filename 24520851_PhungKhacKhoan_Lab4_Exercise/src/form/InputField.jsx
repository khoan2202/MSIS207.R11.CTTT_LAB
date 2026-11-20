import { useId } from "react";
import { useFormContext } from "./FormContext.js";

// Sprint 2 contract — InputField.
// - Không có state riêng: value/error lấy từ Context (một nguồn sự thật duy nhất).
// - useId() sinh id ổn định, duy nhất (kể cả khi render nhiều form) cho label ↔ input ↔ lỗi.
// - aria-invalid báo trạng thái lỗi; aria-describedby trỏ tới đoạn mô tả lỗi/gợi ý
//   để trình đọc màn hình đọc lỗi ngay khi focus vào ô.
export function InputField({ name, label, type = "text", hint = "", ...props }) {
  const { values, visibleErrors, handleChange, handleBlur } = useFormContext();
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const error = visibleErrors[name];

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && <small id={hintId} className="field-hint">{hint}</small>}
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
}
