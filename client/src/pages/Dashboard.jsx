// Analytics page: 4 charts built from the backend's aggregation endpoints.
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import { api, ymd } from "../api.js";

const COLORS = ["#e8590c", "#2f9e44", "#1c7ed6", "#ae3ec9", "#f59f00", "#e03131", "#868e96"];

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [hs, setHs] = useState({ perDay: [], perHabit: [] });
  const [fin, setFin] = useState({ byMonth: [], byCategory: [] });
  useEffect(() => {
    api("/habits").then(setHabits);
    api("/analytics/habits").then(setHs);
    api("/analytics/finance").then(setFin);
  }, []);

  // last 7 days completions
  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return ymd(d); });
  const dayCount = (d) => (hs.perDay.find((x) => x._id === d) || { count: 0 }).count;
  // last 30 days trend
  const last30 = [...Array(30)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return ymd(d); });
  // finance by month
  const months = [...new Set(fin.byMonth.map((x) => x._id.month))];
  const monthTotal = (m, type) => (fin.byMonth.find((x) => x._id.month === m && x._id.type === type) || { total: 0 }).total;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid2">
        <div className="card"><b>Habits completed — last 7 days</b>
          <Bar data={{ labels: last7.map((d) => d.slice(5)), datasets: [{ label: "Completions", data: last7.map(dayCount), backgroundColor: "#e8590c" }] }} /></div>
        <div className="card"><b>30-day trend</b>
          <Line data={{ labels: last30.map((d) => d.slice(5)), datasets: [{ label: "Completions", data: last30.map(dayCount), borderColor: "#2f9e44", tension: 0.3 }] }} /></div>
        <div className="card"><b>By habit (30 days)</b>
          <Doughnut data={{ labels: habits.map((h) => h.name), datasets: [{ data: habits.map((h) => (hs.perHabit.find((x) => x._id === h._id) || { count: 0 }).count), backgroundColor: COLORS }] }} /></div>
        <div className="card"><b>Income vs expense</b>
          <Bar data={{ labels: months, datasets: [{ label: "Income", data: months.map((m) => monthTotal(m, "income")), backgroundColor: "#2f9e44" }, { label: "Expense", data: months.map((m) => monthTotal(m, "expense")), backgroundColor: "#e03131" }] }} /></div>
        <div className="card"><b>Spending by category</b>
          <Doughnut data={{ labels: fin.byCategory.map((c) => c._id), datasets: [{ data: fin.byCategory.map((c) => c.total), backgroundColor: COLORS }] }} /></div>
      </div>
    </>
  );
}
