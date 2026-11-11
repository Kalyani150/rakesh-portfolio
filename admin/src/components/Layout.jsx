import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

const NAV = [
  { to: "/projects", label: "Projects" },
  { to: "/home", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-brand">
          <span className="brand">Rakesh<b>.</b>P</span>
          <span className="admin-tag">Admin</span>
        </div>
        <nav aria-label="Sections" className="side-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-main">
        <header className="topbar">
          <span className="who" title={user?.email}>{user?.email}</span>
          <div className="topbar-actions">
            <a className="ghost-btn" href={SITE_URL} target="_blank" rel="noreferrer">View site ↗</a>
            <button className="ghost-btn" onClick={logout}>Sign out</button>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}