import { connectDB } from "@/lib/db";
import Group from "@/models/Group";

export default async function handler(req, res) {
  await connectDB();

  // GET → return all groups bot has seen / logged
  if (req.method === "GET") {
    const groups = await Group.find()
      .sort({ lastActiveAt: -1 })
      .lean();

    return res.json({
      ok: true,
      count: groups.length,
      data: groups
    });
  }

  // DELETE → remove a group
  if (req.method === "DELETE") {
    const { chatId } = req.body;

    if (!chatId)
      return res.json({ ok: false, msg: "chatId required" });

    await Group.findOneAndDelete({ chatId: String(chatId) });

    return res.json({ ok: true, msg: "Group deleted" });
  }

  res.status(405).json({ ok: false, msg: "Method not allowed" });
}
