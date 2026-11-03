import './AllergenBar.css';

export default function AllergenBar({ variant = 'compact' }) {
  return (
    <div className={`allergen-bar allergen-${variant}`} role="note" aria-label="Allergen information">
      <div className="allergen-icon-wrap" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div className="allergen-text">
        <strong>Allergen Information</strong>
        <p>
          Please inform your server of any allergies or dietary requirements before ordering.
          Full allergen matrices are available on request. Our kitchen handles{' '}
          <strong>nuts</strong>, <strong>gluten</strong>, and <strong>dairy</strong>.
        </p>
      </div>
    </div>
  );
}
