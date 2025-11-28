import { connectDB } from "@/lib/db";
import BotConfig from "@/models/BotConfig";
import BotSettings from "@/models/BotSettings";
import Group from "@/models/Group";

import startHandler from "@/server/telegram/start";
import inlineHandler from "@/server/telegram/inline";
import commandsHandler from "@/server/telegram/commands";
import welcomeHandler from "@/server/telegram/welcome";
import moderationHandler from "@/server/telegram/moderation";
import aiHandler from "@/server/telegram/ai-handler";

// TELEGRAM RAW BODY PARSE
export const config = {
  api: { bodyParser: false }
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  await connectDB();
  const raw = await readBody(req);

  let update;
  try {
    update = JSON.parse(raw.toString());
  } catch (e) {
    console.log("❌ Invalid update");
    return res.status(200).json({ ok: true });
  }

  const botCfg = await BotConfig.findOne().lean();
  if (!botCfg?.telegramBotToken) return res.status(200).json({ ok: true });
  const BOT_TOKEN = botCfg.telegramBotToken;

  const msg = update.message || update.edited_message;
  const callback = update.callback_query;

  // ========================
  // 1) INLINE BUTTON HANDLER
  // ========================
  if (callback) {
    await inlineHandler(update, BOT_TOKEN);
    return res.status(200).json({ ok: true });
  }

  // if no message → done
  if (!msg) return res.status(200).json({ ok: true });

  const text = msg.text || msg.caption || "";
  const chatId = msg.chat.id;
  const userId = msg.from?.id?.toString();
  const chatType = msg.chat.type;
  const isGroup = chatType.includes("group");

  // ========================
  // 2) GROUP LOGGER
  // ========================
  if (isGroup) {
    await Group.findOneAndUpdate(
      { chatId },
      {
        chatId,
        title: msg.chat.title || "",
        username: msg.chat.username || "",
        type: msg.chat.type,
        lastActiveAt: new Date(),
        $setOnInsert: { firstSeenAt: new Date() }
      },
      { upsert: true }
    );
  }

  // ========================
  // 3) NEW MEMBER → WELCOME
  // ========================
  if (msg.new_chat_members) {
    await welcomeHandler.onJoin(msg, BOT_TOKEN);
    return res.status(200).json({ ok: true });
  }

  // ========================
  // 4) MEMBER LEFT → GOODBYE
  // ========================
  if (msg.left_chat_member) {
    await welcomeHandler.onLeave(msg, BOT_TOKEN);
    return res.status(200).json({ ok: true });
  }

  // ========================
  // 5) COMMANDS
  // ========================
  if (text.startsWith("/")) {
    const handled = await commandsHandler(msg, BOT_TOKEN);
    if (handled) return res.status(200).json({ ok: true });

    // /start goes here also
    if (text.startsWith("/start")) {
      await startHandler(msg, BOT_TOKEN);
      return res.status(200).json({ ok: true });
    }
  }

  // ========================
  // 6) MODERATION SYSTEM
  // ========================
  const modBlocked = await moderationHandler(msg, BOT_TOKEN);
  if (modBlocked) return res.status(200).json({ ok: true });

  // ========================
  // 7) GROUP REPLY CONTROL
  // ========================
  if (isGroup) {
    const lower = text.toLowerCase();
    const settings = await BotSettings.findOne().lean();
    const botUsername = settings?.botUsername?.replace("@", "")?.toLowerCase();

    let shouldReply = false;

    // reply-to-bot
    if (
      msg.reply_to_message?.from?.username?.toLowerCase() === botUsername
    ) {
      shouldReply = true;
    }

    // mention
    if (
      lower.includes("@" + botUsername)
    ) {
      shouldReply = true;
    }

    // by default don't reply
    if (!shouldReply) {
      return res.status(200).json({ ok: true });
    }
  }

  // ========================
  // 8) AI CHAT FINAL HANDLER
  // ========================
  await aiHandler(msg, BOT_TOKEN);

  return res.status(200).json({ ok: true });
}
