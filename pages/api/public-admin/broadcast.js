import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import { sendMessage } from "@/lib/telegram";
import Group from "@/models/Group";
import Memory from "@/models/Memory";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, msg: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || message.length < 1) {
      return res.json({ ok: false, msg: "Message required" });
    }

    // Fetch all public bots
    const bots = await PublicBot.find().lean();
    if (!bots.length)
      return res.json({ ok: false, msg: "No bots registered" });

    let totalSent = 0;
    let failed = 0;

    for (const bot of bots) {
      const token = bot.botToken;

      //
      // 1️⃣ Send to Groups where bot is present
      //
      const groups = await Group.find({ botId: bot._id }).lean();
      for (const g of groups) {
        const ok = await sendMessage(token, g.chatId, message);
        if (ok?.ok) totalSent++;
        else failed++;
      }

      //
      // 2️⃣ Send to users who ever talked to bot (from memory DB)
      //
      const memories = await Memory.find({ botId: bot._id }).lean();
      for (const m of memories) {
        const ok = await sendMessage(token, m.chatId, message);
        if (ok?.ok) totalSent++;
        else failed++;
      }
    }

    return res.json({
      ok: true,
      msg: "Broadcast completed",
      totalBots: bots.length,
      sent: totalSent,
      failed,
    });
  } catch (err) {
    console.log("BROADCAST ERROR:", err);
    return res.json({
      ok: false,
      msg: "Broadcast error",
      error: err.message,
    });
  }
}
