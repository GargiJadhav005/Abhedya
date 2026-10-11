import { useEffect } from 'react';

export function useCinematicScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll('.landing > section:not(.hero)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach(element => { element.classList.add('scroll-reveal'); observer.observe(element); });
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove('scroll-reveal')); };
  }, []);
}