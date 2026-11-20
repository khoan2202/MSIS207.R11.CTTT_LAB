// Ex 1.1 — Skeleton fallback cho <Suspense>.
// - minHeight bằng đúng chiều cao nội dung thật => không nhảy layout (CLS = 0).
// - role="status" + aria-live="polite": trình đọc màn hình thông báo "Đang tải"
//   mà không cắt ngang nội dung đang đọc.
// - aria-busy="true": báo vùng này đang được cập nhật.
export default function Skeleton({ lines = 3, minHeight = 160, label = "Đang tải nội dung…" }) {
  return (
    <div
      className="card skeleton"
      role="status"
      aria-busy="true"
      aria-live="polite"
      style={{ minHeight }}
    >
      <span className="visually-hidden">{label}</span>
      <div className="skeleton-line skeleton-title" aria-hidden="true" />
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton-line" aria-hidden="true" />
      ))}
    </div>
  );
}
