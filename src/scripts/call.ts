/**
 * /call page only.
 *  - Carries UTM params from the page URL into the Calendly embed.
 *  - Builds the Calendly iframe and sizes it from Calendly's own messages.
 *  - Fires the Schedule event once when a call is booked.
 *  - Posts the lead form to the GoHighLevel webhook and fires Lead.
 */
import { initSmooth, refreshSoon } from './smooth';
import { initReveal, splitHeadline } from './reveal';
import { initTimecode } from './hero';
import { initVimeo } from './vimeo';
import { initCursor } from './cursor';
import { initMagnetic, initCount } from './extras';
import { gsap, motionOn } from './gsap';
import { track, trackScheduleOnce } from './track';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

function readUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  const q = new URLSearchParams(window.location.search);
  for (const k of UTM_KEYS) {
    const v = q.get(k);
    if (v) out[k] = v;
  }
  return out;
}

/* Calendly */
function initCalendly(utm: Record<string, string>) {
  const root = document.querySelector<HTMLElement>('[data-calendly]');
  if (!root) return;
  const base = root.dataset.calendlyUrl;
  const frameHost = root.querySelector<HTMLElement>('[data-calendly-frame]');
  const done = root.querySelector<HTMLElement>('[data-calendly-done]');

  let iframe: HTMLIFrameElement | null = null;

  if (base && frameHost) {
    const url = new URL(base);
    url.searchParams.set('embed_domain', window.location.hostname);
    url.searchParams.set('embed_type', 'Inline');
    url.searchParams.set('hide_gdpr_banner', '1');
    url.searchParams.set('background_color', 'f3efe8');
    url.searchParams.set('text_color', '0b0b0b');
    url.searchParams.set('primary_color', 'ff6a1a');
    for (const [k, v] of Object.entries(utm)) url.searchParams.set(k, v);

    iframe = document.createElement('iframe');
    iframe.src = url.toString();
    iframe.title = 'Pick a time with Cayden';
    iframe.loading = 'lazy';
    frameHost.appendChild(iframe);
  }

  window.addEventListener('message', (e: MessageEvent) => {
    if (typeof e.origin !== 'string' || !e.origin.endsWith('calendly.com')) return;
    const data = e.data as { event?: string; payload?: { height?: number } } | undefined;
    if (!data || typeof data.event !== 'string') return;

    if (data.event === 'calendly.page_height' && iframe && data.payload?.height) {
      iframe.style.height = `${Math.ceil(data.payload.height)}px`;
    }

    if (data.event === 'calendly.event_scheduled') {
      trackScheduleOnce();
      // If Calendly is set to redirect to /booked this is never seen.
      if (done) {
        Array.from(root.children).forEach((child) => {
          (child as HTMLElement).hidden = child !== done;
        });
      }
    }
  });
}

/* Lead form */
function initForm(utm: Record<string, string>) {
  const form = document.querySelector<HTMLFormElement>('[data-lead-form]');
  if (!form) return;
  const webhook = form.dataset.webhook ?? '';
  const msg = form.querySelector<HTMLElement>('[data-form-msg]');
  const done = form.querySelector<HTMLElement>('[data-form-done]');
  const error = form.querySelector<HTMLElement>('[data-form-error]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (msg) msg.textContent = '';
    if (error) error.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);
    // Bots fill the hidden field. People never see it.
    if ((fd.get('website') as string) !== '') {
      form.classList.add('is-done');
      if (done) done.hidden = false;
      return;
    }

    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      source: 'realreachcontent.com/call',
      page: window.location.href,
      submitted_at: new Date().toISOString(),
      utm_source: utm.utm_source ?? '',
      utm_medium: utm.utm_medium ?? '',
      utm_campaign: utm.utm_campaign ?? '',
      utm_content: utm.utm_content ?? '',
    };

    if (!webhook) {
      if (error) error.hidden = false;
      return;
    }

    if (button) button.disabled = true;
    if (msg) msg.textContent = 'Sending.';

    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
      track('Lead');
      form.classList.add('is-done');
      if (msg) msg.textContent = '';
      if (done) done.hidden = false;
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = '';
      if (error) error.hidden = false;
      if (button) button.disabled = false;
    }
  });
}

/* Hero on /call: headline lines rise on load, then the rest follows. */
function initCallHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || !motionOn()) return;
  const lines = hero.querySelectorAll<HTMLElement>('[data-lines]');
  const blocks = hero.querySelectorAll<HTMLElement>('[data-reveal]');
  const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } });
  lines.forEach((el) => {
    const split = splitHeadline(el);
    tl.from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.09 }, 0);
  });
  tl.fromTo(blocks, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.35);
}

const utm = readUtm();
document.fonts.ready.then(() => {
  initSmooth();
  initCallHero();
  initTimecode();
  initReveal();
  initVimeo();
  initCalendly(utm);
  initForm(utm);
  initCursor();
  initMagnetic();
  initCount();
  refreshSoon();
});
