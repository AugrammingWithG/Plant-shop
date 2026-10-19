import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "./styles.css";
import { icons, lightLabel } from "./icons.js";
import { order, resolveLines, MIN_ORDER, PHONE, PHONE_INTL } from "./store.js";
import { money, imageUrl, minPrice, firstAvailable, sizeChip, botanical, escapeHtml as esc, barcodeBars } from "./format.js";
import { GROUPS, HEDGE_SIZES, groupById, inGroup } from "./groups.js";
import { createHelper } from "./helper.js";
import { EMAILJS, emailOrdersEnabled } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const PAGE = 12;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const canMorph = () => typeof document.startViewTransition === "function" && !reduceMotion();

// Hero tags, one per plant form the 3D bench can grow.
const FEATURED = [
  { slug: "golden-cane-palm", form: "palm" },
  { slug: "lilly-pilly-resilience-5l-pot", form: "shrub" },
  { slug: "phormium-chief-new-zealand-flax", form: "strappy" },
  { slug: "giant-bird-of-paradise", form: "paddle" },
  { slug: "echeveria-blue-curl", form: "rosette" },
  { slug: "pom-pom-fern", form: "fern" },
  { slug: "west-australian-weeping-peppermint", form: "tree" },
];

const state = { q: "", bed: "", size: "", light: new Set(), sort: "featured", instock: true, shown: PAGE };
let catalogue = { products: [], categories: [] };
let bySlug = new Map();
let helper = null;

/* ---------- boot ---------- */

injectIcons();
renderContact();
$("[data-year]").textContent = new Date().getFullYear();

fetch(`${import.meta.env.BASE_URL}data/products.json`)
  .then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  })
  .then((data) => {
    catalogue = data;
    bySlug = new Map(data.products.map((p) => [p.slug, p]));
    readUrlState();
    $$("[data-stock-count]").forEach((el) => (el.textContent = data.products.length));
    if (data.syncedAt) {
      const d = new Date(data.syncedAt);
      $("[data-synced]").textContent = `Stock updated ${d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    renderBeds();
    bindTools();
    renderBed();
    bindOrder();
    renderOrder();
    initFeature();
    helper = createHelper({
      sheet: $("[data-helper-sheet]"),
      getCatalogue: () => catalogue,
      onShowPlant: (slug) => showPlant(slug),
      onAdd: (slug, variantId, btn) => addToOrder(slug, variantId, btn),
      onBrowse: browseFromHelper,
    });
    routeFromHash();
  })
  .catch(() => {
    $("[data-tags]").innerHTML = "";
    $("[data-count]").innerHTML = `We couldn't load the plant list just now. Refresh the page, or call <a href="tel:+${PHONE_INTL}">${PHONE}</a> and we'll tell you what's in stock.`;
    $("[data-more]").hidden = true;
  });

window.addEventListener("hashchange", routeFromHash);

// If Wix's image CDN rejects a transformed photo, retry once with the plain JPEG.
document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.retried || !img.src.includes("static.wixstatic.com")) return;
    img.dataset.retried = "1";
    const id = img.src.match(/media\/([^/]+)/)?.[1];
    if (id) img.src = `https://static.wixstatic.com/media/${id}/v1/fill/w_${img.width * 2 || 400},h_${img.height * 2 || 480},q_80/file.jpg`;
  },
  true,
);
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-helper]")) helper?.open();
});

const header = $(".top");
addEventListener("scroll", () => header.classList.toggle("is-stuck", scrollY > 8), { passive: true });

