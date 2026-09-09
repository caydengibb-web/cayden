/**
 * Scroll reveals.
 *  [data-lines]   headline lines rise out of a mask, 90ms apart
 *  [data-reveal]  block fades up 24px
 *  [data-scale]   video frames scale 0.98 to 1
 *  [data-words]   paragraph words brighten one by one as you scroll
 */
import { gsap, SplitText, EASE, motionOn } from './gsap';

export function splitHeadline(el: HTMLElement) {
  const split = SplitText.create(el, {
    type: 'lines',
    linesClass: 'line',
    mask: 'lines',
    autoSplit: true,
    aria: 'none',
  });
  el.classList.add('is-split');
  return split;
}

export function initReveal(root: ParentNode = document) {
  if (!motionOn()) return;

  root.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
    if (el.closest('[data-hero]')) return;
    const split = splitHeadline(el);
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('[data-hero]')) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  root.querySelectorAll<HTMLElement>('[data-scale]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: EASE,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });

  root.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word', aria: 'none' });
    gsap.set(el, { opacity: 1 });
    const from = getComputedStyle(el).getPropertyValue('--word-from').trim() || '#b8b3aa';
    const to = getComputedStyle(el).color;
    gsap.fromTo(
      split.words,
      { color: from },
      {
        color: to,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
      }
    );
  });
}
