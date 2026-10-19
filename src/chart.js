// "Stock by bed": one series (plants in stock per bed), columns from one baseline.
// Each column is a button: hover or focus shows its value, and clicking browses that bed.
// Only the largest bed is labelled directly; every value is also in the table view.
import { escapeHtml as esc } from "./format.js";

const TICKS = 4;

function niceMax(v) {
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= v) return m * step;
  return v;
}

// A tiny canopy for the top of each column, after the reference's trees on bars.
const tree = `<svg class="col__tree" viewBox="0 0 24 22" aria-hidden="true"><circle cx="12" cy="9" r="7"/><circle cx="6.5" cy="12" r="4.5"/><circle cx="17.5" cy="12" r="4.5"/><path d="M12 13v9" /></svg>`;

export function renderChart(root, table, rows, { onPick }) {
  const max = niceMax(Math.max(...rows.map((r) => r.value)));
  const top = rows.reduce((a, b) => (b.value > a.value ? b : a));
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((max / TICKS) * i));
  root.innerHTML = `
    <div class="chart__axis" aria-hidden="true">${ticks
      .map((t) => `<span style="--at:${t / max}">${t}</span>`)
      .join("")}</div>
    <div class="chart__cols">${rows
      .map(
        (r, i) => `<button type="button" class="col" data-bed="${r.id}" style="--h:${r.value / max};--i:${i}"
          aria-label="${esc(r.label)}: ${r.value} plants. Browse this bed.">
          <span class="col__bar">${tree}${r === top ? `<span class="col__value">${r.value}</span>` : ""}</span>
          <span class="col__label">${esc(r.label)}</span>
          <span class="col__count" aria-hidden="true">${r.value}</span>
          <span class="col__tip" aria-hidden="true"><strong>${r.value}</strong> plants · ${esc(r.label)}</span>
        </button>`,
      )
      .join("")}</div>`;
  table.querySelector("tbody").innerHTML = rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${r.value}</td></tr>`).join("");
  root.addEventListener("click", (e) => {
    const col = e.target.closest("[data-bed]");
    if (col) onPick(col.dataset.bed);
  });
}
