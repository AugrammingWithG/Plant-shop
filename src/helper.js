// The plant helper: a small chat that answers from the site's own facts and searches the real catalogue.
// It never invents: anything it can't answer goes to a phone / WhatsApp hand-off.
import { icons, lightLabel } from "./icons.js";
import { GROUPS, HEDGE_SIZES, inGroup } from "./groups.js";
import { money, imageUrl, minPrice, botanical, escapeHtml as esc } from "./format.js";
import { PHONE, PHONE_INTL, MIN_ORDER } from "./store.js";

const FACTS = {
  greet: "Hi! I can answer questions about delivery and ordering, or help you find plants. What are you after?",
  area: "We deliver across Perth Metro and Mandurah. If you're not sure your suburb is covered, call or message us and we'll tell you straight away.",
  minimum: `Delivery starts at a ${money(MIN_ORDER)} order. Your order sheet shows how close you are as you add plants.`,
  cost: `Delivery costs aren't listed online. We confirm them with your invoice before you pay. Orders need to reach ${money(MIN_ORDER)} for delivery.`,
  timing: "Deliveries run Mon–Sat, 1–9 pm, and usually arrive within 7–10 business days.",
  hours: "The nursery office is open Mon–Sat, 9 am – 12 noon. We take orders online only, so there's no walk-in shop.",
  payment: "Once we confirm your order we send an invoice. You can pay by credit card, PayPal or Alipay.",
  pickup: "We take orders online only and deliver them. For a special request, call the office Mon–Sat, 9 am – 12 noon.",
  gift: "Yes, we sell gift cards, and they can be used for any purchase. Call or message the nursery to arrange one.",
  care: "Every plant comes with its own care instructions. If one is struggling, check its sunlight, watering and soil first. If it's still unhappy, call us and we'll help you sort it out.",
  order: "Add plants from any tag, then open Your order. Fill in your name, suburb and phone and send it. We confirm stock and your delivery day, then invoice you.",
  contact: "You can call or message the nursery on 0420 493 944. The office is open Mon–Sat, 9 am – 12 noon.",
  status: "For an order you've already sent, call or message 0420 493 944 and quote your order reference.",
};

const PLANT_WORDS = /\b(water ?wise|waterwise|drought|low water|ground ?cover)\b/;
const INTENTS = [
  ["gift", /\b(gift ?cards?|vouchers?)\b/],
  ["status", /\b(order status|my order|track(ing)?|already (ordered|sent))\b/],
  ["minimum", /\b(minimum|min(\.|imum)? order|smallest order)\b/],
  ["cost", /\b(deliver(y|ies)?|shipping|freight)\b.*\b(cost|fee|price|charge|how much)\b|\b(cost|fee|charge|how much)\b.*\b(deliver(y)?|shipping|freight)\b/],
  ["timing", /\b(how long|lead time|when (will|would|does|do).*(arrive|come|deliver)|how soon|eta)\b/],
  ["area", /\b(do you deliver|deliver(y)? (to|area|areas)|which suburbs|what suburbs|mandurah|my suburb|where do you deliver)\b/],
  ["hours", /\b(open|opening|hours|office|closed|weekends?|sunday)\b/],
  ["payment", /\b(pay|payment|credit card|paypal|alipay|afterpay|zip ?pay|invoice|cash)\b/],
  ["pickup", /\b(pick ?up|collect|visit|come (in|by)|walk[- ]?in|showroom|address|where are you)\b/],
  ["order", /\b(how (do|can) i (order|buy)|how to order|checkout|place an order|how does (it|ordering) work)\b/],
  ["contact", /\b(phone|call|contact|talk to|speak to|number|whatsapp|email)\b/],
];
const CARE = /\b(dying|yellow(ing)? leaves|brown (leaves|tips)|wilting|droop(ing|y)?|sick|unhealthy|pests?|bugs|look after|caring for|fertili[sz]e?r?|repot)\b|\bcare\b/;

