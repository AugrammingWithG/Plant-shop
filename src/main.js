import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "./styles.css";
import { icons, lightLabel } from "./icons.js";
import { order, resolveLines, MIN_ORDER, PHONE, PHONE_INTL } from "./store.js";
import { money, imageUrl, minPrice, firstAvailable, sizeChip, botanical, escapeHtml as esc, excerpt, barcodeBars } from "./format.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const PAGE = 24;
const QUICK_CATS = ["Hedging (medium - 1m-2m)", "Natives", "Indoor", "Palms", "Succulents", "Water Wise (Super Tough)"];
const CAT_LABELS = {
  "Hedging (large - 2m+)": "Hedging 2m+",
  "Hedging (medium - 1m-2m)": "Hedging 1–2m",
  "Hedging (small - up to 1m)": "Hedging to 1m",
  "Water Wise (Super Tough)": "Water Wise",
  "Shrubs (small)": "Small shrubs",
};
const catLabel = (name) => CAT_LABELS[name] || name;

// Hero tags, one per plant form the 3D bench can grow.
export const FEATURED = [
  { slug: "golden-cane-palm", form: "palm" },
  { slug: "lilly-pilly-resilience-5l-pot", form: "shrub" },
  { slug: "phormium-chief-new-zealand-flax", form: "strappy" },
  { slug: "giant-bird-of-paradise", form: "paddle" },
  { slug: "echeveria-blue-curl", form: "rosette" },
  { slug: "pom-pom-fern", form: "fern" },
  { slug: "west-australian-weeping-peppermint", form: "tree" },
];

const state = { q: "", cat: "", light: new Set(), sort: "featured", instock: true, shown: PAGE };
let catalogue = { products: [], categories: [] };
let bySlug = new Map();

/* ---------- boot ---------- */

injectIcons();
renderContact();
$("[data-year]").textContent = new Date().getFullYear();

fetch("/data/products.json")
  .then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  })
  .then((data) => {
    catalogue = data;
    bySlug = new Map(data.products.map((p) => [p.slug, p]));
    readUrlState();
    $$("[data-stock-count]").forEach((el) => (el.textContent = data.products.length));
    renderQuickCats();
    renderRail();
    bindTools();
    renderBed();
    bindOrder();
    renderOrder();
    initFeature();
    routeFromHash();
  })
  .catch(() => {
    $("[data-tags]").innerHTML = "";
    $("[data-count]").innerHTML = `We couldn't load the plant list just now. Refresh the page, or call <a href="tel:+${PHONE_INTL}">${PHONE}</a> and we'll tell you what's in stock.`;
    $("[data-more]").hidden = true;
  });

window.addEventListener("hashchange", routeFromHash);

const header = $(".top");
new IntersectionObserver(([e]) => header.classList.toggle("is-stuck", !e.isIntersecting)).observe($(".strip"));

function injectIcons() {
  $$("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icons[el.dataset.icon]));
  $("[data-feature-prev]").innerHTML = icons.prev;
  $("[data-feature-next]").innerHTML = icons.next;
  $("[data-order-sheet] [data-close]").innerHTML = icons.close;
  $(".order-btn").insertAdjacentHTML("afterbegin", icons.tag);
  const summary = $(".contact summary");
  summary.innerHTML = `${icons.phone}<span class="contact__label">${summary.textContent}</span>`;
  summary.setAttribute("aria-label", "Call or message the nursery");
}

function renderContact() {
  const links = [
    { href: `tel:+${PHONE_INTL}`, icon: "phone", label: `Call ${PHONE}` },
    { href: `sms:+${PHONE_INTL}`, icon: "sms", label: "Send an SMS" },
    { href: `https://wa.me/${PHONE_INTL}`, icon: "whatsapp", label: "Message on WhatsApp", external: true },
  ];
  const html = links
    .map((l) => `<li><a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${icons[l.icon]}<span>${l.label}</span></a></li>`)
    .join("");
  $("[data-contact-menu]").innerHTML = `<ul>${html}</ul><p>Office Mon–Sat, 9 am – 12 noon</p>`;
  $("[data-contact-list]").innerHTML = html;
  document.addEventListener("click", (e) => {
    const d = $(".contact");
    if (d.open && !d.contains(e.target)) d.open = false;
  });
}

/* ---------- url state ---------- */

function readUrlState() {
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.cat = catalogue.categories.some((c) => c.name === params.get("cat")) ? params.get("cat") : "";
  state.light = new Set((params.get("light") || "").split(",").filter((v) => v in lightLabel));
  state.sort = params.get("sort") || "featured";
  state.instock = params.get("all") !== "1";
  const form = $("[data-tools]");
  form.q.value = state.q;
  form.sort.value = state.sort;
  form.instock.checked = state.instock;
  $$('input[name="light"]', form).forEach((i) => (i.checked = state.light.has(i.value)));
}

function writeUrlState() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.cat) params.set("cat", state.cat);
  if (state.light.size) params.set("light", [...state.light].join(","));
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (!state.instock) params.set("all", "1");
  const qs = params.toString();
  history.replaceState(history.state, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
}

