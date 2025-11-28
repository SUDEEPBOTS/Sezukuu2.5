import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import User from "@/models/User";

export default async function handler(req, res) {
  await connectDB();

  // Only GET allowed
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, msg: "Method not allowed" });
  }

  try {
    // Fetch all public bots
    const bots = await PublicBot.find().sort({ createdAt: -1 }).lean();

    // Fetch all users so we can attach username to bot
    const users = await User.find().lean();

    // Attach owner username to every bot
    const botsWithUsers = bots.map((bot) => {
      const owner = users.find((u) => u._id.toString() === bot.userId?.toString());

      return {
        ...bot,
        ownerUsername: owner?.username || "Unknown User",
        ownerCreatedAt: owner?.createdAt || null,
      };
    });

    return res.json({
      ok: true,
      totalBots: bots.length,
      data: botsWithUsers,
    });

  } catch (err) {
    console.error("LIST BOTS ERROR:", err);
    return res.status(500).json({
      ok: false,
      msg: "Failed to fetch bots",
      error: err.message,
    });
  }
}
