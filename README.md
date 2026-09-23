# Real Reach Content

One-page agency site. Static: `index.html`, `styles.css`, `main.js` and an `/assets` folder. No build step. Vanilla HTML, CSS and JavaScript, with GSAP 3, ScrollTrigger and Lenis loaded from the jsDelivr CDN for smooth scroll and the scroll-driven sections.

## Run it on your computer

Any static server works. With Node installed:

```
npx serve .
```

Open the address it prints. Opening `index.html` straight from the file system also works, but videos and fonts load faster through a server.

## Deploy

Netlify reads `netlify.toml`, which sets the publish folder to the repository root with no build command. Push to the main branch and Netlify deploys it as-is.

`netlify.toml` also carries the security headers and two redirects from the old site: `/call` goes to the booking section and `/booked` goes to the home page.

## Change the copy

Everything visible is in `index.html`, top to bottom in page order. Search for `[PLACEHOLDER]` to find every spot that still needs a real number, name or quote.

Three blocks of content live in `main.js` because they swap on scroll or click:

- `WORK`: the three client results shown on the phone in "The work".
- `IND`: the five market panels in "Your market".
- The month calendar tiles and lead notifications are in `index.html` under `#month`. Give each `.tile` a `data-views="1234"` attribute and the total views in the card header adds itself up.

## Swap media

All paths are listed in `index.html` and `main.js`, and every file in `/assets` is a labelled placeholder until replaced:

- `assets/hero.mp4` and `assets/hero-poster.jpg`: the muted background loop. Keep the mp4 under 4 MB, H.264, 1280 by 720 is plenty.
- `assets/reels/*.mp4` and matching `.jpg` posters: 9:16 client reels. Names match the client.
- `assets/testimonials/tall.mp4` (9:16), `wide-1.mp4` and `wide-2.mp4` (16:9), each with a `.jpg` poster.
- `assets/hand-phone.png`: a photographed hand holding a phone with a transparent screen. The screen rectangle is set as percentages in `styles.css` under `.hand-screen`. Adjust those four numbers to match the photo.
- `assets/team/*.jpg` (4:5) and `assets/avatars/*.jpg` (square).
- `assets/og.jpg`: the share image, 1200 by 630.

Every video lazy-loads with its poster and at most eight are live at once.

## Calendly

Put the event link in the `data-url` attribute of the `#calendly` element in `index.html`. The widget loads only when a visitor scrolls near it. Until a real `https://calendly.com/...` link is in place the card shows a note and an email button.

## Colours and type

Colours are CSS variables at the top of `styles.css`. The brand orange is `--accent`. Each section palette (`.s-dark`, `.s-bone`, `.s-accent`) overrides the variables it needs.

Type falls back through Neue Haas Grotesk Display, Helvetica Now, Helvetica Neue and then Inter Tight, which is self-hosted in `assets/fonts`.

## Motion

Everything is in `main.js`. Lenis handles smooth scroll. ScrollTrigger pins "The work", "Your month" and the filmstrip on desktop. On phones the calendar and filmstrip stack and the work section advances on its own. Visitors who ask for reduced motion get a plain page with everything visible and native scroll.
