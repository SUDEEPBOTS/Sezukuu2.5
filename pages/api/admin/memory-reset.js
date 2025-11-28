import { connectDB } from "@/lib/db";
import Memory from "@/models/Memory";

export default async function handler(req, res) {
  await connectDB();

  // GET — show total memory entries
  if (req.method === "GET") {
    const count = await Memory.countDocuments();
    return res.json({ ok: true, totalMemories: count });
  }

  // POST — reset memory for specific user in a specific chat
  if (req.method === "POST") {
    const { chatId, userId } = req.body;

    if (!chatId || !userId)
      return res.json({ ok: false, msg: "chatId and userId required" });

    await Memory.deleteMany({ chatId, userId });

    return res.json({
      ok: true,
      msg: `Memory cleared for user ${userId} in chat ${chatId}`
    });
  }

  // DELETE — reset ALL memories
  if (req.method === "DELETE") {
    await Memory.deleteMany({});
    return res.json({ ok: true, msg: "All memory reset successfully" });
  }

  return res.status(405).json({ ok: false, msg: "Method not allowed" });
}
