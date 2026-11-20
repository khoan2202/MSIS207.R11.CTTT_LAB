import { useEffect, useRef } from "react";

// HW1 — Lightbox bằng phần tử HTML gốc <dialog>.
// Vì sao <dialog> + showModal()?
//  - Trình duyệt tự làm "focus trap": Tab không thoát ra trang phía sau.
//  - Phần còn lại của trang tự trở thành inert (không click/đọc được).
//  - Phím Esc tự đóng (sự kiện "cancel" -> "close").
//  - Có sẵn role="dialog" + aria-modal, không cần thư viện modal.
//
// Props: photo (ảnh đang mở hoặc null), onClose, onPrev, onNext, position ("3 / 12").
export default function Lightbox({ photo, onClose, onPrev, onNext, position }) {
  const dialogRef = useRef(null);
  const isOpen = photo !== null;

  // Effect HỢP LỆ: đồng bộ React với một API bên ngoài (DOM dialog), không phải để tính state.
  // Nguồn sự thật là URL (?photo=...), dialog chỉ "đi theo".
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
  };

  // Click vào vùng nền (backdrop) — e.target chính là <dialog> — thì đóng.
  const handleClick = (e) => {
    if (e.target === dialogRef.current) dialogRef.current.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby="lightbox-title"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {photo && (
        <div className="lightbox-inner">
          <header className="lightbox-header">
            <h2 id="lightbox-title">{photo.title}</h2>
            <p className="lightbox-pos" aria-live="polite">Ảnh {position}</p>
            {/* Nút chỉ có icon => bắt buộc aria-label (WCAG 2.2 AA, 4.1.2) */}
            <button type="button" className="icon-button" aria-label="Đóng ảnh" onClick={() => dialogRef.current.close()} autoFocus>
              <span aria-hidden="true">✕</span>
            </button>
          </header>
          <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
          <footer className="lightbox-nav">
            <button type="button" className="icon-button" aria-label="Ảnh trước" onClick={onPrev}>
              <span aria-hidden="true">←</span>
            </button>
            <p className="lightbox-hint">Dùng phím ← → để chuyển ảnh, Esc để đóng.</p>
            <button type="button" className="icon-button" aria-label="Ảnh tiếp theo" onClick={onNext}>
              <span aria-hidden="true">→</span>
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
