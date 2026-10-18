// Landing + login page. Renders Google's official sign-in button.
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
    <div className="hero">
      <h1>Build better habits.<br />Master your money.</h1>
      <p>Track daily habits, log income and expenses, and see your progress in charts. Your data syncs across all your devices.</p>
      <div ref={btn} style={{ display: "inline-block" }}></div>
    </div>
  );
}
