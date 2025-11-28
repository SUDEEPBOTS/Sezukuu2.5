import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const bots = await PublicBot.find({}).select("botName botUsername").lean();

  return res.json({ ok: true, bots });
}
