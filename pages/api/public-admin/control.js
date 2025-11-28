import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import { setWebhook, deleteWebhook } from "@/lib/telegram";

export default async function handler(req, res) {
  await connectDB();

  const { action } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, msg: "Method not allowed" });
  }

  try {
    const {
      botId,
      botToken,
      botName,
      botUsername,
      gender,
      personality,
      ownerName,
      ownerUsername
    } = req.body;

    if (!botToken && !botId)
      return res.json({ ok: false, msg: "Missing botId / botToken" });

    // FETCH BOT
    const bot = await PublicBot.findById(botId).lean();
    if (!bot) return res.json({ ok: false, msg: "Bot not found" });

    const webhookURL =
      process.env.MAIN_URL +
      `/api/public-bot-webhook?botId=${bot._id.toString()}`;

    // 1️⃣ CONNECT WEBHOOK
    if (action === "connect") {
      await setWebhook(bot.botToken, webhookURL);

      await PublicBot.findByIdAndUpdate(botId, {
        webhookConnected: true
      });

      return res.json({ ok: true, msg: "Webhook connected" });
    }

    // 2️⃣ DISCONNECT WEBHOOK
    if (action === "disconnect") {
      await deleteWebhook(bot.botToken);

      await PublicBot.findByIdAndUpdate(botId, {
        webhookConnected: false
      });

      return res.json({ ok: true, msg: "Webhook removed" });
    }

    // 3️⃣ DELETE BOT
    if (action === "delete") {
      await PublicBot.findByIdAndDelete(botId);
      return res.json({ ok: true, msg: "Bot deleted" });
    }

    // 4️⃣ UPDATE SETTINGS
    if (action === "update") {
      await PublicBot.findByIdAndUpdate(botId, {
        botName,
        botUsername,
        gender,
        personality,
        ownerName,
        ownerUsername
      });

      return res.json({ ok: true, msg: "Bot updated" });
    }

    return res.json({ ok: false, msg: "Invalid action" });
  } catch (err) {
    console.log("CONTROL ERROR:", err);
    return res.json({ ok: false, msg: err.message });
  }
}
