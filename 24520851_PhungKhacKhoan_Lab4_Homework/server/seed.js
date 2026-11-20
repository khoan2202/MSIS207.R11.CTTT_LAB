import { connectDb, disconnectDb, requireMongoUri } from "./db.js";
import { Profile, Dossier } from "./models/index.js";
import { PROFILES } from "./data/profiles.js";
import { buildDossiers } from "./data/dossiers.js";

// npm run seed — nạp dữ liệu mẫu (chạy lại nhiều lần vẫn an toàn nhờ upsert).
await connectDb(requireMongoUri());
const result = await Profile.bulkWrite(
  PROFILES.map((p) => ({ replaceOne: { filter: { _id: p._id }, replacement: p, upsert: true } })),
);
console.log(`Profiles: ${result.upsertedCount} mới, ${result.modifiedCount} cập nhật.`);

// Hồ sơ HW3: hạn SLA tính lại từ thời điểm seed.
const dossiers = buildDossiers(new Date());
await Dossier.bulkWrite(dossiers.map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true } })));
console.log(`Dossiers: ${dossiers.map((d) => d._id).join(", ")} (hạn SLA tính từ bây giờ).`);
await disconnectDb();
