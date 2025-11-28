import { connectDB } from "@/lib/db";
import BotConfig from "@/models/BotConfig";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const cfg = await BotConfig.findOne().lean();
    return res.json({ ok: true, data: cfg || {} });
  }

  if (req.method === "POST") {
    const { telegramBotToken, ownerName, ownerUsername } = req.body;

    const updated = await BotConfig.findOneAndUpdate(
      {},
      {
        telegramBotToken,
        ownerName,
        ownerUsername
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, data: updated });
  }

  return res.status(405).json({ ok: false, msg: "Method not allowed" });
}
