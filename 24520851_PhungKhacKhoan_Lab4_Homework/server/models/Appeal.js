import mongoose from "mongoose";
import { APPEAL_REASONS, APPEAL_OUTCOMES, STATEMENT_LIMITS } from "../../shared/appealRules.js";

// Đơn khiếu nại. Mỗi người chơi chỉ được nộp 1 đơn cho vụ hiện tại (unique playerId).
// Schema lặp lại các ràng buộc chính của shared/appealRules.js như lớp phòng thủ cuối ở tầng DB.
const appealSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, ref: "Dossier" },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    reason: { type: String, required: true, enum: APPEAL_REASONS.map((r) => r.id) },
    requestedOutcome: { type: String, required: true, enum: APPEAL_OUTCOMES.map((o) => o.id) },
    statement: { type: String, required: true, minlength: STATEMENT_LIMITS.min, maxlength: STATEMENT_LIMITS.max },
    evidenceUrl: { type: String, default: "" },
    status: { type: String, enum: ["received", "under-review", "decided"], default: "received" },
  },
  { timestamps: true, versionKey: false },
);

export const Appeal = mongoose.models.Appeal ?? mongoose.model("Appeal", appealSchema);
