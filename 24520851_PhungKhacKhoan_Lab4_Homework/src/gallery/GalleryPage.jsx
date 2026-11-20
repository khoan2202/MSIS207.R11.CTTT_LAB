import { Link, useSearchParams } from "react-router";
import { CATEGORIES, PHOTOS } from "./photos.js";

// HW1 — Photo & Evidence Gallery.
// Mọi trạng thái giao diện nằm trên URL:
//   /gallery?category=city            -> lọc theo category
//   /gallery?category=city&photo=c2   -> lọc + đang mở ảnh c2 (thêm ở commit lightbox)
// => copy link gửi người khác là thấy đúng màn hình (deep linking).

export function filterPhotos(photos, category) {
  return category ? photos.filter((p) => p.category === category) : photos;
}

export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const rawCategory = searchParams.get("category");
  // Category lạ trên URL (vd ?category=abc) => coi như "Tất cả" thay vì hiện lưới rỗng.
  const category = CATEGORIES.some((c) => c.id === rawCategory) ? rawCategory : null;
  const visible = filterPhotos(PHOTOS, category); // derived state

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
          </li>
        ))}
      </ul>
    </section>
  );
}
