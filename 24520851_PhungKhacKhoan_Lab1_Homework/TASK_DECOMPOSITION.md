
# PHÂN CHIA CÔNG VIỆC - LAB 1

## Thông tin chung

- Môn học: Phát triển ứng dụng Web
- Bài thực hành: Lab 1
- Công nghệ: HTML5, CSS3, JavaScript ES6+
- Công cụ: Visual Studio Code, Git, GitHub, Live Server
- Phương pháp: Chia nhỏ công việc, kiểm tra và commit theo từng chức năng

## HOMEWORK 1: WEBSITE PORTFOLIO CÁ NHÂN

### HW1-01: Xây dựng cấu trúc HTML
- Tạo các thành phần header, nav, main, section, footer.
- Sử dụng HTML có ngữ nghĩa.
- Có một thẻ h1 chính.
- Có liên kết bỏ qua phần điều hướng.
- Không sử dụng thẻ div không cần thiết.

### HW1-02: Xây dựng CSS và giao diện tương thích
- Tạo các biến màu sắc trong :root.
- Thiết lập lại Box Model.
- Sử dụng Flexbox và CSS Grid.
- Giao diện hiển thị tốt trên màn hình rộng 375px.
- Kiểm tra độ tương phản màu sắc.

### HW1-03: Xử lý giao diện bằng JavaScript
- Thêm chức năng chuyển chế độ sáng/tối.
- Lưu chế độ giao diện trong localStorage.
- Không phát sinh lỗi JavaScript khi chuyển giao diện.

### HW1-04: Kiểm tra khả năng truy cập
- Điều hướng được bằng phím Tab và Enter.
- Không xảy ra lỗi kẹt bàn phím.
- Kiểm tra cấu trúc HTML bằng DevTools.
- Kiểm tra mức tương phản WCAG 2.2 AA.

### HW1-05: Bảo mật website
- Thiết lập chính sách bảo mật nội dung CSP.
- Không sử dụng sự kiện JavaScript trực tiếp trong HTML.
- Không hiển thị dữ liệu không tin cậy bằng innerHTML.

### HW1-06: Tối ưu hiệu suất
- Tối ưu kích thước hình ảnh.
- Kiểm tra giao diện trên thiết bị di động.
- Kiểm tra hiệu suất bằng Lighthouse.
- Lưu bằng chứng kiểm thử.

## HOMEWORK 2: BỘ TRỐNG ĐIỆN TỬ

### HW2-01: Xây dựng cấu trúc HTML
- Tạo các nút trống.
- Mỗi nút có data-key và data-sound.
- Tách thông tin âm thanh khỏi logic JavaScript.

### HW2-02: Thiết kế giao diện CSS
- Tạo giao diện bộ trống.
- Có hiệu ứng khi nhấn nút.
- Hỗ trợ màn hình điện thoại.

### HW2-03: Xây dựng bộ phát âm thanh
- Đọc đường dẫn âm thanh từ data-sound.
- Phát được nhiều âm thanh chồng lên nhau.
- Xử lý lỗi khi âm thanh không tải được.

### HW2-04: Điều khiển bằng bàn phím
- Sử dụng sự kiện keydown.
- Sử dụng event.key.
- Kiểm tra event.repeat để tránh lặp âm thanh.

### HW2-05: Ghi và phát lại nhịp trống
- Thêm nút bắt đầu ghi.
- Thêm nút dừng ghi.
- Thêm nút phát lại.
- Lưu thứ tự nhịp và thời gian phát.
- Phát lại theo thứ tự FIFO.

## HOMEWORK 3: TRANG ĐĂNG KÝ SỰ KIỆN

### HW3-01: Xây dựng giao diện
- Tạo trang giới thiệu sự kiện.
- Hiển thị đồng hồ đếm ngược.
- Tạo biểu mẫu đăng ký.
- Hỗ trợ giao diện điện thoại.

### HW3-02: Xây dựng đồng hồ đếm ngược
- Sử dụng thời gian UTC ISO 8601.
- Tính thời gian bằng Date.now().
- Không để đồng hồ bị sai lệch tích lũy.
- Dừng đồng hồ khi sự kiện bắt đầu.

### HW3-03: Xây dựng trạng thái biểu mẫu
- Trạng thái ban đầu.
- Trạng thái đang gửi.
- Trạng thái thành công.
- Trạng thái thất bại.

### HW3-04: Chống gửi biểu mẫu nhiều lần
- Khóa nút khi đang gửi.
- Ngăn xử lý nhiều yêu cầu cùng lúc.
- Mở lại nút khi hoàn tất.

### HW3-05: Kiểm tra dữ liệu và bảo mật
- Kiểm tra họ tên.
- Kiểm tra email.
- Không thực thi HTML do người dùng nhập.
- Sử dụng textContent để hiển thị thông báo.

### HW3-06: Báo cáo kiểm tra lỗi AI
- Tạo file AI_FAILURE_AUDIT.md.
- Ghi nhận 3 lỗi thực tế do AI tạo ra.
- Trình bày cách phát hiện từng lỗi.
- Trình bày cách sửa và kiểm tra lại.
- Ghi mã commit tương ứng.

## QUY TRÌNH THỰC HIỆN

1. Đọc yêu cầu của từng công việc.
2. Chỉ thực hiện một công việc tại một thời điểm.
3. Chạy thử chức năng vừa hoàn thành.
4. Mở Git Diff để kiểm tra những gì đã thay đổi.
5. Commit chức năng đã kiểm tra.
6. Chuyển sang công việc tiếp theo.

## TIÊU CHÍ HOÀN THÀNH

- Không xuất hiện lỗi trong Console.
- Website hoạt động ở màn hình 375px.
- Điều hướng bằng bàn phím hoạt động.
- Không có lỗ hổng XSS được phát hiện trong các bài kiểm tra.
- Không sử dụng thư viện ngoài khi không được cho phép.
- Mỗi commit thể hiện một thay đổi cụ thể.
- Có khả năng giải thích code khi giảng viên hỏi.
