import { useSearchParams } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [params] = useSearchParams();
  return (
    <section className="card" aria-labelledby="admin-title">
      <h2 id="admin-title">Khu vực quản trị</h2>
      <p>Xin chào <strong>{user.name}</strong>. {params.get("tab") && <>Tab: <code>{params.get("tab")}</code></>}</p>
      <button type="button" className="secondary" onClick={logout}>Đăng xuất</button>
    </section>
  );
}
