import { NavLink, Outlet } from "react-router";

// Ex 1.2.1 — Layout dùng chung cho mọi route con.
// <Outlet /> là "lỗ trống" nơi React Router chèn route con đang khớp URL.
const NAV_ITEMS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/people", label: "Nhân sự (Sprint 1)" },
  { to: "/about", label: "Giới thiệu" },
];

// v7: className nhận một hàm ({ isActive }) => string
// thay cho prop activeClassName đã bị xóa từ v6.
const linkClass = ({ isActive }) => (isActive ? "active" : "");

export default function Layout({ navItems = NAV_ITEMS }) {
  return (
    <>
      <header className="app-header">
        <h1>Lab 4 — Multi-Route SPA</h1>
        <nav className="main-nav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            // end: chỉ active khi URL khớp chính xác (thay cho "exact" của v5)
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
