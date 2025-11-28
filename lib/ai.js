// lib/ai.js
import axios from "axios";
import { connectDB } from "./db";
import BotSettings from "@/models/BotSettings";

// Call Gemini API
async function callGemini(API_KEY, prompt) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    API_KEY;

  try {
    const res = await axios.post(url, {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 512
      }
    });

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      null
    );
  } catch (err) {
    console.log("❌ Gemini Error:", err?.response?.data || err);
    return null;
  }
}

// =========================
// MAIN EXPORT (NEEDED)
// =========================
export async function generateWithYuki(prompt) {
  await connectDB();

  const MAIN_KEY = process.env.GEMINI_API_KEY;

  if (!MAIN_KEY) {
    console.log("❌ Missing GEMINI_API_KEY in env");
    return "Gemini key missing 😅";
  }

  let reply = await callGemini(MAIN_KEY, prompt);

  if (!reply) {
    reply = "Oops, thoda issue aa gaya 😅";
  }

  return reply;
}

// =========================
// OPTIONAL: ADVANCED AI WITH SETTINGS
// (used only in main admin panel)
// =========================
export async function generateAI(memoryText, userText) {
  await connectDB();

  const settings = (await BotSettings.findOne()) || {};

  const name = settings.botName || "Sezukuu";
  const personality = settings.personality || "normal";
  const gender = settings.gender || "female";

  let personalityLine = "";
  if (personality === "normal")
    personalityLine = "Soft Hinglish, cute, friendly. 2 lines max.";
  else if (personality === "flirty")
    personalityLine = "Thodi flirty, teasing tone. Emojis allowed.";
  else
    personalityLine = "Calm, polite, respectful. No flirting.";

  const genderLine =
    gender === "male"
      ? "Tum 18 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki Delhi ki cute girl ho.";

  const finalPrompt = `
Tumhara naam ${name} hai.
${genderLine}
${personalityLine}

Rules:
- Real human style
- Short, cute replies
- No repeating user message
- No over-explaining

Conversation:
${memoryText}

User: ${userText}
Reply:
`;

  const MAIN_KEY = process.env.GEMINI_API_KEY;
  let reply = await callGemini(MAIN_KEY, finalPrompt);

  return (
    reply || "Oops, kuch gadbad ho gayi 😅"
  );
}
