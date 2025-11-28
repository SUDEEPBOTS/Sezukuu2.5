import mongoose from "mongoose";

const PublicBotSchema = new mongoose.Schema(
  {
    userId: String,              // public user id
    botToken: String,
    botName: String,
    ownerName: String,
    ownerUsername: String,
    ownerId: String,
    supportGroup: String,
    logGroup: String,
    startMessage: String,

    webhookSet: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.PublicBot ||
  mongoose.model("PublicBot", PublicBotSchema);
