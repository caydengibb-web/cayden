/** Small wrapper around the Meta pixel so calls never throw when it is off. */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: 'Lead' | 'Schedule', params?: Record<string, unknown>) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params ?? {});
  }
}

/** Fire Schedule once per browser session, no matter how many times it is called. */
const SCHEDULE_KEY = 'rrc_schedule_fired';
let scheduleFired = false;

export function trackScheduleOnce() {
  if (scheduleFired) return;
  try {
    if (sessionStorage.getItem(SCHEDULE_KEY) === '1') {
      scheduleFired = true;
      return;
    }
    sessionStorage.setItem(SCHEDULE_KEY, '1');
  } catch {
    /* private mode or storage off; the in-memory flag still holds */
  }
  scheduleFired = true;
  track('Schedule');
}
