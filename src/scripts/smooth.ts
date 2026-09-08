/**
 * Smooth scrolling on desktop. Phones keep native scroll.
 * Anchor links with data-scroll-to scroll through the smoother.
 */
import { gsap, ScrollSmoother, motionOn } from './gsap';

let smoother: ScrollSmoother | null = null;

export function initSmooth() {
  if (motionOn()) {
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.1,
      effects: false,
      smoothTouch: 0,
      normalizeScroll: false,
    });
  }

  document.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href') ?? '';
      if (!href.startsWith('#')) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      ev.preventDefault();
      if (smoother) {
        smoother.scrollTo(target, true, 'top top');
      } else {
        target.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' });
      }
    });
  });

  return smoother;
}

export function getSmoother() {
  return smoother;
}

/** Let GSAP refresh after everything (fonts, images) is in place. */
export function refreshSoon() {
  gsap.delayedCall(0.1, () => {
    import('./gsap').then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  });
}
