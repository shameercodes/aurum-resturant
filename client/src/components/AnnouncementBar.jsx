import { Link } from 'react-router-dom';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  return (
    <div className="announce-bar" role="region" aria-label="Announcement">
      <div className="announce-inner">
        <span className="announce-badge">New</span>
        <p>
          Seven-course <strong>Seasonal Tasting Menu</strong> — £145 per guest, optional wine pairing from £85
        </p>
        <Link to="/reservations" className="announce-link">Reserve your evening →</Link>
      </div>
    </div>
  );
}