/* ---------- the plant bed ---------- */

function renderQuickCats() {
  const cats = QUICK_CATS.map((name) => catalogue.categories.find((c) => c.name === name)).filter(Boolean);
  $("[data-quick-cats]").innerHTML = cats
    .map((c) => `<li><button type="button" data-cat="${esc(c.name)}">${esc(catLabel(c.name))}<span>${c.count}</span></button></li>`)
    .join("");
  $("[data-quick-cats]").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    setCategory(btn.dataset.cat);
    $("#bed").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  $("[data-hero-search]").addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = e.currentTarget.q.value.trim();
    state.cat = "";
    state.shown = PAGE;
    $("[data-tools]").q.value = state.q;
    renderRail();
    renderBed();
    $("#bed").scrollIntoView();
    $("#bed-q").focus({ preventScroll: true });
  });
}

function renderRail() {
  const max = Math.max(...catalogue.categories.map((c) => c.count));
  const items = [{ name: "", count: catalogue.products.length, label: "Everything" }, ...catalogue.categories];
  $("[data-rail]").innerHTML = items
    .map(
      (c) => `<li><button type="button" data-cat="${esc(c.name)}" aria-pressed="${state.cat === c.name}" style="--extent:${c.name ? Math.max(0.06, c.count / max) : 1}">
        <span class="rail__name">${esc(c.label || catLabel(c.name))}</span><span class="rail__n">${c.count}</span></button></li>`,
    )
    .join("");
}

function setCategory(name) {
  state.cat = name;
  state.shown = PAGE;
  renderRail();
  renderBed();
}

function bindTools() {
  const form = $("[data-tools]");
  $("[data-rail]").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (btn) setCategory(btn.dataset.cat);
  });
  let t;
  form.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.q = form.q.value.trim();
      state.light = new Set($$('input[name="light"]:checked', form).map((i) => i.value));
      state.sort = form.sort.value;
      state.instock = form.instock.checked;
      state.shown = PAGE;
      renderBed();
    }, e.target.type === "search" ? 160 : 0);
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  $("[data-more]").addEventListener("click", () => {
    const first = state.shown;
    state.shown += PAGE;
    renderBed();
    $$("[data-tags] > li")[first]?.querySelector("a")?.focus();
  });
  $("[data-tags]").addEventListener("change", (e) => {
    if (e.target.matches("[data-size]")) {
      const li = e.target.closest("[data-slug]");
      const p = bySlug.get(li.dataset.slug);
      const v = p.variants.find((x) => x.id === e.target.value);
      li.querySelector("[data-price]").textContent = money(v.price);
      li.querySelector("[data-add]").disabled = !v.inStock;
    }
  });
  $("[data-tags]").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const li = btn.closest("[data-slug]");
    const variantId = li.querySelector("[data-size]:checked")?.value || li.querySelector("[data-size]")?.value;
    addToOrder(li.dataset.slug, variantId, btn);
  });
}

