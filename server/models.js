// Database schemas. Every document stores userId so users only see their own data.
// Added optional color/archived on Habit (defaults keep existing docs intact).
// Added WeekPlan and Task for the planner feature.
import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const User = model("User", new Schema({
  googleId: { type: String, unique: true }, name: String, email: String, avatar: String,
}, { timestamps: true }));

export const Habit = model("Habit", new Schema({
  userId: { type: Schema.Types.ObjectId, index: true },
  name: String,
  emoji: { type: String, default: "✅" },
  color: { type: String, default: "#c77dff" }, // neon violet default
  archived: { type: Boolean, default: false },
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

// Weekly planner: one doc per user per week (weekStart is Monday's YYYY-MM-DD)
const weekPlanSchema = new Schema({
  userId: Schema.Types.ObjectId, weekStart: String, // "YYYY-MM-DD"
  bossTask: { type: String, default: "" }, bossDone: { type: Boolean, default: false },
  wins: { type: String, default: "" }, nextWeek: { type: String, default: "" },
}, { timestamps: true });
weekPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
export const WeekPlan = model("WeekPlan", weekPlanSchema);

// Tasks within a week
const taskSchema = new Schema({
  userId: Schema.Types.ObjectId,
  weekStart: String, // "YYYY-MM-DD" (Monday)
  day: String, // "YYYY-MM-DD" (actual day)
  text: String,
  big3: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });
taskSchema.index({ userId: 1, weekStart: 1, day: 1, order: 1 });
export const Task = model("Task", taskSchema);
