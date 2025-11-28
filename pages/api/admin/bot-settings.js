import { connectDB } from "@/lib/db";
import BotSettings from "@/models/BotSettings";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const settings = await BotSettings.findOne().lean();
    return res.json({ ok: true, data: settings || {} });
  }

  if (req.method === "POST") {
    const {
      botName,
      gender,
      personality,
      groupLink,
      startMessage,
      welcomeMessage,
      welcomeImage
    } = req.body;

    const updated = await BotSettings.findOneAndUpdate(
      {},
      {
        botName,
        gender,
        personality,
        groupLink,
        startMessage,
        welcomeMessage,
        welcomeImage
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, data: updated });
  }

  return res.status(405).json({ ok: false, msg: "Method not allowed" });
}
