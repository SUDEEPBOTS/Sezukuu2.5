import { connectDB } from "@/lib/db";
import ApiKey from "@/models/ApiKey";

export default async function handler(req, res) {
  await connectDB();

  // GET → return all keys
  if (req.method === "GET") {
    const keys = await ApiKey.find().lean();
    return res.json({ ok: true, data: keys });
  }

  // POST → add new API key
  if (req.method === "POST") {
    const { key } = req.body;

    const newKey = await ApiKey.create({
      key,
      active: true,
      failedAt: null
    });

    return res.json({ ok: true, data: newKey });
  }

  // DELETE → remove a key
  if (req.method === "DELETE") {
    const { id } = req.body;

    await ApiKey.findByIdAndDelete(id);
    return res.json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
