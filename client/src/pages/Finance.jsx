// Finance tracker restyled in dark neon theme.
import { useEffect, useState } from "react";
import { api, ymd } from "../api.js";

const CATS = ["Food", "Travel", "Study", "Bills", "Fun", "Salary", "Other"];
const inr = (n) => "₹" + n.toLocaleString("en-IN");

export default function Finance() {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ type: "expense", amount: "", category: "Food", note: "", date: ymd(new Date()) });
  useEffect(() => { api("/transactions").then(setList); }, []);

  const add = async () => {
    if (!(+f.amount > 0)) return;
    const t = await api("/transactions", "POST", { ...f, amount: +f.amount });
    setList([t, ...list]); setF({ ...f, amount: "", note: "" });
  };
  const remove = async (id) => { await api("/transactions/" + id, "DELETE"); setList(list.filter((t) => t._id !== id)); };
  const sum = (type) => list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <h2>Finance tracker</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div className="card">
          <span className="mu" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Income</span>
          <div className="big in">{inr(sum("income"))}</div>
        </div>
        <div className="card">
          <span className="mu" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Expenses</span>
          <div className="big ex">{inr(sum("expense"))}</div>
        </div>
        <div className="card">
          <span className="mu" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>Balance</span>
          <div className="big" style={{ color: sum("income") - sum("expense") >= 0 ? "var(--teal)" : "var(--pink)" }}>{inr(sum("income") - sum("expense"))}</div>
        </div>
      </div>
      <div className="card row">
        <select value={f.type} onChange={set("type")}><option value="expense">Expense</option><option value="income">Income</option></select>
        <input type="number" placeholder="Amount ₹" value={f.amount} onChange={set("amount")} />
        <select value={f.category} onChange={set("category")}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <input placeholder="Note" value={f.note} onChange={set("note")} />
        <input type="date" value={f.date} onChange={set("date")} />
        <button className="primary" onClick={add}>Add</button>
      </div>
      <div className="card">
        {list.length === 0 && <p className="mu">No transactions yet.</p>}
        {list.map((t) => (
          <div className="tx" key={t._id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: 10, borderBottom: "1px solid var(--border)" }}>
            <div>
              <b>{t.category}</b> <span className="mu">{t.note} · {t.date}</span>
            </div>
            <div>
              <span className={t.type === "income" ? "in" : "ex"}>{t.type === "income" ? "+" : "−"}{inr(t.amount)}</span>
              <button className="x" onClick={() => remove(t._id)} aria-label="Delete">×</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
