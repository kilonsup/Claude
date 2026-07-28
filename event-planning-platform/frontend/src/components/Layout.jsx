import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to={user ? "/" : "/discover"} className="brand">
          <span className="brand-mark">✦</span> Festiva
        </NavLink>
        <nav className="topnav">
          <NavLink to="/discover">Discover</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          {user && <NavLink to="/" end>Dashboard</NavLink>}
          {user && (user.role === "PLANNER" || user.role === "ADMIN") && (
            <NavLink to="/events">My Events</NavLink>
          )}
          {user && user.role === "VENDOR" && <NavLink to="/vendor-hub">Vendor Hub</NavLink>}
          {user && <NavLink to="/messages">Messages</NavLink>}
        </nav>
        <div className="topbar-right">
          {user ? (
            <>
              <span className="user-chip">
                {user.first_name || user.username}
                <em>{user.role}</em>
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">Sign in</NavLink>
          )}
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        Festiva — discover events, book vendors, plan surprises, and share the memories.
      </footer>
    </div>
  );
}
