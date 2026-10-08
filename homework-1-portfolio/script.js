
// Lấy các phần tử HTML cần xử lý
const nutGiaoDien = document.querySelector("#nut-giao-dien");
const bieuMau = document.querySelector("#bieu-mau-lien-he");
const thongBao = document.querySelector("#thong-bao");

// Hàm thay đổi giao diện
function thayDoiGiaoDien(cheDo) {
  const laCheDoToi = cheDo === "toi";

  document.body.classList.toggle(
    "che-do-toi",
    laCheDoToi
  );

  nutGiaoDien.setAttribute(
    "aria-pressed",
    String(laCheDoToi)
  );

  nutGiaoDien.textContent = laCheDoToi
    ? "Chuyển chế độ sáng"
    : "Chuyển chế độ tối";
}

// Đọc giao diện đã lưu
const cheDoDaLuu =
  localStorage.getItem("theme") || "sang";

thayDoiGiaoDien(cheDoDaLuu);

// Xử lý khi bấm nút đổi giao diện
nutGiaoDien.addEventListener("click", () => {
  const dangToi =
    document.body.classList.contains("che-do-toi");

  const cheDoMoi = dangToi ? "sang" : "toi";

  thayDoiGiaoDien(cheDoMoi);

  localStorage.setItem("theme", cheDoMoi);
});

// Xử lý biểu mẫu liên hệ
bieuMau.addEventListener("submit", (suKien) => {
  suKien.preventDefault();

  if (!bieuMau.reportValidity()) {
    return;
  }

  thongBao.textContent =
    "Thông tin hợp lệ. Đây là biểu mẫu minh họa.";

  bieuMau.reset();
});