function injectIcons() {
  $$("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icons[el.dataset.icon]));
  $("[data-feature-prev]").innerHTML = icons.prev;
  $("[data-feature-next]").innerHTML = icons.next;
  $("[data-order-sheet] [data-close]").innerHTML = icons.close;
  $(".order-btn").insertAdjacentHTML("afterbegin", icons.tag);
  $(".ask-btn").insertAdjacentHTML("afterbegin", icons.chat);
  const summary = $(".contact summary");
  summary.innerHTML = `${icons.phone}<span class="visually-hidden">${summary.textContent}</span>`;
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
  $("[data-menu-contact]").innerHTML = html;
  $(".menu summary").innerHTML = icons.menu;
  // Close either dropdown on an outside click, and the menu once a link is chosen.
  document.addEventListener("click", (e) => {
    for (const d of $$(".contact, .menu")) {
      if (d.open && (!d.contains(e.target) || e.target.closest(".menu__panel a"))) d.open = false;
    }
  });
}

/* ---------- url state ---------- */

function readUrlState() {
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.bed = groupById(params.get("bed")) ? params.get("bed") : "";
  state.size = state.bed === "hedging" && HEDGE_SIZES.some((s) => s.id === params.get("size")) ? params.get("size") : "";
  state.light = new Set((params.get("light") || "").split(",").filter((v) => v in lightLabel));
  state.sort = params.get("sort") || "featured";
  state.instock = params.get("all") !== "1";
  syncToolsForm();
}

function syncToolsForm() {
  const form = $("[data-tools]");
  form.q.value = state.q;
  form.sort.value = state.sort;
  $$('input[name="light"]', form).forEach((i) => (i.checked = state.light.has(i.value)));
}

function writeUrlState() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.bed) params.set("bed", state.bed);
  if (state.size) params.set("size", state.size);
  if (state.light.size) params.set("light", [...state.light].join(","));
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (!state.instock) params.set("all", "1");
  const qs = params.toString();
  history.replaceState(history.state, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
}

/* ---------- the plant bed ---------- */

function renderBeds() {
  const count = (g) => catalogue.products.filter((p) => inGroup(p, g.id)).length;
  const beds = [{ id: "", label: "Everything", n: catalogue.products.length }, ...GROUPS.map((g) => ({ ...g, n: count(g) })).filter((g) => g.n)];
  const sizes =
    state.bed === "hedging"
      ? `<li class="beds__sizes"><span>Height</span>${[{ id: "", label: "All" }, ...HEDGE_SIZES]
          .map((s) => `<button type="button" data-size="${s.id}" aria-pressed="${state.size === s.id}">${s.label}</button>`)
          .join("")}</li>`
      : "";
  $("[data-beds]").innerHTML =
    beds
      .map((b) => `<li><button type="button" data-bed="${b.id}" aria-pressed="${state.bed === b.id}">${esc(b.label)} <span>${b.n}</span></button></li>`)
      .join("") + sizes;
}

function setBed(id, size = "") {
  state.bed = id;
  state.size = id === "hedging" ? size : "";
  state.shown = PAGE;
  renderBeds();
  renderBed({ animate: true });
}

function bindTools() {
  const form = $("[data-tools]");
  $("[data-beds]").addEventListener("click", (e) => {
    const bed = e.target.closest("[data-bed]");
    if (bed) return setBed(bed.dataset.bed);
    const size = e.target.closest("[data-size]");
    if (size) setBed("hedging", size.dataset.size);
  });
  let t;
  form.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(
      () => {
        state.q = form.q.value.trim();
        state.light = new Set($$('input[name="light"]:checked', form).map((i) => i.value));
        state.sort = form.sort.value;
        state.shown = PAGE;
        renderBed({ animate: true });
      },
      e.target.type === "search" ? 180 : 0,
    );
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  $("[data-toggle-stock]").addEventListener("click", () => {
    state.instock = !state.instock;
    state.shown = PAGE;
    renderBed({ animate: true });
  });
  $("[data-more]").addEventListener("click", () => {
    const first = state.shown;
    state.shown += PAGE;
    renderBed({ appendFrom: first });
    $$("[data-tags] > li")[first]?.querySelector("a")?.focus({ preventScroll: true });
  });
  $("[data-tags]").addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-plant]");
    if (open) {
      e.preventDefault();
      const li = open.closest("[data-slug]");
      showPlant(li.dataset.slug, li.querySelector(".tag__photo img"));
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) addToOrder(add.closest("[data-slug]").dataset.slug, add.dataset.variant, add);
  });

  $("[data-hero-search]").addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = e.currentTarget.q.value.trim();
    state.bed = "";
    state.size = "";
    state.shown = PAGE;
    syncToolsForm();
    renderBeds();
    renderBed({ animate: true });
    $("#bed").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
  });
}

