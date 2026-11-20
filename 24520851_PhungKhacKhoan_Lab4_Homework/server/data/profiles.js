// Dữ liệu GIẢ LẬP cho HW2 "Hẹn Hò Nhưng Không Yêu" — nhân vật hư cấu, không phải người thật.
export const PROFILES = [
  { _id: "lan-cafe", name: "Lan", age: 22, city: "TP.HCM", bio: "Chỉ hẹn ở quán cà phê có ổ cắm. Nói chuyện tình cảm thì xin phép đang bận deadline.", tags: ["cà phê", "deadline", "lo-fi"], hue: 25 },
  { _id: "minh-gym", name: "Minh", age: 24, city: "Hà Nội", bio: "Đi gym 6 buổi/tuần, buổi thứ 7 để… đi gym. Không yêu, chỉ tập.", tags: ["gym", "protein", "5h sáng"], hue: 205 },
  { _id: "thu-coder", name: "Thư", age: 21, city: "Thủ Đức", bio: "Sinh viên IT. Hẹn hò được, nhưng phải merge xong PR đã.", tags: ["React", "git", "trà sữa"], hue: 160 },
  { _id: "khang-phuot", name: "Khang", age: 26, city: "Đà Lạt", bio: "Thích phượt. Mối quan hệ dài nhất của mình là với con xe số.", tags: ["phượt", "cắm trại", "nhiếp ảnh"], hue: 95 },
  { _id: "vy-meo", name: "Vy", age: 23, city: "Cần Thơ", bio: "Có 3 con mèo. Bạn cần được cả 3 duyệt, mình chỉ là thư ký.", tags: ["mèo", "đọc sách", "nấu ăn"], hue: 320 },
  { _id: "duc-game", name: "Đức", age: 25, city: "Đà Nẵng", bio: "Rank cao, tình cảm thấp. Tìm người duo, không tìm người yêu.", tags: ["game", "esports", "mì gói"], hue: 260 },
  { _id: "hoa-plan", name: "Hoa", age: 27, city: "Huế", bio: "Lên kế hoạch cho mọi thứ, trừ việc yêu. Lịch kín tới 2027.", tags: ["Notion", "chạy bộ", "kế hoạch"], hue: 45 },
  { _id: "tuan-chill", name: "Tuấn", age: 22, city: "Vũng Tàu", bio: "Chill là chính. Nhắn tin trả lời sau 3–5 ngày làm việc.", tags: ["biển", "guitar", "ngủ nướng"], hue: 185 },
].map((p, order) => ({ ...p, order }));
