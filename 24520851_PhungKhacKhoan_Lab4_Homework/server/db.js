import mongoose from "mongoose";

// Kết nối MongoDB theo cú pháp Mongoose 8:
// - KHÔNG truyền useNewUrlParser / useUnifiedTopology (đã bị bỏ từ driver 4 / Mongoose 6).
// - Connection string chỉ lấy từ biến môi trường, không bao giờ hardcode trong code.
export function requireMongoUri(env = process.env) {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing — sao chép .env.example thành .env và điền connection string.");
  }
  return env.MONGODB_URI;
}

export async function connectDb(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