function browseFromHelper({ group, size, light, q }) {
  state.bed = group || "";
  state.size = group === "hedging" ? size || "" : "";
  state.light = new Set(light || []);
  state.q = q || "";
  state.shown = PAGE;
  syncToolsForm();
  renderBeds();
  renderBed({ animate: true });
  $("#bed").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
}

function matches(p, words) {
  if (state.bed && !inGroup(p, state.bed, state.size)) return false;
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

function renderBed({ animate = false, appendFrom = 0 } = {}) {
  writeUrlState();
  const list = filtered();
  const shown = list.slice(0, state.shown);
  const where = state.bed ? ` in ${groupById(state.bed).label.toLowerCase()}` : "";
  $("[data-count]").textContent = list.length
    ? `${list.length} ${list.length === 1 ? "plant" : "plants"}${where}${state.q ? ` matching “${state.q}”` : ""}${state.instock ? ", in stock" : ""}.`
    : "";
  $("[data-toggle-stock]").textContent = state.instock ? "Show sold-out too" : "Hide sold-out";
  $("[data-toggle-stock]").hidden = !list.length && state.instock === false;
  const tags = $("[data-tags]");
  if (appendFrom) {
    tags.insertAdjacentHTML("beforeend", shown.slice(appendFrom).map((p, i) => tagHtml(p, i)).join(""));
  } else {
    tags.innerHTML = list.length ? shown.map((p, i) => tagHtml(p, i)).join("") : emptyHtml();
  }
  if ((animate || appendFrom) && !reduceMotion()) {
    $$(":scope > .tag", tags)
      .slice(appendFrom)
      .forEach((li, i) => {
        li.style.setProperty("--i", Math.min(i, 8));
        li.classList.add("is-entering");
        li.addEventListener("animationend", () => li.classList.remove("is-entering"), { once: true });
      });
  }
  $("[data-more]").hidden = shown.length >= list.length;
  $("[data-more]").textContent = `Show more plants (${list.length - shown.length} more)`;
}

function emptyHtml() {
  const relax = [];
  if (state.light.size) relax.push('<button type="button" data-relax="light">Clear the light filter</button>');
  if (state.bed) relax.push('<button type="button" data-relax="bed">Search every bed</button>');
  if (state.instock) relax.push('<button type="button" data-relax="instock">Include sold-out plants</button>');
  queueMicrotask(() =>
    $$("[data-relax]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.relax === "light") state.light = new Set();
        if (b.dataset.relax === "bed") (state.bed = ""), (state.size = ""), renderBeds();
        if (b.dataset.relax === "instock") state.instock = false;
        syncToolsForm();
        renderBed({ animate: true });
      }),
    ),
  );
  return `<li class="empty"><p class="empty__title">Nothing here yet</p>
    <p>No plants match ${state.q ? `“${esc(state.q)}”` : "those filters"} right now. Try a broader search, <button type="button" class="link-btn" data-open-helper>ask the plant helper</button>, or call <a href="tel:+${PHONE_INTL}">${PHONE}</a>.</p>
    <div class="empty__actions">${relax.join("")}</div></li>`;
}

function lightHtml(p, cls = "light") {
  if (!p.light.length) return "";
  return `<ul class="${cls}" aria-label="Light">${p.light.map((l) => `<li title="${lightLabel[l]}">${icons[l]}<span class="visually-hidden">${lightLabel[l]}</span></li>`).join("")}</ul>`;
}

