// Scroll motion for the storefront. Everything is visible by default: the inline script in
// index.html adds .motion only when motion is allowed, and drops it again if this module never loads.
const root = document.documentElement;
const enabled = root.classList.contains("motion");
window.__motionReady = true;

const STAGGER = 70;
const MAX_STAGGER = 7;

/* ---------- reveals: elements with [data-reveal] animate in once, in batches ---------- */

const io = enabled
  ? new IntersectionObserver(
      (entries) => {
        const arriving = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        // Elements arriving together stagger in reading order.
        arriving
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
          .forEach((el, i) => {
            el.style.setProperty("--d", `${Math.min(i, MAX_STAGGER) * STAGGER}ms`);
            el.classList.add("is-in");
            io.unobserve(el);
            el.querySelectorAll("[data-count-to]").forEach(countUp);
            if (el.matches("[data-count-to]")) countUp(el);
          });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    )
  : null;

export function reveal(elements, kind) {
  for (const el of elements) {
    if (kind) el.dataset.reveal = kind;
    if (!io) {
      el.classList.add("is-in");
      continue;
    }
    el.classList.remove("is-in", "hung");
    // Once a tag has settled it can swing on hover without replaying its entrance.
    if (el.dataset.reveal === "hang") el.addEventListener("animationend", () => el.classList.add("hung"), { once: true });
    io.observe(el);
  }
}

reveal(document.querySelectorAll("[data-reveal]"));

// Real figures count up from zero the first time they're seen.
function countUp(el) {
  const to = +el.dataset.countTo;
  if (!to || el.dataset.counted) return;
  el.dataset.counted = "1";
  const prefix = el.dataset.prefix || "";
  const start = performance.now() + (parseFloat(getComputedStyle(el.closest("[data-reveal]") || el).getPropertyValue("--d")) || 0);
  const dur = 1100;
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, (now - start) / dur));
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = `${prefix}${Math.round(to * eased)}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = `${prefix}0`;
  requestAnimationFrame(tick);
}

/* ---------- foliage: rendered leaf branches drift at their own depth as the page scrolls ---------- */

const leaves = [...document.querySelectorAll("[data-depth]")];

/* ---------- scroll-linked: hero turn, the ordering journey, the story quote, the header ---------- */

const heroListeners = new Set();
export const onHeroProgress = (fn) => heroListeners.add(fn);

const hero = document.querySelector(".hero");
const how = document.querySelector(".how");
const steps = [...document.querySelectorAll(".how__steps li")];
const header = document.querySelector(".top");

// Wrap the quote's words so they can ink in as the reader moves through the story.
const quote = document.querySelector(".story blockquote p");
let words = [];
if (quote && enabled) {
  const text = quote.textContent.trim().replace(/\s+/g, " ");
  quote.setAttribute("aria-label", text);
  quote.innerHTML = text
    .split(" ")
    .map((w) => `<span class="w" aria-hidden="true">${w}</span>`)
    .join(" ");
  words = [...quote.querySelectorAll(".w")];
}

const clamp = (v) => Math.min(1, Math.max(0, v));
let lastY = scrollY;
let ticking = false;

function update() {
  ticking = false;
  const vh = innerHeight;
  const y = scrollY;

  if (hero) {
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height * 0.9));
    root.style.setProperty("--hero-p", p.toFixed(4));
    heroListeners.forEach((fn) => fn(p));
  }

  if (how && steps.length) {
    // 0 when the steps enter the lower third of the screen, 1 when they reach the upper third.
    const r = how.querySelector(".how__steps").getBoundingClientRect();
    const p = clamp((vh * 0.82 - r.top) / (vh * 0.5));
    how.style.setProperty("--how-p", p.toFixed(4));
    steps.forEach((li, i) => li.classList.toggle("is-lit", p >= (i + 0.35) / steps.length));
  }

  if (words.length) {
    const r = quote.getBoundingClientRect();
    const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.35));
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
  }

  // Leaves nearer the camera (larger depth) slide further than the page; negative depth lags behind.
  for (const leaf of leaves) {
    const r = leaf.getBoundingClientRect();
    const cur = parseFloat(leaf.style.getPropertyValue("--py")) || 0;
    if (r.bottom - cur < -200 || r.top - cur > vh + 200) continue;
    const off = (r.top - cur + r.height / 2 - vh / 2) * +leaf.dataset.depth;
    leaf.style.setProperty("--py", `${(-off).toFixed(1)}px`);
  }

  // The header tucks away while scrolling down the page and returns on the way up.
  if (header) {
    const busy = header.querySelector("details[open]");
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (y < 120 || up || busy) header.classList.remove("is-tucked");
    else if (down) header.classList.add("is-tucked");
  }
  lastY = y;
}

if (enabled) {
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener("resize", update, { passive: true });
  update();
} else {
  words.forEach((w) => w.classList.add("is-lit"));
}

export const motionEnabled = enabled;

/* ---------- pointer: the glasshouse leans toward the cursor ----------
   One smoothed pointer (-1..1 on each axis) drives every layer: [data-px] elements shift by
   their own depth, [data-tilt] panels lean in 3D with a glare, [data-magnetic] buttons pull
   toward the cursor, and the lamp glow follows it. Phones that report tilt use that instead. */

const pointerListeners = new Set();
export const onPointer = (fn) => pointerListeners.add(fn);

const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const pointer = { tx: 0, ty: 0, x: 0, y: 0, cx: innerWidth / 2, cy: innerHeight / 2, gx: innerWidth / 2, gy: innerHeight / 2 };
const pxEls = [...document.querySelectorAll("[data-px]")];
const magnets = [...document.querySelectorAll("[data-magnetic]")];
const glow = document.querySelector(".lamp");
let pRaf = 0;

function pointerFrame() {
  pRaf = 0;
  pointer.x += (pointer.tx - pointer.x) * 0.07;
  pointer.y += (pointer.ty - pointer.y) * 0.07;
  pointer.gx += (pointer.cx - pointer.gx) * 0.16;
  pointer.gy += (pointer.cy - pointer.gy) * 0.16;
  for (const el of pxEls) {
    const d = +el.dataset.px;
    el.style.setProperty("--mx", `${(pointer.x * d * 46).toFixed(2)}px`);
    el.style.setProperty("--my", `${(pointer.y * d * 30).toFixed(2)}px`);
  }
  if (glow) glow.style.transform = `translate3d(${pointer.gx.toFixed(1)}px, ${pointer.gy.toFixed(1)}px, 0)`;
  pointerListeners.forEach((fn) => fn(pointer.x, pointer.y));
  const settled = Math.abs(pointer.tx - pointer.x) < 0.001 && Math.abs(pointer.ty - pointer.y) < 0.001 && Math.abs(pointer.cx - pointer.gx) < 0.5;
  if (!settled) pRaf = requestAnimationFrame(pointerFrame);
}
const kick = () => {
  if (!pRaf) pRaf = requestAnimationFrame(pointerFrame);
};

if (enabled && finePointer) {
  root.classList.add("has-pointer");
  addEventListener(
    "pointermove",
    (e) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      magnetize(e);
      kick();
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer.tx = 0;
    pointer.ty = 0;
    kick();
  });
} else if (enabled && typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
  // Android and other browsers that report tilt without a permission prompt.
  let base = null;
  addEventListener(
    "deviceorientation",
    (e) => {
      if (e.gamma == null || e.beta == null) return;
      base ??= { g: e.gamma, b: e.beta };
      pointer.tx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 25));
      pointer.ty = Math.max(-1, Math.min(1, (e.beta - base.b) / 25));
      kick();
    },
    { passive: true },
  );
}

// Buttons lean toward a cursor within reach, and settle back when it leaves.
function magnetize(e) {
  for (const el of magnets) {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const reach = Math.max(r.width, r.height) * 0.9 + 40;
    const dist = Math.hypot(dx, dy);
    if (dist < reach) {
      const pull = (1 - dist / reach) * 0.35;
      el.style.translate = `${(dx * pull).toFixed(1)}px ${(dy * pull).toFixed(1)}px`;
      el.classList.add("is-pulled");
    } else if (el.classList.contains("is-pulled")) {
      el.style.translate = "";
      el.classList.remove("is-pulled");
    }
  }
}

/* ---------- tilt: glass panels and plant cards lean toward the cursor ---------- */

if (enabled && finePointer) {
  let active = null;
  const reset = (el) => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
    el.classList.remove("is-tilting");
  };
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = e.target.closest?.(".tag, [data-tilt]");
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const amp = +(el.dataset.tilt || 7);
      el.classList.add("is-tilting");
      el.style.setProperty("--rx", `${((0.5 - ny) * amp).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((nx - 0.5) * amp).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => active && reset(active));
}

/* ---------- terrain: layered contour lines, like the sand hills in a botanical report ---------- */

export function drawTerrain(svg) {
  if (!svg) return;
  const W = 1200;
  const H = 520;
  const layers = 14;
  const paths = [];
  for (let k = 0; k < layers; k++) {
    const t = k / (layers - 1);
    const pts = [];
    for (let x = -40; x <= W + 40; x += 40) {
      const hill = 230 * Math.exp(-(((x - 820) / 300) ** 2)) + 120 * Math.exp(-(((x - 260) / 220) ** 2));
      const ripple = Math.sin(x / 90 + k * 0.7) * 6;
      pts.push([x, H - 40 - k * 18 - (hill * (1 - t * 0.85)) - ripple]);
    }
    // Catmull-Rom through the points, as cubic Béziers.
    let d = `M${pts[0][0]},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1].toFixed(1)}`;
    }
    paths.push(`<path d="${d}" style="--k:${k}" />`);
  }
  svg.innerHTML = paths.join("");
}
