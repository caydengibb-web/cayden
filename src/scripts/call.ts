/**
 * /call page only.
 *  - Carries UTM params from the page URL into the Calendly embed.
 *  - Builds the Calendly iframe and sizes it from Calendly's own messages.
 *  - Fires the Schedule event once when a call is booked.
 *  - Posts the lead form to the GoHighLevel webhook and fires Lead.
 */
import { initMotion } from './motion';
import { initVimeo } from './vimeo';
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

/* Smooth scroll to the calendar from any [data-scroll-to] link */
function initScrollLinks() {
  document.querySelectorAll<HTMLAnchorElement>('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const target = document.querySelector(a.getAttribute('href') ?? '');
      if (!target) return;
      ev.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
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

const utm = readUtm();
initVimeo();
initCalendly(utm);
initScrollLinks();
initForm(utm);
initMotion();
