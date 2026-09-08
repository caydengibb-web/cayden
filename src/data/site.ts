/**
 * Everything on the site that can change lives here.
 * Copy, links, clients, testimonials, stats, and video IDs.
 *
 * Rules:
 *  - Only items with `approved: true` show on the site.
 *  - Video IDs are Vimeo IDs (the number in the Vimeo URL).
 *  - An empty vimeoId shows a dark placeholder box with a play mark.
 *  - Text in [BRACKETS] is a placeholder. Replace it.
 */

export type Ratio = '16x9' | '9x16';

export interface ClientVideo {
  /** Vimeo ID, for example "912345678". Leave blank until you have it. */
  vimeoId: string;
  ratio: Ratio;
  /** One plain line on what this video is. Shown under the video. */
  label: string;
  /** Optional still image in /public/img. Falls back to a generic still. */
  poster?: string;
}

export interface Client {
  name: string;
  industry: string;
  /** One line on what we did for them. */
  oneLiner: string;
  /** Only approved clients appear anywhere on the site. */
  approved: boolean;
  /** Path to a logo in /public/img, once you have written OK. Optional. */
  logo?: string;
  videos: ClientVideo[];
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  vimeoId: string;
  approved: boolean;
  poster?: string;
}

export interface Stat {
  /** Shown in small type under the number. */
  label: string;
  /** The big number or short value, for example "18" or "40%". */
  value: string;
  approved: boolean;
}

export const site = {
  name: 'Real Reach Content',
  owner: 'Cayden',
  city: 'Sarnia, Ontario',
  /** Used for the sitemap, canonical URLs, and the Open Graph image. */
  links: {
    siteUrl: 'https://realreachcontent.com', // [SITE URL]
    email: 'cayden@realreachcontent.com', // [EMAIL]
    linkedin: 'https://www.linkedin.com/in/', // [LINKEDIN URL]
    instagram: 'https://www.instagram.com/', // [INSTAGRAM URL]
    /** Calendly comes from PUBLIC_CALENDLY_URL in .env. This is the fallback. */
    calendly: '',
  },

  /** Videos that are not tied to a client. Swap IDs here. */
  videos: {
    /** Talk-to-camera video at the top of /call. 16:9. */
    callIntro: {
      vimeoId: '', // [CALL PAGE VIDEO ID]
      poster: '/img/still-16x9.jpg',
    },
    /** Self-hosted hero loop. Files live in /public/video. */
    heroLoop: {
      webm: '/video/hero-loop.webm',
      mp4: '/video/hero-loop.mp4',
      poster: '/video/hero-poster.jpg',
    },
  },

  clients: [
    {
      name: 'Seaport Intermodal',
      industry: 'Logistics',
      oneLiner: 'LinkedIn videos, brand videos, case studies, and recruiting ads. Renewed through the end of 2026.',
      approved: true,
      videos: [
        { vimeoId: '', ratio: '16x9', label: 'Brand video' }, // [SEAPORT BRAND VIDEO ID]
        { vimeoId: '', ratio: '16x9', label: 'Client case study' }, // [SEAPORT CASE STUDY ID]
        { vimeoId: '', ratio: '9x16', label: 'LinkedIn clip' }, // [SEAPORT CLIP ID]
        { vimeoId: '', ratio: '9x16', label: 'Recruiting ad' }, // [SEAPORT RECRUITING AD ID]
      ],
    },
    {
      name: 'CMF Group',
      industry: 'Industrial contracting',
      oneLiner: 'Thirty short videos in 90 days for LinkedIn and Instagram, across six locations in Canada and the US.',
      approved: false,
      videos: [
        { vimeoId: '', ratio: '9x16', label: 'LinkedIn clip' },
        { vimeoId: '', ratio: '9x16', label: 'Instagram clip' },
      ],
    },
    {
      name: 'Elite Relief MD',
      industry: 'Health',
      oneLiner: '[ONE LINE ON WHAT WE DID]',
      approved: false,
      videos: [{ vimeoId: '', ratio: '16x9', label: 'Brand video' }],
    },
    {
      name: 'Build with Assembly',
      industry: 'Construction',
      oneLiner: '[ONE LINE ON WHAT WE DID]',
      approved: false,
      videos: [{ vimeoId: '', ratio: '16x9', label: 'Leadership video' }],
    },
    {
      name: 'H. Moore & Son',
      industry: 'Trades',
      oneLiner: '[ONE LINE ON WHAT WE DID]',
      approved: false,
      videos: [{ vimeoId: '', ratio: '16x9', label: 'Brand video' }],
    },
    {
      name: 'Safe Home Fireplace',
      industry: 'Retail and install',
      oneLiner: '[ONE LINE ON WHAT WE DID]',
      approved: false,
      videos: [{ vimeoId: '', ratio: '16x9', label: 'Brand video' }],
    },
  ] as Client[],

  testimonials: [
    {
      name: '[NAME]',
      title: '[TITLE]',
      company: 'Seaport Intermodal',
      vimeoId: '', // [SEAPORT TESTIMONIAL VIDEO ID]
      approved: true,
    },
    {
      name: '[NAME]',
      title: '[TITLE]',
      company: 'CMF Group',
      vimeoId: '',
      approved: false,
    },
    {
      name: '[NAME]',
      title: '[TITLE]',
      company: '[COMPANY]',
      vimeoId: '',
      approved: false,
    },
  ] as Testimonial[],

  stats: [
    { value: '[X]', label: 'months with Seaport Intermodal', approved: true },
    { value: '[X]', label: 'videos delivered for CMF Group', approved: false },
    { value: '[X]%', label: 'more page visits for [CLIENT]', approved: false },
  ] as Stat[],
};

/** Helpers. Use these in pages so the approved flag is never skipped. */
export const approvedClients = () => site.clients.filter((c) => c.approved);
export const approvedTestimonials = () => site.testimonials.filter((t) => t.approved);
export const approvedStats = () => site.stats.filter((s) => s.approved);

/** "Seaport Intermodal, CMF Group, and Elite Relief MD" from the approved list. */
export function clientNamesSentence(): string {
  const names = approvedClients().map((c) => c.name);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
