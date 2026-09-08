/**
 * Lazy Vimeo embeds.
 * A box with data-video gets its iframe only when tapped, or, for
 * data-load="now", when it comes near the screen.
 */
const PLAYER = 'https://player.vimeo.com';

function buildSrc(id: string, opts: { autoplay: boolean; muted: boolean }) {
  const p = new URLSearchParams({
    dnt: '1',
    byline: '0',
    portrait: '0',
    title: '0',
    autoplay: opts.autoplay ? '1' : '0',
    muted: opts.muted ? '1' : '0',
    playsinline: '1',
  });
  if (opts.muted) p.set('texttrack', 'en');
  return `${PLAYER}/video/${id}?${p.toString()}`;
}

function post(iframe: HTMLIFrameElement, method: string, value?: unknown) {
  iframe.contentWindow?.postMessage(JSON.stringify({ method, value }), PLAYER);
}

function inject(box: HTMLElement) {
  if (box.dataset.loaded === '1') return;
  const id = box.dataset.vimeoId;
  if (!id) return;
  box.dataset.loaded = '1';

  const muted = box.dataset.autoplayMuted === '1';
  const iframe = document.createElement('iframe');
  iframe.src = buildSrc(id, { autoplay: true, muted });
  iframe.title = box.dataset.title ?? 'Video';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.setAttribute('allowfullscreen', '');
  iframe.loading = 'eager';
  box.appendChild(iframe);
  box.classList.add('video--playing');

  const unmute = box.querySelector<HTMLButtonElement>('.video__unmute');
  if (muted && unmute) {
    unmute.hidden = false;
    unmute.addEventListener(
      'click',
      () => {
        post(iframe, 'setCurrentTime', 0);
        post(iframe, 'setMuted', false);
        post(iframe, 'setVolume', 1);
        post(iframe, 'play');
        unmute.hidden = true;
      },
      { once: true }
    );
  }
}

export function initVimeo() {
  const boxes = document.querySelectorAll<HTMLElement>('[data-video][data-vimeo-id]');
  if (boxes.length === 0) return;

  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        near.unobserve(e.target);
        inject(e.target as HTMLElement);
      }
    },
    { rootMargin: '300px 0px' }
  );

  boxes.forEach((box) => {
    box.querySelector('.video__play')?.addEventListener('click', () => inject(box));
    if (box.dataset.load === 'now') near.observe(box);
  });
}
