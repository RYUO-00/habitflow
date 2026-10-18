// Analysis panel with per-habit stats (DONE, NOW, BEST) and progress bars
export default function AnalysisPanel({ habits, stats }) {
  if (!habits || habits.length === 0) return <div className="card"><p className="mu">No habits yet. Add your first habit above.</p></div>;

  const doneMap = stats?.counts || {};
  const bestStreakMap = {}; // simplified: use counts as proxy for best streak
  return (
    <div className="card">
      <h3 style={{ margin: "0 0 12px 0", fontSize: 16, letterSpacing: -0.02 }}>Analysis</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>
            <th style={{ textAlign: "left", padding: "6px 4px" }}>Habit</th>
            <th style={{ textAlign: "center" }}>DONE</th>
            <th style={{ textAlign: "center" }}>NOW</th>
            <th style={{ textAlign: "center" }}>BEST</th>
            <th style={{ textAlign: "right", paddingRight: 8 }}>PROGRESS</th>
            <th style={{ textAlign: "right" }}>%</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => {
            const count = doneMap[h._id] || 0;
            // Simplified best streak for display: use count / 5 as rough best streak estimate for demo; in production query server
            const best = Math.max(1, Math.round(count / 5)) || 0;
            const progressPct = Math.min(100, Math.round((count / 31) * 100)); // 31 days in month
            return (
              <tr key={h._id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "6px 4px", textAlign: "left", fontWeight: 600 }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: h.color || "var(--violet)", marginRight: 8 }} />
                  {h.name}
                </td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>{count}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{stats?.streak || 0}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{best}</td>
                <td style={{ paddingRight: 8 }}>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: h.color || "var(--violet)", borderRadius: 99 }} />
                  </div>
                </td>
                <td style={{ textAlign: "right", fontWeight: 700, fontSize: 13 }}>{progressPct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
