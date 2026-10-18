// Analytics page: 4 charts with dark neon styling.
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { api, ymd } from "../api.js";

const COLORS = ["#c77dff", "#00e5e5", "#a3ff5c", "#ffd166", "#ff6b9d", "#5aaaff", "#00d4aa"];

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [hs, setHs] = useState({ perDay: [], perHabit: [] });
  const [fin, setFin] = useState({ byMonth: [], byCategory: [] });
  useEffect(() => {
    api("/habits").then(setHabits);
    api("/analytics/habits").then(setHs);
    api("/analytics/finance").then(setFin);
  }, []);

  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return ymd(d); });
  const dayCount = (d) => (hs.perDay?.find((x) => x._id === d) || { count: 0 }).count;
  const last30 = [...Array(30)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return ymd(d); });
  const months = [...new Set((fin.byMonth || []).map((x) => x._id?.month))];
  const monthTotal = (m, type) => (fin.byMonth?.find((x) => x._id?.month === m && x._id?.type === type) || { total: 0 }).total;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid2">
        <div className="card"><b>Habits completed — last 7 days</b>
          <Bar style={{ height: 220 }} data={{ labels: last7.map((d) => d.slice(5)), datasets: [{ label: "Completions", data: last7.map(dayCount), backgroundColor: COLORS[0] }] }} options={{ plugins: { legend: { display: false } }, scales: { y: { grid: { color: "var(--border)" } }, x: { grid: { display: false } } } }} />
        </div>
        <div className="card"><b>30-day trend</b>
          <Line style={{ height: 220 }} data={{ labels: last30.map((d) => d.slice(5)), datasets: [{ label: "Completions", data: last30.map(dayCount), borderColor: COLORS[1], backgroundColor: "rgba(0,229,229,0.1)", tension: 0.35, pointBackgroundColor: COLORS[0], pointBorderColor: COLORS[1], pointRadius: 3, fill: true }] }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "var(--border)" } }, x: { grid: { display: false } } } }} />
        </div>
        <div className="card"><b>By habit (30 days)</b>
          <Doughnut style={{ maxHeight: 200 }} data={{ labels: habits.map((h) => h.name), datasets: [{ data: habits.map((h) => (hs.perHabit?.find((x) => x._id === h._id) || { count: 0 }).count), backgroundColor: COLORS }] }} options={{ plugins: { legend: { position: "bottom", labels: { color: "var(--text)", boxWidth: 10 } } } }} />
        </div>
        <div className="card"><b>Income vs expense</b>
          <Bar style={{ height: 200 }} data={{ labels: months, datasets: [{ label: "Income", data: months.map((m) => monthTotal(m, "income")), backgroundColor: COLORS[2] }, { label: "Expense", data: months.map((m) => monthTotal(m, "expense")), backgroundColor: COLORS[4] }] }} options={{ plugins: { legend: { display: false } }, scales: { y: { grid: { color: "var(--border)" } }, x: { grid: { display: false } } } }} />
        </div>
        <div className="card"><b>Spending by category</b>
          <Doughnut style={{ maxHeight: 200 }} data={{ labels: fin.byCategory?.map((c) => c._id) || [], datasets: [{ data: fin.byCategory?.map((c) => c.total) || [], backgroundColor: COLORS }] }} options={{ plugins: { legend: { position: "bottom", labels: { color: "var(--text)", boxWidth: 10 } } } }} />
        </div>
      </div>
    </>
  );
}
