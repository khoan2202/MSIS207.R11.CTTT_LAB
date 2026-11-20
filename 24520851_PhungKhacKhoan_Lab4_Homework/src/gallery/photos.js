// HW1 — Dữ liệu ảnh. Ảnh là SVG minh họa tự tạo (scripts/generate-photos.mjs),
// nhẹ (1–9 KB) nên trang tải nhanh; width/height khai báo sẵn để tránh layout shift.
export const CATEGORIES = [
  { id: "nature", label: "Thiên nhiên" },
  { id: "city", label: "Đô thị" },
  { id: "evidence", label: "Bằng chứng" },
];

export const PHOTOS = [
  { id: "n1", category: "nature", title: "Dãy núi lúc bình minh", alt: "Ba ngọn núi xanh lục dưới bầu trời cam và mặt trời vàng", hue: 28 },
  { id: "n2", category: "nature", title: "Núi đỏ sẫm", alt: "Ba ngọn núi màu đỏ sẫm dưới bầu trời xanh dương", hue: 200 },
  { id: "n3", category: "nature", title: "Núi tím", alt: "Ba ngọn núi màu tím dưới bầu trời xanh lá", hue: 120 },
  { id: "n4", category: "nature", title: "Hoàng hôn trên núi", alt: "Ba ngọn núi xanh dưới bầu trời hồng đỏ lúc hoàng hôn", hue: 350 },
  { id: "c1", category: "city", title: "Đường chân trời", alt: "Hàng tòa nhà cao tầng sáng đèn trên nền trời tím", hue: 265 },
  { id: "c2", category: "city", title: "Thành phố về đêm", alt: "Các tòa nhà có cửa sổ sáng đèn vàng dưới trời xanh đậm", hue: 230 },
  { id: "c3", category: "city", title: "Phố lúc chiều tà", alt: "Dãy nhà cao tầng màu nâu dưới bầu trời cam", hue: 15 },
  { id: "c4", category: "city", title: "Phố ban ngày", alt: "Dãy nhà cao tầng màu xanh xám dưới bầu trời xanh", hue: 190 },
  { id: "e1", category: "evidence", title: "Biên bản số 01", alt: "Tờ biên bản nền vàng nhạt có các dòng chữ và con dấu đỏ số 01", hue: 45 },
  { id: "e2", category: "evidence", title: "Biên bản số 02", alt: "Tờ biên bản nền xanh ngọc có các dòng chữ và con dấu đỏ số 02", hue: 160 },
  { id: "e3", category: "evidence", title: "Biên bản số 03", alt: "Tờ biên bản nền xanh lá nhạt có các dòng chữ và con dấu đỏ số 03", hue: 95 },
  { id: "e4", category: "evidence", title: "Biên bản số 04", alt: "Tờ biên bản nền tím nhạt có các dòng chữ và con dấu đỏ số 04", hue: 300 },
].map((p) => ({ ...p, src: `/photos/${p.id}.svg`, width: 800, height: 600 }));
