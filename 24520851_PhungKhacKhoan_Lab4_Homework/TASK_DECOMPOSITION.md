# Task Homework — Lab 4

Mỗi task: contract → test → code → kiểm tra → commit.

> Ghi chú đánh số: slide 19–21 ghi "Homework 1, Homework 1, Homework 2", còn slide contract
> 30–33 ghi "Homework 3, Homework 4, Homework 4". Repo đặt tên theo thứ tự xuất hiện: HW1, HW2, HW3.

## Chuẩn bị
- [x] Khởi tạo Vite React 19, Router v7, Express, Mongoose 8, Vitest
- [x] project-rules.md, TASK_DECOMPOSITION.md, .env.example

## HW1 — Production Multi-Route Photo & Evidence Gallery
- [x] Dữ liệu ảnh + ảnh SVG tối ưu (có width/height)
- [x] Lưới ảnh + lọc theo category đồng bộ `useSearchParams`
- [x] Lightbox `<dialog>` deep link `?photo=`, focus management, phím ←/→
- [x] Kiểm tra Lighthouse + accessibility

## HW2 — Full-Stack Card-Swipe Deck ("Hẹn Hò Nhưng Không Yêu")
- [x] Logic thuần: LIFO undo stack + điểm bất đối xứng (derived)
- [x] Backend: Mongoose 8 models + Express GET/POST/DELETE
- [x] Hook dữ liệu + persistence có AbortController
- [x] Giao diện swipe: bàn phím ←/→/↑/Backspace + pointer kéo thả

## HW3 — Full-Stack Esports Fair-Play Appeal Tribunal
- [x] Contract + luật validate dùng chung client/server
- [x] Backend: Dossier/Appeal models, `/api/time`, `/api/dossiers/:playerID`, `/api/appeals`
- [ ] Route `/dossier/:playerID` + ma trận bất tương xứng (derived)
- [ ] Hook `useAppealSlaTimer` không trôi (đồng bộ đồng hồ server + visibilitychange)
- [ ] Form khiếu nại Context, validate real-time, gửi lên server

## Hoàn tất
- [ ] AI_FAILURE_AUDIT.md, HUONG_DAN.md, log kiểm chứng
