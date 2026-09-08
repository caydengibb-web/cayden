# Real Reach Content

Two-page marketing site plus a thank-you page. Built with Astro, plain HTML and CSS, a little vanilla JavaScript, and GSAP for motion (ScrollTrigger, ScrollSmoother, SplitText). Hosted on Netlify.

- `/` is the general site.
- `/call` is the ad landing page. One job: book a call.
- `/booked` is the thank-you page after a booking.

## Run it on your computer

You need Node 22 or newer.

```
npm install
cp .env.example .env
npm run dev
```

Open the address it prints, usually `http://localhost:4321`.

To build the finished site into the `dist` folder:

```
npm run build
npm run preview
```

## Change the copy

Page copy lives in the page files. Open the one you want and edit the words between the tags.

- Home page: `src/pages/index.astro`
- Ad landing page: `src/pages/call.astro`
- Thank-you page: `src/pages/booked.astro`
- "This works best when" list (shared): `src/components/WhoFor.astro`
- Lead form messages: `src/components/LeadForm.astro`

Page titles and descriptions for Google are at the top of each page file, in the `title` and `description` lines.

## Change links, clients, stats, and videos

Everything that can change lives in one file: `src/data/site.ts`.

- `links`: your site address, email, LinkedIn, and Instagram.
- `videos.callIntro`: the talk-to-camera video on `/call`.
- `videos.heroLoop`: the file names for the hero background loop.
- `clients`: each client, one line on what you did, and their videos.
- `testimonials`: name, title, company, and Vimeo ID for each.
- `stats`: the numbers row.

Every client, testimonial, and stat has an `approved` flag. Only items with `approved: true` show on the site. Flip it to `true` once you have written OK from that client.

Anything in `[BRACKETS]` is a placeholder. Replace it.

### Swap a video

Vimeo videos are set by ID. The ID is the number in the Vimeo link, for example `https://vimeo.com/912345678` has the ID `912345678`.

1. Open `src/data/site.ts`.
2. Find the video and put the ID in `vimeoId: ''`.
3. Save. The site rebuilds on the next deploy.

A video with an empty ID shows a dark box with a play mark.

Tall clips for LinkedIn and Instagram use `ratio: '9x16'`. Wide videos use `ratio: '16x9'`.

### Swap the hero loop

1. Export the loop as an mp4 (H.264) and a webm (VP9). Keep each under 4 MB. 1280 by 720 is plenty.
2. Name them `hero-loop.mp4` and `hero-loop.webm`.
3. Save a still from the loop as `hero-poster.jpg`.
4. Drop all three in `public/video`, replacing the placeholder files.

### Add a client

1. Open `src/data/site.ts`.
2. Copy one of the entries in `clients` and paste it at the end of the list.
3. Fill in the name, industry, one line, and videos.
4. Set `approved: true` once you have written OK.

The client's name will show under the hero and in the work grid on the next deploy.

## Set the secret values

The site reads three values at build time. Locally they live in `.env`. On Netlify they live in Site configuration > Environment variables.

- `PUBLIC_META_PIXEL_ID`: your Meta pixel ID. Leave blank to turn tracking off.
- `PUBLIC_CALENDLY_URL`: your Calendly event link.
- `PUBLIC_GHL_WEBHOOK_URL`: the GoHighLevel webhook the lead form posts to.

## Tracking

- The Meta pixel fires `PageView` on every page.
- `Lead` fires when the form on `/call` sends.
- `Schedule` fires when a Calendly booking finishes on `/call`, and again on `/booked` load. It can only fire once per visit.
- A comment block in `src/layouts/Base.astro` marks where a GA4 tag would go.

In Calendly, set the event's redirect to `https://yoursite.com/booked` if your plan allows it. If it does not, `/call` shows a thank-you message in place of the calendar.

## Deploy

Netlify builds the site every time you push to GitHub.

1. Push this folder to a GitHub repo.
2. In Netlify, pick Add new site > Import an existing project, and choose the repo.
3. Netlify reads `netlify.toml`, so the build command and folder are already set.
4. Add the three environment variables above.
5. Click Deploy.

After that, every push to the main branch goes live in about a minute.

## Where things are

```
public/            files served as-is
  fonts/           Inter Tight, self-hosted
  img/             still images for video boxes
  video/           hero loop and poster
  og.png           share image
  robots.txt
src/
  components/      pieces used on more than one page
  data/site.ts     all changeable content
  layouts/         the page shell (head tags, pixel, fonts)
  pages/           one file per page
  scripts/         motion, video loading, the /call page logic
  styles/          global styles and colours
netlify.toml       build settings and security headers
```

## Colours and fonts

Colours are CSS variables at the top of `src/styles/global.css`. Change them there and they change everywhere.

Fonts are in `public/fonts`. The site uses three faces:

- Inter Tight 800 for headlines and 400 for body.
- Instrument Serif italic for the orange claim lines.
- JetBrains Mono for the small camera-style labels and timecode.

To swap one, drop the new `.woff2` file in that folder and update the matching `@font-face` block in `src/styles/global.css`.

## Motion

All motion lives in `src/scripts`. The home hero (`hero.ts`) opens the viewfinder frame as you scroll. The work section (`work.ts`) pins and scrolls sideways on desktop. Reveals, the custom cursor, magnetic buttons, the marquee, and the hover previews are in `reveal.ts`, `cursor.ts`, and `extras.ts`. Everything turns off for visitors who ask for reduced motion, and the page shows its final state.
