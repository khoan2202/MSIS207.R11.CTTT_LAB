import { NavLink, Outlet, useSearchParams } from "react-router";

// Sprint 1 contract — PeopleLayout: khung Master (sidebar) + Detail (<Outlet />).
// Live Defense #1 — URL Search Params Sync:
//   bộ lọc (?q=...&team=...) nằm trên URL thay vì useState
//   => F5 không mất bộ lọc, copy link gửi người khác thấy đúng trạng thái.
export default function PeopleLayout({ people }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const team = searchParams.get("team") ?? "";

  const teams = [...new Set(people.map((p) => p.team))];
  // Danh sách hiển thị là DERIVED từ URL, không lưu thêm state nào.
  const visible = people.filter(
    (p) => (!team || p.team === team) && p.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  // Cập nhật 1 tham số, giữ nguyên tham số khác; xóa khỏi URL nếu rỗng.
  // replace: true => gõ từng ký tự không đẩy hàng chục mục vào lịch sử Back.
  const updateParam = (key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const query = searchParams.toString();

  return (
    <div className="people-frame">
      <nav className="sidebar card" aria-label="Danh sách nhân sự">
        <h2>Nhân sự</h2>
        <div className="field-group">
          <label htmlFor="people-q">Tìm theo tên</label>
          <input id="people-q" type="search" value={q} onChange={(e) => updateParam("q", e.target.value)} />
        </div>
        <div className="field-group">
          <label htmlFor="people-team">Nhóm</label>
          <select id="people-team" value={team} onChange={(e) => updateParam("team", e.target.value)}>
            <option value="">Tất cả</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <p className="visually-hidden" aria-live="polite">{visible.length} kết quả</p>
        <ul>
          {visible.map((p) => (
            <li key={p.id}>
              <NavLink
                // Giữ query string khi mở chi tiết để bộ lọc không bị mất.
                to={{ pathname: `/people/${p.id}`, search: query ? `?${query}` : "" }}
                className={({ isActive }) => (isActive ? "active-link" : "link")}
              >
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
        {visible.length === 0 && <p>Không có ai khớp bộ lọc.</p>}
      </nav>
      <section className="content-area" aria-live="polite">
        <Outlet />
      </section>
    </div>
  );
}
