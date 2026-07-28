import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const CATEGORIES = [
  ["", "All"], ["VENUE", "Venues"], ["CATERING", "Catering"], ["CAKE", "Cakes"],
  ["PHOTOGRAPHY", "Photo & Video"], ["MUSIC", "Music & DJ"], ["DECOR", "Decor"],
  ["SURPRISE", "Surprise Experiences"], ["TRANSPORT", "Transport"], ["PLANNING", "Full Planning"],
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    api.get(`/vendors/marketplace/?${params}`)
      .then(({ data }) => setVendors(data.results))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div>
      <section className="hero hero-alt">
        <h1>Book vendors who deliver</h1>
        <p>Caterers, photographers, DJs, decorators and surprise specialists — reviewed by real hosts.</p>
        <input
          className="hero-search"
          placeholder="Search vendors by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="chip-row">
        {CATEGORIES.map(([value, label]) => (
          <button key={value} className={`chip ${category === value ? "chip-active" : ""}`} onClick={() => setCategory(value)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading vendors…</p>
      ) : (
        <div className="card-grid">
          {vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-card">
              <div className="vendor-card-media" style={v.cover_image_url ? { backgroundImage: `url(${v.cover_image_url})` } : undefined} />
              <div className="event-card-body">
                <div className="row-between">
                  <h3>{v.business_name}</h3>
                  <span className="rating">{v.average_rating ? `${v.average_rating.toFixed(1)} ★` : "New"}</span>
                </div>
                <p className="muted small">{v.category.replace(/_/g, " ")} · {v.city || "Anywhere"}</p>
                <p className="muted">{v.description?.slice(0, 90)}{v.description?.length > 90 ? "…" : ""}</p>
                <p className="price">From ₦{Number(v.starting_price).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {vendors.length === 0 && <p className="muted">No vendors in this category yet.</p>}
        </div>
      )}
    </div>
  );
}
