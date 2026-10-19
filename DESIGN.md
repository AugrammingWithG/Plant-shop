---
name: Pot Plant Heaven Perth
description: A Perth nursery storefront where every plant is its own white stake tag on a nursery-green field.
colors:
  field: "#0d6b38"
  field-deep: "#0a5730"
  field-ink: "#ffffff"
  field-ink-2: "#d3ecdb"
  tag: "#ffffff"
  tag-shade: "#eef2ec"
  tag-edge: "#d6ddd3"
  ink: "#10130f"
  ink-2: "#444c42"
  ink-lift: "#2a2f28"
  flash: "#ffd400"
  flash-deep: "#f2c500"
  red: "#c8321a"
  pot: "#141613"
  pot-ink-2: "#b9c2b6"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 7vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.005em"
    fontVariation: "\"wdth\" 68"
  headline:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.005em"
    fontVariation: "\"wdth\" 62"
  title:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.005em"
    fontVariation: "\"wdth\" 62"
  price:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 62"
  quote:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.02
    fontVariation: "\"wdth\" 75"
  body:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "\"lnum\""
  botanical:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.3
  control:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 750
    letterSpacing: "0.01em"
    fontVariation: "\"wdth\" 85"
  label:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  tag-foot: "6px"
  field: "12px"
  photo: "12px"
  tag: "20px"
  sheet: "26px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  max: "1480px"
  column-gap: "20px"
  tag-row-gap: "56px"
  section-y: "clamp(56px, 7vw, 96px)"
components:
  button-flash:
    backgroundColor: "{colors.flash}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 1.25em"
    height: "48px"
  button-flash-hover:
    backgroundColor: "{colors.flash-deep}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.field-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 1.25em"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.ink-lift}"
  button-ghost:
    textColor: "{colors.field-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 1.25em"
    height: "48px"
  tag-card:
    backgroundColor: "{colors.tag}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "30px 12px 0"
  tag-price-flash:
    backgroundColor: "{colors.flash}"
    textColor: "{colors.ink}"
    typography: "{typography.price}"
    padding: "10px 10px 10px 14px"
  size-chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "32px"
  size-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.field-ink}"
  filter-pill-selected:
    backgroundColor: "{colors.flash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "40px"
  input-field:
    backgroundColor: "{colors.tag}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
    height: "46px"
  out-of-stock-badge:
    backgroundColor: "{colors.red}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Pot Plant Heaven Perth

## Overview

**Creative North Star: "The Nursery Tag"**

Every plant is its own white injection-moulded stake label pushed into a saturated nursery-green bed. The tag is the one object the system is built from: it is the catalogue card, the plant detail sheet (front and back), the hero's 3D label, each line of the order, and even the search box. Each carries a punched hole, rounded shoulders and either a pointed stake below (vertical tags) or a stake to the left (horizontal tags). The page reads as a working nursery bench, not a lifestyle boutique.

Density is high and honest. Hundreds of tags sit in a grid with real photos, pot sizes and prices, and nothing is hidden behind hover. Type is one variable family, Archivo, pulled hard to its narrowest width for names and numbers so long plant names and prices stay big. Process-yellow marks money and the primary action. Signal red appears only when something is out of stock or wrong. Black poly-pot plastic is the deepest ground.

Motion follows the physical tag. Tags rest at a slight tilt and lift upright when you reach for them, sheets arrive with a small settle, and nothing loops or bounces. Under reduced motion, transitions collapse to nothing and the 3D bench gives way to a flat tag.

**Key Characteristics:**
- One object, many jobs: the stake tag is the card, the sheet, the order line and the search field.
- Saturated nursery-green field (never white) as the page ground.
- Black condensed caps for names, italic for botanicals, yellow flash for prices.
- Soft, physical drop shadows under the tags; no flat-UI borders around cards.
- Pill-shaped controls throughout; tag silhouettes reserved for content objects.

## Colors

