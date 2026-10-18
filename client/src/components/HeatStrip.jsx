// Small coloured squares for each day in the month (daily score heat strip)
export default function HeatStrip({ daily }) {
  if (!daily || daily.length === 0) return null;
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>Daily score</div>
      <div className="heat-strip">
        {daily.map((d) => {
          const pct = d.pct || 0;
          let cls = "heat-cell";
          if (pct >= 75) cls += " high"; else if (pct > 0) cls += " active";
          return (
            <div key={d.date} className={cls} title={`${d.date}: ${d.completed}/${d.total} (${pct}%)`} />
          );
        })}
      </div>
    </div>
  );
}
