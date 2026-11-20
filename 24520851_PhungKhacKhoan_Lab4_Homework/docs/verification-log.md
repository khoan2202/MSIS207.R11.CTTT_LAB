# Nhật ký kiểm chứng — Lab 4 Homework

## HW1 — Lighthouse (production build, 2026-11-20)
Chạy: `npm run build && npm run preview` rồi Lighthouse 13 (Chrome headless, cấu hình mobile mặc định).

| URL | Performance | Accessibility | Best Practices | SEO | CLS | LCP |
|---|---|---|---|---|---|---|
| `/gallery` | 100 | 100 | 100 | 100 | 0 | 1.8 s |
| `/gallery?category=city&photo=c2` (lightbox mở sẵn) | 100 | 100 | 100 | 100 | 0 | 1.8 s |

Báo cáo đầy đủ: `docs/lighthouse/hw1-gallery.html`, `docs/lighthouse/hw1-gallery-lightbox.html`.
Lần chạy đầu SEO = 92 vì thiếu `robots.txt` (vite preview trả về index.html) → đã thêm `public/robots.txt`.

> Lighthouse accessibility 100 **không** đồng nghĩa đạt toàn bộ WCAG 2.2 AA (công cụ tự động chỉ bắt được một phần).
> Phần kiểm tra thủ công bằng bàn phím ghi ở mục dưới.

## HW1 — Kiểm tra hành vi trên Chrome (Playwright)
```
mở ảnh thứ 2 trong ?category=city   -> URL ?category=city&photo=c2, dialog.open = true, focus nằm trong dialog
ArrowRight                          -> ?category=city&photo=c3 (replace, không thêm lịch sử)
Tab x4                              -> focus vẫn trong dialog (showModal làm phần còn lại inert)
Escape                              -> URL ?category=city (giữ bộ lọc), focus trả về thumbnail "Phố lúc chiều tà"
mở ảnh rồi bấm Back                 -> dialog đóng, URL ?category=city
bấm Forward                         -> dialog mở lại đúng ảnh
console error/warning               -> không có
```
