/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

// ⚠️ Ex 1.3 — ANTI-PATTERN (CHỈ ĐỂ MINH HỌA, KHÔNG DÙNG TRONG CODE THẬT).
// Mô phỏng chuỗi 5 useEffect giữa InputField và SimpleForm trong slide.
// Mỗi phím gõ gây ra một dây chuyền setState -> render -> effect -> setState ...

function LegacyInputField({ name, label, error, onSync }) {
  const [value, setValue] = useState("");          // state cục bộ (bản sao thứ nhất)
  const [localError, setLocalError] = useState(""); // bản sao lỗi thứ hai

  // useEffect #1: đồng bộ giá trị lên cha SAU khi render => cha phải render lại
  useEffect(() => { onSync(name, value); }, [value]);

  // useEffect #4 (phía con): sao chép lỗi từ props vào state => thêm 1 render nữa
  useEffect(() => { setLocalError(error); }, [error]);

  return (
    <div className="field-group">
      <label htmlFor={`legacy-${name}`}>{label}</label>
      <input id={`legacy-${name}`} value={value} onChange={(e) => setValue(e.target.value)} />
      {localError && <span className="field-error">{localError}</span>}
    </div>
  );
}

export default function LegacyForm() {
  const [values, setValues] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const handleSync = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  // useEffect #2: validate sau khi values đổi => setErrors => render lại
  useEffect(() => {
    setErrors({ email: /\S+@\S+\.\S+/.test(values.email) ? "" : "Email chưa hợp lệ" });
  }, [values]);

  // useEffect #3: tính validity từ errors => setIsValid => render lại lần nữa
  useEffect(() => { setIsValid(!errors.email); }, [errors]);

  // useEffect #5: "tự cuộn tới lỗi" — chạy mỗi lần errors đổi, đọc DOM sau commit
  useEffect(() => {
    if (errors.email) document.getElementById("legacy-email")?.scrollIntoView({ block: "nearest" });
  }, [errors]);

  return (
    <form className="card" noValidate onSubmit={(e) => e.preventDefault()} aria-label="Form cũ dùng useEffect">
      <h3>Form cũ (5 useEffect)</h3>
      <LegacyInputField name="email" label="Email" error={errors.email} onSync={handleSync} />
      <p>Hợp lệ: {isValid ? "có" : "không"}</p>
    </form>
  );
}