function tagHtml(p) {
  const img = p.images[0];
  const single = p.variants.length === 1;
  const v0 = firstAvailable(p);
  const action = !p.inStock
    ? `<span class="tag__soldout">Sold out</span>`
    : single
      ? `<button class="tag__btn tag__btn--add" type="button" data-add data-variant="${v0.id}" aria-label="Add ${esc(p.name)} to your order">${icons.plus}<span>Add</span></button>`
      : `<a class="tag__btn" href="#plant/${p.slug}" data-open-plant aria-label="Choose a size for ${esc(p.name)}"><span>Sizes</span>${icons.next}</a>`;
  // Money sits on the tag's yellow flash band, as on the 3D tag and the order lines.
  return `<li class="tag" data-slug="${p.slug}">
    <a class="tag__photo" href="#plant/${p.slug}" data-open-plant tabindex="-1" aria-hidden="true">
      ${img ? `<img src="${imageUrl(img, 400, 480)}" alt="" loading="lazy" decoding="async" width="400" height="480">` : ""}
    </a>
    <div class="tag__body">
      <h3 class="tag__name"><a href="#plant/${p.slug}" data-open-plant>${esc(p.name)}</a></h3>
      ${botanical(p) ? `<p class="tag__bot">${esc(botanical(p))}</p>` : ""}
      <div class="tag__meta">
        <span class="tag__size">${single ? esc(sizeChip(v0.label)) : `${p.variants.length} pot sizes`}</span>
        ${lightHtml(p)}
      </div>
    </div>
    <div class="tag__flash">
      <p class="tag__price">${single ? "" : '<span class="tag__from">from</span> '}${money(minPrice(p))}</p>
      ${action}
    </div>
  </li>`;
}

/* ---------- adding ---------- */

function addToOrder(slug, variantId, sourceEl) {
  const p = bySlug.get(slug);
  const v = p?.variants.find((x) => x.id === variantId);
  if (!v || !v.inStock) return;
  order.add(slug, variantId);
  flyToOrder(sourceEl, p);
  if (sourceEl?.matches?.(".tag__btn--add, .btn")) {
    const label = sourceEl.querySelector("span") || sourceEl;
    const was = label.textContent;
    sourceEl.classList.add("is-added");
    label.textContent = "Added";
    setTimeout(() => {
      sourceEl.classList.remove("is-added");
      label.textContent = was;
    }, 1400);
  }
  announce(`${p.name}${v.label ? `, ${v.label}` : ""} added. Order total ${money(orderTotal())}.`);
}

