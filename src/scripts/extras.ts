/**
 * Small touches: magnetic buttons, the services hover preview,
 * the marquee, number count-ups, and the Sarnia clock.
 */
import { gsap, motionOn, finePointer, isDesktop } from './gsap';

export function initMagnetic() {
  if (!motionOn() || !finePointer()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.28);
    });
    el.addEventListener('mouseleave', () => {
      x(0);
      y(0);
    });
  });
}

export function initPreview() {
  const float = document.querySelector<HTMLElement>('[data-preview-float]');
  const img = float?.querySelector<HTMLImageElement>('[data-preview-img]');
  if (!float || !img || !motionOn() || !finePointer() || !isDesktop()) return;
  gsap.set(float, { xPercent: -50, yPercent: -50, scale: 0.94 });
  const x = gsap.quickTo(float, 'x', { duration: 0.5, ease: 'power3' });
  const y = gsap.quickTo(float, 'y', { duration: 0.5, ease: 'power3' });
  const rows = document.querySelectorAll<HTMLElement>('[data-preview]');
  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => {
      img.src = row.dataset.preview ?? img.src;
      float.style.setProperty('--hue', row.style.getPropertyValue('--hue'));
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    });
    row.addEventListener('mouseleave', () => {
      gsap.to(float, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
    });
    row.addEventListener('mousemove', (e) => {
      x(e.clientX);
      y(e.clientY);
    });
  });
}

export function initCount() {
  if (!motionOn()) return;
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.dataset.count ?? '';
    const m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
    if (!m) return; // placeholders like [X] stay as they are
    const [, pre, num, post] = m;
    const target = parseFloat(num);
    const decimals = (num.split('.')[1] ?? '').length;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => (el.textContent = `${pre}${obj.v.toFixed(decimals)}${post}`),
    });
  });
}

export function initClock() {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (els.length === 0) return;
  const fmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' });
  const tick = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 15000);
}

/** Wordmark and links tuck away while scrolling down. The button stays. */
export function initNavTheme() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav || !motionOn()) return;
  import('./gsap').then(({ ScrollTrigger }) => {
    ScrollTrigger.create({
      start: 120,
      end: 'max',
      onUpdate: (self) => nav.classList.toggle('is-tucked', self.direction === 1),
      onLeaveBack: () => nav.classList.remove('is-tucked'),
    });
  });
}
