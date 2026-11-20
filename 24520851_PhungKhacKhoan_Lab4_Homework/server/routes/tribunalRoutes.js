import { Router } from "express";
import { validateAppeal } from "../../shared/appealRules.js";

// HW3 contract — Esports Fair-Play Appeal Tribunal API
//   GET  /api/time                    -> 200 { now }  (đồng hồ chuẩn cho useAppealSlaTimer)
//   GET  /api/dossiers                -> 200 tóm tắt các hồ sơ
//   GET  /api/dossiers/:playerID      -> 200 Dossier | 404
//   GET  /api/appeals/:playerID       -> 200 Appeal | 404 (chưa nộp)
//   POST /api/appeals                 -> 201 | 400 sai dữ liệu | 404 không có hồ sơ | 409 đã nộp | 422 quá hạn SLA
const toDossierDto = ({ _id, createdAt, updatedAt, ...rest }) => ({ playerId: _id, ...rest });
const toAppealDto = ({ _id, playerId, reason, requestedOutcome, status, createdAt }) => ({
  appealId: String(_id), playerId, reason, requestedOutcome, status, submittedAt: createdAt,
});

export function tribunalRoutes({ Dossier, Appeal }, { now = () => Date.now() } = {}) {
  const router = Router();

  router.get("/time", (_req, res) => {
    res.set("Cache-Control", "no-store"); // không được cache, nếu không đồng hồ sẽ sai
    res.json({ now: now() });
  });

  router.get("/dossiers", async (_req, res) => {
    const list = await Dossier.find({}, { displayName: 1, team: 1, offense: 1, appealDeadline: 1 }).sort({ _id: 1 }).lean();
    res.json(list.map(toDossierDto));
  });

  router.get("/dossiers/:playerID", async (req, res) => {
    const dossier = await Dossier.findOne({ _id: req.params.playerID.toLowerCase() }).lean();
    if (!dossier) return res.status(404).json({ error: `Không có hồ sơ "${req.params.playerID}".` });
    res.json(toDossierDto(dossier));
  });

  router.get("/appeals/:playerID", async (req, res) => {
    const appeal = await Appeal.findOne({ playerId: req.params.playerID.toLowerCase() }).lean();
    if (!appeal) return res.status(404).json({ error: "Chưa có đơn khiếu nại." });
    res.json(toAppealDto(appeal));
  });

  router.post("/appeals", async (req, res) => {
    const body = req.body ?? {};
    const fields = validateAppeal(body);
    if (typeof body.playerId !== "string" || !body.playerId.trim()) fields.playerId = "Thiếu playerId.";
    if (Object.keys(fields).length) return res.status(400).json({ error: "Đơn khiếu nại chưa hợp lệ.", fields });

    const playerId = body.playerId.trim().toLowerCase();
    const dossier = await Dossier.findOne({ _id: playerId }).lean();
    if (!dossier) return res.status(404).json({ error: `Không có hồ sơ "${playerId}".` });

    // Server là nơi QUYẾT ĐỊNH quá hạn — không tin đồng hồ của client.
    if (now() > new Date(dossier.appealDeadline).getTime()) {
      return res.status(422).json({ error: "Đã quá hạn SLA nộp khiếu nại." });
    }

    try {
      const appeal = await Appeal.create({
        playerId,
        contactEmail: body.contactEmail.trim(),
        reason: body.reason,
        requestedOutcome: body.requestedOutcome,
        statement: body.statement.trim(),
        evidenceUrl: (body.evidenceUrl ?? "").trim(),
      });
      return res.status(201).json(toAppealDto(appeal));
    } catch (err) {
      if (err?.code === 11000) return res.status(409).json({ error: "Người chơi này đã nộp đơn khiếu nại." });
      if (err?.name === "ValidationError") return res.status(400).json({ error: err.message });
      throw err;
    }
  });

  return router;
}
