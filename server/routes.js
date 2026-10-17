// Habit, transaction and analytics endpoints. All require login.
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "./auth.js";
import { Habit, HabitLog, Transaction } from "./models.js";

const router = Router();
router.use(requireAuth);
const dateOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");

// ---- Habits ----
router.get("/habits", async (req, res) => res.json(await Habit.find({ userId: req.userId }).sort("createdAt")));
router.post("/habits", async (req, res) => {
  const name = (req.body.name || "").trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: "Name required" });
  res.status(201).json(await Habit.create({ userId: req.userId, name, emoji: req.body.emoji || "✅" }));
});
router.delete("/habits/:id", async (req, res) => {
  await Habit.deleteOne({ _id: req.params.id, userId: req.userId });
  await HabitLog.deleteMany({ habitId: req.params.id, userId: req.userId });
  res.json({ ok: true });
});
// Tick / untick a habit for one day.
router.post("/habits/:id/toggle", async (req, res) => {
  const { date } = req.body;
  if (!dateOk(date)) return res.status(400).json({ error: "Bad date" });
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
  if (!habit) return res.status(404).json({ error: "Not found" });
  const existing = await HabitLog.findOneAndDelete({ habitId: habit._id, date });
  if (!existing) await HabitLog.create({ userId: req.userId, habitId: habit._id, date });
  res.json({ done: !existing });
});
router.get("/logs", async (req, res) => {
  const month = req.query.month || ""; // "YYYY-MM"
  res.json(await HabitLog.find({ userId: req.userId, date: new RegExp("^" + month.replace(/[^0-9-]/g, "")) }));
});

// ---- Transactions ----
router.get("/transactions", async (req, res) => res.json(await Transaction.find({ userId: req.userId }).sort({ date: -1 })));
router.post("/transactions", async (req, res) => {
  const { type, amount, category, note, date } = req.body;
  if (!["income", "expense"].includes(type) || !(amount > 0) || !dateOk(date))
    return res.status(400).json({ error: "Invalid transaction" });
  res.status(201).json(await Transaction.create({ userId: req.userId, type, amount, category: category || "Other", note: (note || "").slice(0, 100), date }));
});
router.delete("/transactions/:id", async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

// ---- Analytics (computed in MongoDB with aggregation) ----
router.get("/analytics/habits", async (req, res) => {
  const uid = new mongoose.Types.ObjectId(req.userId);
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const perDay = await HabitLog.aggregate([{ $match: { userId: uid, date: { $gte: since } } }, { $group: { _id: "$date", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  const perHabit = await HabitLog.aggregate([{ $match: { userId: uid, date: { $gte: since } } }, { $group: { _id: "$habitId", count: { $sum: 1 } } }]);
  res.json({ perDay, perHabit });
});
router.get("/analytics/finance", async (req, res) => {
  const uid = new mongoose.Types.ObjectId(req.userId);
  const byMonth = await Transaction.aggregate([
    { $match: { userId: uid } },
    { $group: { _id: { month: { $substrBytes: ["$date", 0, 7] }, type: "$type" }, total: { $sum: "$amount" } } },
    { $sort: { "_id.month": 1 } }]);
  const byCategory = await Transaction.aggregate([
    { $match: { userId: uid, type: "expense" } }, { $group: { _id: "$category", total: { $sum: "$amount" } } }]);
  res.json({ byMonth, byCategory });
});
export default router;
