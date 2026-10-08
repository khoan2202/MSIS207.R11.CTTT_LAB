const danhSachNut = document.querySelectorAll(".nut-trong");
const nutBatDau = document.querySelector("#bat-dau");
const nutDung = document.querySelector("#dung");
const nutPhatLai = document.querySelector("#phat-lai");
const trangThai = document.querySelector("#trang-thai");

let dangGhi = false;
let dangPhatLai = false;
let thoiDiemBatDau = 0;
let danhSachNhip = [];
let danhSachHenGio = [];

function timNutTrong(phim) {
  return [...danhSachNut].find(
    nut => nut.dataset.key === phim.toLowerCase()
  );
}

function kichHoatTrong(phim) {
  const nut = timNutTrong(phim);
  if (!nut) return;
  if (dangGhi && !dangPhatLai) {
    danhSachNhip.push({
      phim: phim.toLowerCase(),
      thoiGian: performance.now() - thoiDiemBatDau
    });
  }

  // Phát âm thanh từ file audio.js
  phatAmThanh(nut.dataset.sound)
    .catch(loi => {
      console.error("Lỗi phát âm thanh:", loi);
      trangThai.textContent = "Không phát được âm thanh.";
    });

  nut.classList.add("dang-nhan");
  setTimeout(() => {
    nut.classList.remove("dang-nhan");
  }, 120);
}


document.addEventListener("keydown", (suKien) => {
  // Ngăn việc giữ phím gây lặp âm thanh
  if (suKien.repeat) return;

  // Phát trống theo phím vừa nhấn
  kichHoatTrong(suKien.key);
});

danhSachNut.forEach(nut => {
  nut.addEventListener("click", () => {
    kichHoatTrong(nut.dataset.key);
  });
});

function dungPhatLai() {
  // Hủy tất cả lịch phát chưa thực hiện
  danhSachHenGio.forEach(maHenGio => {
    clearTimeout(maHenGio);
  });
  danhSachHenGio = [];
  dangPhatLai = false;
}

nutBatDau.addEventListener("click", () => {
  dungPhatLai();
  danhSachNhip = [];
  thoiDiemBatDau = performance.now();
  dangGhi = true;
  trangThai.textContent = "Đang ghi nhịp...";
});

nutDung.addEventListener("click", () => {
  // Tắt chế độ ghi
  dangGhi = false;

  // Hủy lịch phát lại nếu có
  dungPhatLai();

  // Thông báo trạng thái
  trangThai.textContent = "Đã dừng";
});

nutPhatLai.addEventListener("click", () => {
  if (danhSachNhip.length === 0) {
    trangThai.textContent = "Chưa có nhịp được ghi.";
    return;
  }

  dangGhi = false;
  dungPhatLai();
  dangPhatLai = true;
  trangThai.textContent = "Đang phát lại...";
  danhSachNhip.forEach(nhip => {

    const maHenGio = setTimeout(() => {
      kichHoatTrong(nhip.phim);
    }, nhip.thoiGian);

    // Lưu mã hẹn giờ để có thể hủy
    danhSachHenGio.push(maHenGio);
  });

  const nhipCuoi = danhSachNhip.at(-1);
  const maKetThuc = setTimeout(() => {
    dangPhatLai = false;

    danhSachHenGio = [];

    trangThai.textContent = "Phát lại hoàn tất.";
  }, nhipCuoi.thoiGian + 250);

  danhSachHenGio.push(maKetThuc);
});
