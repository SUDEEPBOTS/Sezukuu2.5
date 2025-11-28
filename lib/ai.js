import axios from "axios";
import BotSettings from "@/models/BotSettings";
import { connectDB } from "./db";

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
        temperature: 0.5,
        maxOutputTokens: 512
      }
    });

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm... thoda confuse ho gayi 🥺"
    );
  } catch (err) {
    console.error("❌ Gemini API Error:", err?.response?.data || err);
    return null;
  }
}

// ================================
// MAIN AI FUNCTION
// ================================

export async function generateAI(memoryText, userText) {
  await connectDB();

  const settings = (await BotSettings.findOne()) || {};

  const name = settings.botName || "Sezukuu";
  const personality = settings.personality || "normal";
  const gender = settings.gender || "female";

  // PERSONALITY LINES
  let personalityLine = "";

  if (personality === "normal") {
    personalityLine =
      "Soft Hinglish, cute, friendly but natural. 2 lines max.";
  } else if (personality === "flirty") {
    personalityLine =
      "Thodi flirty, teasing, cute emojis allowed but not too much.";
  } else if (personality === "professional") {
    personalityLine =
      "Calm, polite, professional tone. No flirting. Clean answers.";
  }

  const genderLine =
    gender === "male"
      ? "Tum ek 18 saal ke Delhi ke ladke ho, fun + friendly tone me."
      : "Tum 18 saal ki Delhi ki cute girl ho. Realistic, soft, sweet.";

  // FINAL PROMPT
  const finalPrompt = `
Tumhara naam ${name} hai.
${genderLine}
${personalityLine}

Rules:
- Reply short (1–3 lines)
- Natural real girl style
- Over-explain mat karna
- Emoji ka natural use karo
- User ke message ko repeat nahi karna
- Never say you're an AI or bot

Conversation so far:
${memoryText}

User: ${userText}
Reply:
`;

  // Main API key (.env se)
  const MAIN_KEY = process.env.GEMINI_API_KEY;

  // Primary attempt
  let reply = await callGemini(MAIN_KEY, finalPrompt);

  // Fallback if main key fails
  if (!reply) {
    reply = "Oops, ek second na jaan, thoda issue aa gaya 😅";
  }

  return reply;
}
