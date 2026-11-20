// @vitest-environment node
import request from "supertest";
import { createApp } from "../server/app.js";
import { createMemoryDb } from "../server/db.js";

const silent = { warn: () => {}, error: () => {} };
const makeApp = (opts = {}) => createApp({ db: createMemoryDb(), logger: silent, ...opts });

describe("Sprint 3 — Express REST API", () => {
  it("GET trả tin nhắn của kênh và header CORS đúng origin", async () => {
    const res = await request(makeApp()).get("/api/messages/nasa").set("Origin", "http://localhost:5173");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.body.every((m) => m.forum === "nasa")).toBe(true);
  });

  it("kênh không tồn tại => 404", async () => {
    const res = await request(makeApp()).get("/api/messages/mars");
    expect(res.status).toBe(404);
  });

  it("POST thiếu trường => 400 kèm lỗi theo field", async () => {
    const res = await request(makeApp()).post("/api/messages/nasa").send({ author: "khoan" });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty("text");
  });

  it("POST hợp lệ => 201, id do server sinh (không cho client ghi đè)", async () => {
    const app = makeApp();
    const res = await request(app)
      .post("/api/messages/esports-tribunal")
      .send({ author: " khoan ", text: "Xin chào", id: "hacked", timestamp: "1999" });
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe("hacked");
    expect(res.body.author).toBe("khoan");
    expect(res.body.timestamp).not.toBe("1999");
    const list = await request(app).get("/api/messages/esports-tribunal");
    expect(list.body.at(-1).text).toBe("Xin chào");
  });

  it("JSON hỏng => 400 thay vì 500", async () => {
    const res = await request(makeApp())
      .post("/api/messages/nasa")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
  });

  it("?fail=1 => 503 (dùng cho bài Auto-Retry)", async () => {
    const res = await request(makeApp()).get("/api/messages/nasa?fail=1");
    expect(res.status).toBe(503);
  });
});
