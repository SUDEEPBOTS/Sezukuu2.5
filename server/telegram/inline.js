import BotSettings from "@/models/BotSettings";
import {
  sendMessage,
  editMessageText,
  sendChatAction,
} from "@/lib/telegram";

export default async function inlineHandler(update, BOT_TOKEN) {
  try {
    const callback = update.callback_query;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;
    const data = callback.data;
    const user = callback.from;

    const settings = (await BotSettings.findOne().lean()) || {};

    const botName = settings.botName || "Sezukuu";
    const support = settings.groupLink || "";
    const persona = settings.personality || "normal";

    // ================
    // TYPING ANIMATION
    // ================
    await sendChatAction(BOT_TOKEN, chatId, "typing");

    // ================
    // BUTTON HANDLERS
    // ================

    // TALK BUTTON
    if (data === "talk") {
      return await editMessageText(
        BOT_TOKEN,
        chatId,
        messageId,
        `Alright *${user.first_name}* 💞\nLet's talk!\nJust type your message 💬`
      );
    }

    // ABOUT BUTTON
    if (data === "about") {
      return await editMessageText(
        BOT_TOKEN,
        chatId,
        messageId,
        `*${botName}* v2.5\nCute AI chat partner ✨\n\n` +
          `Mode: *${persona}*\n` +
          `Support: ${support ? support : "No link added"}`
      );
    }

    // SUPPORT BUTTON (callback form)
    if (data === "support") {
      if (!support) {
        return await editMessageText(
          BOT_TOKEN,
          chatId,
          messageId,
          "No support group added ❌"
        );
      }

      return await editMessageText(
        BOT_TOKEN,
        chatId,
        messageId,
        `Support Group:\n${support}`
      );
    }

    // PERSONA SELECTOR (FUTURE SAFE)
    if (data.startsWith("persona_")) {
      const newPersonality = data.split("_")[1];

      await BotSettings.updateOne(
        {},
        { personality: newPersonality },
        { upsert: true }
      );

      return await editMessageText(
        BOT_TOKEN,
        chatId,
        messageId,
        `Persona updated to: *${newPersonality}* 😄`
      );
    }

    // IF UNKNOWN
    return await sendMessage(
      BOT_TOKEN,
      chatId,
      "Unknown button clicked 😅"
    );

  } catch (err) {
    console.log("❌ Inline Handler Error:", err);
  }
}
