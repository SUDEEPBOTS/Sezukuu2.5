import BotSettings from "@/models/BotSettings";
import { sendMessage, sendPhoto } from "@/lib/telegram";

const defaultWelcomeText = "Welcome to the group ❤️";
const defaultGoodbyeText = "Goodbye 👋 Stay safe ❤️";

export default {
  // ==========================
  // ON MEMBER JOIN
  // ==========================
  async onJoin(msg, BOT_TOKEN) {
    try {
      const chatId = msg.chat.id;
      const newMembers = msg.new_chat_members;
      const settings = (await BotSettings.findOne().lean()) || {};

      const welcomeText = settings.welcomeMessage || defaultWelcomeText;
      const photo = settings.welcomeImage || "";

      for (const member of newMembers) {
        const name = member.first_name || "there";

        // If welcome image is set → send photo
        if (photo) {
          await sendPhoto(
            BOT_TOKEN,
            chatId,
            photo,
            `*Hey ${name}!* 👋\n${welcomeText}`,
            {}
          );
        } else {
          // Only text
          await sendMessage(
            BOT_TOKEN,
            chatId,
            `*Hey ${name}!* 👋\n${welcomeText}`
          );
        }
      }
    } catch (err) {
      console.log("❌ Welcome Join Error:", err);
    }
  },

  // ==========================
  // ON MEMBER LEAVE
  // ==========================
  async onLeave(msg, BOT_TOKEN) {
    try {
      const chatId = msg.chat.id;
      const user = msg.left_chat_member;

      const settings = (await BotSettings.findOne().lean()) || {};
      const goodbyeText = settings.goodbyeMessage || defaultGoodbyeText;

      const name = user?.first_name || "User";

      await sendMessage(
        BOT_TOKEN,
        chatId,
        `*${name}* left the chat 💔\n${goodbyeText}`
      );
    } catch (err) {
      console.log("❌ Welcome Leave Error:", err);
    }
  }
};
