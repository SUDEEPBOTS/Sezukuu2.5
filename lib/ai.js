// lib/ai.js
import axios from "axios";

export async function generateWithYuki(prompt) {
  const KEY = process.env.GEMINI_API_KEY;

  if (!KEY) return "❌ Gemini API key missing";

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }
    );

    return (
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hmm… kuch samajh nahi aaya 😅"
    );
  } catch (err) {
    console.log("Gemini Error:", err?.response?.data || err);
    return "Oops, error 😅";
  }
}
