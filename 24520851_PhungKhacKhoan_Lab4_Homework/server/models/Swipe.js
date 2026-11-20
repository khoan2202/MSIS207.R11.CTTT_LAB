import mongoose from "mongoose";
import { SWIPE_ACTIONS } from "../../shared/swipeRules.js";

// Một lượt swipe. clientId do client sinh (crypto.randomUUID) => POST lặp lại (retry mạng)
// không tạo bản ghi trùng (idempotent), và DELETE khi undo không cần chờ server trả _id.
const swipeSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, index: true },
    profileId: { type: String, required: true, ref: "Profile" },
    action: { type: String, required: true, enum: SWIPE_ACTIONS },
  },
  { timestamps: true, versionKey: false },
);

// Một phiên không được swipe cùng một hồ sơ hai lần.
swipeSchema.index({ sessionId: 1, profileId: 1 }, { unique: true });

export const Swipe = mongoose.models.Swipe ?? mongoose.model("Swipe", swipeSchema);
