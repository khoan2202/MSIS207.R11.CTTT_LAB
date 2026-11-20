import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "./AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [attempted, setAttempted] = useState(false);
  const error = attempted && !name.trim() ? "Vui lòng nhập tên đăng nhập." : "";

  // URL đích do RequireAuth gửi sang; mặc định về trang chủ.
  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}` : "/";

  const onSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!name.trim()) return;
    login(name.trim());
    navigate(target, { replace: true });
  };

  return (
    <form className="card" noValidate onSubmit={onSubmit} aria-labelledby="login-title" style={{ maxWidth: 420 }}>
      <h2 id="login-title">Đăng nhập</h2>
      {from && <p>Bạn cần đăng nhập để vào <code>{target}</code>.</p>}
      <div className="field-group">
        <label htmlFor="login-name">Tên đăng nhập</label>
        <input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username"
          aria-invalid={error ? true : undefined} aria-describedby={error ? "login-err" : undefined} />
        {error && <span id="login-err" className="field-error">{error}</span>}
      </div>
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
