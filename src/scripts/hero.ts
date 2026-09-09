/**
 * Home hero. A small viewfinder frame on a bright page. As you scroll the
 * frame opens into a large floating frame and the claim lands beneath it.
 */
import { gsap, motionOn, isDesktop } from './gsap';
import { splitHeadline } from './reveal';

export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const frame = hero.querySelector<HTMLElement>('[data-hero-frame]');
  const vf = hero.querySelector<HTMLElement>('[data-hero-vf]');
  const video = hero.querySelector<HTMLVideoElement>('[data-hero-video]');
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const hint = hero.querySelector<HTMLElement>('[data-hero-hint]');
  const claim = hero.querySelector<HTMLElement>('[data-hero-claim]');
  const below = hero.querySelectorAll<HTMLElement>('[data-hero-below]');
  if (!frame || !vf || !title || !claim) return;

  if (!motionOn()) {
    hero.classList.add('is-open');
    return;
  }

  // Start: a small frame in the middle. End: the frame fills the upper part
  // of the screen with bright margins, and the claim sits under it.
  const desktop = isDesktop();
  const start = desktop ? { t: 26, r: 30, b: 26, l: 30 } : { t: 30, r: 10, b: 30, l: 10 };
  const end = desktop ? { t: 11, r: 4, b: 34, l: 4 } : { t: 12, r: 4, b: 44, l: 4 };
  const clip = (o: { t: number; r: number; b: number; l: number }) => `inset(${o.t}% ${o.r}% ${o.b}% ${o.l}%)`;

  gsap.set(frame, { clipPath: clip(start) });
  gsap.set(vf, { top: `${start.t}%`, right: `${start.r}%`, bottom: `${start.b}%`, left: `${start.l}%` });
  gsap.set(below, { opacity: 0, y: 20 });
  if (video) gsap.set(video, { opacity: 0 });

  // Opening: frame draws in, title fades on.
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .fromTo(frame, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: clip(start), duration: 1.1 }, 0)
    .fromTo(vf, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6)
    .to(video, { opacity: 1, duration: 1 }, 0.2)
    .fromTo(title, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7);
  if (hint) intro.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2);

  const claimSplit = splitHeadline(claim);
  gsap.set(claim, { opacity: 1 });
  gsap.set(claimSplit.lines, { yPercent: 110 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => `+=${desktop ? 140 : 110}%`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });

  tl.to(frame, { clipPath: clip(end), ease: 'power2.inOut', duration: 1 }, 0)
    .to(vf, { top: `${end.t}%`, right: `${end.r}%`, bottom: `${end.b}%`, left: `${end.l}%`, ease: 'power2.inOut', duration: 1 }, 0)
    .to(title, { top: '5.5%', ease: 'power2.inOut', duration: 1 }, 0)
    .to(hint ?? {}, { opacity: 0, duration: 0.2 }, 0)
    .to(claimSplit.lines, { yPercent: 0, stagger: 0.08, ease: 'power3.out', duration: 0.6 }, 0.5)
    .to(below, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 0.75);
}

/** Running timecode in the viewfinder, 24 frames a second. */
export function initTimecode() {
  const els = document.querySelectorAll<HTMLElement>('[data-timecode]');
  if (els.length === 0 || !motionOn()) return;
  const startAt = performance.now();
  const pad = (n: number) => String(n).padStart(2, '0');
  let last = -1;
  const tick = (now: number) => {
    const frames = Math.floor(((now - startAt) / 1000) * 24);
    if (frames !== last) {
      last = frames;
      const f = frames % 24;
      const s = Math.floor(frames / 24) % 60;
      const m = Math.floor(frames / 1440) % 60;
      const h = Math.floor(frames / 86400);
      const text = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
      els.forEach((el) => (el.textContent = text));
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
