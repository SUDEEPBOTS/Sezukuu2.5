import mongoose from "mongoose";

const BotSettingsSchema = new mongoose.Schema(
  {
    botName: { type: String, default: "Sezukuu" },
    botUsername: { type: String, default: "" },

    gender: { type: String, default: "female" },

    personality: { type: String, default: "normal" }, 
    groupLink: { type: String, default: "" },

    welcomeMessage: { type: String, default: "Welcome to the group ❤️" },
    welcomeImage: { type: String, default: "" },

    startMessage: { type: String, default: "Hey, I'm Sezukuu ✨" }
  },
  { timestamps: true }
);

export default mongoose.models.BotSettings ||
  mongoose.model("BotSettings", BotSettingsSchema);
