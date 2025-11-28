// lib/ai.js
import axios from "axios";
import { connectDB } from "./db";
import BotSettings from "@/models/BotSettings";

// ==========================
// INTERNAL GEMINI CALL
// ==========================
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
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text || null
    );
  } catch (err) {
    console.log("❌ Gemini API Error:", err?.response?.data || err);
    return null;
  }
}

// ============================================================
// MAIN EXPORT → Public bots use this function
// ============================================================
export async function generateWithYuki(prompt) {
  await connectDB();

  const MAIN_KEY = process.env.GEMINI_API_KEY;
  if (!MAIN_KEY) {
    return "❌ Gemini API key missing.";
  }

  let reply = await callGemini(MAIN_KEY, prompt);

  return reply || "Oops, thoda error aa gaya 😅";
}

// ============================================================
// ADVANCED AI (Main admin panel only)
// ============================================================
export async function generateAI(memoryText, userText) {
  await connectDB();

  const settings = (await BotSettings.findOne()) || {};

  const name = settings.botName || "Sezukuu";
  const personality = settings.personality || "normal";
  const gender = settings.gender || "female";

  let personalityLine = "";
  if (personality === "normal")
    personalityLine = "Soft Hinglish, cute, friendly.";
  else if (personality === "flirty")
    personalityLine = "Thodi flirty, teasing tone.";
  else
    personalityLine = "Polite, calm, respectful.";

  const genderLine =
    gender === "male"
      ? "Tum 18 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki Delhi ki cute girl ho.";

  const finalPrompt = `
Tumhara naam ${name} hai.
${genderLine}
${personalityLine}
Short natural reply do (1–3 lines).
User ke message ko repeat mat karna.

Conversation:
${memoryText}

User: ${userText}
Reply:
`;

  const MAIN_KEY = process.env.GEMINI_API_KEY;

  const reply = await callGemini(MAIN_KEY, finalPrompt);

  return reply || "Oops, error ho gaya 😅";
}
