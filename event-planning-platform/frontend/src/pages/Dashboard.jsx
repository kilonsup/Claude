import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function Stat({ label, value, to }) {
  const body = (
    <div className="stat">
      <span className="stat-value">{value ?? "—"}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
  return to ? <Link to={to} className="stat-link">{body}</Link> : body;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/reports/dashboard/").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="muted">Loading dashboard…</p>;

  if (stats.role === "VENDOR") {
    return (
      <div>
        <h1 className="page-title">Welcome back{user.first_name ? `, ${user.first_name}` : ""}</h1>
        {!stats.has_profile && (
          <div className="callout">
            You haven't published a vendor profile yet.{" "}
            <Link to="/vendor-hub">Create one now</Link> so planners can find and book you.
          </div>
        )}
        <div className="stat-grid">
          <Stat label="New requests" value={stats.bookings_requested} to="/vendor-hub" />
          <Stat label="Confirmed bookings" value={stats.bookings_confirmed} to="/vendor-hub" />
          <Stat label="Completed jobs" value={stats.bookings_completed} />
          <Stat label="Confirmed revenue" value={`₦${Number(stats.revenue_confirmed).toLocaleString()}`} />
          <Stat label="Rating" value={stats.average_rating ? `${stats.average_rating.toFixed(1)} ★ (${stats.review_count})` : "No reviews"} />
          <Stat label="Unread messages" value={stats.unread_messages} to="/messages" />
        </div>
      </div>
    );
  }

  if (stats.role === "ADMIN") {
    return (
      <div>
        <h1 className="page-title">Platform overview</h1>
        <div className="stat-grid">
          <Stat label="Users" value={stats.total_users} />
          <Stat label="Planners" value={stats.planners} />
          <Stat label="Vendors" value={stats.vendors} />
          <Stat label="Events" value={stats.total_events} />
          <Stat label="Public events" value={stats.public_events} />
          <Stat label="Surprise events" value={stats.surprise_events} />
          <Stat label="Bookings" value={stats.total_bookings} />
          <Stat label="Payments processed" value={`₦${Number(stats.total_payments).toLocaleString()}`} />
          <Stat label="Memories shared" value={stats.memories_shared} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Welcome back{user.first_name ? `, ${user.first_name}` : ""}</h1>

      {stats.next_event && (
        <Link to={`/events/${stats.next_event.id}`} className="next-event">
          <div>
            <span className="next-event-label">Next up</span>
            <h2>{stats.next_event.title}</h2>
            <p className="muted">
              {new Date(stats.next_event.event_date).toLocaleDateString(undefined, { dateStyle: "full" })}
              {stats.next_event.city ? ` · ${stats.next_event.city}` : ""}
            </p>
          </div>
          <div className="countdown">
            <span className="countdown-num">{stats.next_event.days_until}</span>
            <span>days to go</span>
          </div>
        </Link>
      )}

      <div className="stat-grid">
        <Stat label="Events" value={stats.total_events} to="/events" />
        <Stat label="Upcoming" value={stats.upcoming_events} to="/events" />
        <Stat label="Guests invited" value={stats.guests_invited} />
        <Stat label="RSVPs accepted" value={stats.guests_accepted} />
        <Stat label="Checklist done" value={`${stats.tasks_percent}%`} />
        <Stat label="Bookings confirmed" value={stats.bookings_confirmed} />
        <Stat label="Pending requests" value={stats.bookings_requested} />
        <Stat label="Total paid" value={`₦${Number(stats.total_paid).toLocaleString()}`} />
        <Stat label="Gifts received" value={stats.gifts_received} />
        <Stat label="Unread messages" value={stats.unread_messages} to="/messages" />
      </div>

      <div className="quick-actions">
        <Link to="/events" className="btn btn-primary">+ Plan a new event</Link>
        <Link to="/vendors" className="btn btn-ghost">Browse vendors</Link>
        <Link to="/discover" className="btn btn-ghost">Discover events</Link>
      </div>
    </div>
  );
}
