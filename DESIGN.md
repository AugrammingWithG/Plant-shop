---
name: Pot Plant Heaven Perth
description: Every plant is its own nursery stake label, shown in daylight with room to breathe.
colors:
  leaf-white: "#f4f7f1"
  tag-white: "#ffffff"
  hairline: "#dde5d8"
  hairline-strong: "#c3cfbe"
  potting-ink: "#142219"
  potting-ink-soft: "#4a584e"
  nursery-green: "#0d6b38"
  nursery-green-hover: "#0b5c30"
  green-wash: "#e3efe2"
  shade-house-deep: "#0a3a22"
  on-deep-soft: "#c5dccb"
  price-flash: "#ffd400"
  price-flash-deep: "#f0c400"
  sold-out-red: "#b8321a"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6.4vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.005em"
    fontVariation: "\"wdth\" 72"
  headline:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: "\"wdth\" 72"
  sheet-title:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: "\"wdth\" 72"
  quote:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.15
    fontVariation: "\"wdth\" 82"
  title:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 700
    lineHeight: 1.22
    fontVariation: "\"wdth\" 88"
  price:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 70"
  body:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"lnum\""
  label:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  hole: "50%"
  stake-tag: "6px 20px 20px 6px"
  order-line: "6px 14px 14px 6px"
  photo: "12px"
  field: "12px"
  menu: "16px"
  tag: "18px 18px 10px 10px"
  sheet-tag: "24px 24px 12px 12px"
  pill: "999px"
spacing:
  page-pad: "clamp(16px, 4vw, 56px)"
  max-width: "1360px"
  edge: "max(var(--pad), calc((100vw - var(--max)) / 2 + var(--pad)))"
  section-y: "clamp(64px, 8vw, 112px)"
  tag-gap-row: "36px"
  tag-gap-col: "26px"
  sheet-pad: "22px"
components:
  button-flash:
    backgroundColor: "{colors.price-flash}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  button-flash-hover:
    backgroundColor: "{colors.price-flash-deep}"
  button-ink:
    backgroundColor: "{colors.potting-ink}"
    textColor: "{colors.tag-white}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  button-ghost:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  header-pill:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  order-pill-filled:
    backgroundColor: "{colors.nursery-green}"
    textColor: "{colors.tag-white}"
    rounded: "{rounded.pill}"
    height: "44px"
  bed-chip:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  bed-chip-selected:
    backgroundColor: "{colors.nursery-green}"
    textColor: "{colors.tag-white}"
  plant-tag:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.tag}"
    padding: "26px 10px 0"
  price-flash-band:
    backgroundColor: "{colors.price-flash}"
    textColor: "{colors.potting-ink}"
    padding: "9px 10px 9px 16px"
  field:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
    height: "46px"
  chat-bot:
    backgroundColor: "{colors.tag-white}"
    textColor: "{colors.potting-ink}"
    padding: "12px 14px"
  chat-me:
    backgroundColor: "{colors.nursery-green}"
    textColor: "{colors.tag-white}"
    padding: "10px 14px"
---

# Design System: Pot Plant Heaven Perth

## Overview

**Creative North Star: "The Nursery Tag in Daylight"**

Every plant is its own white plastic stake label: the catalogue card, the plant sheet and the order line are all tags. They hang on a pale leaf-white ground, the way labels look on a bench in the morning. The system is calm on purpose. One deep nursery green does the speaking, one process yellow marks money, and everything else is white tag plastic, potting-soil ink and hairline rules. Room to breathe replaces the earlier drenched-green treatment, so the plants and their prices carry the page.

The tag is a physical object with fixed anatomy: rounded shoulders, a punched hole at the top centre, the plant photo, a normal-case name, an italic botanical line, light icons, and a full-width yellow price flash at the foot. Stakes (the pointed spike) appear only where a tag is shown driven into something: the 3D tag in the pot, the hero search tag and the order lines. Grid tags hang flat without tilt or stake and lift on soft shadows.

Motion is quick and physical. It uses exponential ease-out with no bounce, and nothing is hidden until animated. A tag's photo morphs into the plant sheet, an added plant flies into the Order tag, and new tags rise in a short stagger. With reduced motion, only crossfades and state changes remain.

**Key Characteristics:**
- Pale leaf-white ground; white tags; deep green as the single accent.
- Yellow means money, and nothing else is yellow.
- One variable family (Archivo) carries everything, with the width axis as its main voice: condensed caps for headlines, normal-case names on tags.
- Soft, low shadows; hairline rules for structure; no tilt.
- Green owns a whole ground only in the story band; the footer sits on the deepest green.

## Colors

