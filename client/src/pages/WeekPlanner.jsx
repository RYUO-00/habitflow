// Week Planner from Screenshot 2: boss task, Big 3, tasks, donuts, XP.
import { useState, useEffect } from "react";
import { api } from "../api.js";
import DonutRing from "../components/DonutRing.jsx";

export default function WeekPlanner() {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday
    const monday = new Date(today); monday.setDate(today.getDate() + diff);
    const y = monday.getFullYear(); const m = String(monday.getMonth() + 1).padStart(2, "0"); const d = String(monday.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ text: "", big3: false, day: weekStart });
  const [wins, setWins] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [bossTask, setBossTask] = useState("");

  const loadWeek = async (start) => {
    const [w, t] = await Promise.all([
      api("/weeks?start=" + start).then((r) => (r || [])[0] || null),
      api("/weeks/" + start + "/tasks"),
    ]);
    setPlan(w);
    setTasks(t || []);
    if (w) { setBossTask(w.bossTask || ""); setWins(w.wins || ""); setNextWeek(w.nextWeek || ""); }
  };

  useEffect(() => { loadWeek(weekStart); }, [weekStart]);

  const shiftWeek = (n) => {
    const [y, m, d] = weekStart.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + n * 7);
    const ny = date.getFullYear(); const nm = String(date.getMonth() + 1).padStart(2, "0"); const nd = String(date.getDate()).padStart(2, "0");
    setWeekStart(`${ny}-${nm}-${nd}`);
  };

  const addTask = async () => {
    if (!newTask.text.trim()) return;
    const t = await api("/weeks/" + weekStart + "/tasks", "POST", { ...newTask, text: newTask.text.trim(), order: tasks.length });
    setTasks([...tasks, t]);
    setNewTask({ text: "", big3: false, day: weekStart });
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    await api("/tasks/" + id, "PATCH", { completed: !task.completed });
    setTasks(tasks.map((t) => t._id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = async (id) => {
    await api("/tasks/" + id, "DELETE");
    setTasks(tasks.filter((t) => t._id !== id));
  };

  const savePlan = async () => {
    await api("/weeks", "POST", { weekStart, bossTask, wins, nextWeek });
  };

  const setDay = (d) => () => setNewTask({ ...newTask, day: d });

  // Week header: date range
  const startDate = new Date(weekStart + "T00:00:00");
  const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6);
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

  // Stats per day (simplified from tasks)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate); d.setDate(startDate.getDate() + i);
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const nd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${nd}`;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 1;
  const weekPct = Math.round((completedCount / totalTasks) * 100);

  // XP calculation (simplified)
  const regularXp = tasks.filter((t) => t.completed && !t.big3).length * 10;
  const big3Xp = tasks.filter((t) => t.completed && t.big3).length * 30;
  const bossXp = plan && plan.bossDone ? 100 : 0;
  const totalWeekXp = regularXp + big3Xp + bossXp;

  // Rank label
  const rankLabel = totalWeekXp < 300 ? "Warming up" : totalWeekXp < 600 ? "On track" : totalWeekXp < 1000 ? "Rising" : totalWeekXp < 1500 ? "On fire" : "Unstoppable";

  return (
    <>
      <h2>Week Planner</h2>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 320px", marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ margin: 0, fontSize: 16 }}>Boss task of the week <span style={{ color: "var(--yellow)" }}>+100 XP</span></h3>
          <input value={bossTask} onChange={(e) => setBossTask(e.target.value)} placeholder="Type the one task that makes this week a win" style={{ width: "100%", marginTop: 8, marginBottom: 4 }} />
          <button className="primary" onClick={async () => { await savePlan(); await api("/weeks/" + weekStart + "/boss", "POST", { done: false }); }}>Save boss task</button>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="mu">WEEK XP</div>
              <b style={{ fontSize: 24, color: "var(--cyan)" }}>{totalWeekXp} / 1,330</b>
              <div style={{ color: "var(--yellow)", fontWeight: 700 }}>{rankLabel}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <DonutRing percent={weekPct} size={80} stroke={6} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
            <span><b>{completedCount}</b> / {totalTasks} done</span>
            <span>Best day: <b>Wed</b></span>
            <span>Needs focus: <b>Sat</b></span>
            <span>Cleared days: <b>0</b></span>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <button onClick={() => shiftWeek(-1)}>←</button>
        <b>{fmt(startDate)} — {fmt(endDate)}, {startDate.getFullYear()}</b>
        <button onClick={() => shiftWeek(1)}>→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {days.map((d, idx) => {
          const dateObj = new Date(d + "T00:00:00");
          const label = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
          const isToday = d === (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; })();
          const dayTasks = tasks.filter((t) => t.day === d);
          const doneCount = dayTasks.filter((t) => t.completed).length;
          const big3Count = dayTasks.filter((t) => t.completed && t.big3).length;
          const regularDone = doneCount - big3Count;
          const dayXp = regularDone * 10 + big3Count * 30;
          return (
            <div key={d} className="card" style={{ borderTop: `3px solid ${["var(--violet)","var(--blue)","var(--teal)","var(--lime)","var(--pink)","var(--cyan)","var(--yellow)"][idx]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <b style={{ fontSize: 14 }}>{label}</b>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{doneCount} / {dayTasks.length || 3} done · <span style={{ color: "var(--yellow)" }}>+{dayXp} XP</span></span>
              </div>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <DonutRing percent={dayTasks.length ? Math.round((doneCount / Math.max(dayTasks.length, 1)) * 100) : 0} size={70} stroke={5} color={["var(--violet)","var(--blue)","var(--teal)","var(--lime)","var(--pink)","var(--cyan)","var(--yellow)"][idx]} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: "var(--yellow)" }}>BIG 3 ×3 XP</div>
              {dayTasks.filter((t) => t.big3).map((t) => (
                <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t._id)} aria-label={t.text} />
                  <span style={{ textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--muted)" : "inherit" }}>{t.text}</span>
                  <button className="x" onClick={() => deleteTask(t._id)} aria-label="Delete">×</button>
                </div>
              ))}
              {dayTasks.filter((t) => !t.big3).map((t) => (
                <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t._id)} aria-label={t.text} />
                  <span style={{ textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--muted)" : "inherit" }}>{t.text}</span>
                  <button className="x" onClick={() => deleteTask(t._id)} aria-label="Delete">×</button>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <input type="text" placeholder="New task" value={newTask.day === d ? newTask.text : ""} onChange={(e) => { setDay(d)(); setNewTask({ ...newTask, text: e.target.value }); }} style={{ flex: 1, minWidth: 120 }} />
                <label style={{ fontSize: 12 }}><input type="checkbox" checked={newTask.day === d ? newTask.big3 : false} onChange={(e) => setNewTask({ ...newTask, big3: e.target.checked })} /> Big 3</label>
                <button className="primary" onClick={() => { setNewTask({ ...newTask, day: d }); addTask(); }}>Add</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: 16 }}>
        <div className="card">
          <h4 style={{ margin: 0 }}>Wins of the week</h4>
          <textarea value={wins} onChange={(e) => setWins(e.target.value)} placeholder="What went well?" style={{ width: "100%", minHeight: 80, marginTop: 8 }} />
        </div>
        <div className="card">
          <h4 style={{ margin: 0 }}>Next week focus</h4>
          <textarea value={nextWeek} onChange={(e) => setNextWeek(e.target.value)} placeholder="One boss task, not five" style={{ width: "100%", minHeight: 80, marginTop: 8 }} />
        </div>
      </div>
    </>
  );
}
