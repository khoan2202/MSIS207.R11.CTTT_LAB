const LEVEL_TEXT = {
  ok: "Còn đủ thời gian nộp khiếu nại.",
  warning: "Còn dưới 1 giờ để nộp khiếu nại.",
  critical: "Còn dưới 10 phút! Hãy nộp ngay.",
  expired: "Đã hết hạn nộp khiếu nại.",
};

// Hiển thị đồng hồ SLA (component trình bày; dữ liệu `sla` từ useAppealSlaTimer ở DossierView
// để form khiếu nại dùng chung cờ `expired`).
// Con số thay đổi mỗi giây nhưng KHÔNG đặt trong aria-live (trình đọc màn hình sẽ đọc liên tục);
// chỉ thông báo khi đổi mức cảnh báo.
export default function SlaCountdown({ sla }) {
  return (
    <section className={`card sla sla-${sla.level}`} aria-labelledby="sla-title">
      <h2 id="sla-title">Hạn SLA khiếu nại</h2>
      <p className="sla-clock" role="timer" aria-describedby="sla-status">{sla.text}</p>
      <p id="sla-status" aria-live="polite">{LEVEL_TEXT[sla.level]}</p>
      <p className="field-hint">
        {sla.synced ? `Đã đồng bộ với đồng hồ server (lệch ${sla.offsetMs} ms).` : "Đang đồng bộ đồng hồ server…"}
        {sla.syncError && " Không đồng bộ được — đang dùng đồng hồ máy."}
      </p>
    </section>
  );
}