The palette is the nursery itself: green bed, white tag plastic, black print and pots, a process-yellow price flash, and a red that only warns.

### Primary
- **Nursery Bed Green** (field): the page ground under the header and hero, the "How ordering works" and delivery sections, the 3D tag's brand line, the light-glyph colour on tags, and the success state. White text on it passes AA.
- **Deep Bed Green** (field-deep): the plant-bed section and the order sheet, where the tags sit one step deeper. It also fills the punched holes on tags so they read as holes through to the bed.

### Secondary
- **Price Flash Yellow** (flash): the price band across the foot of every tag, the order-line subtotal, the primary action ("Add to order", "Send by WhatsApp", the header order button), selected filters and sizes, the order meter fill, the focus ring, and text selection. Ink-on-flash is about 13:1.
- **Pressed Flash** (flash-deep): hover state for every flash surface.

### Tertiary
- **Signal Red** (red): out-of-stock badges, invalid field borders and error status text. Nothing else.

### Neutral
- **Tag White** (tag): the face of every tag, sheet, dropdown and input.
- **Tag Shade** (tag-shade): photo wells, light-glyph discs, static chips, quiet hover fills on white, and the order form's tray.
- **Tag Edge** (tag-edge): hairlines and chip outlines on white.
- **Print Black** (ink): all text on tags, the secondary button fill, selected size chips, and rule lines in fact lists.
- **Faded Print** (ink-2): secondary text on tags, such as botanical names, descriptions and fact terms.
- **Ink Lift** (ink-lift): hover for every black button. It is reused, but it lives as a literal value in the stylesheet rather than as a custom property.
- **On-Field White** (field-ink) and **Pale Leaf** (field-ink-2): primary and secondary text on green.
- **Poly-Pot Black** (pot) and **Pot Grey Text** (pot-ink-2): the utility strip and the story section, along with their secondary text. The 3D pot uses the same plastic.

### Named Rules
**The Flash Means Money Rule.** Yellow marks price and the act of buying (price bands, subtotals, primary add/send actions, selected size). It never decorates a heading block or a section background.

**The Red Is a Warning Rule.** Red appears only for out-of-stock, invalid input and error status. It is never an accent.

**The Green Ground Rule.** Content sits on the green field or on a white tag, never on a white page. White surfaces are always objects with a tag silhouette, a sheet or a field.

## Typography

**Display Font:** Archivo Variable (with Archivo, Arial Narrow, system-ui), loaded via Fontsource with the width axis
**Body Font:** Archivo Variable, same family
**Label/Mono Font:** none distinct; labels are Archivo at full width with tracking

**Character:** A single family worked across its width axis. At 62% it is the black condensed caps of a printed nursery tag, at 85 to 88% it is a compact UI voice, and at 100% it is plain, readable body copy. The italic carries botanical names the way a real tag prints them.

### Hierarchy
- **Display** (900, clamp(3.4rem, 7vw, 6rem), 0.88): hero H1 only, uppercase and white, with the second word in flash. It is set at width 68% below 901px and 76% above, where it runs on one line behind the 3D tag.
- **Headline** (900, clamp(2.6rem, 6vw, 4.6rem), 0.9, width 62%): section H2s, uppercase, balanced wrap.
- **Title** (900, 1.5rem, 0.95, width 62%): plant common names on tags, uppercase. The same face at 1.3 to 2.4rem titles sheets, how-steps, FAQ and the order head. The plant sheet scales it to clamp(2.2rem, 4vw, 3.4rem).
- **Price** (900, 1.75rem, width 62%, tabular): tag prices, size prices, order subtotals and totals.
- **Quote** (800, clamp(2rem, 5vw, 3.8rem), 1.02, width 75%): Stephen's quote in the story section only.
- **Body** (400, 1.0625rem, 1.55; 1rem under 600px): running copy, capped at 34 to 65ch depending on context.
- **Botanical** (italic 400, 0.92rem, 1.3): Latin names under common names, in faded print.
- **Control** (750, 1rem, width 85%): buttons, pills and nav (nav at 600, width 88%).
- **Label** (700, 0.75 to 0.8rem, 0.1 to 0.14em tracking, uppercase): form legends, definition terms in fact lists, footer column heads, and the printed brand line on a tag back.