function matches(p, words) {
  if (state.cat && !p.categories.includes(state.cat)) return false;
  if (state.instock && !p.inStock) return false;
  if (state.light.size && ![...state.light].every((l) => p.light.includes(l))) return false;
  if (!words.length) return true;
  const hay = `${p.name} ${p.cultivar} ${p.specs.botanical || ""} ${p.categories.join(" ")} ${p.description}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

function filtered() {
  const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = catalogue.products.filter((p) => matches(p, words));
  const nameHit = (p) => words.length && words.every((w) => `${p.name} ${p.cultivar}`.toLowerCase().includes(w));
  const sorters = {
    featured: (a, b) => nameHit(b) - nameHit(a),
    "price-asc": (a, b) => minPrice(a) - minPrice(b),
    "price-desc": (a, b) => minPrice(b) - minPrice(a),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return list.sort(sorters[state.sort] || sorters.featured);
}

function renderBed() {
  writeUrlState();
  const list = filtered();
  const shown = list.slice(0, state.shown);
  const where = state.cat ? ` in ${catLabel(state.cat)}` : "";
  const spot = state.light.size ? `, suited to ${[...state.light].map((l) => lightLabel[l].toLowerCase()).join(" + ")}` : "";
  $("[data-count]").textContent = list.length
    ? `${list.length} ${list.length === 1 ? "plant" : "plants"}${where}${spot}${state.q ? ` matching “${state.q}”` : ""}`
    : "";
  $("[data-tags]").innerHTML = list.length ? shown.map(tagHtml).join("") : emptyHtml();
  $("[data-more]").hidden = shown.length >= list.length;
  $("[data-more]").textContent = `Show more plants (${list.length - shown.length} left)`;
}

function emptyHtml() {
  const relax = [];
  if (state.light.size) relax.push('<button type="button" data-relax="light">Clear the light filter</button>');
  if (state.cat) relax.push('<button type="button" data-relax="cat">Search every category</button>');
  if (state.instock) relax.push('<button type="button" data-relax="instock">Include sold-out plants</button>');
  queueMicrotask(() =>
    $$("[data-relax]").forEach((b) =>
      b.addEventListener("click", () => {
        const form = $("[data-tools]");
        if (b.dataset.relax === "light") (state.light = new Set()), $$('input[name="light"]', form).forEach((i) => (i.checked = false));
        if (b.dataset.relax === "cat") (state.cat = ""), renderRail();
        if (b.dataset.relax === "instock") (state.instock = false), (form.instock.checked = false);
        renderBed();
      }),
    ),
  );
  return `<li class="empty"><p class="empty__title">No tags in this part of the bed.</p>
    <p>Nothing matches ${state.q ? `“${esc(state.q)}”` : "those filters"} right now. Try a broader search, or call <a href="tel:+${PHONE_INTL}">${PHONE}</a>. We may have it coming in.</p>
    <div class="empty__actions">${relax.join("")}</div></li>`;
}

function lightHtml(p) {
  if (!p.light.length) return "";
  return `<ul class="light" aria-label="Light">${p.light.map((l) => `<li title="${lightLabel[l]}">${icons[l]}<span class="visually-hidden">${lightLabel[l]}</span></li>`).join("")}</ul>`;
}

function tagHtml(p, i) {
  const v0 = firstAvailable(p);
  const tilt = (((p.slug.length * 37 + i * 13) % 7) - 3) * 0.35;
  const sizes = p.variants.slice(0, 4);
  const more = p.variants.length - sizes.length;
  const sizeGroup =
    p.variants.length > 1
      ? `<fieldset class="sizes"><legend class="visually-hidden">${esc(p.option || "Size")}</legend>${sizes
          .map(
            (v) => `<label class="chip${v.inStock ? "" : " chip--out"}"><input type="radio" data-size name="s-${p.id}" value="${v.id}"${v.id === v0.id ? " checked" : ""}><span>${esc(sizeChip(v.label))}</span></label>`,
          )
          .join("")}${more > 0 ? `<a class="chip chip--more" href="#plant/${p.slug}">+${more} sizes</a>` : ""}</fieldset>`
      : `<p class="sizes sizes--one"><input type="hidden" data-size value="${v0.id}"><span class="chip chip--static">${esc(sizeChip(v0.label))}</span></p>`;
  const img = p.images[0];
  return `<li class="tag" data-slug="${p.slug}" style="--tilt:${tilt}deg">
    <a class="tag__photo" href="#plant/${p.slug}" tabindex="-1" aria-hidden="true">
      ${img ? `<img src="${imageUrl(img, 360, 420)}" alt="" loading="lazy" decoding="async" width="360" height="420">` : ""}
      ${p.inStock ? "" : '<span class="tag__out">Sold out</span>'}
    </a>
    <div class="tag__face">
      <h3 class="tag__name"><a href="#plant/${p.slug}">${esc(p.name)}</a></h3>
      ${botanical(p) ? `<p class="tag__bot">${esc(botanical(p))}</p>` : ""}
      ${lightHtml(p)}
      ${sizeGroup}
    </div>
    <div class="tag__flash">
      <p class="tag__price"><span class="visually-hidden">Price </span><span data-price>${money(v0.price)}</span></p>
      <button class="tag__add" type="button" data-add${v0.inStock ? "" : " disabled"} aria-label="Add ${esc(p.name)} to your order">${icons.plus}<span>Add</span></button>
    </div>
  </li>`;
}

/* ---------- adding ---------- */

function addToOrder(slug, variantId, sourceBtn) {
  const p = bySlug.get(slug);
  const v = p?.variants.find((x) => x.id === variantId);
  if (!v || !v.inStock) return;
  order.add(slug, variantId);
  const btn = $(".order-btn");
  btn.classList.remove("is-bumped");
  void btn.offsetWidth;
  btn.classList.add("is-bumped");
  if (sourceBtn) {
    const label = sourceBtn.querySelector("span");
    const was = label?.textContent;
    sourceBtn.classList.add("is-added");
    if (label) label.textContent = "Added";
    setTimeout(() => {
      sourceBtn.classList.remove("is-added");
      if (label) label.textContent = was;
    }, 1400);
  }
  announce(`${p.name}${v.label ? `, ${v.label}` : ""} added. Order total ${money(orderTotal())}.`);
}

const live = Object.assign(document.createElement("p"), { className: "visually-hidden" });
live.setAttribute("aria-live", "polite");
document.body.append(live);
function announce(msg) {
  live.textContent = "";
  setTimeout(() => (live.textContent = msg), 30);
}

/* ---------- plant sheet (#plant/slug) ---------- */

const plantSheet = $("[data-plant-sheet]");
let lastFocus = null;

function routeFromHash() {
  const m = location.hash.match(/^#plant\/(.+)$/);
  if (m && bySlug.has(m[1])) openPlant(bySlug.get(m[1]));
  else if (plantSheet.open) plantSheet.close();
  if (location.hash === "#order") openOrder();
}

function openPlant(p) {
  if (!plantSheet.open) lastFocus = document.activeElement;
  const v0 = firstAvailable(p);
  const facts = [
    p.specs.size && ["Grows to", p.specs.size],
    p.specs.foliage && ["Foliage", p.specs.foliage],
    p.specs.flower && ["Flowers", p.specs.flower],
    p.specs.season && ["Flowering", p.specs.season],
    p.light.length && ["Light", p.light.map((l) => lightLabel[l]).join(", ")],
  ].filter(Boolean);
  const paragraphs = p.description.split("\n").map((t) => `<p>${esc(t)}</p>`).join("");
  const care = p.care.map((c) => `<h3>${esc(c.title)}</h3>${c.text.split("\n").map((t) => `<p>${esc(t)}</p>`).join("")}`).join("");
  $("[data-plant-body]").innerHTML = `
    <button class="icon-btn sheet__close" type="button" data-close aria-label="Close">${icons.close}</button>
    <div class="ptag">
      <div class="ptag__front">
        <div class="ptag__gallery">
          ${p.images.map((id, i) => `<img src="${imageUrl(id, 720, 820)}" alt="${i ? "" : esc(p.name)}" ${i ? 'loading="lazy"' : ""} width="720" height="820">`).join("")}
        </div>
        <div class="ptag__id">
          <h2 class="ptag__name" id="plant-title">${esc(p.name)}</h2>
          ${botanical(p) ? `<p class="tag__bot">${esc(botanical(p))}</p>` : ""}
          ${lightHtml(p)}
          <p class="ptag__cats">${p.categories.slice(0, 4).map((c) => `<a href="?cat=${encodeURIComponent(c)}#bed" data-sheet-cat="${esc(c)}">${esc(catLabel(c))}</a>`).join("")}</p>
        </div>
        <div class="ptag__barcode" aria-hidden="true">${barcodeBars(p.slug).map((w) => `<i style="--w:${w}"></i>`).join("")}</div>
      </div>
      <div class="ptag__back">
        <p class="ptag__brand" aria-hidden="true">Pot Plant Heaven · Perth</p>
        <form class="buy" data-buy>
          <fieldset class="buy__sizes">
            <legend>${esc(p.option || "Size")}</legend>
            ${p.variants
              .map(
                (v) => `<label class="buy__size${v.inStock ? "" : " is-out"}"><input type="radio" name="variant" value="${v.id}"${v.id === v0.id ? " checked" : ""}${v.inStock ? "" : " disabled"}>
                <span class="buy__size-name">${esc(v.label || "Each")}</span><span class="buy__size-price">${v.inStock ? money(v.price) : "Sold out"}</span></label>`,
              )
              .join("")}
          </fieldset>
          <div class="buy__row">
            <div class="qty"><button type="button" data-step="-1" aria-label="One fewer">${icons.minus}</button><input name="qty" type="number" min="1" max="99" value="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="One more">${icons.plus}</button></div>
            <button class="btn btn--flash" type="submit"${p.inStock ? "" : " disabled"}>${p.inStock ? "Add to order" : "Sold out"}</button>
          </div>
          <p class="buy__note" role="status"></p>
        </form>
        ${facts.length ? `<dl class="ptag__facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        <div class="ptag__desc">${paragraphs}${care}</div>
      </div>
    </div>`;
  const form = $("[data-buy]");
  form.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step) form.qty.value = Math.max(1, Math.min(99, (+form.qty.value || 1) + +step.dataset.step));
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const variantId = form.variant?.value || form.querySelector('[name="variant"]')?.value;
    const qty = Math.max(1, Math.min(99, +form.qty.value || 1));
    const v = p.variants.find((x) => x.id === variantId);
    if (!v?.inStock) return;
    order.add(p.slug, variantId, qty);
    $(".buy__note", form).innerHTML = `${qty} × ${esc(v.label || p.name)} added. <button type="button" data-open-order>View your order</button>`;
    $(".order-btn").classList.remove("is-bumped");
    void $(".order-btn").offsetWidth;
    $(".order-btn").classList.add("is-bumped");
  });
  $$("[data-sheet-cat]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closePlant();
      setCategory(a.dataset.sheetCat);
      $("#bed").scrollIntoView();
    }),
  );
  $(".sheet__close").addEventListener("click", closePlant);
  document.title = `${p.name} | Pot Plant Heaven Perth`;
  if (!plantSheet.open) plantSheet.showModal();
  plantSheet.scrollTop = 0;
  $(".sheet__close").focus();
}