The palette is daylight on a nursery bench: pale leaf-white ground, white plastic, dark soil ink, one nursery green and a process-yellow price flash.

### Primary
- **Nursery Green** (`nursery-green`): the single accent. Used for the hero headline, the wordmark, light icons, the selected bed chip, the filled Order tag, the order meter, the user's chat bubbles, link buttons, the focus ring (2.5px outline, 3px offset) and the whole story band ground. A darker press/hover step (`nursery-green-hover`) is used on green buttons and links.
- **Shade-House Deep** (`shade-house-deep`): the footer ground only, with `on-deep-soft` for footer text and white for headings.

### Secondary
- **Price Flash Yellow** (`price-flash`): money. Used for the band at every tag foot, the price tab on each order line, the selected pot-size row on the plant sheet, and the primary commit buttons ("Add to order", "Send order request", "Send by WhatsApp"). `price-flash-deep` is its hover state.

### Neutral
- **Leaf-White Ground** (`leaf-white`): the page, the side sheets (order, helper), and the punched holes.
- **Tag White** (`tag-white`): every tag face, header pills, chips, inputs and the "How ordering works" band.
- **Green Wash** (`green-wash`): photo placeholders, the count badge on the empty Order tag, and the hover fill on menu rows.
- **Hairline** (`hairline`) and **Hairline Strong** (`hairline-strong`): 1px structural rules, chip and pill borders, and meter tracks.
- **Potting Ink** (`potting-ink`) and **Potting Ink Soft** (`potting-ink-soft`): text and secondary text. Ink is also the dark button ground ("Find it", tag Add, "Send by SMS").
- **Sold-Out Red** (`sold-out-red`): sold-out labels and invalid fields only.

### Named Rules
**The Money Is Yellow Rule.** Yellow appears only where a price or the act of ordering is. If a yellow surface carries no price and commits nothing, it is wrong.

**The One Green Ground Rule.** Green fills a whole band once, in the story. The footer uses the deepest green. Every other section sits on leaf-white or tag-white.

## Typography

**Display Font:** Archivo Variable (with Archivo, Arial Narrow, system-ui)
**Body Font:** Archivo Variable (the same family)

**Character:** This is one hard-working grotesque used the way a label printer would. The width axis carries the hierarchy: heavy condensed caps (72–78% width) shout the headline voice, and normal-width text stays readable for names and care notes.

### Hierarchy
- **Display** (800, `display` clamp, 0.9 line-height, uppercase, 72% width, 78% at 901px and up): the hero H1 only, in nursery green.
- **Headline** (800, `headline` clamp, 0.95, uppercase, 72%): section titles (The Plant Bed, How it works, Delivery, Story). The side-sheet heads use the same voice at 2rem.
- **Sheet title** (800, `sheet-title` clamp, uppercase, 72%): the plant name on the plant sheet's front tag.
- **Quote** (700, `quote` clamp, 1.15, 82%): Stephen's words in the story band, quoted in full.
- **Title** (700, 1.12rem, 1.22, 88%, normal case): the plant name on catalogue tags (1rem on phones). The italic botanical line sits under it at 0.9rem in soft ink.
- **Price** (800, 70% width, tabular numerals): every price, at 1.45rem on tags, 1.35rem on size rows, 1.25rem on order tabs and 1.7rem on the order total.
- **Body** (400, 1.0625rem, 1.6, lining numerals): running text, at 1rem under 600px. Descriptions are capped at 65ch.
- **Label** (600, 0.82–0.95rem, soft ink): fact terms, pot sizes, counts and field labels.

### Named Rules
**The Width Axis Rule.** Hierarchy comes from width and weight in one family. Never add a second typeface; reach for `wdth` 70–88 instead.

**The Normal-Case Name Rule.** Catalogue tag names are normal case so long plant names stay readable. Condensed caps are reserved for headlines, the plant-sheet title and the 3D tag.

## Layout

Content lines up on one edge. A centred column (`max-width` 1360px, `page-pad` side padding) and full-bleed bands share the same left edge through the `edge` token, so a band's background runs to the viewport while its content aligns with the column. The header is sticky on the ground and gains a hairline only once the page scrolls.

The hero is a 12-column grid. The headline spans the full width on the back layer, the copy (lede, search tag, facts line) takes columns 1–5, and the 3D stage takes 6–12 in front of the headline, with its prev/size/Add controls underneath. Under 900px it becomes one column in the order headline, lede, search, facts, then the 3D stage, so the search sits inside the first fold.

The plant bed is an auto-fill grid of tags (min 240px, 36px row and 26px column gaps). Under 600px it is two columns with 20px/12px gaps. The 14 bed chips wrap onto two rows at 1024px and up, and scroll sideways with edge masks below that. Sections breathe with `section-y` vertical padding. Steps run 4 columns, then 2 at 1060px, then 1 at 600px. Delivery is a 7:5 split that stacks at 900px. The footer is a 2:1:1 grid.

