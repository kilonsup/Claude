import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

const TABS = ["Overview", "Guests", "Checklist", "Budget", "Gifts", "Bookings", "Memories"];

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState("Overview");

  const reload = useCallback(() => {
    api.get(`/events/${id}/`).then(({ data }) => setEvent(data));
  }, [id]);
  useEffect(reload, [reload]);

  if (!event) return <p className="muted">Loading event…</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{event.is_surprise ? "🤫 " : ""}{event.title}</h1>
          <p className="muted">
            {new Date(event.event_date).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
            {event.venue_name ? ` · ${event.venue_name}` : ""}{event.city ? `, ${event.city}` : ""}
          </p>
        </div>
        <StatusBadge value={event.status} />
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab event={event} reload={reload} />}
      {tab === "Guests" && <GuestsTab event={event} reload={reload} />}
      {tab === "Checklist" && <ChecklistTab event={event} reload={reload} />}
      {tab === "Budget" && <BudgetTab event={event} />}
      {tab === "Gifts" && <GiftsTab event={event} />}
      {tab === "Bookings" && <BookingsTab event={event} />}
      {tab === "Memories" && <MemoriesTab event={event} />}
    </div>
  );
}

function OverviewTab({ event, reload }) {
  const [saving, setSaving] = useState(false);

  async function setStatus(status) {
    setSaving(true);
    await api.patch(`/events/${event.id}/`, { status });
    setSaving(false);
    reload();
  }

  return (
    <div className="panel">
      <div className="stat-grid">
        <div className="stat"><span className="stat-value">{event.days_until >= 0 ? event.days_until : "—"}</span><span className="stat-label">days to go</span></div>
        <div className="stat"><span className="stat-value">{event.progress.percent}%</span><span className="stat-label">checklist done</span></div>
        <div className="stat"><span className="stat-value">{event.guest_stats.accepted}/{event.guest_stats.invited}</span><span className="stat-label">guests confirmed</span></div>
        <div className="stat"><span className="stat-value">₦{Number(event.budget).toLocaleString()}</span><span className="stat-label">budget</span></div>
      </div>

      {event.description && <p>{event.description}</p>}

      {event.is_surprise && (
        <div className="callout callout-surprise">
          <strong>Surprise mode is on.</strong> Honoree: {event.honoree_name || "—"}.
          {event.surprise_brief && <p className="muted">{event.surprise_brief}</p>}
          <p className="small muted">Guests marked as insiders see the secret brief on their invite. The honoree never does.</p>
        </div>
      )}

      <div className="quick-actions">
        {event.status === "PLANNING" && <button className="btn btn-primary" disabled={saving} onClick={() => setStatus("CONFIRMED")}>Mark confirmed</button>}
        {event.status !== "COMPLETED" && event.status !== "CANCELLED" && (
          <button className="btn btn-ghost" disabled={saving} onClick={() => setStatus("COMPLETED")}>Mark completed</button>
        )}
        {event.status !== "CANCELLED" && event.status !== "COMPLETED" && (
          <button className="btn btn-danger-ghost" disabled={saving} onClick={() => setStatus("CANCELLED")}>Cancel event</button>
        )}
      </div>
    </div>
  );
}

