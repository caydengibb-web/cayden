/** Horizontal work gallery on desktop. Pins and scrolls the track sideways. */
import { gsap, ScrollTrigger, motionOn, isDesktop } from './gsap';

export function initWork() {
  const section = document.querySelector<HTMLElement>('[data-work]');
  const pin = section?.querySelector<HTMLElement>('[data-work-pin]');
  const track = section?.querySelector<HTMLElement>('[data-work-track]');
  const progress = section?.querySelector<HTMLElement>('[data-work-progress]');
  if (!section || !pin || !track || !motionOn() || !isDesktop()) return;

  const distance = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: pin,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (progress) progress.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  // Reveal each item as it slides into view horizontally.
  section.querySelectorAll<HTMLElement>('[data-scale]').forEach((el) => {
    ScrollTrigger.getById?.('');
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          containerAnimation: gsap.getTweensOf(track)[0],
          start: 'left 95%',
          once: true,
        },
      }
    );
  });
}
