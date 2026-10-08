
/*
  HOMEWORK 3 - TRANG ĐĂNG KÝ SỰ KIỆN

  Chức năng:
  1. Quản lý 4 trạng thái biểu mẫu
  2. Kiểm tra thông tin đăng ký
  3. Ngăn gửi biểu mẫu nhiều lần
  4. Mô phỏng quá trình đăng ký
  5. Xử lý thành công và thất bại
  6. Hiển thị thông báo an toàn
*/

// ==========================================
// 1. LẤY CÁC PHẦN TỬ HTML
// ==========================================

const bieuMau = document.querySelector(
  "#bieu-mau-dang-ky"
);

const nutGui = document.querySelector("#nut-gui");

const thongBao = document.querySelector("#thong-bao");

// ==========================================
// 2. KHAI BÁO TRẠNG THÁI BIỂU MẪU
// ==========================================

// Các trạng thái:
// ban-dau: Chưa gửi đăng ký
// dang-gui: Đang xử lý đăng ký
// thanh-cong: Đăng ký thành công
// that-bai: Đăng ký thất bại

let trangThaiBieuMau = "ban-dau";

// ==========================================
// 3. HÀM THAY ĐỔI TRẠNG THÁI
// ==========================================

function thayDoiTrangThai(trangThai) {
  // Cập nhật trạng thái hiện tại
  trangThaiBieuMau = trangThai;

  // Khóa nút khi đang gửi
  nutGui.disabled = trangThai === "dang-gui";

  // Danh sách thông báo
  const cacThongBao = {
    "ban-dau": "",
    "dang-gui": "Đang xử lý đăng ký...",
    "thanh-cong": "Đăng ký thành công!",
    "that-bai": "Đăng ký thất bại!"
  };

  // Hiển thị nội dung an toàn
  thongBao.textContent = cacThongBao[trangThai];
}

// ==========================================
// 4. HÀM MÔ PHỎNG GỬI ĐĂNG KÝ
// ==========================================

// Bài Lab 1 chưa yêu cầu kết nối backend.
// Hàm này mô phỏng thời gian xử lý 1,2 giây.

async function xuLyDangKy() {
  await new Promise((thanhCong) => {
    setTimeout(thanhCong, 1200);
  });

  return true;
}

// ==========================================
// 5. XỬ LÝ SỰ KIỆN GỬI BIỂU MẪU
// ==========================================

bieuMau.addEventListener("submit", async (suKien) => {
  // Ngăn trình duyệt tải lại trang
  suKien.preventDefault();

  // Không xử lý thêm khi đang gửi
  if (trangThaiBieuMau === "dang-gui") {
    return;
  }

  // Kiểm tra quy tắc HTML: required, email...
  if (!bieuMau.reportValidity()) {
    return;
  }

  // ========================================
  // 6. ĐỌC DỮ LIỆU NGƯỜI DÙNG
  // ========================================

  const hoTen = bieuMau.elements["ho-ten"].value;
  const email = bieuMau.elements["email"].value;

  // ========================================
  // 7. KIỂM TRA DỮ LIỆU ĐẦU VÀO
  // ========================================

  // Các hàm được định nghĩa trong validation.js
  if (!kiemTraHoTen(hoTen) || !kiemTraEmail(email)) {
    thayDoiTrangThai("that-bai");

    thongBao.textContent =
      "Họ tên hoặc email không hợp lệ.";

    return;
  }

  // ========================================
  // 8. CHUYỂN SANG TRẠNG THÁI ĐANG GỬI
  // ========================================

  thayDoiTrangThai("dang-gui");

  // ========================================
  // 9. MÔ PHỎNG GỬI ĐĂNG KÝ
  // ========================================

  try {
    await xuLyDangKy();

    // Xử lý thành công
    thayDoiTrangThai("thanh-cong");

    // Xóa dữ liệu biểu mẫu
    bieuMau.reset();

  } catch (loi) {
    // Xử lý thất bại
    console.error("Lỗi đăng ký:", loi);

    thayDoiTrangThai("that-bai");
  }
});

// ==========================================
// 10. KHỞI TẠO TRẠNG THÁI BAN ĐẦU
// ==========================================

thayDoiTrangThai("ban-dau");
