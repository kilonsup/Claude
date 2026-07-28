import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

const CATEGORIES = [
  "VENUE", "CATERING", "CAKE", "PHOTOGRAPHY", "MUSIC",
  "DECOR", "TRANSPORT", "SURPRISE", "GIFTS", "PLANNING", "OTHER",
];

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    business_name: "", category: "OTHER", description: "", city: "",
    starting_price: "", cover_image_url: "", is_published: true,
  });
  const [bookings, setBookings] = useState([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api.get("/vendors/me/")
      .then(({ data }) => {
        setProfile(data);
        setForm({
          business_name: data.business_name, category: data.category,
          description: data.description, city: data.city,
          starting_price: data.starting_price, cover_image_url: data.cover_image_url,
          is_published: data.is_published,
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoaded(true));
    api.get("/vendors/bookings/").then(({ data }) => setBookings(data.results));
  }, []);
  useEffect(load, [load]);

  async function saveProfile(e) {
    e.preventDefault();
    setNotice("");
    try {
      await api.put("/vendors/me/", { ...form, starting_price: form.starting_price || 0 });
      setNotice("Profile saved.");
      load();
    } catch (err) {
      setNotice(JSON.stringify(err.response?.data) || "Could not save profile.");
    }
  }

  async function addPortfolio(e) {
    e.preventDefault();
    await api.post("/vendors/portfolio/", { image_url: portfolioUrl });
    setPortfolioUrl("");
    load();
  }

  async function setStatus(b, status) {
    await api.post(`/vendors/bookings/${b.id}/set-status/`, { status });
    load();
  }

  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1 className="page-title">Vendor hub</h1>

      <div className="grid-2col">
        <form className="panel form-grid" onSubmit={saveProfile}>
          <h3 className="span-2">{profile ? "Your public profile" : "Create your public profile"}</h3>
          <label className="span-2">Business name<input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required /></label>
          <label>Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>Starting price (₦)<input type="number" min="0" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} /></label>
          <label>Cover image URL<input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></label>
          <label className="span-2">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="check span-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Visible in the marketplace
          </label>
          <div className="span-2"><button className="btn btn-primary">Save profile</button></div>
          {notice && <p className="muted span-2">{notice}</p>}
        </form>

        <div>
          <div className="panel">
            <h3>Portfolio</h3>
            {profile?.portfolio?.length ? (
              <div className="memory-grid">
                {profile.portfolio.map((p) => (
                  <figure key={p.id} className="memory-card"><img src={p.image_url} alt={p.caption || "Portfolio"} /></figure>
                ))}
              </div>
            ) : (
              <p className="muted">Show off your best work — add image URLs below.</p>
            )}
            <form className="form-row" onSubmit={addPortfolio}>
              <input placeholder="Image URL" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} required />
              <button className="btn btn-ghost" disabled={!profile}>Add</button>
            </form>
          </div>

          {profile?.reviews?.length > 0 && (
            <div className="panel">
              <h3>Latest reviews</h3>
              <ul className="review-list">
                {profile.reviews.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <div className="row-between"><strong>{r.author_name}</strong><span className="rating">{r.rating} ★</span></div>
                    {r.comment && <p>{r.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <h2>Booking requests</h2>
      <table className="table">
        <thead><tr><th>Event</th><th>Planner</th><th>Service</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.event_title}</td>
              <td>{b.planner_name}</td>
              <td>{b.service_description}</td>
              <td>₦{Number(b.amount).toLocaleString()}</td>
              <td><StatusBadge value={b.status} /></td>
              <td className="actions">
                {b.status === "REQUESTED" && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => setStatus(b, "CONFIRMED")}>Accept</button>
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => setStatus(b, "DECLINED")}>Decline</button>
                  </>
                )}
                {b.status === "CONFIRMED" && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(b, "COMPLETED")}>Mark completed</button>
                )}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan={6} className="muted">No booking requests yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