function closePlant() {
  if (location.hash.startsWith("#plant/")) history.pushState(null, "", `${location.pathname}${location.search}`);
  if (plantSheet.open) plantSheet.close();
}

plantSheet.addEventListener("close", () => {
  document.title = "Pot Plant Heaven Perth | Plants delivered across Perth & Mandurah";
  if (location.hash.startsWith("#plant/")) history.pushState(null, "", `${location.pathname}${location.search}`);
  lastFocus?.focus?.();
});
plantSheet.addEventListener("click", (e) => {
  if (e.target === plantSheet) closePlant();
});

/* ---------- order sheet ---------- */

const orderSheet = $("[data-order-sheet]");

function orderTotal() {
  return resolveLines(bySlug).reduce((s, l) => s + l.subtotal, 0);
}

function openOrder() {
  if (plantSheet.open) plantSheet.close();
  renderOrder();
  if (!orderSheet.open) orderSheet.showModal();
  $("[data-close]", orderSheet).focus();
}

function bindOrder() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-order]")) openOrder();
  });
  $("[data-close]", orderSheet).addEventListener("click", () => orderSheet.close());
  orderSheet.addEventListener("click", (e) => {
    if (e.target === orderSheet) orderSheet.close();
  });
  orderSheet.addEventListener("close", () => {
    if (location.hash === "#order") history.replaceState(null, "", `${location.pathname}${location.search}`);
  });
  $("[data-lines]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-line-step]");
    if (!b) return;
    const li = b.closest("[data-line]");
    const line = order.lines.find((l) => l.slug === li.dataset.slug && l.variantId === li.dataset.variant);
    if (line) order.setQty(line.slug, line.variantId, line.qty + +b.dataset.lineStep);
  });
  const form = $("[data-order-form]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendOrder(e.submitter?.value || "whatsapp");
  });
  form.addEventListener("input", () => form.querySelectorAll("[aria-invalid]").forEach((i) => i.value.trim() && i.removeAttribute("aria-invalid")));
  $("[data-copy]").addEventListener("click", async () => {
    const status = $("[data-order-status]");
    try {
      await navigator.clipboard.writeText(orderMessage());
      status.className = "order__status is-ok";
      status.textContent = "Order copied. Paste it into a message to 0420 493 944.";
    } catch {
      status.className = "order__status is-error";
      status.textContent = "Couldn't copy automatically. Use WhatsApp or SMS instead.";
    }
  });
  order.subscribe(renderOrder);
}