// A small copy of the plant's photo travels into the Order tag, so it's clear where it went.
function flyToOrder(sourceEl, p) {
  const btn = $(".order-btn");
  const bump = () => {
    btn.classList.remove("is-bumped");
    void btn.offsetWidth;
    btn.classList.add("is-bumped");
  };
  const from = sourceEl?.closest?.("[data-slug], .mini, .ptag, .hero")?.querySelector("img") || null;
  if (reduceMotion() || !from || !p.images[0]) return bump();
  const a = from.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  if (!a.width || a.bottom < 0 || a.top > innerHeight) return bump();
  const ghost = Object.assign(document.createElement("img"), { src: imageUrl(p.images[0], 120, 120), alt: "" });
  ghost.className = "fly";
  const size = 64;
  Object.assign(ghost.style, { left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px` });
  document.body.append(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  ghost
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 40}px) scale(0.75)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.2 },
      ],
      { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    )
    .finished.then(() => {
      ghost.remove();
      bump();
    });
}

const live = Object.assign(document.createElement("p"), { className: "visually-hidden" });
live.setAttribute("aria-live", "polite");
document.body.append(live);
function announce(msg) {
  live.textContent = "";
  setTimeout(() => (live.textContent = msg), 30);
}

/* ---------- plant sheet (#plant/slug), with a photo morph from its tag ---------- */

const plantSheet = $("[data-plant-sheet]");
let lastFocus = null;
let openSlug = null;

function routeFromHash() {
  const m = location.hash.match(/^#plant\/(.+)$/);
  if (m && bySlug.has(m[1])) {
    if (openSlug !== m[1]) openPlant(bySlug.get(m[1]));
  } else if (plantSheet.open) closePlant({ fromHistory: true });
  if (location.hash === "#order") openOrder();
}

function showPlant(slug, fromImg) {
  const p = bySlug.get(slug);
  if (!p) return;
  if (location.hash !== `#plant/${slug}`) history.pushState(null, "", `${location.pathname}${location.search}#plant/${slug}`);
  if (!fromImg || !canMorph()) return openPlant(p);
  fromImg.style.viewTransitionName = "plant-photo";
  const t = document.startViewTransition(() => {
    fromImg.style.viewTransitionName = "";
    openPlant(p, { morph: true });
  });
  t.finished.finally(() => {
    const img = $(".ptag__gallery img", plantSheet);
    if (img) img.style.viewTransitionName = "";
    plantSheet.removeAttribute("data-morph");
  });
}

function openPlant(p, { morph = false } = {}) {
  if (!plantSheet.open) lastFocus = document.activeElement;
  openSlug = p.slug;
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
        <p class="ptag__brand" aria-hidden="true">Pot Plant Heaven · Perth</p>
        <div class="ptag__gallery">
          ${p.images.map((img, i) => `<img src="${imageUrl(img, 720, 820)}" alt="${i ? "" : esc(p.name)}" ${i ? 'loading="lazy"' : ""} width="720" height="820"${!i && morph ? ' style="view-transition-name: plant-photo"' : ""}>`).join("")}
        </div>
        <div class="ptag__id">
          <h2 class="ptag__name" id="plant-title">${esc(p.name)}</h2>
          ${botanical(p) ? `<p class="tag__bot">${esc(botanical(p))}</p>` : ""}
          ${lightHtml(p)}
        </div>
        <div class="ptag__barcode" aria-hidden="true">${barcodeBars(p.slug).map((w) => `<i style="--w:${w}"></i>`).join("")}</div>
      </div>
      <div class="ptag__back">
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
        ${p.categories.length ? `<p class="ptag__beds">${GROUPS.filter((g) => inGroup(p, g.id)).slice(0, 4).map((g) => `<button type="button" data-sheet-bed="${g.id}">${esc(g.label)}</button>`).join("")}</p>` : ""}
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
    const variantId = form.querySelector('[name="variant"]:checked')?.value;
    const qty = Math.max(1, Math.min(99, +form.qty.value || 1));
    const v = p.variants.find((x) => x.id === variantId);
    if (!v?.inStock) return;
    order.add(p.slug, variantId, qty);
    flyToOrder(e.submitter, p);
    $(".buy__note", form).innerHTML = `${qty} × ${esc(v.label || p.name)} added. <button type="button" data-open-order>View your order</button>`;
  });
  $$("[data-sheet-bed]").forEach((b) =>
    b.addEventListener("click", () => {
      closePlant();
      setBed(b.dataset.sheetBed);
      $("#bed").scrollIntoView();
    }),
  );
  $(".sheet__close").addEventListener("click", () => closePlant());
  document.title = `${p.name} | Pot Plant Heaven Perth`;
  if (morph) plantSheet.setAttribute("data-morph", "");
  if (!plantSheet.open) plantSheet.showModal();
  plantSheet.scrollTop = 0;
  $(".ptag", plantSheet).scrollTop = 0;
  $(".sheet__close").focus({ preventScroll: true });
}

function closePlant({ fromHistory = false } = {}) {
  if (!plantSheet.open) return;
  if (!fromHistory && location.hash.startsWith("#plant/")) history.pushState(null, "", `${location.pathname}${location.search}`);
  const slug = openSlug;
  const sheetImg = $(".ptag__gallery img", plantSheet);
  const cardImg = $(`[data-tags] [data-slug="${slug}"] .tag__photo img`);
  const r = cardImg?.getBoundingClientRect();
  const cardVisible = r && r.bottom > 0 && r.top < innerHeight;
  if (!canMorph() || !sheetImg || !cardVisible) return plantSheet.close();
  sheetImg.style.viewTransitionName = "plant-photo";
  const t = document.startViewTransition(() => {
    sheetImg.style.viewTransitionName = "";
    cardImg.style.viewTransitionName = "plant-photo";
    plantSheet.close();
  });
  t.finished.finally(() => (cardImg.style.viewTransitionName = ""));
}

