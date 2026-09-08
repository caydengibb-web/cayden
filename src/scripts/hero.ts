/**
 * Home hero. A small viewfinder frame on load. As you scroll, the frame
 * opens to fill the screen and the claim lands on top of it.
 */
import { gsap, motionOn, isDesktop } from './gsap';
import { splitHeadline } from './reveal';

export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const frame = hero.querySelector<HTMLElement>('[data-hero-frame]');
  const vf = hero.querySelector<HTMLElement>('[data-hero-vf]');
  const video = hero.querySelector<HTMLVideoElement>('[data-hero-video]');
  const caption = hero.querySelector<HTMLElement>('[data-hero-caption]');
  const hint = hero.querySelector<HTMLElement>('[data-hero-hint]');
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const claim = hero.querySelector<HTMLElement>('[data-hero-claim]');
  const below = hero.querySelectorAll<HTMLElement>('[data-hero-below]');
  if (!frame || !vf || !title || !claim) return;

  if (!motionOn()) {
    hero.classList.add('is-open');
    return;
  }

  const small = isDesktop() ? { x: 28, y: 24 } : { x: 8, y: 30 };
  const startClip = `inset(${small.y}% ${small.x}% ${small.y}% ${small.x}% round 6px)`;
  const endClip = 'inset(0% 0% 0% 0% round 0px)';

  gsap.set(frame, { clipPath: startClip });
  gsap.set(vf, { top: `${small.y}%`, bottom: `${small.y}%`, left: `${small.x}%`, right: `${small.x}%`, opacity: 1 });
  gsap.set([title, claim], { opacity: 0 });
  gsap.set(below, { opacity: 0, y: 24 });
  if (video) gsap.set(video, { opacity: 0 });

  // Opening: the frame draws in, the caption types on.
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .fromTo(frame, { clipPath: 'inset(50% 50% 50% 50% round 6px)' }, { clipPath: startClip, duration: 1.1 }, 0)
    .fromTo(vf, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6)
    .to(video, { opacity: 1, duration: 1 }, 0.2);
  if (caption) intro.fromTo(caption, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.8);
  if (hint) intro.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2);

  // Scroll: the frame opens, the claim lands.
  const titleSplit = splitHeadline(title);
  const claimSplit = splitHeadline(claim);
  gsap.set([title, claim], { opacity: 1 });
  gsap.set(titleSplit.lines, { yPercent: 110 });
  gsap.set(claimSplit.lines, { yPercent: 110 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => `+=${isDesktop() ? 160 : 120}%`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });

  tl.to(frame, { clipPath: endClip, ease: 'power2.inOut', duration: 1 }, 0)
    .to(vf, { top: '0%', bottom: '0%', left: '0%', right: '0%', ease: 'power2.inOut', duration: 1 }, 0)
    .to(vf, { opacity: 0, duration: 0.3 }, 0.55)
    .to(caption ?? {}, { opacity: 0, y: -12, duration: 0.25 }, 0.1)
    .to(hint ?? {}, { opacity: 0, duration: 0.2 }, 0)
    .to(titleSplit.lines, { yPercent: 0, stagger: 0.06, ease: 'power3.out', duration: 0.5 }, 0.45)
    .to(claimSplit.lines, { yPercent: 0, stagger: 0.08, ease: 'power3.out', duration: 0.6 }, 0.55)
    .to(below, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 }, 0.75);
}

/** Running timecode in the viewfinder, 24 frames a second. */
export function initTimecode() {
  const els = document.querySelectorAll<HTMLElement>('[data-timecode]');
  if (els.length === 0 || !motionOn()) return;
  const start = performance.now();
  const pad = (n: number) => String(n).padStart(2, '0');
  let last = -1;
  const tick = (now: number) => {
    const frames = Math.floor(((now - start) / 1000) * 24);
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
