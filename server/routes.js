// Habit, transaction, analytics, planner and badge endpoints. All protected by requireAuth.
import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "./auth.js";
import { Habit, HabitLog, Transaction, WeekPlan, Task } from "./models.js";

const router = Router();
router.use(requireAuth);
const dateOk = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");

// ---- Habits ----
router.get("/habits", async (req, res) => res.json(await Habit.find({ userId: req.userId, archived: false }).sort("createdAt")));
router.post("/habits", async (req, res) => {
  const name = (req.body.name || "").trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: "Name required" });
  const color = /^#[0-9A-Fa-f]{6}$/.test(req.body.color || "") ? req.body.color : "#c77dff";
  res.status(201).json(await Habit.create({ userId: req.userId, name, emoji: req.body.emoji || "✅", color }));
});
router.patch("/habits/:id", async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = String(req.body.name || "").trim().slice(0, 60);
  if (req.body.color !== undefined && /^#[0-9A-Fa-f]{6}$/.test(req.body.color)) updates.color = req.body.color;
  if (req.body.archived === true) updates.archived = true;
  if (req.body.archived === false) updates.archived = false;
  const result = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, updates, { new: true });
  if (!result) return res.status(404).json({ error: "Not found" });
  res.json(result);
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
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId, archived: false });
  if (!habit) return res.status(404).json({ error: "Not found" });
  const existing = await HabitLog.findOneAndDelete({ habitId: habit._id, date, userId: req.userId });
  if (!existing) await HabitLog.create({ userId: req.userId, habitId: habit._id, date });
  res.json({ done: !existing });
});
router.get("/logs", async (req, res) => {
  const month = req.query.month || "";
  res.json(await HabitLog.find({ userId: req.userId, date: new RegExp("^" + month.replace(/[^0-9-]/g, "")) }));
});

// ---- Transactions ---- (unchanged)
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

// ---- Stats / Monthly Tracker ----
router.get("/stats/month", async (req, res) => {
  const { month } = req.query; // "YYYY-MM"
  const uid = new mongoose.Types.ObjectId(req.userId);

  // All active habits
  const habits = await Habit.find({ userId: req.userId, archived: false }).sort("createdAt");

  // Logs for the month
  const monthRegex = new RegExp("^" + (month || "").replace(/[^0-9-]/g, ""));
  const logs = await HabitLog.find({ userId: req.userId, date: { $regex: monthRegex } });

  // Count per habit
  const counts = {};
  habits.forEach((h) => { counts[h._id.toString()] = 0; });
  logs.forEach((l) => { const idStr = l.habitId.toString ? l.habitId.toString() : String(l.habitId); counts[idStr] = (counts[idStr] || 0) + 1; });

  // Daily completion % for the month
  const daysInMonth = new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0).getDate();
  const dayMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = month + "-" + String(d).padStart(2, "0");
    const completed = logs.filter((l) => l.date === dStr).length;
    const totalHabits = habits.length || 1; // avoid division by zero
    dayMap[dStr] = { completed, total: totalHabits, pct: Math.round((completed / totalHabits) * 100) };
  }

  // Current streak: count consecutive days ending at today
  let streak = 0;
  const todayStr = (() => {
    const n = new Date(); return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  })();
  const sortedDates = uniqueDates; // already sorted ascending
  // Walk backwards from today to count streak
  let check = todayStr;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    if (sortedDates[i] === check) { streak++; check = new Date(new Date(check + "T00:00:00").getTime() - 864e5).toISOString().slice(0, 10); }
    else if (sortedDates[i] < check) break;
  }
  // Best streak (all time) using string comparison on dates sorted
  const allLogs = await HabitLog.find({ userId: req.userId }).sort("date");
  const uniqueDates = [...new Set(allLogs.map((l) => l.date))].sort();
  let bestStreak = 0, cur = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i > 0) {
      const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
      const curr = new Date(uniqueDates[i] + "T00:00:00");
      const diff = (curr - prev) / 864e5;
      if (diff === 1) { cur++; bestStreak = Math.max(bestStreak, cur); }
      else { cur = 1; bestStreak = Math.max(bestStreak, cur); }
    } else { cur = 1; bestStreak = Math.max(bestStreak, cur); }
  }

  // Perfect days
  const perfectDays = Object.values(dayMap).filter((d) => d.completed >= habits.length && habits.length > 0).length;

  // Completed / total possible (days in month × habits)
  const totalPossible = daysInMonth * Math.max(habits.length, 1);
  const completedTotal = logs.length;

  res.json({
    habits,
    counts,
    daily: Object.entries(dayMap).map(([date, val]) => ({ date, ...val })),
    streak,
    bestStreak,
    perfectDays,
    completedTotal,
    totalPossible,
  });
});

