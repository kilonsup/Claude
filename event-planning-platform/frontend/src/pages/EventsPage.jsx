import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

const CATEGORIES = [
  "WEDDING", "BIRTHDAY", "CORPORATE", "ANNIVERSARY",
  "BABY_SHOWER", "GRADUATION", "CONCERT", "SURPRISE", "OTHER",
];

const EMPTY = {
  title: "", category: "BIRTHDAY", event_date: "", venue_name: "", city: "",
  description: "", budget: "", is_public: false, is_surprise: false,
  honoree_name: "", surprise_brief: "",
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  function load() {
    api.get("/events/").then(({ data }) => setEvents(data.results));
  }
  useEffect(load, []);

  function set(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm({ ...form, [field]: value });
    };
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, budget: form.budget || 0 };
      const { data } = await api.post("/events/", payload);
      await api.post("/tasks/seed-defaults/", { event: data.id });
      setShowForm(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "object" && data
          ? Object.entries(data).map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`).join(" · ")
          : "Could not create event."
      );
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">My events</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ New event"}
        </button>
      </div>

      {showForm && (
        <form className="panel form-grid" onSubmit={handleCreate}>
          <label className="span-2">Title<input value={form.title} onChange={set("title")} required /></label>
          <label>Category
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label>Date & time<input type="datetime-local" value={form.event_date} onChange={set("event_date")} required /></label>
          <label>Venue<input value={form.venue_name} onChange={set("venue_name")} /></label>
          <label>City<input value={form.city} onChange={set("city")} /></label>
          <label>Budget (₦)<input type="number" min="0" value={form.budget} onChange={set("budget")} /></label>
          <label className="span-2">Description<textarea rows={2} value={form.description} onChange={set("description")} /></label>
          <label className="check"><input type="checkbox" checked={form.is_public} onChange={set("is_public")} /> List publicly on Discover</label>
          <label className="check"><input type="checkbox" checked={form.is_surprise} onChange={set("is_surprise")} /> 🤫 Surprise mode</label>
          {form.is_surprise && (
            <>
              <label className="span-2">Who's it for?<input value={form.honoree_name} onChange={set("honoree_name")} placeholder="The honoree — they won't see the plan" /></label>
              <label className="span-2">The secret plan<textarea rows={2} value={form.surprise_brief} onChange={set("surprise_brief")} placeholder="Only insider guests will see this brief" /></label>
            </>
          )}
          {error && <p className="form-error span-2">{error}</p>}
          <div className="span-2">
            <button className="btn btn-primary">Create event + starter checklist</button>
          </div>
        </form>
      )}

      {events.length === 0 && !showForm ? (
        <div className="empty-state">
          <h2>Nothing planned yet</h2>
          <p className="muted">Create your first event and Black Sand Events will set up a starter checklist for you.</p>
        </div>
      ) : (
        <div className="card-grid">
          {events.map((ev) => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="event-card event-card-link">
              <div className="event-card-body">
                <div className="row-between">
                  <h3>{ev.is_surprise ? "🤫 " : ""}{ev.title}</h3>
                  <StatusBadge value={ev.status} />
                </div>
                <div className="event-meta">
                  <span>📅 {new Date(ev.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  <span>📍 {[ev.venue_name, ev.city].filter(Boolean).join(", ") || "TBA"}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${ev.progress.percent}%` }} />
                </div>
                <p className="muted small">
                  {ev.progress.done}/{ev.progress.total} tasks · {ev.guest_stats.accepted}/{ev.guest_stats.invited} guests confirmed
                  {ev.days_until >= 0 ? ` · ${ev.days_until} days left` : " · past"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
