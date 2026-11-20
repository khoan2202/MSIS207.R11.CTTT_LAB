import { useParams } from "react-router";
import { useFetchJson } from "../lib/useFetchJson.js";
import MatrixTable from "./MatrixTable.jsx";
import SlaCountdown from "./SlaCountdown.jsx";
import Skeleton from "../components/Skeleton.jsx";
import NotFound from "../pages/NotFound.jsx";

const fmt = (iso) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });

// HW3 — /dossier/:playerID : route động, một component cho mọi người chơi
// (thay vì viết cứng từng <Route path="/dossier/himass"> như slide).
export default function DossierView() {
  const { playerID } = useParams();
  const { data: dossier, error, loading, reload } = useFetchJson(`/api/dossiers/${encodeURIComponent(playerID)}`);

  if (loading) return <Skeleton lines={6} minHeight={420} label="Đang tải hồ sơ…" />;
  if (error?.status === 404) return <NotFound message={`Không có hồ sơ cho người chơi "${playerID}".`} />;
  if (error) {
    return (
      <div className="card" role="alert">
        <p>Không tải được hồ sơ: {error.message}</p>
        <button type="button" onClick={reload}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="dossier-view">
      <article className="card" aria-labelledby="dossier-title">
        <h2 id="dossier-title">{dossier.displayName} <span className="subtitle">— {dossier.offense.caseId}</span></h2>
        <dl className="kv">
          <div><dt>Đội</dt><dd>{dossier.team}</dd></div>
          <div><dt>Giải đấu</dt><dd>{dossier.tournament}</dd></div>
          <div><dt>Vi phạm</dt><dd>{dossier.offense.title}</dd></div>
          <div><dt>Phát hiện bởi</dt><dd>{dossier.offense.detectedBy}</dd></div>
          <div><dt>Bậc nghiêm trọng</dt><dd>{dossier.offense.severity} / 5</dd></div>
          <div><dt>Án phạt</dt><dd>Cấm {dossier.penalty.banDays} ngày, trừ {dossier.penalty.pointDeduction} điểm</dd></div>
          <div><dt>Ngày ra quyết định</dt><dd><time dateTime={dossier.issuedAt}>{fmt(dossier.issuedAt)}</time></dd></div>
          <div><dt>Hạn khiếu nại</dt><dd><time dateTime={dossier.appealDeadline}>{fmt(dossier.appealDeadline)}</time></dd></div>
        </dl>
        <h3>Bằng chứng</h3>
        <ul>
          {dossier.evidence.map((e) => <li key={e.label}><strong>{e.label}:</strong> {e.note}</li>)}
        </ul>
      </article>
      <SlaCountdown deadline={dossier.appealDeadline} />
      <MatrixTable dossier={dossier} />
    </div>
  );
}
