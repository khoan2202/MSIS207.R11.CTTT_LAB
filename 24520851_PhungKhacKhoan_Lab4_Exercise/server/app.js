import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

// Sprint 3 contract — Express REST API
//   GET  /api/forums               -> 200 string[]
//   GET  /api/messages/:forum      -> 200 Message[] | 404 { error }
//   POST /api/messages/:forum      -> 201 Message   | 400 { error, fields } | 404 { error }
// Message = { id, forum, author, text, timestamp }

const LIMITS = { author: 40, text: 500 };

// Validate payload ở server (không tin client). Trả về object lỗi theo field.
export function validateMessagePayload(body) {
  const errors = {};
  if (body === null || typeof body !== "object") return { body: "Payload phải là JSON object." };
  for (const field of ["author", "text"]) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) errors[field] = `Thiếu trường ${field}.`;
    else if (value.trim().length > LIMITS[field]) errors[field] = `${field} tối đa ${LIMITS[field]} ký tự.`;
  }
  return errors;
}

// Chờ ms mili-giây nhưng dừng sớm nếu client đã ngắt kết nối (AbortController phía client).
function wait(ms, req) {
  return new Promise((resolve) => {
    if (ms <= 0) return resolve(true);
    const timer = setTimeout(() => resolve(true), ms);
    req.once("close", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export function createApp({ db, clientOrigin = "http://localhost:5173", delayMs = 0, logger = console } = {}) {
  const app = express();

  // CORS: chỉ cho phép origin của Vite dev server, không dùng "*".
  app.use(cors({ origin: clientOrigin }));
  // Giới hạn kích thước body để chặn payload quá lớn.
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/forums", async (_req, res) => {
    res.json(await db.listForums());
  });

  app.get("/api/messages/:forum", async (req, res) => {
    const { forum } = req.params;
    // ?fail=1 => giả lập lỗi 503 để thử Auto-Retry Backoff (Live Defense).
    if (req.query.fail === "1") return res.status(503).json({ error: "Dịch vụ tạm thời không khả dụng." });

    const completed = await wait(delayMs, req);
    if (!completed) {
      // Log này là bằng chứng phía server rằng request đã bị client hủy.
      logger.warn(`[aborted] GET /api/messages/${forum} — client đã hủy request`);
      return;
    }
    if (!(await db.hasForum(forum))) return res.status(404).json({ error: `Không có kênh "${forum}".` });
    res.json(await db.getMessagesByForum(forum));
  });

  app.post("/api/messages/:forum", async (req, res) => {
    const { forum } = req.params;
    if (!(await db.hasForum(forum))) return res.status(404).json({ error: `Không có kênh "${forum}".` });

    const fields = validateMessagePayload(req.body);
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: "Thiếu hoặc sai trường bắt buộc.", fields });
    }

    // Chỉ lấy các field cho phép (whitelist). KHÔNG spread ...req.body vì client
    // có thể gửi kèm id/timestamp giả để ghi đè (mass assignment).
    const newMessage = {
      id: randomUUID(),
      forum,
      author: req.body.author.trim(),
      text: req.body.text.trim(),
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(await db.addMessage(forum, newMessage));
  });

  app.use("/api", (_req, res) => res.status(404).json({ error: "Endpoint không tồn tại." }));

  // Middleware lỗi (4 tham số). Express 5 tự chuyển lỗi từ async handler vào đây.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON không hợp lệ." });
    if (err.type === "entity.too.large") return res.status(413).json({ error: "Payload quá lớn." });
    logger.error("[server error]", err);
    res.status(500).json({ error: "Lỗi máy chủ." });
  });

  return app;
}
