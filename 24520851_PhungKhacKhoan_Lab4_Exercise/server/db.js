// "Database" trong bộ nhớ cho Exercise (Homework mới dùng MongoDB/Mongoose 8).
// Dùng interface async giống DB thật để route handler viết bằng async/await.
const seed = {
  nasa: [
    { author: "mission-control", text: "Artemis: kiểm tra hệ thống hoàn tất." },
    { author: "astro-lan", text: "Ảnh mới từ kính viễn vọng đã được tải lên." },
  ],
  "esports-tribunal": [
    { author: "referee-01", text: "Phiên điều trần khiếu nại bắt đầu lúc 19:00." },
    { author: "moderator", text: "Vui lòng nộp bằng chứng trước hạn SLA." },
  ],
  notNasa: [{ author: "random-user", text: "Kênh này không liên quan đến NASA 🙂" }],
};

export function createMemoryDb(initial = seed) {
  const store = new Map();
  for (const [forum, list] of Object.entries(initial)) {
    store.set(
      forum,
      list.map((m, i) => ({
        id: `${forum}-${i + 1}`,
        forum,
        ...m,
        timestamp: new Date(Date.UTC(2026, 10, 1, 8, i)).toISOString(),
      })),
    );
  }

  return {
    async hasForum(forum) {
      return store.has(forum);
    },
    async listForums() {
      return [...store.keys()];
    },
    async getMessagesByForum(forum) {
      // Trả bản sao để code bên ngoài không sửa trực tiếp dữ liệu trong store.
      return (store.get(forum) ?? []).map((m) => ({ ...m }));
    },
    async addMessage(forum, message) {
      store.get(forum).push(message);
      return { ...message };
    },
  };
}
