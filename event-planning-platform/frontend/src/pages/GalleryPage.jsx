import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import Wordmark from "../components/Wordmark";

const CATEGORY_ORDER = [
  "WEDDING", "ENGAGEMENT", "SURPRISE", "BIRTHDAY", "BABY_SHOWER", "CORPORATE", "OTHER",
];

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/gallery/")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (filter && item.category !== filter) continue;
      if (!map.has(item.category)) map.set(item.category, { label: item.category_label, items: [] });
      map.get(item.category).items.push(item);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, ...map.get(c) }));
  }, [items, filter]);

  const categories = useMemo(() => {
    const present = new Map(items.map((i) => [i.category, i.category_label]));
    return CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => [c, present.get(c)]);
  }, [items]);

  return (
    <div>
      <section className="hero hero-dark">
        <Wordmark stacked light />
        <h1>Our Work</h1>
        <p>A look at projects Black Sand Events &amp; Creations has brought to life.</p>
      </section>

      <div className="chip-row">
        <button className={`chip ${filter === "" ? "chip-active" : ""}`} onClick={() => setFilter("")}>All</button>
        {categories.map(([value, label]) => (
          <button key={value} className={`chip ${filter === value ? "chip-active" : ""}`} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading gallery…</p>
      ) : grouped.length === 0 ? (
        <p className="muted">The gallery is being curated — check back soon.</p>
      ) : (
        grouped.map((group) => (
          <section key={group.category} className="gallery-section">
            <h2>{group.label}</h2>
            <div className="memory-grid gallery-grid">
              {group.items.map((item) => (
                <figure key={item.id} className={`memory-card ${item.is_featured ? "featured" : ""}`}>
                  <img src={item.image_url} alt={item.caption || group.label} loading="lazy" />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