const GROUP_WORDS = [
  ["hedging", /\b(hedg(e|es|ing)|screen(ing)?|privacy)\b/],
  ["natives", /\bnatives?\b|\baustralian\b/],
  ["indoor", /\b(indoor|inside|house ?plants?|office|apartment)\b/],
  ["trees", /\btrees?\b/],
  ["palms", /\b(palms?|tropical|bamboo|cordylines?|yuccas?)\b/],
  ["succulents", /\b(succulents?|cactus|cacti|aloes?|agaves?)\b/],
  ["grasses", /\b(grass(es)?|flax(es)?|strappy|ground ?covers?)\b/],
  ["climbers", /\b(climb(er|ers|ing)|creepers?|vines?|green walls?|vertical)\b/],
  ["edible", /\b(fruit(ing)?|edible|herbs?|vegetables?|veg(gie)?s?)\b/],
  ["waterwise", /\b(water ?wise|drought|low water|tough|hardy)\b/],
  ["coastal", /\b(coastal|beach|salt|seaside|windy)\b/],
  ["advanced", /\b(advanced|mature|instant)\b/],
  ["supplies", /\b(pottery|planters?|stones?|pebbles?|shade ?cloth|sand|turf)\b/],
  ["shrubs", /\b(shrubs?|bush(es)?)\b/],
];
const STOP = new Set(
  "a an and any are can do for from have i in is it me my need of on or our plant plants please some something that the to want what which with you your under below less than up best good great nice looking ideas idea suggest recommend got sell stock show find".split(" "),
);
const COLOURS = ["red", "white", "purple", "pink", "yellow", "blue", "orange", "lilac", "cream", "mauve"];

