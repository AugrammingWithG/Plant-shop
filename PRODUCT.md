# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + vanilla JS + Three.js, static build. Chosen by the user over Next.js and plain HTML. Deploy target: a static host (Netlify / Vercel / GitHub Pages), not yet decided. No backend.

## Users

- **Perth home gardeners and renters** buying plants online for delivery. They want to see what's in stock, what size it comes in, what it costs, and whether it will survive Perth's climate.
- **Bulk/landscape buyers** (hedging, screening, advanced trees). Orders like these usually clear the $350 delivery minimum in one go.
- **The owner (Stephen Rolls)**, who must be able to maintain the catalogue without a developer. The previous Wix build failed him on exactly this point.

## Product Purpose

Pot Plant Heaven Perth is an online-orders-only plant nursery in Camillo (south of the river) that delivers to Perth Metro and Mandurah. The site exists to let people browse the real stock and send an order request that the owner confirms and invoices. Success means visitors can find plants and send complete order requests that clear the delivery minimum. On the old site only one product of 652 was visible, so it could not do either.

## Positioning

Stephen describes the business as a nursery that began as a therapeutic hobby while he recovered from illness. His stated aim is "the best plants, the best prices and the best delivery costs in the Western Australian Metropolitan area". His own words, verbatim from the old About page, are: "All plants are suitable for the Perth environment and will be guaranteed to provide you with the tools to create a majestic garden that others will be jealous of, asking 'Where did you get that from?'" Quote it in full or not at all, because shortening it changes what is guaranteed. Deliveries run Mon–Sat in the afternoons and evenings.

## Operating Context

- Ordering: **cart → order request**. The customer builds a cart, sees progress toward the $350 delivery minimum, and submits name, suburb, phone and notes. The owner confirms availability, delivery and the invoice. There is no online payment on this site. The existing FAQ says payment is accepted by credit card, PayPal or Alipay when invoiced.
- Contact: phone/SMS/WhatsApp to 0420 493 944. No chatbots and no third-party popup widgets.
- Office hours: Mon–Sat 9 AM – 12 noon. Deliveries: Mon–Sat 1 PM – 9 PM.
- Delivery areas: Perth Metro & Mandurah. Minimum order $350. The FAQ states "typically 7–10 business days".
- Address: 191 Westfield Rd, Camillo WA. Online orders only, so it is not a walk-in shopfront.

## Capabilities and Constraints

- The catalogue is the real Wix store export (652 product pages). Most products carry their price on pot-size variants, and the Wix base price is $0.00. Always show variant prices, and use "from $X" where several exist.
- The catalogue lives in one data file that the owner can edit.
- Gift cards exist on the old site. Gift card purchase is not built here; send people to an enquiry.
- Undecided: the hosting provider, how order requests get delivered (email service / form backend), the domain cut-over, and whether to migrate the blog (37 posts) and videos (4).

## Brand Commitments

- Name: **Pot Plant Heaven Perth**.
- Existing logo: a smiling flower in an orange pot with angel wings and a halo, with "Best plants · Best prices · Best delivery costs" around a roundel. The visual world is being replaced. Whether the mascot is kept, redrawn or retired is open.
- Voice: a down-to-earth Perth local. Plain-spoken, practical about care, and keen on value.

## Evidence on Hand

- Google rating widget on the old site: 5.0 from 80 reviews. This came from a third-party widget; verify it before republishing.
- Real product names, descriptions, pot sizes, prices and photos come from the Wix store (`src/data/products.json`). Images are hosted on static.wixstatic.com.
- Social: facebook.com/POTPlantHeavenPerth, instagram.com/potplantheavenperth, YouTube channel UCPWqnC4Bj7WCc77mJRZyQ6A.
- **Do not fabricate**: testimonials, review quotes, delivery fees (not published), awards, or years-in-business figures beyond "© 2018".

## Product Principles

1. **Stock is the hero.** If a visitor can't find a plant in two moves, the site has failed.
2. **Honest numbers.** Show real prices, real pot sizes, the $350 minimum and the delivery window up front, with no surprises at the order step.
3. **Perth-proof.** Lead with climate suitability and care, because suitability for the Perth environment is the nursery's core promise.
4. **The owner can run it.** Content changes are data edits, not code edits.
5. **Nothing floats over the plants.** No popups or bots, and no overlapping widgets.

## Accessibility & Inclusion

WCAG 2.2 AA. Many buyers are older, local and on mobile, so the site needs large tap targets and readable type, and phone contact must always be reachable.
