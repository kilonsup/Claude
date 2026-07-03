import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", roles: ["ADMIN", "DOCTOR", "NURSE", "PATIENT"] },
  { to: "/patients", label: "Patients", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { to: "/appointments", label: "Appointments", roles: ["ADMIN", "DOCTOR", "NURSE", "PATIENT"] },
  { to: "/staff", label: "Medical Staff", roles: ["ADMIN"] },
  { to: "/shifts", label: "Shift Schedule", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { to: "/reports", label: "Reports", roles: ["ADMIN", "DOCTOR", "NURSE"] },
];

export default function Layout() {
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span className="brand-name">MediCore HMS</span>
        </div>
        <nav>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{(user.first_name || user.username)[0].toUpperCase()}</div>
            <div>
              <div className="user-name">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
