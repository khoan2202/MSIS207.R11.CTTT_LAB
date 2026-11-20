import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext.jsx";

// Wrapper bảo vệ route (layout route không có path):
// - Chưa đăng nhập => <Navigate> tới /login, gửi kèm URL đích trong state.from
//   (đầy đủ pathname + search + hash) để đăng nhập xong quay lại đúng chỗ.
// - replace: thay mục lịch sử hiện tại => bấm Back không bị kẹt vòng /admin <-> /login.
// v7 dùng <Navigate> thay cho <Redirect> của v5.
export default function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
