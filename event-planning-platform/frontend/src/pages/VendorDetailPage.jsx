import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function VendorDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [booking, setBooking] = useState({ event: "", service_description: "", amount: "" });
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api.get(`/vendors/marketplace/${id}/`).then(({ data }) => setVendor(data));
  }, [id]);
  useEffect(load, [load]);

  useEffect(() => {
    if (user?.role === "PLANNER") {
      api.get("/events/").then(({ data }) => setMyEvents(data.results));
    }
  }, [user]);

  async function requestBooking(e) {
    e.preventDefault();
    setNotice("");
    try {
      await api.post("/vendors/bookings/", { ...booking, vendor: vendor.id, amount: booking.amount || 0 });
      setNotice("Request sent! Track it under your event's Bookings tab — the conversation thread is already open in Messages.");
      setBooking({ event: "", service_description: "", amount: "" });
    } catch (err) {
      setNotice(err.response?.data?.detail || "Could not send request.");
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setNotice("");
    try {
      await api.post("/vendors/reviews/", { ...review, vendor: vendor.id });
      setReview({ rating: 5, comment: "" });
      load();
    } catch (err) {
      setNotice(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Could not post review.");
    }
  }

  if (!vendor) return <p className="muted">Loading vendor…</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{vendor.business_name}</h1>
          <p className="muted">
            {vendor.category.replace(/_/g, " ")} · {vendor.city || "Anywhere"} ·{" "}
            {vendor.average_rating ? `${vendor.average_rating.toFixed(1)} ★ (${vendor.review_count} reviews)` : "No reviews yet"}
          </p>
        </div>
        <span className="price">From ₦{Number(vendor.starting_price).toLocaleString()}</span>
      </div>

      <p>{vendor.description}</p>

      {vendor.portfolio.length > 0 && (
        <>
          <h3>Portfolio</h3>
          <div className="memory-grid">
            {vendor.portfolio.map((p) => (
              <figure key={p.id} className="memory-card">
                <img src={p.image_url} alt={p.caption || vendor.business_name} />
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      )}

      {user?.role === "PLANNER" && (
        <form className="panel form-grid" onSubmit={requestBooking}>
          <h3 className="span-2">Request a booking</h3>
          <label>For which event?
            <select value={booking.event} onChange={(e) => setBooking({ ...booking, event: e.target.value })} required>
              <option value="">Select an event…</option>
              {myEvents.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </label>
          <label>Budget for this service (₦)
            <input type="number" min="0" value={booking.amount} onChange={(e) => setBooking({ ...booking, amount: e.target.value })} />
          </label>
          <label className="span-2">What do you need?
            <input value={booking.service_description} onChange={(e) => setBooking({ ...booking, service_description: e.target.value })} required placeholder="e.g. Catering for 150 guests, buffet style" />
          </label>
          <div className="span-2"><button className="btn btn-primary">Send request</button></div>
          {myEvents.length === 0 && (
            <p className="muted span-2">You need an event first — <Link to="/events">create one</Link>.</p>
          )}
        </form>
      )}
      {!user && (
        <div className="callout"><Link to="/login">Sign in</Link> to book this vendor or leave a review.</div>
      )}

      <h3>Reviews</h3>
      {vendor.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      <ul className="review-list">
        {vendor.reviews.map((r) => (
          <li key={r.id}>
            <div className="row-between">
              <strong>{r.author_name}</strong>
              <span className="rating">{r.rating} ★</span>
            </div>
            {r.comment && <p>{r.comment}</p>}
          </li>
        ))}
      </ul>

      {user?.role === "PLANNER" && (
        <form className="panel form-row" onSubmit={submitReview}>
          <select value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </select>
          <input placeholder="Share your experience…" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          <button className="btn btn-ghost">Post review</button>
        </form>
      )}

      {notice && <p className="callout">{notice}</p>}
    </div>
  );
}
