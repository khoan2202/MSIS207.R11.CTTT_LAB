import express from "express";
import cors from "cors";
import { swipeRoutes } from "./routes/swipeRoutes.js";

// createApp nhận models qua tham số (dependency injection):
// - server.js truyền model Mongoose thật;
// - test truyền model giả trong bộ nhớ => test API không cần MongoDB.
export function createApp({ models, clientOrigin = "http://localhost:5174", logger = console }) {
  const app = express();
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", swipeRoutes(models));

  app.use("/api", (_req, res) => res.status(404).json({ error: "Endpoint không tồn tại." }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON không hợp lệ." });
    logger.error("[server error]", err);
    res.status(500).json({ error: "Lỗi máy chủ." });
  });

  return app;
}
