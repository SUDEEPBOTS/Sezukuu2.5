import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    active: { type: Boolean, default: true },
    failedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.ApiKey ||
  mongoose.model("ApiKey", ApiKeySchema);
