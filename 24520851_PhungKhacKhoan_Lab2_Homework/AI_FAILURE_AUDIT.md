# AI Failure Audit — Lab 2 Homework

## 1. Điểm khởi tạo không khớp HTML

### Vấn đề
main.ts yêu cầu phần tử #root nhưng HTML đang chạy không có phần tử đó.

### Bằng chứng
Console đã báo:
main.ts:10 Uncaught Error: Không tìm thấy phần tử #root.

### Cách sửa
Đồng bộ index.html với main.ts:
<main id="root"></main>

## 2. Import không còn khớp sau khi chuyển module Homework 2

### Vấn đề
Các file được đưa từ src/homework/hw2/ ra src/homework/
và thêm tiền tố hw2-, nhưng các import cũ vẫn trỏ vào cấu trúc cũ.

### Cách sửa
Đồng bộ tên file và tất cả import:
- ./hw2-contracts
- ./hw2-audio-engine
- ./hw2-audio-queue
- ./hw2-demo-audio
- ./hw2-visualizer

## 3. Cleanup pagehide đơn giản chưa xử lý khôi phục từ bfcache

### Vấn đề
Phiên bản main.ts trước đây chỉ gỡ event delegation khi pagehide.
Nếu trình duyệt lưu trang vào back-forward cache rồi khôi phục,
DOM có thể còn nhưng event delegation đã bị gỡ.

Đây là vấn đề phát hiện khi đọc code.
Chưa được coi là lỗi đã tái hiện nếu chưa kiểm tra trên trình duyệt.

### Cách sửa
Phân biệt pagehide.persisted.
Khi pageshow.persisted, tải lại trang để khởi tạo đầy đủ
giao diện, event delegation và tài nguyên của bài hiện tại.

### Đánh đổi
Tải lại trang sẽ mất trạng thái tạm trong bộ nhớ.
Cách này phù hợp phiên mô phỏng của bài lab.

## Giới hạn của Homework 3

- Tồn kho nằm trong bộ nhớ của một instance trang.
- Tải lại trang tạo phiên sale mới.
- Không đồng bộ tồn kho giữa nhiều tab hoặc nhiều người.
- Deadline dựa trên đồng hồ máy người dùng.
- Hệ thống thật cần thời gian server và thao tác tồn kho atomic
  trong database hoặc dịch vụ quản lý tồn kho.
- Không dùng kết quả test mô phỏng để khẳng định chống overselling
  trong môi trường nhiều server.