### Named Rules
**The Printed Tag Rule.** Plant names, prices and section heads are uppercase, weight 900, width 62%. Botanical names are italic, never caps. Prices always use tabular figures.

**The Label Earns Its Place Rule.** Tracked uppercase labels name a field, a fact or a column. They are never a decorative kicker stacked above a heading.

## Layout

The page width is capped at 1480px, with a responsive side gutter of clamp(16px, 4vw, 56px). The hero is a 12-column grid with a 20px column gap. The headline spans the full width on the back layer, the copy and search take columns 1 to 5, and the 3D stage takes columns 5 to the end, layered over the headline. The plant bed is a 240px sticky category rail beside an auto-fill tag grid (min 228px tracks, 56px row gap so stakes clear the next row). Sections breathe on clamp ramps of about 56 to 140px vertically.

Breakpoints are 1100px (nav hides, how-steps go to 2 columns), 900px (everything stacks, the rail becomes a horizontal pill scroller, the hero reorders to title, pot, buy row, lede, search and categories) and 600px (two-up tags with a smaller tilt, icon-only add and order buttons). Tap targets are 44 to 48px for primary controls.

## Elevation & Depth

Depth is physical. Tags are white plastic lifted off the bed by soft, green-tinted drop shadows (applied as `filter: drop-shadow` so the stake and hole silhouettes cast correctly), and holes are inset shadows punched into the plastic. Controls stay mostly flat. Only the flash button and order button carry a small soft drop, and the sticky header gains a shadow once it is stuck. The 3D bench in the hero is the deepest expression: a lit WebGL pot with a procedural plant and a canvas-painted tag.

### Shadow Vocabulary
- **Tag rest** (`drop-shadow(0 1px 1px rgba(3,25,12,.22)) drop-shadow(0 12px 12px rgba(3,25,12,.28))`): every tag and the search tag.
- **Card lift** (`drop-shadow(0 18px 18px rgba(3,25,12,.3))`): the delivery card, the largest tag.
- **Punched hole** (`inset 0 2px 2px rgba(0,0,0,.45)`): the hole in every tag.
- **Menu drop** (`0 18px 40px -16px rgba(0,0,0,.55)`): the contact dropdown.
- **Header stuck** (`0 10px 24px -14px rgba(0,0,0,.55)`): sticky header after scroll.

### Named Rules
**The Plastic Shadow Rule.** Shadows are soft and tinted toward the green bed, as if the tag were lifted off it. Never use a hard offset shadow.

## Shapes

There are two shape families, and they are never mixed. **Content objects are tags**: rounded shoulders on top (20px, 26px on sheets, 28px on the delivery card), near-square feet (6 to 10px), a punched hole centred near the top, and a pointed stake clipped below. Horizontal tags (the search field, order lines) turn this 90 degrees: 6px corners on the stake side, 16 to 22px on the free end, and the stake points left. **Controls are pills**: buttons, chips, filters, selects and search inputs are fully round (999px), and icon buttons are circles. Photos inside tags use 12 to 14px corners. Order-form text fields are the one exception, at 12px.

## Components

### Buttons
- **Shape:** full pill (999px), 48px tall, 2px transparent border reserved for ghost variants.
- **Flash (primary):** flash fill, ink text, weight 750 at width 85%, with a soft drop and an inset top highlight. Hover: pressed flash.
- **Ink (secondary):** black fill, white text. Hover: ink lift. The tag's "Add" button and the search's "Find it" share this.
- **Ghost:** 70% white outline on green; ghost-ink is a black outline on white.
- **Press:** translateY(1px) scale(.98), using the ease-out curve. Disabled: 45% opacity.
- **Added state:** add buttons turn bed green briefly to confirm.

