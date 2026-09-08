/**
 * Custom cursor for mouse and trackpad users. A dot leads, a ring
 * follows with a little lag. Over anything with data-cursor="Label"
 * the ring fills orange and shows the label.
 */
import { gsap, motionOn, finePointer } from './gsap';

export function initCursor() {
  const root = document.querySelector<HTMLElement>('[data-cursor]');
  if (!root || !motionOn() || !finePointer()) return;
  const dot = root.querySelector<HTMLElement>('[data-cursor-dot]')!;
  const ring = root.querySelector<HTMLElement>('[data-cursor-ring]')!;
  const label = root.querySelector<HTMLElement>('[data-cursor-label]')!;

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

  root.classList.add('is-hidden');
  window.addEventListener('mousemove', (e) => {
    root.classList.remove('is-hidden');
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });
  document.addEventListener('mouseleave', () => root.classList.add('is-hidden'));

  document.addEventListener('mouseover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, input, iframe');
    if (!t) {
      root.classList.remove('is-label');
      return;
    }
    if (t.matches('input, iframe')) {
      root.classList.add('is-hidden');
      return;
    }
    const text = t.dataset.cursor;
    if (text) {
      label.textContent = text;
      root.classList.add('is-label');
    } else {
      root.classList.remove('is-label');
    }
  });
  document.addEventListener('mouseout', (e) => {
    const t = (e.target as HTMLElement).closest?.('input, iframe');
    if (t) root.classList.remove('is-hidden');
  });
}
