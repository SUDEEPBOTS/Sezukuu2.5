import mongoose from "mongoose";

const BotConfigSchema = new mongoose.Schema(
  {
    telegramBotToken: { type: String, required: true },
    ownerId: { type: String, default: "" },
    ownerUsername: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.BotConfig ||
  mongoose.model("BotConfig", BotConfigSchema);
