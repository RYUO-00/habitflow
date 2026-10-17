// Root component: checks if the user is logged in, then shows the login page or the app.
import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Habits from "./pages/Habits.jsx";
import Finance from "./pages/Finance.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api("/auth/me").then(setUser).catch(() => {}).finally(() => setLoading(false)); }, []);
  const logout = async () => { await api("/auth/logout", "POST"); setUser(null); };

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
