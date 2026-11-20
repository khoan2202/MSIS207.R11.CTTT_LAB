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
  const rawRatios = dossier.precedents.map((p) => ratioOf(p.banDays, p.severity));
  const rows = dossier.precedents.map((p, i) => ({
    ...p,
    ratio: round2(rawRatios[i]),
    delta: round2(current - rawRatios[i]),
  }));
  // Trung vị tính trên giá trị CHƯA làm tròn; chỉ làm tròn khi hiển thị
  // (làm tròn trước rồi mới tính sẽ cộng dồn sai số).
  const baseline = median(rawRatios);
  const index = baseline > 0 ? round2(current / baseline) : null;
  return {
    currentRatio: round2(current),
    baseline: round2(baseline),
    index,
    rows,
    disproportionate: index !== null && index > DISPROPORTION_THRESHOLD,
  };
}
