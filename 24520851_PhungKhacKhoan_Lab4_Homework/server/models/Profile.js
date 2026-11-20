import mongoose from "mongoose";

// Hồ sơ trong bộ bài "Hẹn Hò Nhưng Không Yêu" (dữ liệu giả lập).
// _id là chuỗi slug (vd "lan-cafe") để URL và log dễ đọc.
const profileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    age: { type: Number, required: true, min: 18, max: 99 },
    city: { type: String, required: true, trim: true },
    bio: { type: String, required: true, maxlength: 280 },
    tags: { type: [String], default: [] },
    hue: { type: Number, min: 0, max: 360, default: 210 },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const Profile = mongoose.models.Profile ?? mongoose.model("Profile", profileSchema);
