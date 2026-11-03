/** Minimal stroke icons for premium UI (no emoji) */

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconClock({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconMapPin({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconPhone({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M6.5 4h3l2 5-2.5 1.5a11 11 0 005 5L15.5 13l5 2v3a2 2 0 01-2 2A15 15 0 014 6.5a2 2 0 012-2.5z" />
    </svg>
  );
}

export function IconMail({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconLeaf({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M11 20C6 14 4 8 12 4c-2 8-1 12 7 16-4-2-6-4-8-8z" />
    </svg>
  );
}

export function IconStar({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l2.9 6.9H22l-5.5 4.5 2.1 6.6L12 17.3 5.4 19.9l2.1-6.6L2 8.9h7.1L12 2z" />
    </svg>
  );
}