function renderOrder() {
  const lines = resolveLines(bySlug);
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  $("[data-order-count]").textContent = `${count} ${count === 1 ? "plant" : "plants"}`;
  $("[data-order-total]").textContent = money(total);
  const pct = Math.min(1, total / MIN_ORDER);
  const short = MIN_ORDER - total;
  $("[data-progress]").innerHTML = `
    <div class="meter" style="--fill:${pct}" role="img" aria-label="${money(total)} of the ${money(MIN_ORDER)} delivery minimum"><span></span></div>
    <p>${
      total >= MIN_ORDER
        ? `<strong>${money(total)}</strong>: you've reached the delivery minimum.`
        : `<strong>${money(total)}</strong> of ${money(MIN_ORDER)}. Add <strong>${money(short)}</strong> more and we can deliver.`
    }</p>`;
  $("[data-lines]").innerHTML = lines.length
    ? lines
        .map(
          (l) => `<li class="line" data-line data-slug="${l.slug}" data-variant="${l.variantId}">
        ${l.product.images[0] ? `<img src="${imageUrl(l.product.images[0], 120, 140)}" alt="" width="60" height="70" loading="lazy">` : "<span></span>"}
        <div class="line__what"><a href="#plant/${l.slug}">${esc(l.product.name)}</a><span>${esc(l.variant.label || "Each")} · ${money(l.variant.price)}</span></div>
        <div class="line__qty">
          <button type="button" data-line-step="-1" aria-label="One fewer ${esc(l.product.name)}">${l.qty === 1 ? icons.trash : icons.minus}</button>
          <span aria-label="Quantity">${l.qty}</span>
          <button type="button" data-line-step="1" aria-label="One more ${esc(l.product.name)}">${icons.plus}</button>
        </div>
        <span class="line__sub">${money(l.subtotal)}</span>
      </li>`,
        )
        .join("")
    : `<li class="line line--empty"><p>Your order is empty.</p><p>Add plants from any tag, and they'll appear here with a running total.</p><a class="btn btn--ink" href="#bed" data-close-to-bed>Browse the plant bed</a></li>`;
  $("[data-close-to-bed]")?.addEventListener("click", () => orderSheet.close());
  $("[data-order-form]").hidden = !lines.length;
  $("[data-order-sum]").innerHTML = `<span>${count} ${count === 1 ? "item" : "items"}</span><strong>${money(total)}</strong>${
    total < MIN_ORDER ? `<em>${money(short)} to the delivery minimum</em>` : ""
  }`;
}

