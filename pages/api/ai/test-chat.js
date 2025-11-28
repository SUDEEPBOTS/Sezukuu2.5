import { generateGemini } from "@/lib/gemini";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false });

  const { prompt } = req.body;

  const reply = await generateGemini(prompt);

  return res.json({
    ok: true,
    reply
  });
}
