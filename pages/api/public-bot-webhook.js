import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Memory from "@/models/Memory";
import Group from "@/models/Group";
import { generateWithYuki } from "@/lib/ai";
import { sendMessage, sendChatAction } from "@/lib/telegram";

// RAW body needed for Telegram
export const config = {
  api: { bodyParser: false },
};

function readRaw(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  await connectDB();

  // Get raw Telegram update
  const raw = await readRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(200).json({ ok: true });
  }

  const msg = update.message || update.edited_message;
  if (!msg) return res.status(200).json({ ok: true });

  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const userText = msg.text || msg.caption || "";
  const chatType = msg.chat.type;
  const isGroup = chatType.includes("group");

  const botId = req.query.botId;
  if (!botId) return res.status(200).json({ ok: true });

  // Load THIS bot info
  const bot = await PublicBot.findById(botId).lean();
  if (!bot) return res.status(200).json({ ok: true });

  if (!bot.webhookConnected) {
    return res.status(200).json({ ok: true });
  }

  const BOT_TOKEN = bot.botToken;
  const botUsername = bot.botUsername.toLowerCase();
  const lower = userText.toLowerCase();

  // -------------------------------------------------------
  // 1) START COMMAND
  // -------------------------------------------------------
  if (lower.startsWith("/start")) {
    const text = bot.startMessage || `Hey, I'm *${bot.botName}* ✨`;
    await sendMessage(BOT_TOKEN, chatId, text, {
      parse_mode: "Markdown",
    });
    return res.status(200).json({ ok: true });
  }

  // -------------------------------------------------------
  // 2) GROUP JOIN → WELCOME MESSAGE
  // -------------------------------------------------------
  if (update.my_chat_member?.new_chat_member?.status === "member") {
    const welcome = bot.welcomeMessage || "Thanks for adding me 💗";

    if (bot.welcomeImage) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            caption: welcome,
            photo: bot.welcomeImage,
          }),
        }
      );
    } else {
      await sendMessage(BOT_TOKEN, chatId, welcome);
    }

    // SAVE GROUP INFO
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

  // -------------------------------------------------------
  // 3) GROUP STRICT REPLY MODE
  // -------------------------------------------------------
  let shouldReply = false;

  if (!isGroup) {
    shouldReply = true; // DM always reply
  } else {
    // Mention
    if (lower.includes("@" + botUsername)) shouldReply = true;

    // Reply to bot
    if (
      msg.reply_to_message?.from?.username?.toLowerCase() === botUsername
    ) {
      shouldReply = true;
    }

    // Loose bot name match
    if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;
  }

  if (isGroup && !shouldReply) {
    return res.status(200).json({ ok: true });
  }

  // -------------------------------------------------------
  // 4) MEMORY LOAD / CREATE
  // -------------------------------------------------------
  let memory = await Memory.findOne({ chatId, userId, botId });

  if (!memory) {
    memory = await Memory.create({
      chatId,
      userId,
      botId,
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

  // -------------------------------------------------------
  // 5) AI PROMPT SYSTEM (Uses bot settings)
  // -------------------------------------------------------
  const toneMap = {
    normal:
      "Friendly, soft Hinglish, natural, 1–2 lines.",
    flirty:
      "Cute flirty tone, playful, emojis allowed, but safe.",
    professional:
      "Calm, respectful, no flirting, short answers.",
  };

  const genderLine =
    bot.gender === "male"
      ? "Tum 19 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki Delhi ki cute girl ho.";

  const ownerRule = `
Tumhara real owner sirf *${bot.ownerName}* hai.
Owner ka naam tabhi lo jab koi specifically owner ke baare me pooche.
`;

  const finalPrompt = `
Tumhara naam *${bot.botName}* hai.
${genderLine}
${toneMap[bot.personality]}
${ownerRule}

Conversation so far:
${conversation}

User: ${userText}
Bot:
`;

  // -------------------------------------------------------
  // 6) TYPING + AI RESPONSE
  // -------------------------------------------------------
  await sendChatAction(BOT_TOKEN, chatId, "typing");

  let reply = "Sorry, error aagaya 😅";
  try {
    reply = await generateWithYuki(finalPrompt);
  } catch (e) {
    console.log("AI ERROR:", e);
  }

  memory.history.push({ role: "bot", text: reply });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);
  await memory.save();

  await sendMessage(BOT_TOKEN, chatId, reply);

  return res.status(200).json({ ok: true });
}