plantSheet.addEventListener("close", () => {
  openSlug = null;
  document.title = "Pot Plant Heaven Perth | Plants delivered across Perth & Mandurah";
  if (location.hash.startsWith("#plant/")) history.pushState(null, "", `${location.pathname}${location.search}`);
  lastFocus?.focus?.({ preventScroll: true });
});
plantSheet.addEventListener("cancel", (e) => {
  e.preventDefault();
  closePlant();
});
plantSheet.addEventListener("click", (e) => {
  if (e.target === plantSheet) closePlant();
});

/* ---------- order sheet ---------- */

const orderSheet = $("[data-order-sheet]");
const DETAILS_KEY = "pph-details-v1";

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
  if (emailOrdersEnabled()) {
    $("[data-email-field]").hidden = false;
    $("[data-send-email]").hidden = false;
    $("[data-send-whatsapp]").className = "btn btn--ghost-ink";
  }
  // Remember delivery details on this device so repeat customers don't retype them.
  try {
    const saved = JSON.parse(localStorage.getItem(DETAILS_KEY) || "{}");
    for (const k of ["name", "phone", "suburb", "email"]) if (saved[k] && form[k]) form[k].value = saved[k];
  } catch {
    // storage blocked
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendOrder(e.submitter?.value || (emailOrdersEnabled() ? "email" : "whatsapp"));
  });
  form.addEventListener("input", () => form.querySelectorAll("[aria-invalid]").forEach((i) => i.value.trim() && i.removeAttribute("aria-invalid")));
  $("[data-copy]").addEventListener("click", async () => {
    const status = $("[data-order-status]");
    try {
      await navigator.clipboard.writeText(orderMessage(orderRef()));
      status.className = "order__status is-ok";
      status.textContent = `Order copied. Paste it into a message to ${PHONE}.`;
    } catch {
      status.className = "order__status is-error";
      status.textContent = "Couldn't copy automatically. Send by WhatsApp or SMS instead.";
    }
  });
  order.subscribe(renderOrder);
}

function renderOrder() {
  const lines = resolveLines(bySlug);
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const short = MIN_ORDER - total;
  $("[data-order-count]").textContent = count;
  $("[data-order-total]").textContent = money(total);
  $(".order-btn").classList.toggle("has-items", count > 0);
  $(".order-btn").setAttribute("aria-label", `Your order: ${count} ${count === 1 ? "plant" : "plants"}, ${money(total)}`);
  const pct = Math.min(1, total / MIN_ORDER);
  $("[data-progress]").innerHTML = lines.length
    ? `<div class="meter" style="--fill:${pct}" role="img" aria-label="${money(total)} of the ${money(MIN_ORDER)} delivery minimum"><span></span></div>
       <p>${total >= MIN_ORDER ? `<strong>${money(total)}</strong>. You've reached the delivery minimum.` : `<strong>${money(total)}</strong> of ${money(MIN_ORDER)}. Add <strong>${money(short)}</strong> more and we can deliver.`}</p>`
    : "";
  $("[data-lines]").innerHTML = lines.length
    ? lines
        .map(
          (l) => `<li class="line" data-line data-slug="${l.slug}" data-variant="${l.variantId}">
        ${l.product.images[0] ? `<img src="${imageUrl(l.product.images[0], 104, 124)}" alt="" width="52" height="62" loading="lazy">` : "<span></span>"}
        <div class="line__what"><a href="#plant/${l.slug}">${esc(l.product.name)}</a><span>${esc(l.variant.label || "Each")} · ${money(l.variant.price)}</span></div>
        <div class="line__qty">
          <button type="button" data-line-step="-1" aria-label="${l.qty === 1 ? "Remove" : "One fewer"} ${esc(l.product.name)}">${l.qty === 1 ? icons.trash : icons.minus}</button>
          <span aria-label="Quantity">${l.qty}</span>
          <button type="button" data-line-step="1" aria-label="One more ${esc(l.product.name)}">${icons.plus}</button>
        </div>
        <span class="line__sub">${money(l.subtotal)}</span>
      </li>`,
        )
        .join("")
    : `<li class="line line--empty"><p>Your order is empty</p><p>Add plants from any tag and they'll appear here with a running total.</p><a class="btn btn--ink" href="#bed" data-close-to-bed>Browse the plant bed</a></li>`;
  $("[data-close-to-bed]")?.addEventListener("click", () => orderSheet.close());
  $("[data-order-form]").hidden = !lines.length || !$("[data-order-done]").hidden;
  $("[data-order-sum]").innerHTML = `<span>${count} ${count === 1 ? "item" : "items"}</span><strong>${money(total)}</strong>${
    total < MIN_ORDER ? `<em>${money(short)} to the delivery minimum</em>` : ""
  }`;
}

