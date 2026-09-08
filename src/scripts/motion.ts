/**
 * Motion. GSAP and ScrollTrigger only. Slow and quiet.
 * Runs only when <html class="motion"> is set, which the head script
 * adds unless the visitor asked for reduced motion.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EASE = 'power2.out';

/** Wrap each visual line of a heading in <span class="line"> so lines can stagger. */
function splitLines(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? '';
  const words = text.split(/\s+/).filter(Boolean);
  el.textContent = '';
  const spans = words.map((w) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.style.display = 'inline-block';
    el.appendChild(s);
    el.appendChild(document.createTextNode(' '));
    return s;
  });

  const rows: HTMLElement[][] = [];
  let top: number | null = null;
  for (const s of spans) {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 2) {
      rows.push([]);
      top = t;
    }
    rows[rows.length - 1].push(s);
  }

  el.textContent = '';
  return rows.map((row) => {
    const line = document.createElement('span');
    line.className = 'line';
    line.style.display = 'block';
    line.textContent = row.map((s) => s.textContent).join(' ');
    el.appendChild(line);
    return line;
  });
}

/**
 * A [data-reveal-lines] block is either a heading itself or a wrapper
 * holding a small label and a heading. Returns the pieces to stagger,
 * in order: the label (if any), then each line of the heading.
 */
function splitBlock(el: HTMLElement): HTMLElement[] {
  if (el.matches('h1, h2, h3')) return splitLines(el);
  const parts: HTMLElement[] = [];
  Array.from(el.children).forEach((child) => {
    const c = child as HTMLElement;
    if (c.matches('h1, h2, h3')) parts.push(...splitLines(c));
    else parts.push(c);
  });
  return parts;
}

export function initMotion() {
  if (!document.documentElement.classList.contains('motion')) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero: video fades in over 1s, text follows 0.3s later.
  const heroVideo = document.querySelector<HTMLElement>('[data-hero-video]');
  const heroText = document.querySelector<HTMLElement>('[data-hero-text]');
  if (heroVideo) {
    gsap.fromTo(heroVideo, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'none' });
  }
  if (heroText) {
    const lines = heroText.querySelectorAll<HTMLElement>('[data-reveal-lines]');
    const blocks = heroText.querySelectorAll<HTMLElement>('[data-reveal]');
    const tl = gsap.timeline({ delay: 0.3 });
    lines.forEach((h) => {
      const parts = splitBlock(h);
      gsap.set(h, { opacity: 1 });
      tl.from(parts, { opacity: 0, y: 24, duration: 0.7, ease: EASE, stagger: 0.09 }, 0);
    });
    tl.fromTo(
      blocks,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.09 },
      0.2
    );
  }

  // Every other headline: lines stagger in as it enters the screen.
  document
    .querySelectorAll<HTMLElement>('[data-reveal-lines]')
    .forEach((h) => {
      if (heroText?.contains(h)) return;
      const parts = splitBlock(h);
      gsap.set(h, { opacity: 1 });
      gsap.from(parts, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: EASE,
        stagger: 0.09,
        scrollTrigger: { trigger: h, start: 'top 85%', once: true },
      });
    });

  // Every text block fades up 24px, once.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (heroText?.contains(el)) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });

  // Video frames scale from 0.98 to 1.
  document.querySelectorAll<HTMLElement>('[data-scale]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: EASE,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });
}
