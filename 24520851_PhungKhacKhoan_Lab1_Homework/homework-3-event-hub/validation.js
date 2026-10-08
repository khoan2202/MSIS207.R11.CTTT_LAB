
// Chuẩn hóa họ và tên
function chuanHoaHoTen(giaTri) {
  return giaTri.trim().replace(/\s+/g, " ");
}

// Kiểm tra họ và tên
function kiemTraHoTen(giaTri) {
  const hoTen = chuanHoaHoTen(giaTri);

  return hoTen.length >= 3 && hoTen.length <= 100;
}

// Kiểm tra email
function kiemTraEmail(giaTri) {
  const email = giaTri.trim();

  // Kết hợp với validation của input type="email"
  return email.length > 0 && email.length <= 254;
}
