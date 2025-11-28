import axios from "axios";
import { connectDB } from "./db";
import ApiKey from "@/models/ApiKey";

async function callGeminiWithKey(API_KEY, prompt) {
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
      "Hmm... kuch samajh nahi aaya 😅"
    );
  } catch (err) {
    const status = err?.response?.status || 500;
    const details = err?.response?.data || err;

    const e = new Error("Gemini Error");
    e.status = status;
    e.details = details;
    throw e;
  }
}

export async function generateGemini(prompt) {
  await connectDB();

  const keys = await ApiKey.find({ active: true }).sort({
    failedAt: 1,
    createdAt: 1
  });

  if (!keys.length) {
    return "No active Gemini keys found ❌";
  }

  let lastError = null;

  for (const key of keys) {
    try {
      const reply = await callGeminiWithKey(key.key, prompt);

      key.failedAt = null;
      await key.save();

      return reply;

    } catch (err) {
      lastError = err;

      const isRateLimit =
        err.status === 429 || err.status === 403 || err.status === 503;

      key.failedAt = new Date();
      if (isRateLimit) key.active = false;
      await key.save();

      continue;
    }
  }

  return (
    lastError?.details?.error?.message ||
    "All API keys failed 😢"
  );
}