function GuestsTab({ event }) {
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({ full_name: "", email: "", plus_ones: 0, is_surprise_insider: true });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get(`/guests/?event=${event.id}`).then(({ data }) => setGuests(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function addGuest(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/guests/", { ...form, event: event.id });
      setForm({ full_name: "", email: "", plus_ones: 0, is_surprise_insider: true });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Failed to add guest.");
    }
  }

  function copyInvite(g) {
    const url = `${window.location.origin}/rsvp/${g.invite_token}`;
    navigator.clipboard?.writeText(url);
  }

  return (
    <div>
      <form className="panel form-row" onSubmit={addGuest}>
        <input placeholder="Guest name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="number" min="0" style={{ width: 90 }} title="Plus ones" value={form.plus_ones} onChange={(e) => setForm({ ...form, plus_ones: e.target.value })} />
        {event.is_surprise && (
          <label className="check">
            <input type="checkbox" checked={form.is_surprise_insider} onChange={(e) => setForm({ ...form, is_surprise_insider: e.target.checked })} />
            In on the secret
          </label>
        )}
        <button className="btn btn-primary">Invite</button>
        {error && <p className="form-error">{error}</p>}
      </form>

      <table className="table">
        <thead>
          <tr><th>Guest</th><th>RSVP</th><th>+1s</th><th>Dietary</th>{event.is_surprise && <th>Insider</th>}<th>Invite link</th></tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td>{g.full_name}<div className="small muted">{g.email}</div></td>
              <td><StatusBadge value={g.rsvp_status} /></td>
              <td>{g.plus_ones}</td>
              <td>{g.dietary_notes || "—"}</td>
              {event.is_surprise && <td>{g.is_surprise_insider ? "🤫 yes" : "no (honoree?)"}</td>}
              <td><button className="btn btn-ghost btn-sm" onClick={() => copyInvite(g)}>Copy link</button></td>
            </tr>
          ))}
          {guests.length === 0 && <tr><td colSpan={6} className="muted">No guests invited yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ChecklistTab({ event, reload }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const load = useCallback(() => {
    api.get(`/tasks/?event=${event.id}`).then(({ data }) => setTasks(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/tasks/", { event: event.id, title });
    setTitle("");
    load(); reload();
  }

  async function toggle(task) {
    await api.patch(`/tasks/${task.id}/`, { status: task.status === "DONE" ? "TODO" : "DONE" });
    load(); reload();
  }

  async function remove(task) {
    await api.delete(`/tasks/${task.id}/`);
    load(); reload();
  }

  async function seed() {
    await api.post("/tasks/seed-defaults/", { event: event.id });
    load(); reload();
  }

  const done = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div>
      <div className="panel">
        <div className="row-between">
          <strong>{done}/{tasks.length} complete</strong>
          {tasks.length === 0 && <button className="btn btn-ghost" onClick={seed}>Generate starter checklist</button>}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : 0 }} />
        </div>
      </div>

      <form className="form-row" onSubmit={addTask}>
        <input placeholder="Add a task…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn btn-primary">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map((t) => (
          <li key={t.id} className={t.status === "DONE" ? "done" : ""}>
            <label className="check">
              <input type="checkbox" checked={t.status === "DONE"} onChange={() => toggle(t)} />
              {t.title}
            </label>
            <button className="btn-x" title="Delete" onClick={() => remove(t)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BudgetTab({ event }) {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", status: "PENDING", method: "TRANSFER" });

  const load = useCallback(() => {
    api.get(`/events/${event.id}/budget/`).then(({ data }) => setSummary(data));
    api.get(`/payments/?event=${event.id}`).then(({ data }) => setPayments(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function addPayment(e) {
    e.preventDefault();
    await api.post("/payments/", { ...form, event: event.id });
    setForm({ description: "", amount: "", status: "PENDING", method: "TRANSFER" });
    load();
  }

  async function markPaid(p) {
    await api.patch(`/payments/${p.id}/`, { status: "PAID", paid_on: new Date().toISOString().slice(0, 10) });
    load();
  }

  const fmt = (v) => `₦${Number(v).toLocaleString()}`;

  return (
    <div>
      {summary && (
        <div className="stat-grid">
          <div className="stat"><span className="stat-value">{fmt(summary.budget)}</span><span className="stat-label">budget</span></div>
          <div className="stat"><span className="stat-value">{fmt(summary.paid)}</span><span className="stat-label">paid</span></div>
          <div className="stat"><span className="stat-value">{fmt(summary.pending)}</span><span className="stat-label">pending</span></div>
          <div className="stat"><span className="stat-value">{fmt(summary.committed_bookings)}</span><span className="stat-label">booked with vendors</span></div>
          <div className="stat"><span className="stat-value">{fmt(summary.gifts_received)}</span><span className="stat-label">cash gifts in</span></div>
          <div className="stat"><span className={`stat-value ${Number(summary.remaining) < 0 ? "text-danger" : ""}`}>{fmt(summary.remaining)}</span><span className="stat-label">remaining</span></div>
        </div>
      )}

      <form className="panel form-row" onSubmit={addPayment}>
        <input placeholder="What's this payment for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
          <option value="TRANSFER">Transfer</option><option value="CARD">Card</option>
          <option value="CASH">Cash</option><option value="OTHER">Other</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="PENDING">Pending</option><option value="PAID">Paid</option>
        </select>
        <button className="btn btn-primary">Record</button>
      </form>

      <table className="table">
        <thead><tr><th>Description</th><th>Vendor</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.description}</td>
              <td>{p.booking_label || "—"}</td>
              <td>{fmt(p.amount)}</td>
              <td>{p.method}</td>
              <td><StatusBadge value={p.status} /></td>
              <td>{p.status === "PENDING" && <button className="btn btn-ghost btn-sm" onClick={() => markPaid(p)}>Mark paid</button>}</td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={6} className="muted">No payments recorded.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function GiftsTab({ event }) {
  const [items, setItems] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", product_url: "" });

  const load = useCallback(() => {
    api.get(`/registry/?event=${event.id}`).then(({ data }) => setItems(data.results));
    api.get(`/gifts/?event=${event.id}`).then(({ data }) => setGifts(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function addItem(e) {
    e.preventDefault();
    await api.post("/registry/", { ...form, event: event.id, price: form.price || 0 });
    setForm({ name: "", price: "", product_url: "" });
    load();
  }

  return (
    <div className="grid-2col">
      <div>
        <h3>Gift registry</h3>
        <p className="muted small">Guests see this on their invite link and can claim items.</p>
        <form className="form-row" onSubmit={addItem}>
          <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <button className="btn btn-primary">Add</button>
        </form>
        <ul className="task-list">
          {items.map((it) => (
            <li key={it.id} className={it.is_claimed ? "done" : ""}>
              <span>
                {it.name} — ₦{Number(it.price).toLocaleString()}
                {it.is_claimed && <em className="small muted"> · claimed by {it.claimed_by_name}</em>}
              </span>
            </li>
          ))}
          {items.length === 0 && <li className="muted">No registry items yet.</li>}
        </ul>
      </div>
      <div>
        <h3>Gifts received</h3>
        <ul className="gift-feed">
          {gifts.map((g) => (
            <li key={g.id}>
              <strong>{g.sender_name}</strong>
              {g.registry_item_name ? ` claimed ${g.registry_item_name}` : Number(g.amount) > 0 ? ` sent ₦${Number(g.amount).toLocaleString()}` : " sent a gift"}
              {g.message && <p className="muted">"{g.message}"</p>}
            </li>
          ))}
          {gifts.length === 0 && <li className="muted">No gifts yet — share invite links!</li>}
        </ul>
      </div>
    </div>
  );
}

function BookingsTab({ event }) {
  const [bookings, setBookings] = useState([]);

  const load = useCallback(() => {
    api.get(`/vendors/bookings/?event=${event.id}`).then(({ data }) => setBookings(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function cancel(b) {
    await api.post(`/vendors/bookings/${b.id}/set-status/`, { status: "CANCELLED" });
    load();
  }

  return (
    <div>
      <p className="muted">
        Need more hands? <Link to="/vendors">Browse the vendor marketplace</Link> to send booking requests for this event.
      </p>
      <table className="table">
        <thead><tr><th>Vendor</th><th>Service</th><th>Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.vendor_name}<div className="small muted">{b.vendor_category}</div></td>
              <td>{b.service_description}</td>
              <td>₦{Number(b.amount).toLocaleString()}</td>
              <td><StatusBadge value={b.status} /></td>
              <td>
                {["REQUESTED", "CONFIRMED"].includes(b.status) && (
                  <button className="btn btn-ghost btn-sm" onClick={() => cancel(b)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan={5} className="muted">No vendor bookings yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function MemoriesTab({ event }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ caption: "", image_url: "" });

  const load = useCallback(() => {
    api.get(`/memories/?event=${event.id}`).then(({ data }) => setPosts(data.results));
  }, [event.id]);
  useEffect(load, [load]);

  async function post(e) {
    e.preventDefault();
    await api.post("/memories/", { ...form, event: event.id });
    setForm({ caption: "", image_url: "" });
    load();
  }

  return (
    <div>
      <form className="panel form-row" onSubmit={post}>
        <input placeholder="Photo URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <input placeholder="Share a memory…" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} required />
        <button className="btn btn-primary">Post</button>
      </form>
      <div className="memory-grid">
        {posts.map((m) => (
          <figure key={m.id} className="memory-card">
            {m.image_url && <img src={m.image_url} alt={m.caption || "Event memory"} />}
            <figcaption>
              {m.caption}
              <span className="small muted">— {m.author_name}, {new Date(m.created_at).toLocaleDateString()}</span>
            </figcaption>
          </figure>
        ))}
        {posts.length === 0 && <p className="muted">The memory wall is empty. After the event, post the best moments here.</p>}
      </div>
    </div>
  );
}
