import { Router } from "express";
import { validateSwipePayload } from "../../shared/swipeRules.js";

// HW2 contract — Swipe Deck API (Mongoose 8, async/await, không callback)
//   GET    /api/profiles                 -> 200 Profile[]
//   GET    /api/swipes?sessionId=<uuid>  -> 200 { clientId, profileId, action }[] (khôi phục phiên)
//   POST   /api/swipes   (alias /api/swipe như slide) -> 201 tạo mới | 200 đã tồn tại | 400 | 404 | 409
//   DELETE /api/swipes/:clientId         -> 204 (idempotent, dùng cho Undo)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toSwipeDto = ({ clientId, profileId, action }) => ({ clientId, profileId, action });

export function swipeRoutes({ Profile, Swipe }) {
  const router = Router();

  router.get("/profiles", async (_req, res) => {
    // .lean() trả object JS thuần (không phải Mongoose Document) => nhanh, nhẹ hơn khi chỉ đọc.
    const profiles = await Profile.find({}, { createdAt: 0, updatedAt: 0 }).sort({ order: 1 }).lean();
    res.json(profiles.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
  });

  router.get("/swipes", async (req, res) => {
    const { sessionId } = req.query;
    if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) {
      return res.status(400).json({ error: "sessionId phải là UUID." });
    }
    const swipes = await Swipe.find({ sessionId }).sort({ createdAt: 1 }).lean();
    res.json(swipes.map(toSwipeDto));
  });

  const createSwipe = async (req, res) => {
    const fields = validateSwipePayload(req.body);
    if (Object.keys(fields).length) return res.status(400).json({ error: "Payload không hợp lệ.", fields });

    // Whitelist field — không đưa thẳng req.body vào create().
    const { clientId, sessionId, profileId, action } = req.body;
    if (!(await Profile.exists({ _id: profileId }))) {
      return res.status(404).json({ error: `Không có hồ sơ "${profileId}".` });
    }

    try {
      const record = await Swipe.create({ clientId, sessionId, profileId, action });
      return res.status(201).json(toSwipeDto(record));
    } catch (err) {
      if (err?.code === 11000) {
        // Trùng clientId => client gửi lại cùng một lượt (retry) => trả bản ghi cũ, coi như thành công.
        if (err.keyPattern?.clientId) {
          const existing = await Swipe.findOne({ clientId }).lean();
          return res.status(200).json(toSwipeDto(existing));
        }
        return res.status(409).json({ error: "Hồ sơ này đã được swipe trong phiên." });
      }
      if (err?.name === "ValidationError") return res.status(400).json({ error: err.message });
      throw err; // để middleware lỗi chung xử lý (500)
    }
  };

  router.post("/swipes", createSwipe);
  router.post("/swipe", createSwipe);

  router.delete("/swipes/:clientId", async (req, res) => {
    await Swipe.deleteOne({ clientId: req.params.clientId });
    res.status(204).end();
  });

  return router;
}
