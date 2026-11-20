import { NavLink, Outlet } from "react-router";
import { useFetchJson } from "../lib/useFetchJson.js";

// HW3 — Layout của khu vực Tribunal: sidebar danh sách hồ sơ + <Outlet /> cho /dossier/:playerID.
export default function DossierLayout() {
  const { data, error, loading } = useFetchJson("/api/dossiers");

  return (
    <section aria-labelledby="tribunal-title">
      <h1 id="tribunal-title">Esports Fair-Play Appeal Tribunal</h1>
      <p className="disclaimer">
        <strong>Case study giả lập:</strong> toàn bộ vi phạm, số liệu và tiền lệ do sinh viên tự đặt ra cho bài tập,
        không phản ánh sự việc có thật.
      </p>
      <div className="dossier-frame">
        <nav className="card sidebar" aria-label="Danh sách hồ sơ">
          <h2>Hồ sơ</h2>
          {loading && <p>Đang tải…</p>}
          {error && <p role="alert">Không tải được danh sách: {error.message}</p>}
          {data && (
            <ul>
              {data.map((d) => (
                <li key={d.playerId}>
                  <NavLink to={`/dossier/${d.playerId}`} className={({ isActive }) => (isActive ? "active-link" : "link")}>
                    <span className="dossier-name">{d.displayName}</span>
                    <span className="dossier-case">{d.offense.caseId}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </section>
  );
}

export function DossierIndex() {
  return <div className="card"><p>Chọn một hồ sơ bên trái để xem chi tiết và nộp đơn khiếu nại.</p></div>;
}
