// pages/api/public-bot-webhook.js

import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Memory from "@/models/Memory";
import Group from "@/models/Group";
import { generateWithYuki } from "@/lib/ai";
import { sendMessage, sendChatAction } from "@/lib/telegram";

// RAW body for Telegram
export const config = {
  api: { bodyParser: false },
};

// Read raw body
function readRaw(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  await connectDB();

  const raw = await readRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(200).json({ ok: true });
  }

  // ===========================
  // CALLBACK QUERY HANDLER
  // ===========================
  if (update.callback_query) {
    const q = update.callback_query;
    const data = q.data;
    const chatId = q.message.chat.id;
    const userId = q.from.id.toString();

    const botId = req.query.botId;
    if (!botId) return res.status(200).json({ ok: true });

    const bot = await PublicBot.findById(botId).lean();
    if (!bot) return res.status(200).json({ ok: true });

    const BOT_TOKEN = bot.botToken;

    // MAIN MENU
    if (data === "menu") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `✨ *${bot.botName} — Main Menu*`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "😋 Talk with Me", callback_data: "chat" }],
              [{ text: "🧠 Reset Memory", callback_data: "reset" }],
              [{ text: "⚙ Settings", callback_data: "settings" }],
              [
                { text: "🔗 Support", callback_data: "support" },
                { text: "👤 Owner", callback_data: "owner" },
              ],
            ],
          },
        }
      );

      return res.status(200).json({ ok: true });
    }

    // SETTINGS
    if (data === "settings") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `⚙ *${bot.botName} Settings*\nChoose what you want to edit.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🧬 Personality", callback_data: "persona" }],
              [{ text: "🚻 Gender", callback_data: "gender" }],
              [{ text: "⬅ Back", callback_data: "menu" }],
            ],
          },
        }
      );

      return res.status(200).json({ ok: true });
    }

    // PERSONALITY MENU
    if (data === "persona") {
      await sendMessage(BOT_TOKEN, chatId, `🧬 *Choose Personality*`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "😊 Normal", callback_data: "persona_normal" }],
            [{ text: "😏 Flirty", callback_data: "persona_flirty" }],
            [{ text: "💼 Professional", callback_data: "persona_pro" }],
            [{ text: "⬅ Back", callback_data: "settings" }],
          ],
        },
      });

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("persona_")) {
      const type = data.replace("persona_", "");
      await PublicBot.findByIdAndUpdate(botId, { personality: type });

      await sendMessage(
        BOT_TOKEN,
        chatId,
        `🧬 Personality updated to: *${type}*`,
        { parse_mode: "Markdown" }
      );

      return res.status(200).json({ ok: true });
    }

    // GENDER MENU
    if (data === "gender") {
      await sendMessage(BOT_TOKEN, chatId, `🚻 *Choose Gender*`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "👧 Female", callback_data: "gender_female" }],
            [{ text: "👦 Male", callback_data: "gender_male" }],
            [{ text: "⬅ Back", callback_data: "settings" }],
          ],
        },
      });

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("gender_")) {
      const gen = data.replace("gender_", "");
      await PublicBot.findByIdAndUpdate(botId, { gender: gen });

      await sendMessage(
        BOT_TOKEN,
        chatId,
        `🚻 Gender updated to: *${gen}*`,
        { parse_mode: "Markdown" }
      );

      return res.status(200).json({ ok: true });
    }

    // OWNER
    if (data === "owner") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `👤 *Owner:* ${bot.ownerName}\n🔗 @${bot.ownerUsername}`,
        { parse_mode: "Markdown" }
      );
      return res.status(200).json({ ok: true });
    }

    // HELP
    if (data === "help") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        "⭐ Commands:\n\n/start – Open menu\nTalk by tagging me or replying\nUse me in group & DM 🤍"
      );
      return res.status(200).json({ ok: true });
    }

    // RESET MEMORY
    if (data === "reset") {
      await Memory.deleteMany({ botId, userId, chatId });
      await sendMessage(BOT_TOKEN, chatId, "🧠 Memory reset!");
      return res.status(200).json({ ok: true });
    }

    // SUPPORT
    if (data === "support") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `🔗 Support Group:\n${bot.supportGroup || "Not added"}`
      );
      return res.status(200).json({ ok: true });
    }

    // CHAT
    if (data === "chat") {
      await sendMessage(BOT_TOKEN, chatId, "Aww okay 😊 bolo na…");
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }

  // ===========================
  // NORMAL MESSAGE HANDLER
  // ===========================
  const msg = update.message || update.edited_message;
  const chatId = msg?.chat?.id;
  const userId = msg?.from?.id?.toString();
  const userText = msg?.text || msg?.caption || "";
  const chatType = msg?.chat?.type;
  const isGroup =
    chatType === "group" ||
    chatType === "supergroup" ||
    chatType?.includes("group");

  const botId = req.query.botId;
  if (!botId || !chatId || !userId)
    return res.status(200).json({ ok: true });

  const bot = await PublicBot.findById(botId).lean();
  if (!bot || !bot.webhookConnected)
    return res.status(200).json({ ok: true });

  const BOT_TOKEN = bot.botToken;
  const botUsername = bot.botUsername.toLowerCase();
  const lower = (userText || "").toLowerCase();

  // ===========================
  // /start with inline menu
  // ===========================
  if (lower.startsWith("/start")) {
    const text = bot.startMessage || `Hey, I'm *${bot.botName}* ✨`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "❤️ Chat with Me", callback_data: "chat" }],
            [
              { text: "ℹ️ Help", callback_data: "help" },
              { text: "👤 Owner", callback_data: "owner" },
            ],
            [{ text: "🧠 Reset Memory", callback_data: "reset" }],
            [{ text: "🔗 Support", callback_data: "support" }],
            [{ text: "📋 Menu", callback_data: "menu" }],
          ],
        },
      }),
    });

    return res.status(200).json({ ok: true });
  }

  // ===========================
  // BOT ADDED TO GROUP
  // ===========================
  if (update.my_chat_member?.new_chat_member?.status === "member") {
    const welcome = bot.welcomeMessage || "Thanks for adding me 💗";

    if (bot.welcomeImage) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          caption: welcome,
          photo: bot.welcomeImage,
        }),
      });
    } else {
      await sendMessage(BOT_TOKEN, chatId, welcome);
    }

    await Group.findOneAndUpdate(
      { chatId, botId },
      {
        chatId,
        botId,
        title: msg?.chat?.title || "",
        username: msg?.chat?.username || "",
        type: chatType,
        lastActiveAt: new Date(),
        $setOnInsert: { firstSeenAt: new Date() },
      },
      { upsert: true }
    );

    return res.status(200).json({ ok: true });
  }

  // ===========================
  // ANTI-LINK
  // ===========================
  if (isGroup) {
    if (
      lower.includes("http://") ||
      lower.includes("https://") ||
      lower.includes("t.me/")
    ) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: msg.message_id,
          }),
        }
      );
    }
  }

  // ===========================
  // ADMIN CHECK
  // ===========================
  async function isAdmin(chatId, uid) {
    try {
      const r = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${uid}`
      );
      const data = await r.json();
      if (!data.ok) return false;

      const st = data.result.status;
      return st === "administrator" || st === "creator";
    } catch {
      return false;
    }
  }

  // ===========================
  // COMMANDS (ban/mute/kick/unmute)
  // ===========================
  if (
    lower.startsWith("/ban") ||
    lower.startsWith("/kick") ||
    lower.startsWith("/mute") ||
    lower.startsWith("/unmute")
  ) {
    if (!isGroup) {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        "Ye command sirf groups me chalta hai."
      );
      return res.status(200).json({ ok: true });
    }

    const admin = await isAdmin(chatId, msg.from.id);
    if (!admin) {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        "⛔ Sirf admin ye command use kar sakta!"
      );
      return res.status(200).json({ ok: true });
    }

    const victim = msg.reply_to_message?.from;
    if (!victim) {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        "Kisko target karna hai? Reply karke /ban /mute karo."
      );
      return res.status(200).json({ ok: true });
    }

    const victimId = victim.id;

    if (lower.startsWith("/ban")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: victimId }),
        }
      );
      await sendMessage(BOT_TOKEN, chatId, "🚫 User banned.");
    } else if (lower.startsWith("/kick")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            until_date: Math.floor(Date.now() / 1000) + 10,
          }),
        }
      );
      await sendMessage(BOT_TOKEN, chatId, "👢 User kicked.");
    } else if (lower.startsWith("/mute")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            permissions: { can_send_messages: false },
          }),
        }
      );
      await sendMessage(BOT_TOKEN, chatId, "🔇 User muted.");
    } else if (lower.startsWith("/unmute")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            permissions: { can_send_messages: true },
          }),
        }
      );
      await sendMessage(BOT_TOKEN, chatId, "🔊 User unmuted.");
    }

    return res.status(200).json({ ok: true });
  }

  // ===========================
  // ANTI-SPAM
  // ===========================
  if (isGroup) {
    const last = global.lastMsg || {};
    const key = chatId + "-" + userId;
    const now = Date.now();

    if (last[key] && now - last[key] < 1200) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: msg.message_id,
          }),
        }
      );
    }

    last[key] = now;
    global.lastMsg = last;
  }

  // ===========================
  // STRICT GROUP REPLY
  // ===========================
  let shouldReply = false;

  if (!isGroup) shouldReply = true;
  else {
    if (lower.includes("@" + botUsername)) shouldReply = true;
    if (
      msg.reply_to_message?.from?.username?.toLowerCase() === botUsername
    )
      shouldReply = true;
    if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;
  }

  if (isGroup && !shouldReply)
    return res.status(200).json({ ok: true });

  // ===========================
  // MEMORY SYSTEM
  // ===========================
  let memory = await Memory.findOne({ botId, chatId, userId });

  if (!memory) {
    memory = await Memory.create({
      botId,
      chatId,
      userId,
      history: [],
      mode: bot.personality,
    });
  }

  memory.history.push({ role: "user", text: userText });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  const conversation = memory.history
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");

  // ===========================
  // AI PROMPT
  // ===========================
  const toneMap = {
    normal: "Friendly, soft Hinglish, sweet natural tone.",
    flirty: "Cute flirty tone, playful, emojis allowed.",
    professional: "Calm, respectful, no flirting.",
  };

  const genderLine =
    bot.gender === "male"
      ? "Tum 19 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki cute Delhi girl ho.";

  const ownerRule = `
Tumhara real owner sirf *${bot.ownerName}* hai.
Owner ka naam tabhi lo jab koi specifically pooche.
`;

  const finalPrompt = `
Tumhara naam *${bot.botName}* hai.
${genderLine}
${toneMap[bot.personality]}
${ownerRule}

Conversation:
${conversation}

User: ${userText}
Bot:
`;

  await sendChatAction(BOT_TOKEN, chatId, "typing");

  let reply = "Oops, error 😅";
  try {
    reply = await generateWithYuki(finalPrompt);
  } catch (err) {
    console.log("AI ERROR:", err);
  }

  memory.history.push({ role: "bot", text: reply });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  await sendMessage(BOT_TOKEN, chatId, reply);

  return res.status(200).json({ ok: true });
          }
