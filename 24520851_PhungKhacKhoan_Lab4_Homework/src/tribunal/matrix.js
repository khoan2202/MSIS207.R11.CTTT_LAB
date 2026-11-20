// HW3 — "Disproportionality Derived Matrix" (ma trận bất tương xứng).
// Ý tưởng: so sánh mức phạt của vụ hiện tại với các vụ tiền lệ cùng loại.
//   ratio  = số ngày cấm / mức độ nghiêm trọng (1–5)  => "bao nhiêu ngày phạt cho mỗi bậc vi phạm"
//   index  = ratio vụ hiện tại / trung vị ratio các tiền lệ
//   index > 1.5 => phạt nặng hơn đáng kể so với tiền lệ => có cơ sở khiếu nại "không tương xứng".
// Hàm thuần — được gọi trong render qua useMemo (không lưu vào state).

export const DISPROPORTION_THRESHOLD = 1.5;

export function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const ratioOf = (penaltyDays, severity) => (severity > 0 ? penaltyDays / severity : 0);
const round2 = (n) => Math.round(n * 100) / 100;

export function computeMatrix(dossier) {
  const current = ratioOf(dossier.penalty.banDays, dossier.offense.severity);
  const rows = dossier.precedents.map((p) => {
    const ratio = ratioOf(p.banDays, p.severity);
    return { ...p, ratio: round2(ratio), delta: round2(current - ratio) };
  });
  const baseline = median(rows.map((r) => r.ratio));
  const index = baseline > 0 ? round2(current / baseline) : null;
  return {
    currentRatio: round2(current),
    baseline: round2(baseline),
    index,
    rows,
    disproportionate: index !== null && index > DISPROPORTION_THRESHOLD,
  };
}
