import { useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { CATEGORIES, PHOTOS } from "./photos.js";
import Lightbox from "./Lightbox.jsx";

// HW1 — Photo & Evidence Gallery.
// Mọi trạng thái giao diện nằm trên URL:
//   /gallery?category=city            -> lọc theo category
//   /gallery?category=city&photo=c2   -> lọc + đang mở ảnh c2
// => copy link gửi người khác là thấy đúng màn hình (deep linking),
//    F5 không mất trạng thái, nút Back của trình duyệt đóng lightbox.

export function filterPhotos(photos, category) {
  return category ? photos.filter((p) => p.category === category) : photos;
}

// Vị trí kề bên theo vòng tròn: cuối danh sách bấm "tiếp" thì quay về đầu.
export function neighborId(list, currentId, step) {
  const i = list.findIndex((p) => p.id === currentId);
  if (i === -1 || list.length === 0) return null;
  return list[(i + step + list.length) % list.length].id;
}

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const thumbRefs = useRef(new Map()); // id -> nút thumbnail, để trả focus khi đóng

  const rawCategory = searchParams.get("category");
  // Category lạ trên URL (vd ?category=abc) => coi như "Tất cả" thay vì hiện lưới rỗng.
  const category = CATEGORIES.some((c) => c.id === rawCategory) ? rawCategory : null;
  const visible = filterPhotos(PHOTOS, category); // derived state

  // Ảnh đang mở cũng là DERIVED từ URL. Id sai => null => không mở dialog.
  const photoId = searchParams.get("photo");
  const selected = PHOTOS.find((p) => p.id === photoId) ?? null;
  // Deep link có thể mở ảnh không thuộc category đang lọc -> chuyển ảnh trong toàn bộ danh sách.
  const navList = selected && visible.some((p) => p.id === selected.id) ? visible : PHOTOS;
  const position = selected ? `${navList.findIndex((p) => p.id === selected.id) + 1} / ${navList.length}` : "";

  // Cập nhật tham số "photo" nhưng GIỮ "category" (slide dùng setSearchParams({}) sẽ xóa luôn bộ lọc).
  const setPhoto = (id, { replace = false } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set("photo", id);
        else next.delete("photo");
        return next;
      },
      { replace },
    );
  };

  const open = (id) => setPhoto(id); // push: Back sẽ đóng ảnh
  const go = (step) => setPhoto(neighborId(navList, selected.id, step), { replace: true }); // chuyển ảnh không làm dài lịch sử

  const handleClose = () => {
    const closedId = selected?.id;
    // Đóng do bấm Back thì URL đã không còn ?photo — không navigate thêm (tránh tạo mục lịch sử thừa).
    if (photoId) setPhoto(null);
    // WCAG 2.4.3: trả focus về đúng thumbnail đã mở ảnh.
    if (closedId) thumbRefs.current.get(closedId)?.focus();
  };

  return (
    <section aria-labelledby="gallery-title">
      <h1 id="gallery-title">Photo &amp; Evidence Gallery</h1>

      <nav aria-label="Lọc theo danh mục" className="filter-bar">
        <ul>
          {[{ id: null, label: "Tất cả" }, ...CATEGORIES].map((c) => (
            <li key={c.id ?? "all"}>
              <Link
                to={c.id ? `?category=${c.id}` : "."}
                aria-current={category === c.id ? "page" : undefined}
                className="chip"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p aria-live="polite" className="result-count">{visible.length} ảnh</p>

      <ul className="photo-grid">
        {visible.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              className="thumb-button"
              ref={(el) => {
                if (el) thumbRefs.current.set(photo.id, el);
                else thumbRefs.current.delete(photo.id);
              }}
              aria-haspopup="dialog"
              onClick={() => open(photo.id)}
            >
              <figure>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  // 4 ảnh đầu nằm trên màn hình đầu tiên: tải ngay; còn lại lazy.
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                />
                <figcaption>{photo.title}</figcaption>
              </figure>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        photo={selected}
        position={position}
        onClose={handleClose}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      />
    </section>
  );
}