### Chips
- **Size chips (on tags):** 32px pill, 1.5px tag-edge outline, weight 650 at width 88%. Selected: black fill, white text. Out of stock: struck through. "More sizes": green text, dashed outline.
- **Light filters (on green):** 40px pill with a drawn light glyph and a 40% white outline. Selected: flash fill, ink text.
- **Category stakes (hero):** 38px outlined pill with a tabular count in pale leaf.

### Cards / Containers
- **The Tag (signature):** tag white, 20px shoulders and 6px feet, punched hole, clipped stake, tag-rest shadow, and a per-item tilt of about -1 to 1 degree (reduced to 40% on mobile). Hover or focus: it lifts 10px and straightens on the pull curve. Its stack runs top to bottom: photo well (6:7), condensed name, italic botanical, light-glyph discs, size chips, then a full-bleed flash band with price and an ink "Add" button.
- **Plant sheet:** a tag front (photo gallery, name, categories, barcode) and a tag back (brand line, size list with flash selection, quantity pill, fact list, description) side by side, stacked under 900px.
- **Delivery card:** a large tag with a 2-column fact list ruled in 2px ink. One fact value sits on a flash highlight.

### Inputs / Fields
- **Search tag:** a horizontal white tag with a left stake and hole. Its input sits on a 2px ink underline, with the label set in condensed caps. Focus-within draws a 3px flash ring.
- **Pill search and selects:** white pills with drawn chevrons and magnifier icons inline.
- **Order form fields:** white, 12px radius, 1.5px border. Focus: 3px flash outline plus an ink border. Invalid: red border and ring.

### Navigation
- **Utility strip:** pot black, 0.82rem at width 88%, facts separated by flash dots, phone number in white bold.
- **Header:** sticky on green, with a tag-silhouette wordmark (condensed caps, "PERTH" tracked in flash). Nav links get a 2px flash underline on hover. "Call or message" is an outlined pill that opens a white dropdown. The order button is a flash pill showing a tabular count and total. Nav hides under 1100px.

### Order Line (signature)
Each line in the order sheet is a small horizontal tag on the deep-green sheet, with a left stake, a hole, a thumbnail, condensed caps name, size and unit price, circular stepper buttons (the minus becomes a trash icon at quantity 1), and a flash subtotal panel on the free end. A 14px flash meter above the lines fills toward the $350 minimum.

### Icons
One drawn family on a 24px grid with 1.75 stroke and round caps and joins, drawn in currentColor: sun, part shade, shade, phone, SMS, WhatsApp, search, prev/next, close, plus/minus, check, turn, tag, copy and trash. Light glyphs sit in 30px tag-shade discs in bed green.

## Do's and Don'ts

### Do:
- **Do** build every new content object as a tag: rounded shoulders, punched hole, stake, and the tag-rest shadow.
- **Do** set names, prices and section heads in Archivo 900 at width 62%, uppercase, with tabular figures on every number.
- **Do** put prices on the flash band and keep flash for money, buying and focus.
- **Do** keep controls as pills (999px) at 44 to 48px tall, and circles for icon buttons.
- **Do** use the drawn 24px / 1.75-stroke icon family for any new glyph.
- **Do** let tags tilt at rest and straighten on hover or focus, using the pull curve (cubic-bezier(.22,1,.36,1)), and collapse motion under reduced-motion.

### Don't:
- **Don't** put content on a white page. The ground is the green field, deep green or pot black.
- **Don't** use red for anything except out-of-stock, invalid input or errors.
- **Don't** give a content card plain uniform corners or a 1px border in place of the tag silhouette.
- **Don't** use hard offset shadows. Tag shadows stay soft and green-tinted.
- **Don't** put tracked uppercase kickers or eyebrows above headings. Tracked labels name fields and facts only.
- **Don't** set botanical names in caps or plant common names in sentence case.
