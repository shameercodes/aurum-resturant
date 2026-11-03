import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';
import './NotFound.css';

export default function NotFound() {
  useReveal(0.2);
  return (
    <main className="not-found-page">
      <div className="not-found-inner reveal">
        <span className="eyebrow">Lost at the table</span>
        <h1 className="not-found-code">404</h1>
        <p className="not-found-msg">This page isn’t on our menu. Let us guide you back to the dining room.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-gold">Return Home</Link>
          <Link to="/reservations" className="btn btn-outline">Reserve a Table</Link>
        </div>
      </div>
    </main>
  );
}
