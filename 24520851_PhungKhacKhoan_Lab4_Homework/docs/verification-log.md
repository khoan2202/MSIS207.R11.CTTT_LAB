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

## HW2 — Swipe Deck trên Chrome (Playwright)
Môi trường sandbox **không có MongoDB** (không tải được mongod), nên e2e chạy `createApp()` thật
với model giả trong bộ nhớ (`tests/fake-models.js`). Kết nối MongoDB thật cần kiểm tra lại trên máy
cá nhân theo `HUONG_DAN.md` (mục HW2 → Chạy với MongoDB).
```
→ ← ↑                  -> Điểm: 30   (+10 -5 +25)
Backspace              -> Điểm: 5    (hoàn tác lượt +25 cuối cùng — LIFO)
kéo chuột sang phải    -> Điểm: 15   (+10)
F5 (reload)            -> lá trên cùng vẫn "Khang, 26", Điểm: 15 (khôi phục phiên từ API)
console error/warning  -> không có
```
Screenshot: `screenshots/hw2-drag.png` (đang kéo), `screenshots/hw2-deck.png`.

Lỗi phát hiện nhờ screenshot (test jsdom không bắt được): lá bài trên cùng bị trong suốt do
`{...rest}` ghi đè `style` chứa `--hue` → đã sửa + thêm test hồi quy (AI_FAILURE_AUDIT #HW2-1).
