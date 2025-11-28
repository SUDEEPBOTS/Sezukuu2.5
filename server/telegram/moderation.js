import BotSettings from "@/models/BotSettings";
import { deleteMessage, sendMessage } from "@/lib/telegram";

export default async function moderationHandler(msg, BOT_TOKEN) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text || msg.caption || "";
    const lower = text.toLowerCase();

    const settings = (await BotSettings.findOne().lean()) || {};

    // Future panel toggles (default ON)
    const antiLink = settings.antiLink ?? true;
    const antiBad = settings.antiBad ?? true;
    const antiSpam = settings.antiSpam ?? true;

    const ownerId = settings.ownerId ? settings.ownerId.toString() : "";
    const isOwner = userId === ownerId;

    // OWNER BYPASS
    if (isOwner) return false;

    // ============================
    // ANTI-LINK (t.me, http, https)
    // ============================
    if (antiLink) {
      const linkDetected =
        lower.includes("http://") ||
        lower.includes("https://") ||
        lower.includes("t.me") ||
        lower.includes("telegram.me");

      if (linkDetected) {
        await deleteMessage(BOT_TOKEN, chatId, msg.message_id);

        await sendMessage(
          BOT_TOKEN,
          chatId,
          `Links are not allowed here ❌`,
          {
            reply_to_message_id: msg.message_id
          }
        );

        return true;
      }
    }

    // ============================
    // ANTI-BAD WORDS
    // ============================
    if (antiBad) {
      const badWords = [
        "gandu",
        "chutiya",
        "madarchod",
        "bhosdike",
        "randi",
        "lund",
        "mc",
        "bc"
      ];

      for (const word of badWords) {
        if (lower.includes(word)) {
          await deleteMessage(BOT_TOKEN, chatId, msg.message_id);

          await sendMessage(
            BOT_TOKEN,
            chatId,
            `Don't use abusive words 🚫`,
            {
              reply_to_message_id: msg.message_id
            }
          );

          return true;
        }
      }
    }

    // ============================
    // ANTI-SPAM (FAST TEXT)
    // ============================
    if (antiSpam) {
      // If user is spamming repeated characters
      if (text.length > 20 && /(.)\1{7,}/.test(text)) {
        await deleteMessage(BOT_TOKEN, chatId, msg.message_id);

        await sendMessage(
          BOT_TOKEN,
          chatId,
          `Stop spamming 😑`,
          {
            reply_to_message_id: msg.message_id
          }
        );

        return true;
      }
    }

    return false;
  } catch (err) {
    console.log("❌ Moderation Error:", err);
    return false;
  }
}
