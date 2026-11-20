import { connectDb, disconnectDb, requireMongoUri } from "./db.js";
import { Profile } from "./models/index.js";
import { PROFILES } from "./data/profiles.js";

// npm run seed — nạp dữ liệu mẫu (chạy lại nhiều lần vẫn an toàn nhờ upsert).
await connectDb(requireMongoUri());
const result = await Profile.bulkWrite(
  PROFILES.map((p) => ({ replaceOne: { filter: { _id: p._id }, replacement: p, upsert: true } })),
);
console.log(`Profiles: ${result.upsertedCount} mới, ${result.modifiedCount} cập nhật.`);
await disconnectDb();
