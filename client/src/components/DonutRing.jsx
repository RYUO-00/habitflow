// SVG donut ring for progress
export default function DonutRing({ percent, size = 90, stroke = 6, color = "var(--cyan)" }) {
  const r = (size - stroke) / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut" aria-label={`${percent}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
    </svg>
  );
}
