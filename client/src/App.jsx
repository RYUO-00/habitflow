// Root component: shows legal pages to everyone, then login or the redesigned app.
import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import MonthlyTracker from "./pages/Habits.jsx";
import WeekPlanner from "./pages/WeekPlanner.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Finance from "./pages/Finance.jsx";
import { Privacy, Terms } from "./pages/Legal.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const { pathname } = useLocation();

  useEffect(() => { api("/auth/me").then(setUser).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("theme", theme); }, [theme]);

  const logout = async () => { await api("/auth/logout", "POST"); setUser(null); };

  if (pathname === "/privacy") return <Privacy />;
  if (pathname === "/terms") return <Terms />;

  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <>
      <nav>
        <b className="logo">🔥 HabitFlow</b>
        <NavLink to="/habits">Tracker</NavLink>
        <NavLink to="/week">Planner</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/finance">Finance</NavLink>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {user.avatar && <img src={user.avatar} alt="" referrerPolicy="no-referrer" />}
          <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} style={{ fontSize: 11, padding: 6 }} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={logout}>Logout</button>
        </span>
      </nav>
      <main>
        <Routes>
          <Route path="/habits" element={<MonthlyTracker />} />
          <Route path="/week" element={<WeekPlanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="*" element={<Navigate to="/habits" />} />
        </Routes>
      </main>
    </>
  );
}
