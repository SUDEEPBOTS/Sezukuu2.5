import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    type: { type: String, default: "info" }, // info, error, warn, moderation
    chatId: String,
    userId: String,
    message: String,
    details: Object
  },
  { timestamps: true }
);

export default mongoose.models.Log ||
  mongoose.model("Log", LogSchema);
