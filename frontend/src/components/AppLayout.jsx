import { NavLink, Outlet } from "react-router-dom";

import { adminNavigation, userNavigation } from "../app-data";
import { useAuth } from "../auth/AuthContext";

function AppLayout({ role }) {
  const { session, logout } = useAuth();
  const navigation = role === "admin" ? adminNavigation : userNavigation;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-seal">SS</div>
          <div>
            <p className="eyebrow">SmartSpace</p>
            <h1>{role === "admin" ? "Admin Control Layer" : "Client Intelligence Layer"}</h1>
          </div>
        </div>

        <div className="status-panel">
          <p className="eyebrow">Signed In</p>
          <div className="status-pill-row">
            <span className="status-pill">{role === "admin" ? "Admin" : "User"}</span>
            <span className="status-pill muted">{session?.name}</span>
          </div>
          <p className="status-copy">
            {role === "admin"
              ? "Admin views include operational charts, queue posture, and protected monitoring surfaces."
              : "User views focus on buyer requirements, shortlist movement, and personal property workflow insights."}
          </p>
          <button className="secondary-button full-width" type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <nav className="workspace-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app" || item.to === "/admin"}
              className={({ isActive }) =>
                `workspace-tab route-tab ${isActive ? "active" : ""}`
              }
            >
              <span className="workspace-tab-id">{item.eyebrow}</span>
              <span className="workspace-tab-body">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace Access</p>
            <h2>{role === "admin" ? "Administrative Board" : "User Workspace"}</h2>
          </div>
          <div className="topbar-meta">
            <span className="topbar-badge">{session?.email}</span>
            <span className="topbar-badge subtle">
              {role === "admin" ? "Protected Operations View" : "Client View"}
            </span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
