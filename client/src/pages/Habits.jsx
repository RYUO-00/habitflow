// Monthly habit grid: add habits, tick days.
import { useEffect, useState } from "react";
import { api, ymd } from "../api.js";

export default function Habits() {
  const [month, setMonth] = useState(ymd(new Date()).slice(0, 7)); // "YYYY-MM"
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [name, setName] = useState("");

  const loadLogs = async () => setLogs(await api("/logs?month=" + month));
  useEffect(() => { api("/habits").then(setHabits); }, []);
  useEffect(() => { loadLogs(); }, [month]);

  const [y, m] = month.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  const days = [...Array(count)].map((_, i) => month + "-" + String(i + 1).padStart(2, "0"));
  const isDone = (h, d) => logs.some((l) => l.habitId === h && l.date === d);
  const today = ymd(new Date());

  const add = async () => {
    if (!name.trim()) return;
    const h = await api("/habits", "POST", { name });
    setHabits([...habits, h]); setName("");
  };
  const remove = async (id) => {
    if (!confirm("Delete this habit and its history?")) return;
    await api("/habits/" + id, "DELETE"); setHabits(habits.filter((h) => h._id !== id));
  };
  const toggle = async (id, d) => { await api(`/habits/${id}/toggle`, "POST", { date: d }); loadLogs(); };
  const shift = (n) => setMonth(ymd(new Date(y, m - 1 + n, 1)).slice(0, 7));

  return (
    <>
      <h2>Daily tracking</h2>
      <div className="row">
        <button onClick={() => shift(-1)}>←</button><b>{month}</b><button onClick={() => shift(1)}>→</button>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit, e.g. Read 20 pages" />
        <button className="primary" onClick={add}>Add habit</button>
      </div>
      <div className="card scroll">
        {habits.length === 0 ? <p className="mu">No habits yet. Add your first one above.</p> : (
          <table>
            <thead><tr><th className="name">Habit</th>{days.map((d) => <th key={d}>{+d.slice(8)}</th>)}<th>Done</th></tr></thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h._id}>
                  <td className="name">{h.name} <button className="x" onClick={() => remove(h._id)}>×</button></td>
                  {days.map((d) => (
                    <td key={d}><button className={"cb" + (isDone(h._id, d) ? " on" : "") + (d > today ? " fut" : "")} onClick={() => toggle(h._id, d)}>{isDone(h._id, d) ? "✓" : ""}</button></td>
                  ))}
                  <td><b>{logs.filter((l) => l.habitId === h._id).length}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
