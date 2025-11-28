// pages/api/public-bot-webhook.js

import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Memory from "@/models/Memory";
import Group from "@/models/Group";
import { generateWithYuki } from "@/lib/ai";
import {
  sendMessage,
  sendChatAction,
  setWebhook,
  deleteWebhook,
} from "@/lib/telegram";

// RAW body for Telegram
export const config = {
  api: { bodyParser: false },
};

// Read raw body safely
function readRaw(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  await connectDB();

  // Raw update
  const raw = await readRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(200).json({ ok: true });
  }

  const botId = req.query.botId;
  if (!botId) return res.status(200).json({ ok: true });

  const bot = await PublicBot.findById(botId).lean();
  if (!bot || !bot.webhookConnected)
    return res.status(200).json({ ok: true });

  const BOT_TOKEN = bot.botToken;

  // ===================================================================
  // CALLBACK QUERIES
  // ===================================================================
  if (update.callback_query) {
    const q = update.callback_query;
    const chatId = q.message.chat.id;
    const userId = q.from.id.toString();
    const data = q.data;

    //===== MAIN MENU =====
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

    //===== SETTINGS MENU =====
    if (data === "settings") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `⚙ *${bot.botName} Settings*`,
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

    //===== PERSONALITY MENU =====
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
        `🧬 Personality updated to *${type}*`,
        { parse_mode: "Markdown" }
      );
      return res.status(200).json({ ok: true });
    }

    //===== GENDER MENU =====
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
        `🚻 Gender updated to *${gen}*`,
        { parse_mode: "Markdown" }
      );
      return res.status(200).json({ ok: true });
    }

    //===== OWNER =====
    if (data === "owner") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `👤 *Owner:* ${bot.ownerName}\n🔗 @${bot.ownerUsername}`,
        { parse_mode: "Markdown" }
      );
      return res.status(200).json({ ok: true });
    }

    //===== SUPPORT =====
    if (data === "support") {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `🔗 Support Group:\n${bot.supportGroup || "Not added"}`
      );
      return res.status(200).json({ ok: true });
    }

    //===== MEMORY RESET =====
    if (data === "reset") {
      await Memory.deleteMany({ botId, userId, chatId });
      await sendMessage(BOT_TOKEN, chatId, "🧠 Memory reset!");
      return res.status(200).json({ ok: true });
    }

    //===== CHAT =====
    if (data === "chat") {
      await sendMessage(BOT_TOKEN, chatId, "Hehe okay baby 😊 bolo…");
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }

  // ===================================================================
  // MESSAGE HANDLER
  // ===================================================================
  const msg = update.message || update.edited_message;
  const chatId = msg?.chat?.id;
  const userId = msg?.from?.id?.toString();
  const userText = msg?.text || msg?.caption || "";
  const chatType = msg?.chat?.type;
  const isGroup = chatType?.includes("group");

  if (!chatId || !userId) return res.status(200).json({ ok: true });

  const botUsername = bot.botUsername.toLowerCase();
  const lower = (userText || "").toLowerCase();

  //===== /start =====
  if (lower.startsWith("/start")) {
    await sendMessage(
      BOT_TOKEN,
      chatId,
      bot.startMessage || `Hey, I'm *${bot.botName}* ✨`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "❤️ Chat with Me", callback_data: "chat" }],
            [{ text: "ℹ️ Help", callback_data: "help" }],
            [{ text: "👤 Owner", callback_data: "owner" }],
            [{ text: "🧠 Reset Memory", callback_data: "reset" }],
            [{ text: "📋 Menu", callback_data: "menu" }],
          ],
        },
      }
    );

    return res.status(200).json({ ok: true });
  }

  //===== BOT ADDED TO GROUP =====
  if (update.my_chat_member?.new_chat_member?.status === "member") {
    const welcome = bot.welcomeMessage || "Thanks for adding me 💗";

    if (bot.welcomeImage) {
      await sendMessage(
        BOT_TOKEN,
        chatId,
        welcome,
        {
          reply_markup: undefined,
          photo: bot.welcomeImage,
        }
      );
    } else {
      await sendMessage(BOT_TOKEN, chatId, welcome);
    }

    await Group.findOneAndUpdate(
      { chatId, botId },
      {
        chatId,
        botId,
        title: msg.chat.title || "",
        username: msg.chat.username || "",
        type: chatType,
        lastActiveAt: new Date(),
        $setOnInsert: { firstSeenAt: new Date() },
      },
      { upsert: true }
    );

    return res.status(200).json({ ok: true });
  }

  //===== STRICT REPLY MODE =====
  let shouldReply = false;

  if (!isGroup) shouldReply = true;
  else {
    if (lower.includes("@" + botUsername)) shouldReply = true;
    if (msg.reply_to_message?.from?.username?.toLowerCase() === botUsername)
      shouldReply = true;
    if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;
  }

  if (isGroup && !shouldReply)
    return res.status(200).json({ ok: true });

  //===== MEMORY SYSTEM =====
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

  //===== BUILD CONVERSATION =====
  const conversation = memory.history
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");

  //===== PROMPT =====
  const genderLine =
    bot.gender === "male"
      ? "Tum 19 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki cute Delhi girl ho.";

  const toneMap = {
    normal: "Friendly, soft Hinglish.",
    flirty: "Cute flirty tone, emojis allowed 💕.",
    professional: "Calm, respectful, no flirting.",
  };

  const finalPrompt = `
Tumhara naam *${bot.botName}* hai.
${genderLine}
${toneMap[bot.personality]}

Conversation:
${conversation}

User: ${userText}
Bot:
`;

  //===== AI REPLY =====
  await sendChatAction(BOT_TOKEN, chatId, "typing");
  let reply = await generateWithYuki(finalPrompt);
  if (!reply) reply = "Oops, error aa gaya 😅";

  memory.history.push({ role: "bot", text: reply });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);
  await memory.save();

  await sendMessage(BOT_TOKEN, chatId, reply);

  return res.status(200).json({ ok: true });
}
