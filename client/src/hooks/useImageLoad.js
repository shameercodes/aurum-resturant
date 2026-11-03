import { useEffect } from 'react';

/** Adds `.loaded` class to lazy images when they finish loading */
export default function useImageLoad() {
  useEffect(() => {
    const mark = img => {
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    };
    document.querySelectorAll('img[loading="lazy"]').forEach(mark);
    const io = new MutationObserver(() => {
      document.querySelectorAll('img[loading="lazy"]:not(.loaded)').forEach(mark);
    });
    io.observe(document.body, { childList: true, subtree: true });
    return () => io.disconnect();
  }, []);
}
