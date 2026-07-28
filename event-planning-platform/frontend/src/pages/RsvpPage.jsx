import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function RsvpPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ rsvp_status: "", plus_ones: 0, dietary_notes: "" });
  const [giftMsg, setGiftMsg] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api.get(`/rsvp/${token}/`)
      .then(({ data }) => {
        setData(data);
        setForm({
          rsvp_status: data.guest.rsvp_status === "PENDING" ? "" : data.guest.rsvp_status,
          plus_ones: data.guest.plus_ones,
          dietary_notes: data.guest.dietary_notes,
        });
      })
      .catch(() => setError("This invite link is invalid or has expired."));
  }, [token]);
  useEffect(load, [load]);

  async function respond(status) {
    setNotice("");
    await api.post(`/rsvp/${token}/`, { ...form, rsvp_status: status });
    setForm({ ...form, rsvp_status: status });
    setNotice(status === "ACCEPTED" ? "Wonderful — see you there! 🎉" : "Thanks for letting us know.");
  }

  async function claim(item) {
    setNotice("");
    try {
      await api.post(`/rsvp/${token}/gifts/`, { registry_item: item.id, message: giftMsg });
      setNotice(`You claimed "${item.name}" — thank you!`);
      setGiftMsg("");
      load();
    } catch (err) {
      setNotice(err.response?.data?.detail || "Could not claim item.");
    }
  }

  async function sendCashGift(e) {
    e.preventDefault();
    if (!giftAmount) return;
    await api.post(`/rsvp/${token}/gifts/`, { amount: giftAmount, message: giftMsg });
    setNotice("Your gift has been recorded — thank you! 💝");
    setGiftAmount("");
    setGiftMsg("");
  }

  if (error) return <div className="rsvp-page"><div className="rsvp-card"><h1>Hmm.</h1><p className="muted">{error}</p></div></div>;
  if (!data) return <div className="rsvp-page"><div className="rsvp-card"><p className="muted">Loading your invite…</p></div></div>;

  const { event, guest, registry } = data;

  return (
    <div className="rsvp-page">
      <div className="rsvp-card">
        <p className="rsvp-kicker">You're invited</p>
        <h1>{event.title}</h1>
        <p className="muted">Hosted by {event.host_name}</p>

        {event.cover_image_url && <img className="rsvp-cover" src={event.cover_image_url} alt="" />}

        <div className="rsvp-details">
          <p>📅 {new Date(event.event_date).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</p>
          <p>📍 {[event.venue_name, event.address, event.city].filter(Boolean).join(", ") || "Venue to be announced"}</p>
        </div>

        {event.description && <p>{event.description}</p>}

        {event.is_surprise && event.surprise_brief && (
          <div className="callout callout-surprise">
            <strong>🤫 You're in on the secret{event.honoree_name ? ` — it's for ${event.honoree_name}` : ""}.</strong>
            <p>{event.surprise_brief}</p>
            <p className="small muted">Please keep this off social media until after the reveal!</p>
          </div>
        )}
        {event.is_surprise && !event.surprise_brief && (
          <p className="muted">A little bird says there may be more to this event than meets the eye…</p>
        )}

        <h2>Hello {guest.full_name.split(" ")[0]}, will you be there?</h2>
        <div className="rsvp-buttons">
          <button className={`btn ${form.rsvp_status === "ACCEPTED" ? "btn-primary" : "btn-ghost"}`} onClick={() => respond("ACCEPTED")}>Yes, count me in</button>
          <button className={`btn ${form.rsvp_status === "MAYBE" ? "btn-primary" : "btn-ghost"}`} onClick={() => respond("MAYBE")}>Maybe</button>
          <button className={`btn ${form.rsvp_status === "DECLINED" ? "btn-primary" : "btn-ghost"}`} onClick={() => respond("DECLINED")}>Can't make it</button>
        </div>

        <div className="form-grid">
          <label>Bringing anyone?
            <input type="number" min="0" max="10" value={form.plus_ones} onChange={(e) => setForm({ ...form, plus_ones: e.target.value })} />
          </label>
          <label>Dietary notes
            <input value={form.dietary_notes} onChange={(e) => setForm({ ...form, dietary_notes: e.target.value })} placeholder="e.g. vegetarian" />
          </label>
        </div>
        {form.rsvp_status && (
          <button className="btn btn-ghost" onClick={() => respond(form.rsvp_status)}>Update my details</button>
        )}

        {registry.length > 0 && (
          <>
            <h2>Gift registry</h2>
            <ul className="registry-list">
              {registry.map((item) => (
                <li key={item.id} className={item.is_claimed ? "claimed" : ""}>
                  <div>
                    <strong>{item.name}</strong>
                    {Number(item.price) > 0 && <span className="muted"> · ₦{Number(item.price).toLocaleString()}</span>}
                    {item.is_claimed && <span className="small muted"> — claimed</span>}
                  </div>
                  {!item.is_claimed && <button className="btn btn-ghost btn-sm" onClick={() => claim(item)}>Claim</button>}
                </li>
              ))}
            </ul>
          </>
        )}

        <h2>Send a gift</h2>
        <form className="form-row" onSubmit={sendCashGift}>
          <input type="number" min="1" placeholder="Amount (₦)" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} />
          <input placeholder="Add a message…" value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} />
          <button className="btn btn-primary">Send</button>
        </form>

        {notice && <p className="callout">{notice}</p>}
        <p className="rsvp-footer">
          Powered by <span className="wordmark">Black Sand <em>Events</em></span>
          <br />
          WhatsApp: <a href="https://wa.me/2348171617653">+234 817 161 7653</a> · <a href="https://wa.me/2347079962577">+234 707 996 2577</a>
        </p>
        <p className="dev-credit">developed by Ajommuo - 08087777476</p>
      </div>
    </div>
  );
}
