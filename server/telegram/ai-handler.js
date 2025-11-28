import Memory from "@/models/Memory";
import BotSettings from "@/models/BotSettings";
import { sendMessage, sendChatAction } from "@/lib/telegram";
import { generateAI } from "@/lib/ai";

export default async function aiHandler(msg, BOT_TOKEN) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const userText = msg.text || msg.caption || "";

    const settings = (await BotSettings.findOne().lean()) || {};
    const botName = settings.botName || "Sezukuu";
    const personality = settings.personality || "normal";

    // ============================
    // MEMORY LOAD / CREATE
    // ============================
    let memory = await Memory.findOne({ chatId, userId });

    if (!memory) {
      memory = await Memory.create({
        chatId,
        userId,
        mode: personality,
        history: []
      });
    }

    // Add user message to history
    memory.history.push({
      role: "user",
      text: userText,
      time: new Date()
    });

    if (memory.history.length > 10) {
      memory.history = memory.history.slice(-10);
    }

    await memory.save();

    // Convert memory to text
    const memoryText = memory.history
      .map((m) => `${m.role === "user" ? "User" : botName}: ${m.text}`)
      .join("\n");

    // ============================
    // TYPING ACTION
    // ============================
    await sendChatAction(BOT_TOKEN, chatId, "typing");
    await new Promise((r) => setTimeout(r, 800));

    // ============================
    // AI GENERATION
    // ============================
    const reply = await generateAI(memoryText, userText);

    // Add bot reply to memory
    memory.history.push({
      role: "assistant",
      text: reply,
      time: new Date()
    });

    if (memory.history.length > 10) {
      memory.history = memory.history.slice(-10);
    }

    await memory.save();

    // ============================
    // SEND FINAL MESSAGE
    // ============================
    await sendMessage(BOT_TOKEN, chatId, reply, {
      reply_to_message_id: msg.message_id
    });

  } catch (err) {
    console.log("❌ AI Handler Error:", err);
  }
}
