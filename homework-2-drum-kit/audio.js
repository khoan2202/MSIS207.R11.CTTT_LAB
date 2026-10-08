
// Lưu các bộ đệm âm thanh đã tải
const boNhoAmThanh = new Map();

let boXuLyAmThanh = null;

// Tạo bộ xử lý âm thanh của trình duyệt
function layBoXuLyAmThanh() {
  if (!boXuLyAmThanh) {
    boXuLyAmThanh = new AudioContext();
  }

  return boXuLyAmThanh;
}

// Đọc và giải mã file âm thanh
async function taiAmThanh(duongDan) {
  if (!boNhoAmThanh.has(duongDan)) {
    const tacVu = (async () => {
      const phanHoi = await fetch(duongDan);

      if (!phanHoi.ok) {
        throw new Error("Không tải được: " + duongDan);
      }

      const duLieu = await phanHoi.arrayBuffer();

      return layBoXuLyAmThanh()
        .decodeAudioData(duLieu);
    })();

    boNhoAmThanh.set(duongDan, tacVu);
  }

  try {
    return await boNhoAmThanh.get(duongDan);
  } catch (loi) {
    boNhoAmThanh.delete(duongDan);
    throw loi;
  }
}

// Phát âm thanh
async function phatAmThanh(duongDan) {
  const boXuLy = layBoXuLyAmThanh();

  if (boXuLy.state === "suspended") {
    await boXuLy.resume();
  }

  const duLieu = await taiAmThanh(duongDan);

  const nguon = boXuLy.createBufferSource();
  nguon.buffer = duLieu;
  nguon.connect(boXuLy.destination);
  nguon.start();
}