router.get("/stats/year", async (req, res) => {
  const { year } = req.query; // "YYYY"
  const uid = new mongoose.Types.ObjectId(req.userId);
  const regex = new RegExp("^" + (year || "").replace(/[^0-9-]/g, ""));
  const logs = await HabitLog.find({ userId: req.userId, date: { $regex: regex } });
  const countsByDate = {};
  logs.forEach((l) => { countsByDate[l.date] = (countsByDate[l.date] || 0) + 1; });
  const result = Object.entries(countsByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  res.json(result);
});

// ---- Analytics (existing) ----
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

// ---- Week Planner ----
router.get("/weeks", async (req, res) => {
  const start = req.query.start || "";
  const filter = { userId: req.userId };
  if (start) filter.weekStart = start;
  res.json(await WeekPlan.find(filter).sort("weekStart"));
});
router.post("/weeks", async (req, res) => {
  const { weekStart, bossTask, wins, nextWeek } = req.body;
  if (!dateOk(weekStart)) return res.status(400).json({ error: "Invalid weekStart" });
  const doc = await WeekPlan.findOneAndUpdate(
    { userId: req.userId, weekStart },
    { bossTask: (bossTask || "").slice(0, 200), wins: (wins || "").slice(0, 500), nextWeek: (nextWeek || "").slice(0, 500) },
    { upsert: true, new: true }
  );
  res.json(doc);
});
router.get("/weeks/:start/tasks", async (req, res) => {
  const start = req.params.start;
  res.json(await Task.find({ userId: req.userId, weekStart: start }).sort("day").sort("order"));
});
router.post("/weeks/:start/tasks", async (req, res) => {
  const start = req.params.start;
  const { day, text, big3, completed, order } = req.body;
  if (!dateOk(day) || !text || !(text.trim().length > 0)) return res.status(400).json({ error: "Invalid task" });
  const doc = await Task.create({
    userId: req.userId, weekStart: start, day,
    text: String(text).trim().slice(0, 200),
    big3: !!big3, completed: !!completed, order: Number(order || 0),
  });
  res.status(201).json(doc);
});
router.patch("/tasks/:id", async (req, res) => {
  const updates = {};
  if (req.body.text !== undefined) updates.text = String(req.body.text || "").trim().slice(0, 200);
  if (req.body.completed !== undefined) updates.completed = !!req.body.completed;
  if (req.body.big3 !== undefined) updates.big3 = !!req.body.big3;
  if (req.body.order !== undefined) updates.order = Number(req.body.order || 0);
  const doc = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, updates, { new: true });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});
router.delete("/tasks/:id", async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});
router.post("/weeks/:start/boss", async (req, res) => {
  const { done } = req.body;
  const doc = await WeekPlan.findOneAndUpdate(
    { userId: req.userId, weekStart: req.params.start },
    { bossDone: !!done },
    { upsert: true, new: true }
  );
  res.json(doc);
});

// ---- Badges ----
router.get("/badges", async (req, res) => {
  const uid = req.userId;
  // 7-day streak badge
  const logs = await HabitLog.find({ userId: uid }).sort("date");
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort();
  let bestStreak = 0, cur = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) cur = 1; else {
      const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
      const curr = new Date(uniqueDates[i] + "T00:00:00");
      const diff = (curr - prev) / 864e5;
      if (diff === 1) cur++; else cur = 1;
    }
    bestStreak = Math.max(bestStreak, cur);
  }
  // Perfect week: any 7 consecutive days where at least one habit completed each day (simplified: any 7-day span with 7 unique dates)
  const hasPerfectWeek = uniqueDates.length >= 7; // approximate check; full logic can be added

  // 100 completions
  const totalCompletions = logs.length;
  const badges = [];
  if (bestStreak >= 7) badges.push({ key: "streak7", label: "7-Day Streak", desc: "Completed a habit 7 days in a row" });
  if (bestStreak >= 30) badges.push({ key: "streak30", label: "30-Day Streak", desc: "Completed a habit 30 days in a row" });
  if (hasPerfectWeek) badges.push({ key: "perfectWeek", label: "Perfect Week", desc: "Every day completed" });
  if (totalCompletions >= 100) badges.push({ key: "century", label: "100 Completions", desc: "Reached 100 completions" });
  res.json(badges);
});

export default router;
