import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    chatId: String,
    userId: String,

    mode: { type: String, default: "normal" },

    history: [
      {
        role: String,
        text: String,
        time: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Memory ||
  mongoose.model("Memory", MemorySchema);
