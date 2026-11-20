// @vitest-environment node
import request from "supertest";
import { createApp } from "../server/app.js";
import { createFakeModel } from "./fake-models.js";
import { buildDossiers } from "../server/data/dossiers.js";
import { Appeal } from "../server/models/Appeal.js";
import { Dossier } from "../server/models/Dossier.js";

const T0 = Date.UTC(2026, 10, 20, 8, 0, 0);
function makeApp(clock = { t: T0 }) {
  const models = {
    Profile: createFakeModel(), Swipe: createFakeModel(),
    Dossier: createFakeModel({ seed: buildDossiers(new Date(T0)) }),
    Appeal: createFakeModel({ uniques: [["playerId"]], defaults: { status: "received" } }),
  };
  return { app: createApp({ models, logger: { error: () => {} }, now: () => clock.t }), models, clock };
}
const appeal = (over = {}) => ({
  playerId: "himass", contactEmail: "a@b.com", reason: "technical-issue", requestedOutcome: "reduce",
  statement: "Hai lần mất kết nối là do sự cố mạng ký túc xá, có xác nhận của ban quản lý ký túc xá kèm theo.", acknowledge: true, ...over,
});

describe("HW3 — Tribunal API", () => {
  it("GET /api/time trả thời gian server và không cho cache", async () => {
    const res = await request(makeApp().app).get("/api/time");
    expect(res.body.now).toBe(T0);
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("GET /api/dossiers/:playerID không phân biệt hoa thường; id lạ => 404", async () => {
    const { app } = makeApp();
    const res = await request(app).get("/api/dossiers/HiMaSS");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ playerId: "himass", displayName: "Himass" });
    expect((await request(app).get("/api/dossiers/ghost")).status).toBe(404);
  });

  it("POST hợp lệ => 201; nộp lần 2 => 409; GET /api/appeals/himass trả trạng thái", async () => {
    const { app } = makeApp();
    const first = await request(app).post("/api/appeals").send(appeal());
    expect(first.status).toBe(201);
    expect(first.body.status).toBe("received");
    expect((await request(app).post("/api/appeals").send(appeal())).status).toBe(409);
    expect((await request(app).get("/api/appeals/himass")).body.reason).toBe("technical-issue");
    const none = await request(app).get("/api/appeals/tanvuu");
    expect(none.status).toBe(200);
    expect(none.body).toBeNull();
  });

  it("server validate lại bằng luật dùng chung (client bị bypass vẫn bị chặn)", async () => {
    const res = await request(makeApp().app).post("/api/appeals").send(appeal({ statement: "ngắn", acknowledge: "true" }));
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)).toEqual(["statement", "acknowledge"]);
  });

  it("quá hạn SLA theo ĐỒNG HỒ SERVER => 422", async () => {
    const ctx = makeApp();
    ctx.clock.t = T0 + 7 * 3600 * 1000; // tanvuu chỉ còn 6 giờ
    expect((await request(ctx.app).post("/api/appeals").send(appeal({ playerId: "tanvuu" }))).status).toBe(422);
    expect((await request(ctx.app).post("/api/appeals").send(appeal())).status).toBe(201); // himass còn hạn
  });

  it("schema Appeal từ chối reason ngoài enum; Dossier yêu cầu severity 1–5", () => {
    expect(new Appeal({ ...appeal(), reason: "boring" }).validateSync().errors.reason).toBeTruthy();
    const d = buildDossiers()[0];
    expect(new Dossier({ ...d, offense: { ...d.offense, severity: 9 } }).validateSync().errors["offense.severity"]).toBeTruthy();
  });
});
