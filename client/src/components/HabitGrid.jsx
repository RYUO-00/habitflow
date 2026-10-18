// Habit grid: left column with habit names, scrollable grid of checkboxes.
import { useState, useEffect } from "react";
import { api, ymd } from "../api.js";

export default function HabitGrid({ habits, month, stats, toggle }) {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => month + "-" + String(i + 1).padStart(2, "0"));
  const todayStr = ymd(new Date());

  const isDone = (habitId, d) => {
    // Check if log exists for this habit + date
    // Since stats don't include per-day per-habit details directly, we'll rely on a future endpoint or approximate.
    // For simplicity in this redesign, we approximate using stats.daily, but ideally we'd have logs endpoint.
    // We'll load logs in the parent and pass them; since stats here doesn't have per-habit logs, we approximate.
    // For full correctness, we call toggle endpoint and rely on the API for state.
    return false; // placeholder: we'll load logs via component state
  };

  // Better approach: load logs from server in component or parent
  // Let's use a small inline fetch for logs
  // Actually, let's modify the parent to pass logs. But to keep it simple, we'll approximate using the stats
  // For a fully working app, we'll add a logs endpoint call inside this component.
  return <GridInternal habits={habits} month={month} todayStr={todayStr} toggle={toggle} />;
}

function GridInternal({ habits, month, todayStr, toggle }) {
  // Fetch logs for this month to show correct checkboxes
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api("/logs?month=" + month);
        setLogs(data || []);
      } catch (e) { console.error("Logs load error", e); }
    };
    fetchLogs();
  }, [month]);

  const isDone = (habitId, d) => logs.some((l) => l.habitId === habitId || (l.habitId && l.habitId.toString() === habitId.toString()) && l.date === d);

  const [y, m] = month.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  const days = [...Array(count)].map((_, i) => month + "-" + String(i + 1).padStart(2, "0"));

  // Week grouping
  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  const weekColors = ["week-violet", "week-blue", "week-teal", "week-lime", "week-pink"];

  return (
    <div className="card scroll">
      <table style={{ borderCollapse: "collapse", fontSize: ".8rem", width: "100%" }}>
        <thead>
          <tr>
            <th className="name" style={{ minWidth: 160, textAlign: "left", background: "var(--card)", position: "sticky", left: 0, zIndex: 3, borderBottom: "2px solid var(--border)", padding: 8 }}>Habit</th>
            {days.map((d, idx) => {
              const weekIdx = Math.floor(idx / 7);
              return (
                <th key={d} style={{ textAlign: "center", padding: 6, borderBottom: `3px solid ${weekColors[weekIdx] || "var(--border)"}`, minWidth: 28 }}>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>{["Th","Fr","Sa","Su","Mo","Tu","We"][new Date(d + "T00:00:00").getDay()]}</div>
                  <div style={{ fontWeight: 700 }}>{+d.slice(8)}</div>
                </th>
              );
            })}
            <th style={{ borderLeft: "2px solid var(--border)" }}>Done</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => (
            <tr key={h._id}>
              <td className="name" style={{ textAlign: "left", position: "sticky", left: 0, background: "var(--card)", zIndex: 2, padding: 8, borderRight: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: h.color || "var(--violet)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{h.name}</span>
                </div>
              </td>
              {days.map((d) => {
                const done = isDone(h._id, d);
                const future = d > todayStr;
                return (
                  <td key={d} style={{ padding: 2 }}>
                    <button
                      className={`cb ${done ? "on" : ""} ${future ? "fut" : ""}`}
                      aria-label={`${h.name} on ${d}`}
                      onClick={() => !future && toggle(h._id, d)}
                    >
                      {done ? "✓" : ""}
                    </button>
                  </td>
                );
              })}
              <td style={{ borderLeft: "2px solid var(--border)", fontWeight: 700, fontSize: 14 }}>{logs.filter((l) => (l.habitId === h._id || (l.habitId && l.habitId.toString() === h._id.toString())) && l.date >= month && l.date < (month.slice(0, 7) === month ? month + "-32" : month)).length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

