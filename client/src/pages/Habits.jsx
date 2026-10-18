// Monthly habit tracker: everything from Screenshot 1, wired to real data.
import { useEffect, useState, useCallback } from "react";
import { api, ymd } from "../api.js";
import StatBar from "../components/StatBar.jsx";
import HabitGrid from "../components/HabitGrid.jsx";
import AnalysisPanel from "../components/AnalysisPanel.jsx";
import HeatStrip from "../components/HeatStrip.jsx";
import ProgressLineChart from "../components/ProgressLineChart.jsx";
import LevelUpBanner from "../components/LevelUpBanner.jsx";

export default function MonthlyTracker() {
  const [month, setMonth] = useState(ymd(new Date()).slice(0, 7));
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [prevLevel, setPrevLevel] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, s] = await Promise.all([
        api("/habits"),
        api("/stats/month?month=" + month),
      ]);
      setHabits(h);
      setStats({ ...s, month, year: month.slice(0, 4) });
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  // Compute level from total XP (simplified: 500 per level)
  const totalXp = stats ? (stats.completedTotal || 0) * 10 : 0;
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const levelUp = currentLevel > prevLevel;
  useEffect(() => { if (stats && !loading) setPrevLevel(currentLevel); }, [currentLevel, stats, loading]);

  const shift = (n) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    setMonth(ymd(d).slice(0, 7));
  };

  const add = async () => {
    if (!name.trim()) return;
    const h = await api("/habits", "POST", { name: name.trim(), color: "#c77dff" });
    setHabits([...habits, h]);
    setName("");
  };

  const toggle = useCallback(async (id, d) => {
    // Optimistic update
    const doneBefore = stats?.daily?.find((day) => day.date === d)?.completed || 0;
    try {
      const res = await api(`/habits/${id}/toggle`, "POST", { date: d });
      // Refresh stats to keep consistent
      load();
    } catch (e) {
      console.error("Toggle failed", e);
      load(); // rollback by reloading
    }
  }, [load, stats]);

  if (loading && !stats) return <div className="card"><p className="mu">Loading tracker...</p></div>;

  return (
    <>
      <h2>Monthly Habit Tracker</h2>
      <StatBar stats={{ ...stats, year: month.slice(0, 4), month: month }} />
      <div className="row" style={{ marginBottom: 8, gap: 12 }}>
        <button onClick={() => shift(-1)}>← Previous</button>
        <b style={{ fontSize: 18 }}>{month}</b>
        <button onClick={() => shift(1)}>Next →</button>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit, e.g. Read 20 pages" style={{ flex: 1, minWidth: 220 }} />
        <button className="primary" onClick={add}>Add habit</button>
      </div>
      {levelUp && <LevelUpBanner level={currentLevel} />}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 340px" }}>
        <div>
          <HabitGrid habits={habits} month={month} stats={stats} toggle={toggle} />
          <HeatStrip daily={stats?.daily || []} />
          <ProgressLineChart daily={stats?.daily || []} />
        </div>
        <aside>
          <AnalysisPanel habits={habits} stats={stats} />
          <div className="card">
            <h4 style={{ margin: "0 0 8px" }}>Top 5 Strongest</h4>
            {habits.map((h) => {
              const count = stats?.counts?.[h._id] || 0;
              return (
                <div key={h._id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: h.color || "var(--violet)", marginRight: 6 }} />{h.name}</span>
                  <b>{count}</b>
                </div>
              );
            }).slice(0, 5)}
          </div>
          <div className="card">
            <h4 style={{ margin: "0 0 8px" }}>Needs Focus</h4>
            {habits.map((h) => {
              const count = stats?.counts?.[h._id] || 0;
              return count === 0 ? (
                <div key={h._id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)", color: "var(--pink)", fontWeight: 600 }}>
                  {h.name} <span>{count}</span>
                </div>
              ) : null;
            }).filter(Boolean).slice(0, 5)}
          </div>
        </aside>
      </div>
    </>
  );
}
