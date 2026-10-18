// Animated level-up banner with confetti particles (pure CSS)
import { useEffect, useState } from "react";

export default function LevelUpBanner({ level }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [level]);

  if (!visible) return null;

  // Spawn confetti dots
  const dots = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="banner-level">
      <h2 style={{ margin: "0 0 4px", fontSize: 28 }}>Level Up!</h2>
      <p style={{ margin: 0, fontSize: 18 }}>You reached <b>Level {level}</b> — keep the momentum going!</p>
      {dots.map((i) => (
        <span key={i} className="confetti" style={{
          left: `${Math.random() * 100}vw`,
          background: ["var(--violet)", "var(--cyan)", "var(--lime)", "var(--yellow)", "var(--pink)"][i % 5],
          animationDelay: `${Math.random() * .5}s`,
        }} />
      ))}
    </div>
  );
}
