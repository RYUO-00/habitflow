// Root component: shows legal pages to everyone, then login or the app.
import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Habits from "./pages/Habits.jsx";
import Finance from "./pages/Finance.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { Privacy, Terms } from "./pages/Legal.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  useEffect(() => { api("/auth/me").then(setUser).catch(() => {}).finally(() => setLoading(false)); }, []);
  const logout = async () => { await api("/auth/logout", "POST"); setUser(null); };

  // These two pages must be visible without logging in.
  if (pathname === "/privacy") return <Privacy />;
  if (pathname === "/terms") return <Terms />;

  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Login onLogin={setUser} />;
  return (
    <>
      <nav>
        <b className="logo">🔥 HabitFlow</b>
        <NavLink to="/habits">Habits</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/finance">Finance</NavLink>
        <span className="user">{user.avatar && <img src={user.avatar} alt="" referrerPolicy="no-referrer" />}<button onClick={logout}>Logout</button></span>
      </nav>
      <main>
        <Routes>
          <Route path="/habits" element={<Habits />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="*" element={<Navigate to="/habits" />} />
        </Routes>
      </main>
    </>
  );
}