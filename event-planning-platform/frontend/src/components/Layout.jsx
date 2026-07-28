import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const WHATSAPP_NUMBERS = [
  { label: "+234 817 161 7653", link: "https://wa.me/2348171617653" },
  { label: "+234 707 996 2577", link: "https://wa.me/2347079962577" },
];

export function DevCredit() {
  return <p className="dev-credit">developed by Ajommuo - 08087777476</p>;
}

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
          <img src="/logo.svg" alt="Black Sand Events logo" className="brand-logo" />
          <span>Black Sand <em>Events</em></span>
        </NavLink>
        <nav className="topnav">
          <NavLink to="/discover">Discover</NavLink>
          <NavLink to="/gallery">Our Work</NavLink>
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

      <a
        className="whatsapp-fab"
        href={WHATSAPP_NUMBERS[0].link}
        target="_blank"
        rel="noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Chat with Black Sand Events on WhatsApp"
      >
        {/* WhatsApp glyph */}
        <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.5c1.2.5 2.5.7 3.8.7 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.2 0-2.4-.2-3.5-.7l-.6-.3-4.9.9 1-4.7-.4-.6c-1-1.6-1.5-3.5-1.5-5.4 0-5.5 4.5-9.9 9.9-9.9s9.9 4.5 9.9 9.9-4.4 10.8-9.9 10.8zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.5-.3z"/>
        </svg>
      </a>

      <footer className="footer">
        <img src="/logo.svg" alt="" className="footer-logo" />
        <p><strong>Black Sand Events &amp; Creations</strong> — discover events, book vendors, plan surprises, and share the memories.</p>
        <p className="footer-contacts">
          WhatsApp:{" "}
          {WHATSAPP_NUMBERS.map((n, i) => (
            <span key={n.link}>
              {i > 0 && " · "}
              <a href={n.link} target="_blank" rel="noreferrer">{n.label}</a>
            </span>
          ))}
        </p>
        <DevCredit />
      </footer>
    </div>
  );
}
