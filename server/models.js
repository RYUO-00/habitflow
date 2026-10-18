// Database schemas. Every document stores userId so users only see their own data.
import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const User = model("User", new Schema({
  googleId: { type: String, unique: true }, name: String, email: String, avatar: String,
}, { timestamps: true }));

export const Habit = model("Habit", new Schema({
  userId: { type: Schema.Types.ObjectId, index: true }, name: String, emoji: { type: String, default: "✅" },
}, { timestamps: true }));

// One document per habit per day that was completed. date is "YYYY-MM-DD" (user's local date).
const logSchema = new Schema({ userId: Schema.Types.ObjectId, habitId: Schema.Types.ObjectId, date: String });
logSchema.index({ habitId: 1, date: 1 }, { unique: true });
export const HabitLog = model("HabitLog", logSchema);

const txSchema = new Schema({
  userId: Schema.Types.ObjectId, type: { type: String, enum: ["income", "expense"] },
  amount: Number, category: String, note: String, date: String,
});
txSchema.index({ userId: 1, date: -1 });
export const Transaction = model("Transaction", txSchema);
