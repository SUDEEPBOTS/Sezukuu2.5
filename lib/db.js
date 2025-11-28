import mongoose from "mongoose";

const MAIN = process.env.MONGODB_URI_MAIN;
const PUBLIC = process.env.MONGODB_URI_PUBLIC;

// MAIN DB
export async function connectMainDB() {
  if (!MAIN) throw new Error("Missing MONGODB_URI_MAIN");
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MAIN, { dbName: "sezukuu_main" });
  console.log("🔥 MAIN DB CONNECTED");
}

// PUBLIC DB
export async function connectPublicDB() {
  if (!PUBLIC) throw new Error("Missing MONGODB_URI_PUBLIC");
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(PUBLIC, { dbName: "yuki_sezukuut" });
  console.log("🔥 PUBLIC DB CONNECTED");
}
