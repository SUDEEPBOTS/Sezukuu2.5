import BotConfig from "@/models/BotConfig";
import BotSettings from "@/models/BotSettings";
import { sendMessage } from "@/lib/telegram";

export default async function commandsHandler(msg, BOT_TOKEN) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text;
    const reply = msg.reply_to_message;

    const settings = (await BotSettings.findOne().lean()) || {};
    const botCfg = await BotConfig.findOne().lean();

    const ownerId = botCfg?.ownerId?.toString() || "";
    const ownerUsername = botCfg?.ownerUsername || "";

    const isOwner = userId === ownerId;

    // HELP
    if (text === "/help") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `*Commands:*\n/help - show this menu\n/owner - show bot owner\n/alive - bot status\n/id - your id\n\n*Admin commands:*\n/ban\n/mute\n/kick\n(unless turned off)`
      );
      return true;
    }

    // ALIVE
    if (text === "/alive") {
      await sendMessage(BOT_TOKEN, chatId, "Yes baby, I'm alive 💗✨");
      return true;
    }

    // OWNER
    if (text === "/owner") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `My owner is: *${ownerUsername}* ❤️`
      );
      return true;
    }

    // USER ID
    if (text === "/id") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `Your Telegram ID: *${userId}*`
      );
      return true;
    }

    // ADMIN COMMANDS (only owner)
    // ===================================================

    if (text.startsWith("/ban")) {
      if (!isOwner)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Only owner can use /ban ❌"
        );

      if (!reply)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Reply to a user's message to ban 🚫"
        );

      const target = reply.from.id;

      await sendMessage(BOT_TOKEN, chatId, `Banned user: *${target}* ❌`);

      // Telegram ban API
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: target
          })
        }
      );

      return true;
    }

    // MUTE
    if (text.startsWith("/mute")) {
      if (!isOwner)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Only owner can use /mute ❌"
        );

      if (!reply)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Reply to someone’s message to mute them 😶"
        );

      const target = reply.from.id;

      await sendMessage(BOT_TOKEN, chatId, `Muted user: *${target}* 😶`);

      // Telegram mute API
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: target,
            permissions: {
              can_send_messages: false
            }
          })
        }
      );

      return true;
    }

    // UNMUTE
    if (text.startsWith("/unmute")) {
      if (!isOwner)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Only owner can use /unmute ❌"
        );

      if (!reply)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Reply to someone’s message to unmute them 😄"
        );

      const target = reply.from.id;

      await sendMessage(BOT_TOKEN, chatId, `Unmuted user: *${target}* 😄`);

      // Unmute
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: target,
            permissions: {
              can_send_messages: true
            }
          })
        }
      );

      return true;
    }

    // KICK
    if (text.startsWith("/kick")) {
      if (!isOwner)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Only owner can use /kick ❌"
        );

      if (!reply)
        return await sendMessage(
          BOT_TOKEN,
          chatId,
          "Reply to someone’s message to kick 😤"
        );

      const target = reply.from.id;

      await sendMessage(BOT_TOKEN, chatId, `Kicked user: *${target}* 😤`);

      // Kick
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: target
          })
        }
      );

      // Immediately unban so user can rejoin
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/unbanChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: target
          })
        }
      );

      return true;
    }

    return false; // no command matched

  } catch (err) {
    console.log("❌ Commands Handler Error:", err);
    return false;
  }
}
