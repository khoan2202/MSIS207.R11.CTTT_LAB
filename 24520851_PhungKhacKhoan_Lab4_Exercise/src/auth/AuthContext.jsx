import { createContext, useContext, useState } from "react";

// Live Defense #4 — AuthContext giả lập (chỉ để minh họa route guard ở client).
// Lưu ý bảo mật: guard phía client chỉ ẩn giao diện; dữ liệu thật phải được
// server kiểm tra quyền (token/session) ở từng API.
const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const login = (name) => setUser({ name });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() phải nằm trong <AuthProvider>.");
  return ctx;
}