function orderMessage() {
  const form = $("[data-order-form]");
  const lines = resolveLines(bySlug);
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  return [
    "Order request: Pot Plant Heaven Perth",
    "",
    ...lines.map((l) => `${l.qty} × ${l.product.name}${l.variant.label ? ` (${l.variant.label})` : ""}: ${money(l.subtotal)}`),
    "",
    `Total: ${money(total)} (to be confirmed on invoice)`,
    "",
    `Name: ${form.name.value.trim()}`,
    `Phone: ${form.phone.value.trim()}`,
    `Suburb: ${form.suburb.value.trim()}`,
    form.notes.value.trim() ? `Notes: ${form.notes.value.trim()}` : "",
  ]
    .filter((l, i, a) => l || a[i - 1])
    .join("\n");
}

function sendOrder(via) {
  const form = $("[data-order-form]");
  const status = $("[data-order-status]");
  const total = orderTotal();
  const missing = ["name", "phone", "suburb"].filter((n) => !form[n].value.trim());
  form.querySelectorAll("[aria-invalid]").forEach((i) => i.removeAttribute("aria-invalid"));
  missing.forEach((n) => form[n].setAttribute("aria-invalid", "true"));
  status.className = "order__status is-error";
  if (missing.length) {
    const names = { name: "your name", phone: "a phone number", suburb: "your suburb" };
    const list = missing.map((n) => names[n]);
    const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0];
    status.textContent = `Add ${joined} so we know where to deliver.`;
    form[missing[0]].focus();
    return;
  }
  if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.value.trim())) {
    form.phone.setAttribute("aria-invalid", "true");
    status.textContent = "That phone number looks short. Check it so we can call you back.";
    form.phone.focus();
    return;
  }
  if (total < MIN_ORDER) {
    status.textContent = `Delivery starts at ${money(MIN_ORDER)}. Add ${money(MIN_ORDER - total)} more, or call ${PHONE} to talk it through.`;
    return;
  }
  const text = encodeURIComponent(orderMessage());
  const url = via === "sms" ? `sms:+${PHONE_INTL}?&body=${text}` : `https://wa.me/${PHONE_INTL}?text=${text}`;
  window.open(url, via === "sms" ? "_self" : "_blank", "noopener");
  status.className = "order__status is-ok";
  status.textContent = `Your order is ready in ${via === "sms" ? "Messages" : "WhatsApp"}. Press send there, and we'll call to confirm.`;
}

