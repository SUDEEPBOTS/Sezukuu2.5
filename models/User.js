import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: String,         // telegram user id
    username: String,
    firstName: String,
    lastName: String,

    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    lastActiveAt: Date,
    registeredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
