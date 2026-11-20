import { createApp } from "./app.js";
import { createMemoryDb } from "./db.js";

// Cấu hình đọc từ biến môi trường (xem .env.example), không hardcode.
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const API_DELAY_MS = Number(process.env.API_DELAY_MS ?? 1200);

const app = createApp({ db: createMemoryDb(), clientOrigin: CLIENT_ORIGIN, delayMs: API_DELAY_MS });

app.listen(PORT, () => {
  console.log(`API chạy tại http://localhost:${PORT} (CORS: ${CLIENT_ORIGIN}, delay: ${API_DELAY_MS}ms)`);
});
