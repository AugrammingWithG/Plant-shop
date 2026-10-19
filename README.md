# Plant-shop

A rebuild of [potplantheavenperth.com](https://www.potplantheavenperth.com/), the online plant nursery in Camillo, Perth. The site sells through a catalogue and an order request, not a checkout. Visitors fill an order from the real stock, see their progress toward the $350 delivery minimum, and send the order to the nursery by WhatsApp or SMS. The nursery then confirms the order and invoices it.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # static site in dist/
npm run preview   # serve the build
```

The site is fully static. Every push to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/deploy.yml`, at https://augrammingwithg.github.io/Plant-shop/. Because Pages serves the site under `/Plant-shop/`, the workflow sets `BASE_PATH` for the build. If you move to a custom domain or a different host, leave `BASE_PATH` unset.

## The catalogue

`public/data/products.json` holds every product: names, descriptions, pot sizes, prices, stock status, categories and photos. It's pulled from the existing Wix store with:

```bash
npm run sync
```

The sync script takes the light needs (full sun, part shade, shade) and plant specs from each product's own description. A light icon only appears when the description actually says so. Product photos still load from Wix's image CDN.

## Automations and helpers

- **Nightly stock sync:** `.github/workflows/sync-catalogue.yml` re-pulls the Wix catalogue every night at 2:30 am Perth time. When anything has changed, it commits the new catalogue and redeploys the site. It analyses only new photos, and it refuses to publish if the catalogue suddenly shrinks by more than half. You can also run it any time from the repo's **Actions** tab ("Nightly catalogue sync", then **Run workflow**).
- **Plant helper:** the **Ask** button opens a small chat (`src/helper.js`). It answers delivery, hours, payment and ordering questions from the site's own facts, and it finds plants from the real catalogue, for example "natives for full sun under $30" or "hedging up to 1 m". It runs entirely in the browser, costs nothing, and never makes things up: anything it can't answer goes to a call or WhatsApp.
- **Email order requests:** switched off until the nursery adds its EmailJS keys. See [docs/email-orders.md](docs/email-orders.md). Customers can always send orders by WhatsApp or SMS.
- **Small conveniences:** every order request gets a reference number such as `PPH-261019-4821`. The visitor's browser remembers their name, phone and suburb for next time, and their order is kept if they leave and come back.

## What was wrong with the old site

- **Only 1 of 652 products showed.** The /shop page's product gallery was set to the "Artificial Turf & Accessories" category, which contains only Foundry Sand. On top of that, most products have a $0.00 base price with the real price on each pot-size option, so they looked free wherever they did appear.
- **Broken widgets:** a "Let's Chat" bot, an Instagram popup that still read "Follow us on Instagram @your_instagram_id", and floating review and chat badges stacked over the content.
- **Empty first screen:** the homepage hero rendered as a blank green block.
- **Dead and duplicate links:** /about returned a 404 (About actually lived at /page4), "Shop" appeared twice in the menu, and "INDOOR PLANTS" linked back to the homepage.
- **Heavy pages:** 2.3 MB of homepage HTML, loading Wix Bookings, an AI assistant and video apps that the site never used.
- **Small errors:** "Testimonals" in the menu, "Pot Plant Heaven Porth" in image alt text, a LinkedIn link to an admin-only URL, and a copyright year stuck at © 2018.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Page shell and static content |
| `src/main.js` | Catalogue, filters, plant sheet, order sheet, hero controls |
| `src/bench3d.js` | The Three.js hero: pot, procedurally grown plants, painted stake tag |
| `src/store.js` | Order state (saved in the visitor's browser) and nursery contact numbers |
| `src/styles.css` | All styling |
| `scripts/sync-wix.mjs` | Pulls the catalogue from the Wix store |
| `PRODUCT.md` | Product facts the design rests on |

## Still to decide

- Hosting, and when to move the domain off Wix.
- Whether order requests should also go to email or a form service.
- The mascot logo: keep it, redraw it or retire it. The new site uses a type wordmark for now.
- Whether to move the blog (37 posts) and videos (4) across.
- The "5.0 from 80 Google reviews" badge has been left off until the rating is verified at the source.
