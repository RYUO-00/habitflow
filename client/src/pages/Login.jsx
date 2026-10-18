// Landing + login page. Restyled with dark neon theme.
import { useEffect, useRef } from "react";
import { api } from "../api.js";

export default function Login({ onLogin }) {
  const btn = useRef(null);
  useEffect(() => {
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => onLogin(await api("/auth/google", "POST", { credential: response.credential })),
      });
      window.google.accounts.id.renderButton(btn.current, { theme: "outline", size: "large" });
    };
    if (window.google) init(); else window.addEventListener("load", init);
  }, []);
  return (
    <div className="hero" style={{ maxWidth: 600, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
      <h1 style={{ fontSize: "clamp(2.2rem, 7vw, 3.4rem)", lineHeight: 1.1, letterSpacing: -0.04, background: "linear-gradient(135deg, var(--violet), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        Build better habits.<br />Master your money.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 18 }}>Track daily habits, plan your week, and see your progress in glowing charts. Your data syncs across all devices.</p>
      <div ref={btn} style={{ display: "inline-block", marginTop: 24 }} />
    </div>
  );
}
