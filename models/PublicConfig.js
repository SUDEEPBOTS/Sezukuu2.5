import mongoose from "mongoose";

const PublicConfigSchema = new mongoose.Schema(
  {
    publicEnabled: { type: Boolean, default: true },
    offMessage: {
      type: String,
      default: "The public panel is currently offline ❌"
    },
    title: { type: String, default: "Sezukuu Public Panel" },
    subtitle: { type: String, default: "Create your own AI bot here" },
    themeColor: { type: String, default: "#ff66cc" }
  },
  { timestamps: true }
);

export default mongoose.models.PublicConfig ||
  mongoose.model("PublicConfig", PublicConfigSchema);
