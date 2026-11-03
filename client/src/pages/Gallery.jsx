import { useEffect, useState, useCallback } from 'react';
import useReveal from '../hooks/useReveal';
import './Gallery.css';

const IMGS = [
  { src: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80', label: 'The Dining Room', cat: 'ambiance' },
  { src: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80', label: 'Wagyu Fillet A5', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', label: 'Pan-Seared Sea Bass', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80', label: 'Restaurant Interior', cat: 'ambiance' },
  { src: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', label: 'Valrhona Fondant', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80', label: 'The Gold Rush', cat: 'drinks' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', label: "Chef's Table", cat: 'ambiance' },
  { src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', label: 'Cocktail Bar', cat: 'drinks' },
  { src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80', label: 'Tuna Tartare', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80', label: 'Duck Confit', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', label: 'Elderflower Fizz', cat: 'drinks' },
  { src: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=600&q=80', label: 'Crème Brûlée', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', label: 'Signature Plate', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80', label: 'Aurum Negroni', cat: 'drinks' },
  { src: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80', label: 'Truffle Arancini', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', label: 'Rack of Lamb', cat: 'food' },
  { src: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=600&q=80', label: 'Smoked Old Fashioned', cat: 'drinks' },
  { src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=85', thumb: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80', label: 'Artisan Dessert', cat: 'food' },
];

const CATS = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'ambiance', label: 'Ambiance' },
  { key: 'drinks', label: 'Drinks' },
];

export default function Gallery() {
  useReveal(0.07);
  const [cat, setCat] = useState('all');
  const [lb, setLb] = useState(null);

  const filtered = cat === 'all' ? IMGS : IMGS.filter(i => i.cat === cat);
  const close = useCallback(() => setLb(null), []);
  const prev = useCallback(() => setLb(i => (i - 1 + filtered.length) % filtered.length), [filtered.length]);
  const next = useCallback(() => setLb(i => (i + 1) % filtered.length), [filtered.length]);

  useEffect(() => {
    if (lb === null) return;
    const fn = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lb, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lb !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lb]);

  useEffect(() => setLb(null), [cat]);

  return (
    <main className="gallery-page">
      <section className="page-hero">
        <div className="page-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=2000&q=90')" }} />
        <div className="page-hero-content">
          <span className="eyebrow">Visual Stories</span>
          <h1>The <em>Gallery</em></h1>
          <p>Atmosphere, craftsmanship, and the details that define Aurum</p>
        </div>
      </section>
      <div className="divider" />
      <section className="section">
        <div className="container">
          <div className="gallery-controls reveal">
            <div className="menu-tabs" role="tablist">
              {CATS.map(c => (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={cat === c.key}
                  className={`menu-tab ${cat === c.key ? 'active' : ''}`}
                  onClick={() => setCat(c.key)}
                >
                  {c.label}
                  <span className="tab-count">
                    {c.key === 'all' ? IMGS.length : IMGS.filter(i => i.cat === c.key).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="masonry">
            {filtered.map((item, i) => (
              <div
                key={`${cat}-${i}`}
                className="masonry-item reveal"
                onClick={() => setLb(i)}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.label}`}
                onKeyDown={e => e.key === 'Enter' && setLb(i)}
              >
                <img src={item.thumb} alt={item.label} loading="lazy" />
                <div className="masonry-overlay">
                  <span>{item.label}</span>
                  <span className="mi-zoom" aria-hidden="true">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lb !== null && (
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true" aria-label="Image viewer">
          <button type="button" className="lb-btn lb-close" onClick={close} aria-label="Close">×</button>
          <button type="button" className="lb-btn lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <button type="button" className="lb-btn lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          <div className="lb-content" onClick={e => e.stopPropagation()}>
            <img src={filtered[lb].src} alt={filtered[lb].label} className="lb-img" />
            <div className="lb-cap">
              <span>{filtered[lb].label}</span>
              <span className="lb-num">{lb + 1} / {filtered.length}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
