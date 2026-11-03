import { useEffect } from 'react';

/** Scroll-reveal: adds `.visible` when elements with `.reveal` enter viewport */
export default function useReveal(threshold = 0.08) {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }),
      { threshold }
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}