Breakpoints are 600, 900, 1024 and 1060px. At 1060px the header nav and contact menu collapse into the compact menu.

## Elevation & Depth

Depth is soft and ambient. Tags rest on a two-layer shadow (a tight 1px contact shadow plus a long, low, negatively spread drop) and lift 4px with a deeper shadow on hover or focus. Tags with stakes (the search tag and order lines) use `filter: drop-shadow` so the clipped stake casts with the tag. Menus and the fly-to-order thumbnail use the lift shadow. Sheets sit over a 42% potting-ink scrim. There are no hard offset shadows and no tilt.

### Shadow Vocabulary
- **Tag at rest** (`box-shadow: 0 1px 2px rgba(20,34,25,.06), 0 12px 28px -18px rgba(20,34,25,.4)`): catalogue tags, empty states, sheet close button.
- **Tag lifted** (`box-shadow: 0 2px 4px rgba(20,34,25,.06), 0 22px 40px -22px rgba(20,34,25,.45)`): tag hover/focus, menus, flat-tag fallback, fly thumbnail.
- **Staked tag** (`filter: drop-shadow(0 1px 1px rgba(20,34,25,.08)) drop-shadow(0 10px 18px rgba(20,34,25,.12))`): the hero search tag. Order lines use the same pair, tightened to 6px 10px at 0.1.
- **Punched hole** (`box-shadow: inset 0 1.5px 2px rgba(0,0,0,.22)`): the hole on every tag face.

### Named Rules
**The Hanging Tag Rule.** Tags hang; they don't float. Shadows stay soft and low, lift is 4px at most, and nothing rotates.

## Shapes

The silhouette is a nursery label. Tags have generous top shoulders and tighter feet (`tag`, `sheet-tag`), and every tag face carries a punched hole at top centre. Staked tags are horizontal, with a small left radius where the stake joins and a pointed stake drawn as a clipped polygon off the left edge (`stake-tag`, `order-line`). Photos sit inset with 12px corners. Controls are full pills or 44px circles. Inputs use 12px corners, or a pill in the helper. Chat bubbles use a 16px radius with one 4px corner pointing at the speaker. Side sheets round only their inner edge (24px) and go square on phones.

## Components

### Buttons
Buttons are tactile pills that scale to 0.98 on press. Every target is at least 44px, and full buttons are 48px.
- **Shape:** full pill (`pill`), 700 weight at 88% width.
- **Flash (primary commit):** yellow with ink text. Used only for adding to the order and sending it. Hover deepens the yellow.
- **Ink:** potting ink with white text, hovering to a lighter ink. Used for search submit, tag Add, SMS send, and start-new-order.
- **Ghost:** tag-white with a strong hairline border that turns ink on hover ("Show more plants", WhatsApp once email is live).
- **Added state:** any add control turns nursery green with white text after adding.
- **Link button:** green, underlined at 1px with a 0.2em offset, for quiet actions ("Copy order", "Keep browsing", "Ask the plant helper").

### Header
A single quiet row on the ground. It holds the wordmark (a green tag glyph with the condensed caps name over tracked "PERTH"), four soft-ink nav links that underline on hover, the "Ask" pill, the call/message circle, and the Order pill. The Order pill shows a count badge and a running total. Once it has items it fills green and its count badge turns yellow, and it bumps (scale 1.07) when a plant lands. Under 1060px the nav and contact collapse into the compact menu. Under 600px "Ask" shrinks to an icon circle that keeps its accessible label.

### Compact Menu
This is a 44px circle that opens a fixed white panel 16px from both sides of the screen. It has a 16px radius, the lift shadow and a 4px drop-in. Section links come first (1.05rem, 650), then a hairline, then call, SMS and WhatsApp rows with icons. Rows fill green-wash on hover.

### Bed Chips
These are pills (40px tall) with a soft-ink count. The selected chip is nursery green with white text and pale-green count. Choosing Hedging reveals height sub-chips (34px) after a hairline divider, and the selected sub-chip is ink. Light filters are 46px pills with a green icon. When checked they fill with green-wash and take a green border and green text.

