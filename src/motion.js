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
