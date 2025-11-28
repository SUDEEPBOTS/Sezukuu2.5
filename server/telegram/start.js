import BotSettings from "@/models/BotSettings";
import { sendMessage, sendPhoto } from "@/lib/telegram";

export default async function startHandler(msg, BOT_TOKEN) {
  try {
    const chatId = msg.chat.id;
    const user = msg.from;

    const settings = (await BotSettings.findOne().lean()) || {};

    const botName = settings.botName || "Sezukuu";
    const startMessage =
      settings.startMessage ||
      "Hey, I'm Sezukuu ✨\nYour cute AI partner 💞";
    const support = settings.groupLink || "";
    const username = settings.botUsername || "";

    // START PHOTO (optional)
    const photo = settings.startPhoto
      ? settings.startPhoto
      : "https://i.ibb.co/1M3f2jJ/standard-start.jpg";

    // INLINE BUTTONS
    const inlineButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💬 Talk", callback_data: "talk" },
            { text: "📢 Support", url: support || "https://t.me/" + username }
          ],
          [
            { text: "💖 About Bot", callback_data: "about" }
          ]
        ]
      }
    };

    // SEND PHOTO FIRST
    await sendPhoto(BOT_TOKEN, chatId, photo, `Hi *${user.first_name}* 👋`, {});

    // THEN START MESSAGE
    await sendMessage(
      BOT_TOKEN,
      chatId,
      `*${botName}* here 🌸\n${startMessage}`,
      inlineButtons
    );
  } catch (err) {
    console.log("❌ Start Handler Error:", err);
  }
}
