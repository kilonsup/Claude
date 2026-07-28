import { useEffect, useState } from "react";
import api from "../api/client";

const CATEGORIES = [
  ["", "All"], ["WEDDING", "Weddings"], ["BIRTHDAY", "Birthdays"],
  ["CORPORATE", "Corporate"], ["CONCERT", "Concerts"], ["SURPRISE", "Surprises"],
  ["GRADUATION", "Graduations"], ["OTHER", "Other"],
];

export default function DiscoverPage() {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    api.get(`/events/discover/?${params}`)
      .then(({ data }) => setEvents(data.results))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div>
      <section className="hero">
        <h1>Find something worth celebrating</h1>
        <p>Public events happening on Black Sand Events — concerts, weddings, galas and more.</p>
        <input
          className="hero-search"
          placeholder="Search by title, city or venue…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="chip-row">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            className={`chip ${category === value ? "chip-active" : ""}`}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading events…</p>
      ) : events.length === 0 ? (
        <p className="muted">No public events match — try another category.</p>
      ) : (
        <div className="card-grid">
          {events.map((ev) => (
            <article key={ev.id} className="event-card">
              <div className="event-card-media" style={ev.cover_image_url ? { backgroundImage: `url(${ev.cover_image_url})` } : undefined}>
                <span className="badge badge-info">{ev.category.replace(/_/g, " ")}</span>
              </div>
              <div className="event-card-body">
                <h3>{ev.title}</h3>
                <p className="muted">{ev.description || "An event by Black Sand Events."}</p>
                <div className="event-meta">
                  <span>📅 {new Date(ev.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  <span>📍 {[ev.venue_name, ev.city].filter(Boolean).join(", ") || "TBA"}</span>
                  <span>🗓 {ev.days_until} days away</span>
                </div>
                <p className="event-host">Hosted by {ev.owner_name}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
