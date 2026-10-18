// Animated XP bar (linear gradient)
export default function XPBar({ xp, level }) {
  const levelSize = 500;
  const pct = Math.min(100, Math.round(((xp % levelSize) / levelSize) * 100));
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Level {level}</div>
      <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--violet), var(--cyan), var(--lime))", borderRadius: 99, transition: "width .4s ease" }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{xp} / {level * levelSize} XP</div>
    </div>
  );
}
