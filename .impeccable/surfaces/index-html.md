---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: storefront (index.html)

Scope: single-page storefront covering the hero, the catalogue ("the bed"), the plant sheet, the order sheet, the plant helper, how ordering works, delivery and hours, Stephen's story, and the footer. Visitor mode: **Persuade**. The catalogue, order sheet and helper behave like Operate, but inside the world.

Audience and job: Perth gardeners on a phone in daylight, plus bulk hedging buyers. They come to find a plant that suits their spot, pick a pot size, reach the $350 minimum, and send an order request. Proof: 640 real lines with real photos, pot sizes and prices; Stephen's own words; hours and delivery facts. Constraints: no floating widgets over the plants, no invented reviews or fees, and the helper answers only from site facts and the catalogue.

Revision (2026-10-19, user request): the first build felt overwhelming. The user asked for a "really fresh", lighter and calmer take on the same tag world, plus transitions. This contract replaces the drenched-green version.

## Direction contract

THESIS: Every plant is its own nursery stake label (the tag is the card, the sheet and the order line), now shown in daylight with room to breathe. This refuses both the airy sage product grid and the drenched, everything-shouting first build.

OWN-WORLD: A pale leaf-white ground (#f4f7f1 family) and white tag plastic with a punched hole and rounded shoulders. Stakes appear only on the 3D tag, the search tag and order lines. Deep nursery green (#0d6b38) is the single accent, and it owns whole grounds only in the story and footer. Process yellow means money only: price tabs and the primary order action. Archivo: names at 700–800 and ~75% width, with normal-case catalogue names and a condensed-caps headline voice. Shadows are soft, there's no tilt, and hairline rules mark structure.

STORY: Visitors calmly understand that this is a real Perth nursery with hundreds of plants, upfront prices and pot sizes, and a $350 delivery minimum. They find a plant (by browsing, by searching, or by asking the plant helper), add it, and send the order by email, WhatsApp or SMS.

FIRST VIEWPORT: Light ground. A single quiet header row: wordmark tag, four links, "Ask" (plant helper), a phone icon, and the Order tag with count. On the left, the H1 in deep-green condensed caps (≤6rem, "Perth-proof plants, delivered.") runs behind the WebGL pot. Below it sit one short lede, the blank search tag, and one hairline facts line (Perth Metro & Mandurah · Mon–Sat 1–9 pm · $350 minimum). On the right, the 3D pot and a giant stake tag painted with a real plant, with prev/next, pot size and Add under it. Signature interactions: drag to turn the tag; tapping any catalogue tag morphs its photo into the plant sheet (View Transitions) and back on close. Motion grammar: exponential ease-out, 150–450ms, no bounce, nothing hidden by default. Added plants fly a thumbnail into the Order tag. Reduced motion keeps crossfades and state changes only.

FORM: Nursery Tag, position 1 on the ordered list (IMPECCABLE'S PICK over the rolled Delivery Docket); seed key feb48903. Revision: quieter + distill + animate within the same world.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Mascot logo: keep, redraw or retire (a type wordmark for now).
- EmailJS keys (service, templates, public key) from the nursery; email ordering stays hidden until they're set.
- Blog (37 posts) and videos (4) migration; custom domain.
