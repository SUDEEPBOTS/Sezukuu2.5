import mongoose from "mongoose";

const PublicBotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    botToken: {
      type: String,
      required: true,
    },

    botId: String,

    botUsername: String,
    botName: String,

    gender: {
      type: String,
      default: "female",
    },

    personality: {
      type: String,
      default: "normal",
    },

    ownerName: String,
    ownerUsername: String,

    photoUrl: String,

    webhookConnected: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PublicBot ||
  mongoose.model("PublicBot", PublicBotSchema);
