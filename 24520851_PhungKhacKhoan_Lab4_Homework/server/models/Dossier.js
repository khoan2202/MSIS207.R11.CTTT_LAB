import mongoose from "mongoose";

const precedentSchema = new mongoose.Schema(
  { caseId: String, severity: { type: Number, min: 1, max: 5 }, banDays: { type: Number, min: 0 } },
  { _id: false },
);

// Hồ sơ vụ việc của một người chơi. _id = playerID dạng chữ thường ("himass").
const dossierSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    team: String,
    tournament: String,
    offense: {
      caseId: { type: String, required: true },
      title: { type: String, required: true },
      detectedBy: String,
      severity: { type: Number, required: true, min: 1, max: 5 },
    },
    penalty: { banDays: { type: Number, required: true, min: 0 }, pointDeduction: { type: Number, default: 0 } },
    issuedAt: { type: Date, required: true },
    appealDeadline: { type: Date, required: true },
    evidence: [{ _id: false, label: String, note: String }],
    precedents: [precedentSchema],
  },
  { timestamps: true, versionKey: false },
);

export const Dossier = mongoose.models.Dossier ?? mongoose.model("Dossier", dossierSchema);
