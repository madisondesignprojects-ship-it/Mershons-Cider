# Mershon's Cider website (demo redesign)

Astro + Tailwind CSS v4, static output. Redesign of https://mershonscider.com/ (WordPress) with the same palette,
vibe, page set and nav labels. Source kit (crawl, raw HTML, text, images, old-site screenshots): `/workspace/mershons/`.

## Pages (old URL -> new URL)
| Nav label | Old | New |
|---|---|---|
| Home | `/` | `/` |
| Tasting Room | `/tasting-room/` | `/tasting-room/` |
| Contact | `/contact/` | `/contact/` |
| Our Story | `/our-story/` | `/our-story/` |
| Order Cider | `/order-cider/` | `/order-cider/` |
| Where to Find | `/where-to-find/` | `/where-to-find/` |
| Events | `/events/` | `/events/` (`/events-2/` and `/event/*` redirect here) |
| Private Events | `/contact-copy/` | `/private-events/` (`/contact-copy/` 301-redirects, see `vercel.json`) |
| 404 | | custom `404.html` |

## Brand
- Colours (from the old site's CSS and logo art): ink `#0C0909`, gold texture `#DBAA3A` / `#E5BD4C`, honey `#D49C25`,
  amber `#DB7C00`, ember `#DD6420`, flame `#E35E02`, logo peach `#F6C078`, parchment `#E4D2BA`, footer charcoal `#222222`.
- Type: Lobster Two (the old site's display/nav font) for headings, Bitter for labels/buttons, Source Sans 3 for body.
- The gold header texture (`header_bg.png`) is reused for the top info bar and footer edge.

## Content
- Hours, address, phone, email, socials, ship-to states: `src/content/site.json`
- Ciders (from the cidery's Vinoshipper feed, producer 985): `src/content/products.json`; "Buy" buttons link to Vinoshipper.
- Retailers / taps (from the old site's WP Google Maps store locator, map 2): `src/content/retailers.json`
- Events: `src/content/events.json` (`dated` events show as Upcoming until their date, then move to "Latest past events" at build time).

## Notes
- Forms are static: they open the visitor's email app addressed to the cidery. Hook up a form service (Formspree, Basin, etc.) for true submissions.
- Map is click-to-load (no Google API key needed).

## Commands
```
npm install
npm run dev
npm run build
npm run preview -- --port 4420
cd qa && node shoot.mjs && node interact.mjs   # screenshots (390/1440), 320px overflow, axe, interactions
```
