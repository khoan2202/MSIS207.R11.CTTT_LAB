import { useId, useState } from "react";
import { FormContext } from "./FormContext.js";
import { InputField } from "./InputField.jsx";
import { validateForm, INITIAL_VALUES } from "./validateForm.js";

// Sprint 2 contract — SimpleForm: "động cơ" form dựa trên Context, KHÔNG có useEffect.
export function SimpleForm({ onValidSubmit = () => {}, title = "Form mới (Context + derived state)" }) {
  // useId cho tiêu đề: trang /form render 2 SimpleForm, id cố định sẽ bị trùng.
  const titleId = useId();
  // State tối thiểu: chỉ những gì người dùng nhập / thao tác.
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // DERIVED STATE — tính ngay trong render, luôn khớp với values hiện tại.
  const errors = validateForm(values);
  const isValid = Object.keys(errors).length === 0;
  // Chỉ hiện lỗi của field đã rời khỏi (blur) hoặc sau khi bấm Gửi,
  // tránh "mắng" người dùng khi họ chưa kịp gõ.
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => submitAttempted || touched[field]),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) {
      // Side effect (focus) đặt trong event handler — đúng chỗ, không cần useEffect.
      const firstInvalid = Object.keys(errors)[0];
      e.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    onValidSubmit(values);
  };

  const errorCount = Object.keys(visibleErrors).length;

  return (
    <FormContext.Provider value={{ values, errors, visibleErrors, isValid, handleChange, handleBlur }}>
      <form className="card form-engine" noValidate onSubmit={handleSubmit} aria-labelledby={titleId}>
        <h3 id={titleId}>{title}</h3>
        {submitAttempted && errorCount > 0 && (
          <p role="alert" className="form-summary">Còn {errorCount} trường cần sửa.</p>
        )}
        <InputField name="fullName" label="Họ tên" autoComplete="name" />
        <InputField name="email" label="Email" type="email" autoComplete="email" />
        <InputField name="age" label="Tuổi" type="number" inputMode="numeric" hint="Từ 16 đến 100." />
        <InputField name="password" label="Mật khẩu" type="password" autoComplete="new-password" hint="Ít nhất 8 ký tự, có chữ và số." />
        <button type="submit">Gửi</button>
      </form>
    </FormContext.Provider>
  );
}
