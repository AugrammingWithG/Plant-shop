// Pulls the live Wix store catalogue into public/data/products.json.
// Run with: npm run sync
// The old Wix /shop page only listed one product because its gallery was bound
// to the "Artificial Turf & Accessories" category; every product is still here.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { contentBox, mapLimit } from "./trim-bands.mjs";

const BASE = "https://www.potplantheavenperth.com";
const STORES_APP = "1380b703-ce81-ff05-f115-39571d94dfcd";
const OUT = new URL("../public/data/products.json", import.meta.url);

const model = await (await fetch(`${BASE}/_api/v2/dynamicmodel`)).json();
const headers = { "content-type": "application/json", authorization: model.apps[STORES_APP].instance };

const catRes = await fetch(`${BASE}/_api/wix-ecommerce-storefront-web/api`, {
  method: "POST",
  headers,
  body: JSON.stringify({ query: "query{catalog{categories{list{id name visible}}}}" }),
});
const categoryList = (await catRes.json()).data.catalog.categories.list;
const categoryName = new Map(categoryList.map((c) => [c.id, c.name]));

let raw = [];
for (let offset = 0; ; offset += 100) {
  const res = await fetch(`${BASE}/_api/catalog-reader-server/api/v1/products/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: { paging: { limit: 100, offset } }, includeVariants: true }),
  });
  if (!res.ok) throw new Error(`products query failed: ${res.status}`);
  const page = await res.json();
  raw = raw.concat(page.products);
  if (page.products.length < 100) break;
}

const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&ndash;|&mdash;/g, "–").replace(/&[a-z]+;/g, " ");
const plain = (html = "") =>
  decode(html.replace(/<\/(p|li|div|h\d)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");

// Drops the SEO filler the old site appended ("X for sale in Perth. Buy X online now! Cheap plants Perth.").
const stripSeo = (text) =>
  text.replace(/[^.!?\n]*\bfor sale in Perth[.!]?/gi, "")
    .replace(/[^.!?\n]*\bonline now[.!]?/gi, "")
    .replace(/[^.!?\n]*\bCheap plants Perth[.!]?/gi, "")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{2,}/g, "\n").trim();

// Pulls a quoted cultivar or botanical name out of names like "Peppermint 'Agonis flexuosa'".
const splitName = (raw) => {
  const name = raw.replace(/\b[A-Z]{3,}\b/g, (w) => (w === "PBR" ? w : w[0] + w.slice(1).toLowerCase()));
  const m = name.match(/^(.*?)\s*['‘’"]([^'‘’"]+)['‘’"]\s*(.*)$/);
  return m ? { name: `${m[1]} ${m[3]}`.trim(), cultivar: m[2].trim() } : { name: name.trim(), cultivar: "" };
};

// Some descriptions end in a run-on spec block ("Sunlight Full Sun Flower Colour White ...").
const SPEC_KEYS = [
  "Common Name", "Plant Type", "In highlights list", "Dimensions", "Sunlight", "Wildlife Attracting",
  "Australian Native", "Evergreen", "Flower Colour", "Foliage Colour", "Flowering Season",
  "Botanical Genus", "Botanical Species", "Flower Type", "Foliage Type", "Width", "Height",
];
const SPEC_RE = new RegExp(`(?:^|\\s)(${SPEC_KEYS.join("|")})\\s`, "g");
function splitSpecs(text) {
  const specs = {};
  const prose = [];
  for (const line of text.split("\n")) {
    const hits = [...line.matchAll(SPEC_RE)];
    if (hits.length < 2) { prose.push(line); continue; }
    hits.forEach((m, i) => {
      const start = m.index + m[0].length;
      const end = i + 1 < hits.length ? hits[i + 1].index : line.length;
      specs[m[1]] = line.slice(start, end).trim();
    });
  }
  return { prose: prose.join("\n"), specs };
}

// Light needs, read from the spec block first and the product's own prose second.
// Prose rules are deliberately strict: a wrong glyph is a false claim, a missing one is not.
function lightFrom(specs, prose) {
  if (specs.Sunlight) {
    const t = specs.Sunlight.toLowerCase().split("/").map((s) => s.trim());
    return [
      t.includes("full sun") && "sun",
      t.some((s) => s === "part sun" || s === "part shade") && "part",
      t.some((s) => s === "shade" || s === "full shade") && "shade",
    ].filter(Boolean);
  }
  const src = prose.toLowerCase();
  return [
    /full sun|sunny (to|position|spot|aspect|location|garden)|sun to (part|semi)/.test(src) && "sun",
    /part(ial|ly)? (sun|shade)|semi[- ]shade|partly shaded|dappled|filtered (light|sun)/.test(src) && "part",
    /full shade|deep shade|shade[- ]tolerant|tolerates? (some |full )?shade|shady (spot|position|area|garden)|(?<!partly |semi-|semi )shaded (position|area|spot)/.test(src) && "shade",
  ].filter(Boolean);
}

const products = raw
  .filter((p) => p.visible)
  .map((p) => {
    const variants = (p.variants || [])
      .filter((v) => v.variant.visible !== false)
      .map((v) => ({
        id: v.id,
        label: Object.values(v.choices || {}).join(" / ").replace(/\s+/g, " ").trim(),
        price: v.variant.priceData.price,
        inStock: v.stock?.inStock !== false,
      }))
      .filter((v) => v.price > 0);
    if (!variants.length && p.priceData.price > 0) {
      variants.push({ id: "default", label: "", price: p.priceData.price, inStock: p.stock?.inStock !== false });
    }
    const { name, cultivar } = splitName(decode(p.name));
    const care = (p.additionalInfoSections || [])
      .map((s) => ({ title: decode(s.title || ""), text: stripSeo(plain(s.description)) }))
      .filter((s) => s.text);
    const { prose, specs } = splitSpecs(stripSeo(plain(p.description)));
    const isPlant = (p.productOptions?.[0]?.name || "") === "Pot Size";
    return {
      id: p.id,
      slug: p.slug,
      name,
      cultivar,
      description: prose,
      care,
      light: isPlant ? lightFrom(specs, prose) : [],
      specs: {
        ...(specs.Dimensions && { size: specs.Dimensions }),
        ...(specs["Flower Colour"] && { flower: specs["Flower Colour"] }),
        ...(specs["Foliage Colour"] && { foliage: specs["Foliage Colour"] }),
        ...(specs["Flowering Season"] && { season: specs["Flowering Season"] }),
        ...(specs["Botanical Genus"] && { botanical: `${specs["Botanical Genus"]} ${specs["Botanical Species"] || ""}`.trim() }),
      },
      images: (p.media?.items || [])
        .filter((m) => m.mediaType === "image")
        .slice(0, 4)
        .map((m) => ({ id: m.id, w: m.image?.width || 0, h: m.image?.height || 0 })),
      option: p.productOptions?.[0]?.name || "",
      variants,
      categories: (p.collectionIds || []).map((id) => categoryName.get(id)).filter((n) => n && n !== "All Products"),
      inStock: p.stock?.inStock !== false && variants.some((v) => v.inStock),
      ribbon: p.ribbon || "",
    };
  })
  .filter((p) => p.variants.length);

// The previous sync, if any: lets nightly runs reuse photo analysis and skip no-op writes.
let previous = null;
try {
  previous = JSON.parse(readFileSync(OUT, "utf8"));
} catch {
  // first sync
}
const knownCrops = new Map();
for (const p of previous?.products || []) {
  const img = p.images?.[0];
  if (img && typeof img === "object" && "crop" in img) knownCrops.set(img.id, img.crop);
}

// Crop letterbox bands out of each product's lead photo (the one on its tag).
// crop is [x, y, w, h] in source pixels, or false once a photo is known to have no bands.
let analysed = 0;
await mapLimit(products, 8, async (p) => {
  const img = p.images[0];
  if (!img?.w || !img?.h) return;
  if (knownCrops.has(img.id)) {
    img.crop = knownCrops.get(img.id);
    return;
  }
  const box = await contentBox(img.id);
  if (box === undefined) return; // couldn't fetch or decode: try again next sync
  analysed++;
  img.crop = box
    ? [Math.round(box[0] * img.w), Math.round(box[1] * img.h), Math.round(box[2] * img.w), Math.round(box[3] * img.h)]
    : false;
});
console.log(`analysed ${analysed} new lead photos for letterbox bands`);

const categories = categoryList
  .filter((c) => c.name !== "All Products" && c.visible !== false)
  .map((c) => ({ name: c.name, count: products.filter((p) => p.categories.includes(c.name)).length }))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count);

// Guard against a Wix hiccup wiping the shop: refuse a catalogue that shrank by more than half.
const before = previous?.products?.length || 0;
if (before && products.length < before * 0.5) {
  console.error(`refusing to write: ${products.length} products now vs ${before} before`);
  process.exit(1);
}

const unchanged =
  previous &&
  JSON.stringify({ categories: previous.categories, products: previous.products }) === JSON.stringify({ categories, products });
if (unchanged) {
  console.log(`no catalogue changes (${products.length} products)`);
} else {
  mkdirSync(new URL(".", OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), categories, products }));
  console.log(`wrote ${products.length} products in ${categories.length} categories (${raw.length - products.length} hidden or unpriced skipped)`);
}
