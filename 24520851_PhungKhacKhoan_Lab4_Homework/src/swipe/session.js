// sessionId lưu ở localStorage để F5 vẫn khôi phục đúng phiên từ server.
// localStorage có thể bị chặn (chế độ riêng tư, iframe) => bọc try/catch, khi lỗi dùng id tạm.
const KEY = "lab4-hw2-session";

export function loadSessionId() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch { /* bỏ qua */ }
  return saveSessionId(crypto.randomUUID());
}

export function saveSessionId(id) {
  try { localStorage.setItem(KEY, id); } catch { /* bỏ qua */ }
  return id;
}