### Plant Tag (signature)
- **Anatomy:** white face, `tag` radius, `plant-tag` padding, punched hole at top centre, 5:6 photo in a 12px inset frame, normal-case title, italic botanical line, a meta row (pot size or "N pot sizes" plus light icons), and the price flash band.
- **Price flash:** a full-width yellow band bleeding to the tag edges at the foot. It holds the price in condensed tabular figures ("from" in small type when several sizes exist) and one action: a dark "Add" pill for single-size plants, an outlined "Sizes" pill otherwise, or a red "Sold out" chip.
- **States:** rests on the tag shadow and lifts 4px with the lift shadow on hover/focus-within, while the photo scales 1.03.
- **Entrance:** new tags rise 12px and fade in over 500ms, staggered 45ms each and capped at 8 steps.

### Search Tag
The hero search is a blank horizontal staked tag. A condensed green caps label ("What are you planting?") sits over a write-on line (an input with a 1.5px ink underline) and an ink "Find it" pill. Focus outlines the whole tag in green. The catalogue's own search is a plain 46px pill with an inline magnifier.

### Plant Sheet
Two tag faces sit side by side (5:6), each with the `sheet-tag` radius and a darker punched hole. The front holds the small brand imprint printed on the tag, the swipeable photo gallery, the condensed caps title, the botanical line, light icons and a decorative barcode. The back holds the pot-size rows (50px, hairline-divided, with the selected row filled yellow), the quantity stepper and a yellow "Add to order", then a two-column fact list, bed chips and the description at 65ch. On phones the two faces stack and scroll together. The tag photo morphs into the sheet photo via a View Transition (`plant-photo`, 450ms, exponential ease-out) and back on close.

### Order Sheet
A 460px side sheet on the leaf-white ground slides in 32px from the right. It has a sticky condensed caps head, a 10px green meter toward the $350 minimum with plain-language progress, and order lines. Each order line is a small horizontal staked tag: a 52×62 photo, name, size and unit price, a trash/minus and plus stepper, and a yellow price tab that bleeds to the right edge. The form sits on tag-white below a hairline, with fields, a subtotal in condensed figures, and the send buttons (yellow email/WhatsApp, ink SMS, link "Copy order").

### Order Done
The order form is replaced in place by a green reference code (700, 0.08em tracking), a condensed caps heading ("Order request sent"), a plain sentence naming who will call and on which number, an ink "Start a new order" button and a "Keep browsing" link.

### Inputs / Fields
- **Style:** white, 1px mid-grey-green border, 12px radius, 46px minimum height, labels at 0.88rem/600 with "(optional)" in soft ink.
- **Focus:** a 2.5px nursery-green outline.
- **Error:** the border and a 1px ring turn sold-out red, with the message in red in the status line.

### Plant Helper
This side sheet shares the order sheet's frame. The head reads "Plant helper" with a soft-ink subline saying the answers come from the catalogue and delivery info. Bot messages are white bubbles with a hairline and a 4px top-left corner. The user's messages are nursery green with white text and a 4px top-right corner. Each message rises 6px over 350ms. Suggestion chips are 36px leaf-white pills that turn green on hover. Result rows are leaf-white 12px cards: a 56×66 photo, name, botanical name and "from" price, and a 38px circle action. A green "See all N in the plant bed" link follows. The input is a pill with a 48px green send circle on a tag-white footer.

### Story and Footer
The story is the one green band, with a white condensed caps headline, pale-green body copy at 58ch, and Stephen's quote in the quote style. The footer sits on shade-house deep with a condensed caps brand line, link columns at a 36px row height, and a faint white hairline above the small print.

## Do's and Don'ts

### Do:
- **Do** put every price on yellow: the tag flash band, the order-line tab, the selected size row.
- **Do** keep the punched hole on every tag face, and draw stakes only on the 3D tag, the search tag and order lines.
- **Do** use the `edge` token for full-bleed bands so their content shares the column's left edge.
- **Do** animate with the exponential ease-out `cubic-bezier(0.16, 1, 0.3, 1)` and no bounce, and keep every animated element visible without JS.
- **Do** keep tap targets at 44px or more and full buttons at 48px.
- **Do** use 1px hairlines (`hairline`, `hairline-strong`) to divide facts, steps, FAQ rows and size rows.

### Don't:
- **Don't** use yellow for anything that is not money or the order action. That includes decorative fills, highlights and section grounds.
- **Don't** fill a section ground with green other than the story band, or with shade-house deep other than the footer.
- **Don't** tilt grid tags, give them stakes, or use hard offset shadows.
- **Don't** add a second typeface. Use Archivo's width axis instead.
- **Don't** set catalogue tag names in caps.
- **Don't** put small tracked-caps labels above headings. The only tracked caps are the wordmark's "PERTH" and the brand imprint printed on a tag face.
- **Don't** use glyph or emoji icons. Every icon comes from the one drawn SVG family (24px grid, 1.75 stroke, round joins).
- **Don't** float anything over the plants: no popups and no fixed widgets. The helper opens only as a side sheet when asked.