export function createHelper({ sheet, getCatalogue, onShowPlant, onAdd, onBrowse }) {
  const log = sheet.querySelector("[data-helper-log]");
  const form = sheet.querySelector("[data-helper-form]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  form.querySelector("button").innerHTML = icons.send;
  sheet.querySelector("[data-close]").innerHTML = icons.close;
  sheet.querySelector("[data-close]").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => e.target === sheet && sheet.close());
  let started = false;

  function open() {
    if (!sheet.open) sheet.showModal();
    if (!started) {
      started = true;
      bot(`<p>${FACTS.greet}</p>`, ["What areas do you deliver to?", "Natives for full sun", "Hedging up to 1 m", "Indoor plants under $20", "How does ordering work?"]);
    }
    form.q.focus();
  }

  function scroll() {
    log.scrollTo({ top: log.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }

  function me(text) {
    log.insertAdjacentHTML("beforeend", `<div class="msg msg--me"><p>${esc(text)}</p></div>`);
    scroll();
  }

  function bot(html, chips = [], extra = "") {
    const el = document.createElement("div");
    el.className = "msg msg--bot";
    el.innerHTML = `${html}${extra}${chips.length ? `<div class="msg__chips">${chips.map((c) => `<button type="button" data-ask="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : ""}`;
    log.append(el);
    scroll();
    return el;
  }

  function handOff(prefix) {
    return `<p>${prefix}</p><p class="msg__contact">
      <a href="tel:+${PHONE_INTL}">${icons.phone}<span>Call ${PHONE}</span></a>
      <a href="https://wa.me/${PHONE_INTL}" target="_blank" rel="noopener">${icons.whatsapp}<span>WhatsApp</span></a></p>`;
  }

  function answer(text) {
    const t = text.toLowerCase().replace(/[’']/g, "'").trim();
    if (!t) return;
    if (/^(hi|hello|hey|g'?day|hiya)\b[!. ]*$/.test(t)) return bot(`<p>${FACTS.greet}</p>`, ["Natives for full sun", "What areas do you deliver to?"]);
    if (/\b(thanks|thank you|cheers|ta)\b/.test(t) && t.length < 30) return bot("<p>No worries! Anything else I can help with?</p>");

    const plantish = PLANT_WORDS.test(t);
    if (!plantish) {
      if (CARE.test(t)) return bot(handOff(FACTS.care));
      for (const [key, re] of INTENTS) {
        if (re.test(t)) {
          const html = key === "contact" || key === "status" ? handOff(FACTS[key]) : `<p>${FACTS[key]}</p>`;
          const follow = { area: ["How long does delivery take?", "Is there a minimum order?"], minimum: ["How much is delivery?"], cost: ["What areas do you deliver to?"], order: ["How do I pay?"] }[key] || [];
          return bot(html, follow);
        }
      }
    }
    return findPlants(t);
  }

  function findPlants(t) {
    const { products } = getCatalogue();
    const q = { group: "", size: "", light: [], max: 0, cheap: false, colour: "", words: [] };
    let rest = ` ${t} `;

    const sunRe = /\b(full sun|sunny|hot|afternoon sun|west[- ]facing|north[- ]facing)\b/;
    const partRe = /\b(part(ial)? shade|semi[- ]shade|dappled|morning sun|part sun)\b/;
    const shadeRe = /\b(full shade|shady|south[- ]facing|under (a |the )?trees?|shade(?! ?cloth| ?sail))\b/;
    if (sunRe.test(rest)) q.light.push("sun"), (rest = rest.replace(sunRe, " "));
    if (partRe.test(rest)) q.light.push("part"), (rest = rest.replace(partRe, " "));
    if (shadeRe.test(rest)) q.light.push("shade"), (rest = rest.replace(shadeRe, " "));

    for (const [id, re] of GROUP_WORDS) {
      if (re.test(rest)) {
        q.group = id;
        rest = rest.replace(re, " ");
        break;
      }
    }
    if (q.group === "hedging") {
      if (/\b(small|low|dwarf|compact|border|under (1|one) ?m(etre)?|up to (1|one) ?m(etre)?)\b/.test(rest)) q.size = "small";
      else if (/\b(1 ?(-|–|to) ?2 ?m|medium|mid)\b/.test(rest)) q.size = "medium";
      else if (/\b(tall|large|big|high|over 2 ?m|2 ?m ?\+?|2 ?metres?)\b/.test(rest)) q.size = "large";
    }
    // "up to 1 m" is a height, not a budget.
    const budget =
      rest.match(/\b(?:under|below|less than|max(?:imum)?|up to|cheaper than)\s*\$?\s*(\d{1,4})\b(?!\s*(?:m|metres?|meters?|cm)\b)/) ||
      rest.match(/\$\s*(\d{1,4})\b/);
    if (budget) (q.max = +budget[1]), (rest = rest.replace(budget[0], " "));
    if (/\b(cheap|budget|affordable|inexpensive)\b/.test(rest)) q.cheap = true;
    const colour = COLOURS.find((c) => new RegExp(`\\b${c}\\b`).test(rest) && /\b(flower|flowers|flowering|bloom|blooms)\b/.test(rest));
    if (colour) q.colour = colour;

    q.words = rest
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w) && !COLOURS.includes(w) && !/^(flowers?|flowering|blooms?|small|low|dwarf|compact|tall|large|big|cheap|budget|metres?|spot|garden|yard|area|pot)$/.test(w));

    const anyFilter = q.group || q.light.length || q.max || q.colour || q.cheap;
    const score = (p) => {
      const name = `${p.name} ${p.cultivar} ${p.specs.botanical || ""}`.toLowerCase();
      const hay = `${name} ${p.categories.join(" ")} ${p.description}`.toLowerCase();
      let s = 0;
      for (const w of q.words) {
        if (name.includes(w)) s += 3;
        else if (hay.includes(w)) s += 1;
        else if (!anyFilter) return -1;
      }
      return s;
    };
    const run = (light) =>
      products
        .filter((p) => p.inStock)
        .filter((p) => !q.group || inGroup(p, q.group, q.size))
        .filter((p) => light.every((l) => p.light.includes(l)))
        .filter((p) => !q.max || minPrice(p) <= q.max)
        .filter((p) => !q.colour || `${p.specs.flower || ""} ${p.description}`.toLowerCase().includes(q.colour))
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s >= 0 && (anyFilter || x.s > 0))
        .sort((a, b) => b.s - a.s || (q.cheap || q.max ? minPrice(a.p) - minPrice(b.p) : 0));

    if (!anyFilter && !q.words.length) {
      return bot(handOff("I'm not sure about that one, and I'd rather not guess. The nursery can help:"), ["What areas do you deliver to?", "Natives for full sun"]);
    }

    let hits = run(q.light);
    let relaxed = false;
    if (!hits.length && q.light.length) {
      hits = run([]);
      relaxed = hits.length > 0;
    }
    if (!hits.length) {
      return bot(handOff("I couldn't find a match in stock right now. The nursery may have something coming in, so it's worth asking:"), ["Natives for full sun", "Hedging up to 1 m"]);
    }

    const desc = describe(q, relaxed);
    const top = hits.slice(0, 4).map((h) => h.p);
    const el = bot(
      `<p>${relaxed ? `Nothing is tagged for exactly that light, but here are ${top.length} of ${hits.length} ${desc}. Check the light on each one.` : `Here ${top.length === 1 ? "is" : "are"} ${top.length} of ${hits.length} ${desc}:`}</p>`,
      [],
      `<ul class="minis">${top.map(miniHtml).join("")}</ul>${
        hits.length > top.length
          ? `<button type="button" class="msg__browse" data-browse>See all ${hits.length} in the plant bed</button>`
          : ""
      }`,
    );
    el.querySelector("[data-browse]")?.addEventListener("click", () => {
      sheet.close();
      onBrowse({ group: q.group, size: q.size, light: relaxed ? [] : q.light, q: q.words.join(" ") });
    });
  }

  function describe(q, relaxed) {
    const lightTxt = !relaxed && q.light.length ? ` for ${q.light.map((l) => lightLabel[l].toLowerCase()).join(" or ")}` : "";
    const groupTxt = q.group ? GROUPS.find((g) => g.id === q.group).label.toLowerCase() : "plants";
    const sizeTxt = q.size ? `, ${HEDGE_SIZES.find((s) => s.id === q.size).label.toLowerCase()},` : "";
    const wordsTxt = q.words.length ? ` matching “${esc(q.words.join(" "))}”` : "";
    const colourTxt = q.colour ? ` with ${q.colour} flowers` : "";
    const maxTxt = q.max ? ` under ${money(q.max)}` : "";
    return `${groupTxt}${sizeTxt}${wordsTxt}${colourTxt}${lightTxt}${maxTxt} in stock`;
  }

  function miniHtml(p) {
    const single = p.variants.length === 1 && p.variants[0].inStock;
    return `<li class="mini">
      ${p.images[0] ? `<img src="${imageUrl(p.images[0], 112, 132)}" alt="" width="56" height="66" loading="lazy">` : "<span></span>"}
      <div class="mini__what">
        <a href="#plant/${p.slug}" data-mini-open="${p.slug}">${esc(p.name)}</a>
        <span>${botanical(p) ? `<em>${esc(botanical(p))}</em> · ` : ""}${p.variants.length > 1 ? "from " : ""}${money(minPrice(p))}</span>
      </div>
      ${
        single
          ? `<button type="button" class="mini__add" data-mini-add="${p.slug}" data-variant="${p.variants[0].id}" aria-label="Add ${esc(p.name)} to your order">${icons.plus}</button>`
          : `<button type="button" class="mini__add" data-mini-open="${p.slug}" aria-label="Choose a size for ${esc(p.name)}">${icons.next}</button>`
      }
    </li>`;
  }

  log.addEventListener("click", (e) => {
    const ask = e.target.closest("[data-ask]");
    if (ask) {
      me(ask.dataset.ask);
      setTimeout(() => answer(ask.dataset.ask), reduce ? 0 : 240);
      return;
    }
    const openBtn = e.target.closest("[data-mini-open]");
    if (openBtn) {
      e.preventDefault();
      sheet.close();
      onShowPlant(openBtn.dataset.miniOpen);
      return;
    }
    const add = e.target.closest("[data-mini-add]");
    if (add) {
      onAdd(add.dataset.miniAdd, add.dataset.variant, add);
      add.innerHTML = icons.check;
      add.classList.add("is-added");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = form.q.value.trim();
    if (!text) return;
    form.q.value = "";
    me(text);
    setTimeout(() => answer(text), reduce ? 0 : 240);
  });

  return { open };
}
