import { connectDB } from "@/lib/db";
import Log from "@/models/Log";

export default async function handler(req, res) {
  await connectDB();

  // GET → fetch last 200 logs
  if (req.method === "GET") {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({
      ok: true,
      count: logs.length,
      data: logs
    });
  }

  // POST → add new log entry
  if (req.method === "POST") {
    const { type, chatId, userId, message, details } = req.body;

    const log = await Log.create({
      type: type || "info",
      chatId,
      userId,
      message,
      details
    });

    return res.json({ ok: true, log });
  }

  // DELETE → clear all logs
  if (req.method === "DELETE") {
    await Log.deleteMany({});
    return res.json({ ok: true, msg: "All logs cleared" });
  }

  res.status(405).json({ ok: false, msg: "Method not allowed" });
}
