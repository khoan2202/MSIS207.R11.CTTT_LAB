
// Lấy phần tử hiển thị đồng hồ
const dongHo = document.querySelector("#dong-ho");

// Thời gian sự kiện theo chuẩn UTC ISO 8601
// Đây là ngày mẫu, có thể thay đổi
const thoiGianSuKien = Date.parse(
  "2026-12-01T09:00:00Z"
);

// Cập nhật thời gian còn lại
function capNhatDongHo() {
  const thoiGianConLai = Math.max(
    0,
    thoiGianSuKien - Date.now()
  );

  const tongSoGiay = Math.ceil(
    thoiGianConLai / 1000
  );

  const ngay = Math.floor(tongSoGiay / 86400);

  const gio = Math.floor(
    (tongSoGiay % 86400) / 3600
  );

  const phut = Math.floor(
    (tongSoGiay % 3600) / 60
  );

  const giay = tongSoGiay % 60;

  dongHo.textContent =
    `${ngay} ngày ${gio} giờ ${phut} phút ${giay} giây`;

  if (thoiGianConLai === 0) {
    clearInterval(maDongHo);
    dongHo.textContent = "Sự kiện đã bắt đầu!";
  }
}

// Cập nhật mỗi giây
const maDongHo = setInterval(
  capNhatDongHo,
  1000
);

capNhatDongHo();
