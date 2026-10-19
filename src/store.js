// Order state: a list of { slug, variantId, qty }, kept in this browser only.
const KEY = "pph-order-v1";
export const MIN_ORDER = 350;
export const PHONE = "0420 493 944";
export const PHONE_INTL = "61420493944";

let lines = read();
const listeners = new Set();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.slug && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function commit(event) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode or storage blocked: the order still works for this visit.
  }
  listeners.forEach((fn) => fn(lines, event));
}

export const order = {
  get lines() {
    return lines;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  add(slug, variantId, qty = 1) {
    const hit = lines.find((l) => l.slug === slug && l.variantId === variantId);
    if (hit) hit.qty = Math.min(99, hit.qty + qty);
    else lines = [...lines, { slug, variantId, qty }];
    commit({ type: "add", slug, variantId });
  },
  setQty(slug, variantId, qty) {
    lines = lines
      .map((l) => (l.slug === slug && l.variantId === variantId ? { ...l, qty: Math.max(0, Math.min(99, qty)) } : l))
      .filter((l) => l.qty > 0);
    commit({ type: "qty", slug, variantId });
  },
  clear() {
    lines = [];
    commit({ type: "clear" });
  },
};

// Resolves stored lines against the catalogue; drops lines whose product or size has gone.
export function resolveLines(bySlug) {
  return lines
    .map((l) => {
      const product = bySlug.get(l.slug);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      return product && variant ? { ...l, product, variant, subtotal: variant.price * l.qty } : null;
    })
    .filter(Boolean);
}
