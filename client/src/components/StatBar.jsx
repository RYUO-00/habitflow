// Stat bar for the monthly tracker: level, XP, streak, perfect, completed ring
import { useState, useEffect } from "react";

export default function StatBar({ stats }) {
  const [animatedXp, setAnimatedXp] = useState(0);
  useEffect(() => {
    if (!stats) return;
    const target = stats.xp || 0;
    const duration = 800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedXp(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [stats?.xp]);

  if (!stats) return <div className="card">Loading stats...</div>;

  const levelSize = 500;
  const totalCompletions = stats?.completedTotal || 0;
  const xpInLevel = (stats?.xp || totalCompletions * 10);
  const currentLevel = Math.floor(xpInLevel / levelSize) + 1;
  const nextLevelXp = currentLevel * levelSize;
  const levelPct = Math.min(100, Math.round((xpInLevel % levelSize) / levelSize * 100));

  const completedPct = Math.round(((stats.completedTotal || 0) / Math.max(stats.totalPossible || 1, 1)) * 100);

  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: 1, minWidth: 260 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>YEAR</div>
            <b style={{ fontSize: 20 }}>{stats.year || new Date().getFullYear()}</b>
          </div>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>MONTH</div>
            <b style={{ fontSize: 20 }}>{stats.month || "—"}</b>
          </div>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>LEVEL</div>
            <b style={{ fontSize: 28, color: "var(--violet)", letterSpacing: -1 }}>{currentLevel}</b>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}><b>XP</b> <span className="mu">{animatedXp} / {nextLevelXp}</span></div>
            <div style={{ height: 10, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${levelPct}%`, background: "linear-gradient(90deg, var(--violet), var(--cyan))", borderRadius: 99, transition: "width .3s ease" }} />
            </div>
          </div>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>STREAK</div>
            <b style={{ fontSize: 24 }}>{stats.streak || 0}</b>
          </div>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>PERFECT</div>
            <b style={{ fontSize: 24 }}>{stats.perfectDays || 0}</b>
          </div>
          <div>
            <div className="mu" style={{ fontSize: 12 }}>COMPLETED</div>
            <b style={{ fontSize: 20 }}>{stats.completedTotal || 0}</b>
            <span className="mu"> of {stats.totalPossible || 0}</span>
          </div>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: "rotate(-90deg)" }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#grad)" strokeWidth="3" strokeDasharray={`${completedPct} 100`} strokeLinecap="round" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--violet)" />
                  <stop offset="100%" stopColor="var(--cyan)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", fontWeight: 800, fontSize: 14 }}>{completedPct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
