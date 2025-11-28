import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Memory from "@/models/Memory";
import Group from "@/models/Group";
import { sendMessage, sendChatAction } from "@/lib/telegram";
import { generateAI } from "@/lib/ai";

export const config = { api: { bodyParser: false } };

function parseRaw(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  await connectDB();

  // RAW BODY
  const raw = await parseRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.json({ ok: true });
  }

  const msg = update.message || update.edited_message;
  if (!msg) return res.json({ ok: true });

  const botId = req.query.botId;
  if (!botId) return res.json({ ok: false, msg: "Missing botId" });

  // LOAD BOT DETAILS
  const bot = await PublicBot.findById(botId).lean();
  if (!bot) return res.json({ ok: false, msg: "Bot not found" });

  const token = bot.botToken;
  const botUsername = bot.botUsername?.toLowerCase();

  const chatId = msg.chat?.id;
  const userId = msg.from?.id?.toString();
  const text = msg.text || msg.caption || "";

  const lower = text.toLowerCase();
  const isGroup = msg.chat.type.includes("group");

  // --- SAVE GROUP LOG
  if (isGroup) {
    await Group.findOneAndUpdate(
      { chatId, botId },
      {
        chatId,
        botId,
        title: msg.chat.title || "",
        type: msg.chat.type,
        lastActiveAt: new Date()
      },
      { upsert: true }
    );
  }

  // --- /start COMMAND
  if (lower.startsWith("/start")) {
    const welcomeMsg = `Hey, main *${bot.botName}* hu 💫

Owner: *${bot.ownerName}*
Username: *@${bot.botUsername}*
Gender: *${bot.gender}*
Persona: *${bot.personality}*
    `;

    await sendMessage(token, chatId, welcomeMsg, {
      reply_to_message_id: msg.message_id
    });

    return res.json({ ok: true });
  }

  // =============================
  // REPLY LOGIC (STRICT GROUP MODE)
  // =============================

  let shouldReply = false;

  if (!isGroup) shouldReply = true; // PM always reply

  if (lower.includes("@" + botUsername)) shouldReply = true;

  if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;

  if (
    msg.reply_to_message?.from?.username?.toLowerCase() === botUsername
  )
    shouldReply = true;

  if (isGroup && !shouldReply) {
    return res.json({ ok: true });
  }

  // =============================
  // MEMORY SYSTEM
  // =============================
  let memory = await Memory.findOne({ botId, chatId, userId });

  if (!memory) {
    memory = await Memory.create({
      botId,
      chatId,
      userId,
      history: []
    });
  }

  memory.history.push({
    role: "user",
    text,
    time: new Date()
  });

  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  const historyText = memory.history
    .map((m) => `${m.role === "user" ? "User" : bot.botName}: ${m.text}`)
    .join("\n");

  // =============================
  // AI GENERATION
  // =============================

  await sendChatAction(token, chatId, "typing");
  await new Promise((r) => setTimeout(r, 800));

  let reply;
  try {
    reply = await generateAI(historyText, text, {
      botName: bot.botName,
      gender: bot.gender,
      personality: bot.personality,
      ownerName: bot.ownerName,
      ownerUsername: bot.ownerUsername
    });
  } catch (e) {
    reply = "Oops, thoda issue aa gaya 😅";
  }

  // Save bot response
  memory.history.push({
    role: "assistant",
    text: reply,
    time: new Date()
  });

  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  // Send final message
  await sendMessage(token, chatId, reply, {
    reply_to_message_id: msg.message_id
  });

  return res.json({ ok: true });
}
