const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

export const money = (n) => aud.format(n).replace("A$", "$");

// img is { id, w, h, crop? } from the catalogue; crop removes letterbox bands baked into the photo.
export function imageUrl(img, w, h = w, format = "webp") {
  const id = typeof img === "string" ? img : img.id;
  const c = typeof img === "object" && img.crop;
  const crop = c ? `crop/x_${c[0]},y_${c[1]},w_${c[2]},h_${c[3]}/` : "";
  return `https://static.wixstatic.com/media/${id}/v1/${crop}fill/w_${w},h_${h},q_80,enc_auto/file.${format}`;
}

export const minPrice = (p) => Math.min(...p.variants.map((v) => v.price));

export const firstAvailable = (p) => p.variants.find((v) => v.inStock) || p.variants[0];

// Short size label for chips: "5L Pot" -> "5L", "30 L / 40 cm Pot" -> "30 L / 40 cm".
export const sizeChip = (label) => (label || "Each").replace(/\s*pot\b(?!\s*plant)/i, "").replace(/\s+/g, " ").trim() || "Each";

export const botanical = (p) => p.cultivar || p.specs?.botanical || "";

export const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// First sentences up to a length, for tag backs and summaries.
export function excerpt(text, max = 220) {
  const flat = text.replace(/\n+/g, " ");
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// A stable faux barcode for the stake, derived from the slug.
export function barcodeBars(slug, count = 34) {
  let h = 2166136261;
  const bars = [];
  for (let i = 0; i < count; i++) {
    h ^= slug.charCodeAt(i % slug.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    bars.push(1 + (h % 3));
  }
  return bars;
}
