---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: storefront (index.html)

Scope: single-page storefront covering the hero specimen, the nursery-in-numbers report, the catalogue (the bed), the plant sheet, the order sheet, the plant helper, how ordering works, delivery and hours, Stephen's story, and the footer. Visitor mode: **Persuade**. The catalogue, order sheet and helper behave like Operate, but inside the world.

Audience and job: Perth gardeners on a phone, plus bulk hedging buyers. They come to find a plant that suits their spot, pick a pot size, reach the $350 minimum, and send an order request. Proof: 640 real lines with real photos, pot sizes and prices, real stock counts per bed, Stephen's own words, and hours and delivery facts. Constraints: no third-party widgets over the plants, no invented reviews or fees, and the helper answers only from site facts and the catalogue.

Revision (2026-10-19, user-pinned): the user supplied three references and said "i want the overall website to be something like this". The references are a dark botanical infographic report (lime 3D bars with tiny trees, big thin numerals, layered sand-coloured contour hills), a frosted-glass bonsai app (floating glass panels, segmented controls, a timeline planner, a care-schedule table), and a dark premium plant shop (deep forest green, out-of-focus leaves framing the edges, plants under glass cloches on dark plinths, dark green cards). They also asked for the site to feel alive, with scroll motion. This replaces the daylight tag world.

## Direction contract

THESIS: The nursery at night under glass. Each plant is a lit specimen in a glasshouse, frosted panels float over a deep forest dark, and the nursery's real stock is read like a botanical report. This refuses both the bright white plant-shop grid and the earlier paper-tag world.

OWN-WORLD: The ground is deep forest dark (#0b1711 to #10231a) with soft pools of light. Frosted glass panels use a pale-green 6–9% fill, a 1px pale border, an 18px backdrop blur and a top-edge highlight. Lime (#b9e36b) is the accent for text and controls; the chart lime is #6aa336 (validated). Ink is #e6efe8, secondary #a9bdb0. Sand (#d6cc8e) appears only in the contour-line terrain. Rendered 3D leaf branches frame the edges at several focal depths. The 3D specimen is a terracotta pot under a glass cloche on a dark plinth with a lime edge light. Archivo throughout: display at weight 300 in sentence case, data numerals at weight 200, and small tracked lime labels only as chart and panel legends.

STORY: Visitors feel that this is a real, cared-for Perth nursery with hundreds of plants (the numbers prove it), with upfront prices and pot sizes and a $350 delivery minimum. They find a plant by browsing, by the bed chart, by searching, or by asking the helper, then add it and send the order by email, WhatsApp or SMS.

FIRST VIEWPORT: Dark ground. A blurred leaf branch enters from the top-right and a sharper one from the left edge, drifting on scroll. A glass header bar sits on top. On the left: the H1 "Perth-proof plants, delivered." in light 300 type (≤6rem), with "delivered." in lime; one lede line; a glass search pill; and a hairline facts row. On the right: the WebGL specimen (pot, real plant form, glass cloche, plinth) turning slowly and draggable, with a floating glass specimen panel overlapping its lower right (thumbnail, name, botanical, light, pot select, price, Add, prev/next). Signature interactions: drag the specimen; the bed chart's bars grow from their baseline with tiny trees on top, and clicking one filters the catalogue; a catalogue card's photo morphs into the plant sheet. Motion grammar: depth-of-field reveals (blur→sharp with a rise), headline lines rising from masks, leaf parallax and sway, numbers counting up, the journey line, the quote inking in, and the header tucking away. Expo ease-out throughout; reduced motion keeps state changes only.

FORM: User-pinned references (the botanical report, the glass app panels and the dark glasshouse shop), which take precedence over the earlier roll (seed key feb48903). The product truth and functions are carried over unchanged.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Mascot logo: keep, redraw or retire (a type wordmark with a leaf mark for now).
- EmailJS keys from the nursery; email ordering stays hidden until they're set.
- Blog and videos migration; custom domain.