/* ---------- hero feature + 3D bench ---------- */

function initFeature() {
  const items = FEATURED.map((f) => ({ ...f, product: bySlug.get(f.slug) })).filter((f) => f.product);
  if (!items.length) return;
  let index = 0;
  let bench = null;
  const sizeSel = $("[data-feature-size]");

  const show = (i, dir = 1) => {
    index = (i + items.length) % items.length;
    const { product: p, form } = items[index];
    const link = $("[data-feature-link]");
    link.href = `#plant/${p.slug}`;
    link.innerHTML = `${esc(p.name)}${botanical(p) ? ` <em>${esc(botanical(p))}</em>` : ""}`;
    sizeSel.innerHTML = p.variants
      .map((v) => `<option value="${v.id}"${v.inStock ? "" : " disabled"}>${esc(v.label || "Each")}: ${money(v.price)}</option>`)
      .join("");
    sizeSel.value = firstAvailable(p).id;
    bench?.show(p, form, dir, sizeSel.value);
  };

  $("[data-feature-prev]").addEventListener("click", () => show(index - 1, -1));
  $("[data-feature-next]").addEventListener("click", () => show(index + 1, 1));
  sizeSel.addEventListener("change", () => bench?.setVariant(sizeSel.value));
  $("[data-feature-add]").addEventListener("click", (e) => addToOrder(items[index].product.slug, sizeSel.value, e.currentTarget));
  show(0);

  const canvas = $("[data-hero-canvas]");
  const stage = $("[data-stage]");
  const hasGL = (() => {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  })();
  if (!hasGL) {
    stage.classList.add("is-flat");
    stage.insertAdjacentHTML("beforeend", `<div class="flat-tag">${tagHtml(items[0].product, 0).replace(/^<li/, "<div").replace(/<\/li>\s*$/, "</div>")}</div>`);
    return;
  }
  import("./bench3d.js").then(({ createBench }) => {
    bench = createBench(canvas, stage, {
      onReady: () => stage.classList.add("is-live"),
      onSwipe: (dir) => show(index + dir, dir),
    });
    const { product, form } = items[index];
    bench.show(product, form, 1, sizeSel.value);
  });
}
