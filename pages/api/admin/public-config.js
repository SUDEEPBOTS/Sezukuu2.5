import { connectDB } from "@/lib/db";
import PublicConfig from "@/models/PublicConfig";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const cfg = await PublicConfig.findOne().lean();
    return res.json({ ok: true, data: cfg || {} });
  }

  if (req.method === "POST") {
    const { publicEnabled, offMessage } = req.body;

    const updated = await PublicConfig.findOneAndUpdate(
      {},
      {
        publicEnabled,
        offMessage
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, data: updated });
  }

  return res.status(405).json({ ok: false, msg: "Method not allowed" });
}
