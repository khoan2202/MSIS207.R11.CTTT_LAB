// @vitest-environment node
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../server/app.js";
import { createFakeModel } from "./fake-models.js";
import { Swipe } from "../server/models/Swipe.js";
import { Profile } from "../server/models/Profile.js";
import { requireMongoUri } from "../server/db.js";
import { PROFILES } from "../server/data/profiles.js";

const silent = { error: () => {} };
const makeApp = () => {
  const models = {
    Profile: createFakeModel({ seed: PROFILES }),
    Swipe: createFakeModel({ uniques: [["clientId"], ["sessionId", "profileId"]] }),
  };
  return { app: createApp({ models, logger: silent }), models };
};
const session = crypto.randomUUID();
const payload = (over = {}) => ({ clientId: crypto.randomUUID(), sessionId: session, profileId: "lan-cafe", action: "like", ...over });

describe("HW2 — Express + Mongoose 8 API", () => {
  it("GET /api/profiles trả danh sách theo order với field id", async () => {
    const res = await request(makeApp().app).get("/api/profiles");
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: "lan-cafe", name: "Lan" });
    expect(res.body[0]).not.toHaveProperty("_id");
  });

  it("POST tạo mới 201, gửi lại cùng clientId => 200 (idempotent)", async () => {
    const { app, models } = makeApp();
    const body = payload();
    expect((await request(app).post("/api/swipes").send(body)).status).toBe(201);
    expect((await request(app).post("/api/swipes").send(body)).status).toBe(200);
    expect(models.Swipe.docs).toHaveLength(1);
  });

  it("alias POST /api/swipe như slide vẫn hoạt động", async () => {
    expect((await request(makeApp().app).post("/api/swipe").send(payload())).status).toBe(201);
  });

  it("swipe cùng hồ sơ 2 lần trong một phiên => 409", async () => {
    const { app } = makeApp();
    await request(app).post("/api/swipes").send(payload());
    expect((await request(app).post("/api/swipes").send(payload({ action: "nope" }))).status).toBe(409);
  });

  it("payload sai => 400 kèm field; hồ sơ không tồn tại => 404", async () => {
    const { app } = makeApp();
    const bad = await request(app).post("/api/swipes").send(payload({ action: "love" }));
    expect(bad.status).toBe(400);
    expect(bad.body.fields).toHaveProperty("action");
    expect((await request(app).post("/api/swipes").send(payload({ profileId: "ghost" }))).status).toBe(404);
  });

  it("GET /api/swipes?sessionId khôi phục lịch sử đúng thứ tự; DELETE xóa (undo)", async () => {
    const { app } = makeApp();
    const a = payload({ profileId: "lan-cafe" });
    const b = payload({ profileId: "minh-gym", action: "nope" });
    await request(app).post("/api/swipes").send(a);
    await request(app).post("/api/swipes").send(b);
    let list = await request(app).get(`/api/swipes?sessionId=${session}`);
    expect(list.body.map((s) => s.profileId)).toEqual(["lan-cafe", "minh-gym"]);
    expect((await request(app).delete(`/api/swipes/${b.clientId}`)).status).toBe(204);
    list = await request(app).get(`/api/swipes?sessionId=${session}`);
    expect(list.body.map((s) => s.profileId)).toEqual(["lan-cafe"]);
    expect((await request(app).delete(`/api/swipes/${b.clientId}`)).status).toBe(204); // idempotent
  });

  it("sessionId không phải UUID => 400", async () => {
    expect((await request(makeApp().app).get("/api/swipes?sessionId=abc")).status).toBe(400);
  });
});

describe("HW2 — Mongoose schema & cấu hình", () => {
  it("Swipe schema từ chối action ngoài enum (validateSync, không cần DB)", () => {
    const err = new Swipe({ clientId: "c", sessionId: "s", profileId: "p", action: "love" }).validateSync();
    expect(err.errors.action).toBeTruthy();
  });
  it("Profile schema yêu cầu tuổi >= 18", () => {
    const err = new Profile({ _id: "x", name: "X", age: 16, city: "HCM", bio: "..." }).validateSync();
    expect(err.errors.age).toBeTruthy();
  });
  it("Swipe có unique index (sessionId, profileId)", () => {
    const idx = Swipe.schema.indexes().find(([fields]) => fields.sessionId && fields.profileId);
    expect(idx[1].unique).toBe(true);
  });
  it("thiếu MONGODB_URI => ném lỗi rõ ràng", () => {
    expect(() => requireMongoUri({})).toThrow(/MONGODB_URI missing/);
  });
  it("đang dùng Mongoose 8", () => {
    expect(mongoose.version.startsWith("8.")).toBe(true);
  });
});
