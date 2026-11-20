import { createApp } from "./app.js";
import { connectDb, disconnectDb, requireMongoUri } from "./db.js";
import * as models from "./models/index.js";

// 1. Chặn khởi động nếu thiếu MONGODB_URI (không fallback sang chuỗi hardcode).
const uri = requireMongoUri();
const PORT = Number(process.env.PORT ?? 3002);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5174";

// 2. Top-level await (ESM): kết nối DB xong mới mở cổng HTTP.
await connectDb(uri);
const server = createApp({ models, clientOrigin: CLIENT_ORIGIN }).listen(PORT, () => {
  console.log(`API: http://localhost:${PORT} — CORS cho ${CLIENT_ORIGIN}`);
});

// 3. Tắt gọn gàng khi Ctrl+C: đóng HTTP rồi đóng kết nối MongoDB.
const shutdown = async () => {
  server.close();
  await disconnectDb();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