let pendingRef = null;
function orderRef() {
  if (!pendingRef) {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    pendingRef = `PPH-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  }
  return pendingRef;
}

function orderLinesText() {
  return resolveLines(bySlug)
    .map((l) => `${l.qty} × ${l.product.name}${l.variant.label ? ` (${l.variant.label})` : ""}: ${money(l.subtotal)}`)
    .join("\n");
}

function orderMessage(ref) {
  const form = $("[data-order-form]");
  return [
    `Order request ${ref}: Pot Plant Heaven Perth`,
    "",
    orderLinesText(),
    "",
    `Total: ${money(orderTotal())} (to be confirmed on invoice)`,
    "",
    `Name: ${form.name.value.trim()}`,
    `Phone: ${form.phone.value.trim()}`,
    `Suburb: ${form.suburb.value.trim()}`,
    form.email.value.trim() ? `Email: ${form.email.value.trim()}` : "",
    form.notes.value.trim() ? `Notes: ${form.notes.value.trim()}` : "",
  ]
    .filter((l, i, a) => l || a[i - 1])
    .join("\n");
}

function validate(form, status) {
  const missing = ["name", "phone", "suburb"].filter((n) => !form[n].value.trim());
  form.querySelectorAll("[aria-invalid]").forEach((i) => i.removeAttribute("aria-invalid"));
  missing.forEach((n) => form[n].setAttribute("aria-invalid", "true"));
  status.className = "order__status is-error";
  if (missing.length) {
    const names = { name: "your name", phone: "a phone number", suburb: "your suburb" };
    const list = missing.map((n) => names[n]);
    status.textContent = `Add ${list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0]} so we know where to deliver.`;
    form[missing[0]].focus();
    return false;
  }
  if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.value.trim())) {
    form.phone.setAttribute("aria-invalid", "true");
    status.textContent = "That phone number looks short. Check it so we can call you back.";
    form.phone.focus();
    return false;
  }
  const email = form.email.value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.setAttribute("aria-invalid", "true");
    status.textContent = "That email address doesn't look right. Fix it or leave it blank.";
    form.email.focus();
    return false;
  }
  const total = orderTotal();
  if (total < MIN_ORDER) {
    status.textContent = `Delivery starts at ${money(MIN_ORDER)}. Add ${money(MIN_ORDER - total)} more, or call ${PHONE} to talk it through.`;
    return false;
  }
  return true;
}

function saveDetails(form) {
  try {
    const keep = Object.fromEntries(["name", "phone", "suburb", "email"].map((k) => [k, form[k].value.trim()]));
    localStorage.setItem(DETAILS_KEY, JSON.stringify(keep));
  } catch {
    // storage blocked
  }
}

async function sendOrder(via) {
  const form = $("[data-order-form]");
  const status = $("[data-order-status]");
  if (!validate(form, status)) return;
  saveDetails(form);
  const ref = orderRef();

  if (via === "email" && emailOrdersEnabled()) {
    const btn = $("[data-send-email]");
    btn.disabled = true;
    btn.textContent = "Sending…";
    status.className = "order__status";
    status.textContent = "";
    try {
      await emailOrder(ref, form);
      showDone(ref, "email", form);
    } catch {
      status.className = "order__status is-error";
      status.textContent = "We couldn't send that by email just now. Send it by WhatsApp or SMS instead. Nothing has been lost.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Send order request";
    }
    return;
  }

  const text = encodeURIComponent(orderMessage(ref));
  const url = via === "sms" ? `sms:+${PHONE_INTL}?&body=${text}` : `https://wa.me/${PHONE_INTL}?text=${text}`;
  window.open(url, via === "sms" ? "_self" : "_blank", "noopener");
  status.className = "order__status is-ok";
  status.textContent = `Your order ${ref} is ready in ${via === "sms" ? "Messages" : "WhatsApp"}. Press send there, and we'll call to confirm.`;
}

