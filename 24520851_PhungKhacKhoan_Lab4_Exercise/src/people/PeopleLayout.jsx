import { NavLink, Outlet } from "react-router";

// Sprint 1 contract — PeopleLayout: khung Master (sidebar) + Detail (<Outlet />).
// Danh sách ở bên trái luôn giữ nguyên khi đổi người, chỉ vùng Outlet thay đổi.
export default function PeopleLayout({ people }) {
  return (
    <div className="people-frame">
      <nav className="sidebar card" aria-label="Danh sách nhân sự">
        <h2>Nhân sự</h2>
        <ul>
          {people.map((p) => (
            <li key={p.id}>
              <NavLink
                to={`/people/${p.id}`}
                className={({ isActive }) => (isActive ? "active-link" : "link")}
              >
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section className="content-area" aria-live="polite">
        <Outlet />
      </section>
    </div>
  );
}
