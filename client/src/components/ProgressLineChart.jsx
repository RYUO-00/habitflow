// Progress line chart using react-chartjs-2 (already installed)
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function ProgressLineChart({ daily }) {
  if (!daily || daily.length === 0) return <div className="card"><p className="mu">No data yet.</p></div>;

  const labels = daily.map((d) => d.date.slice(5));
  const data = daily.map((d) => d.pct || 0);

  return (
    <div className="card">
      <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Progress</h3>
      <div style={{ height: 220 }}>
        <Line
          data={{
            labels,
            datasets: [{
              label: "Completion %",
              data,
              borderColor: "var(--cyan)",
              backgroundColor: "rgba(0,229,229,0.15)",
              tension: 0.35,
              pointBackgroundColor: "var(--violet)",
              pointBorderColor: "var(--cyan)",
              pointRadius: 4,
              fill: true,
            }],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, max: 100, grid: { color: "var(--border)" }, ticks: { color: "var(--muted)" } },
              x: { grid: { display: false }, ticks: { color: "var(--muted)" } },
            },
          }}
        />
      </div>
    </div>
  );
}
