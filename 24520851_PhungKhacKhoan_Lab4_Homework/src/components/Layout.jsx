import { NavLink, Outlet } from "react-router";

const NAV = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/gallery", label: "HW1 · Gallery" },
  { to: "/swipe", label: "HW2 · Swipe Deck" },
  { to: "/dossier", label: "HW3 · Appeal Tribunal" },
];

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">Bỏ qua tới nội dung chính</a>
      <header className="app-header">
        <p className="app-title">Lab 4 Homework — 24520851</p>
        <nav className="main-nav" aria-label="Chọn bài Homework">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
