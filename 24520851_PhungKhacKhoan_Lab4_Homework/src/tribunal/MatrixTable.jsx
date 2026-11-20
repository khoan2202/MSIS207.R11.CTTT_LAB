import { useMemo } from "react";
import { computeMatrix, DISPROPORTION_THRESHOLD } from "./matrix.js";

// Ma trận được TÍNH trong render (useMemo chỉ để khỏi tính lại khi dossier không đổi),
// không lưu vào state và không đồng bộ bằng useEffect.
export default function MatrixTable({ dossier }) {
  const matrix = useMemo(() => computeMatrix(dossier), [dossier]);

  return (
    <section className="card" aria-labelledby="matrix-title">
      <h2 id="matrix-title">Ma trận bất tương xứng</h2>
      <p>
        Vụ hiện tại: <strong>{matrix.currentRatio}</strong> ngày cấm / bậc nghiêm trọng · Trung vị tiền lệ:{" "}
        <strong>{matrix.baseline}</strong> · Chỉ số: <strong>{matrix.index ?? "—"}</strong>
      </p>
      <p className={matrix.disproportionate ? "verdict warn" : "verdict ok"}>
        {matrix.disproportionate
          ? `Chỉ số > ${DISPROPORTION_THRESHOLD}: mức phạt nặng hơn đáng kể so với tiền lệ — có cơ sở khiếu nại "không tương xứng".`
          : `Chỉ số ≤ ${DISPROPORTION_THRESHOLD}: mức phạt nằm trong khoảng của các tiền lệ.`}
      </p>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Bảng so sánh tiền lệ (cuộn ngang được)">
        <table>
          <caption className="visually-hidden">So sánh mức phạt với các vụ tiền lệ</caption>
          <thead>
            <tr>
              <th scope="col">Mã vụ</th>
              <th scope="col">Bậc nghiêm trọng</th>
              <th scope="col">Ngày cấm</th>
              <th scope="col">Ngày / bậc</th>
              <th scope="col">Chênh lệch so với vụ hiện tại</th>
            </tr>
          </thead>
          <tbody>
            <tr className="current-row">
              <th scope="row">{dossier.offense.caseId} (hiện tại)</th>
              <td>{dossier.offense.severity}</td>
              <td>{dossier.penalty.banDays}</td>
              <td>{matrix.currentRatio}</td>
              <td>—</td>
            </tr>
            {matrix.rows.map((r) => (
              <tr key={r.caseId}>
                <th scope="row">{r.caseId}</th>
                <td>{r.severity}</td>
                <td>{r.banDays}</td>
                <td>{r.ratio}</td>
                <td>{r.delta > 0 ? `+${r.delta}` : r.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