async function emailOrder(ref, form) {
  const params = {
    order_ref: ref,
    customer_name: form.name.value.trim(),
    customer_phone: form.phone.value.trim(),
    customer_suburb: form.suburb.value.trim(),
    customer_email: form.email.value.trim(),
    notes: form.notes.value.trim() || "None",
    order_lines: orderLinesText(),
    order_total: money(orderTotal()),
  };
  const send = (template_id) =>
    fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id, user_id: EMAILJS.publicKey, template_params: params }),
    }).then((r) => {
      if (!r.ok) throw new Error(`EmailJS ${r.status}`);
    });
  await send(EMAILJS.ownerTemplateId);
  if (params.customer_email && EMAILJS.customerTemplateId) {
    // The nursery already has the order; a failed confirmation shouldn't read as a failed order.
    await send(EMAILJS.customerTemplateId).catch(() => {});
  }
}

function showDone(ref, via, form) {
  const done = $("[data-order-done]");
  const email = form.email.value.trim();
  done.innerHTML = `
    <p class="done__ref">${ref}</p>
    <h3 tabindex="-1">Order request sent</h3>
    <p>Thanks, ${esc(form.name.value.trim().split(" ")[0])}. The nursery has your order${email ? `, and a copy is on its way to ${esc(email)}` : ""}. We'll call you on ${esc(form.phone.value.trim())} to confirm stock, delivery day and your invoice.</p>
    <div class="done__actions">
      <button class="btn btn--ink" type="button" data-new-order>Start a new order</button>
      <button class="link-btn" type="button" data-keep>Keep browsing</button>
    </div>`;
  done.hidden = false;
  $("[data-order-form]").hidden = true;
  $("[data-keep]", done).addEventListener("click", () => orderSheet.close());
  $("[data-new-order]", done).addEventListener("click", () => {
    pendingRef = null;
    done.hidden = true;
    form.notes.value = "";
    $("[data-order-status]").textContent = "";
    order.clear();
    orderSheet.close();
  });
  done.querySelector("h3").focus?.();
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
  $("[data-feature-link]").addEventListener("click", (e) => {
    e.preventDefault();
    showPlant(items[index].product.slug);
  });
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
    const p = items[0].product;
    stage.insertAdjacentHTML(
      "beforeend",
      `<div class="flat-tag">${p.images[0] ? `<img src="${imageUrl(p.images[0], 480, 560)}" alt="${esc(p.name)}">` : ""}</div>`,
    );
    return;
  }
  import("./bench3d.js").then(({ createBench }) => {
    bench = createBench(canvas, stage, { onReady: () => stage.classList.add("is-live") });
    const { product, form } = items[index];
    bench.show(product, form, 1, sizeSel.value);
  });
}
