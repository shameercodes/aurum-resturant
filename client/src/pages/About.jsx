import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import './About.css';

const TEAM=[
  {name:"Chef Alexei Moreau",role:"Executive Chef & Founder",bio:"Trained under Alain Ducasse and Marco Pierre White, Alexei brings 25 years of Michelin-starred experience and a relentless pursuit of perfection.",img:"https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80"},
  {name:"Isabelle Voss",role:"Head Pastry Chef",bio:"Former lead at Sketch London, Isabelle crafts desserts that blur the line between art and indulgence — each one a miniature world.",img:"https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=500&q=80"},
  {name:"Marco Delgado",role:"Head Sommelier",bio:"WSET Diploma holder with 12 years pairing wines across three continents. Marco's selections are legendary among regulars.",img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80"},
];
const TIMELINE=[
  {year:"2009",event:"Aurum opens on Golden Square — a 30-seat room with a bold vision and no compromise."},
  {year:"2012",event:"Awarded our first Michelin Star, recognised for consistency and innovation."},
  {year:"2015",event:"Expanded to 48 covers and launched our private dining suite."},
  {year:"2018",event:"Chef Alexei wins Chef of the Year at the National Restaurant Awards."},
  {year:"2021",event:"Launched the 7-course seasonal tasting menu with 400-label wine cellar pairings."},
  {year:"2024",event:"Celebrated 15 years with a collector's dinner and charitable auction."},
];
const STATS=[{n:'15+',l:'Years'},{n:'★1',l:'Michelin Star'},{n:'48',l:'Covers'},{n:'400+',l:'Wines'},{n:'100%',l:'British Produce'},{n:'20+',l:'Seasonal Dishes'}];

export default function About() {
  useReveal(0.1);
  return (
    <main className="about-page">
      <section className="page-hero">
        <div className="page-hero-bg" style={{backgroundImage:"url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1800&q=80')"}}/>
        <div className="page-hero-content">
          <span className="eyebrow">Our Philosophy</span>
          <h1>The Soul of <em>Aurum</em></h1>
          <p>Fifteen years of passion, craft, and quiet excellence in Soho</p>
        </div>
      </section>
      <div className="divider"/>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="story-grid">
            <div className="reveal">
              <span className="eyebrow">Who We Are</span>
              <h2 className="section-title">Crafted with <em>Intention</em></h2>
              <p className="lead" style={{marginTop:'18px',marginBottom:'14px'}}>Founded in 2009 by Chef Alexei Moreau, Aurum was born from one obsession: to transform the finest seasonal ingredients into experiences that linger long after the last bite.</p>
              <p className="lead" style={{marginBottom:'14px'}}>We work directly with farmers, foragers and fishermen across the British Isles and Europe — people who share our belief that exceptional cooking starts long before the kitchen.</p>
              <p className="lead">Every dish on our menu tells a story. We hold one Michelin star, and we wear it lightly.</p>
            </div>
            <div className="story-imgs reveal">
              <img src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=700&q=80" alt="Dining room" className="story-img-main"/>
              <div className="story-img-row">
                <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80" alt="Plating"/>
                <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" alt="Chef's table"/>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="stats-band reveal">
            {STATS.map(s=><div key={s.l} className="sb-item"><strong>{s.n}</strong><span>{s.l}</span></div>)}
          </div>
        </div>
      </section>
      <div className="divider"/>

      {/* Timeline */}
      <section className="section tl-section">
        <div className="container">
          <div className="reveal" style={{marginBottom:'56px'}}>
            <span className="eyebrow">Our Journey</span>
            <h2 className="section-title">A <em>Legacy</em> of Flavour</h2>
          </div>
          <div className="timeline">
            <div className="tl-line"/>
            {TIMELINE.map((item,i)=>(
              <div key={i} className={`tl-item ${i%2===0?'left':'right'} reveal`}>
                <div className="tl-card"><span className="tl-year">{item.year}</span><p>{item.event}</p></div>
                <div className="tl-dot"/>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="divider"/>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="reveal" style={{marginBottom:'48px'}}>
            <span className="eyebrow">The People</span>
            <h2 className="section-title">Meet the <em>Team</em></h2>
          </div>
          <div className="team-grid">
            {TEAM.map((m,i)=>(
              <div key={i} className={`team-card card reveal reveal-d${i+1}`}>
                <div className="team-img-wrap"><img src={m.img} alt={m.name} loading="lazy" onError={e=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'}}/></div>
                <div className="team-body">
                  <h3>{m.name}</h3>
                  <span>{m.role}</span>
                  <p>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="divider"/>

      {/* CTA */}
      <section className="about-cta">
        <div className="cta-bg" style={{backgroundImage:"url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80')"}}/>
        <div className="cta-content container reveal">
          <span className="eyebrow">Experience Aurum</span>
          <h2 className="section-title" style={{color:'var(--text-1)'}}>Ready to Make a <em>Memory</em>?</h2>
          <div className="cta-actions"><Link to="/reservations" className="btn btn-gold">Reserve a Table</Link><Link to="/menu" className="btn btn-outline">Browse Menu</Link></div>
        </div>
      </section>
    </main>
  );
}
