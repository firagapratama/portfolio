import { $ } from "./constants.js";

let vault = null;
let currentVaultFilter = "All";
let isVaultInitialized = false;

export function initVault(vaultData) {
  vault = vaultData;
  if (!vault || !vault.items) return;

  const types = ["All", ...new Set(vault.items.map((i) => i.type))];
  const btn = $("vaultFilterBtn");
  const menu = $("vaultFilterMenu");
  const searchInput = $("vaultSearch");
  const previewModal = $("vaultPreviewModal");
  const previewClose = $("vaultPreviewClose");

  if (!btn || !menu || !searchInput) return;

  // Build dropdown menu items
  menu.innerHTML = "";
  types.forEach((t) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900/60 focus:outline-none";
    item.textContent = t;

    item.onclick = () => {
      currentVaultFilter = t;
      btn.textContent = t;
      menu.classList.add("hidden");
      renderVaultGrid();
    };

    menu.appendChild(item);
  });

  if (!isVaultInitialized) {
    btn.onclick = () => {
      menu.classList.toggle("hidden");
    };

    // Single document listener to avoid memory leaks
    document.addEventListener("click", (e) => {
      const isInside = btn.contains(e.target) || menu.contains(e.target);
      if (!isInside) menu.classList.add("hidden");
    });

    searchInput.addEventListener("input", renderVaultGrid);

    if (previewClose) {
      previewClose.onclick = closePreviewModal;
    }
    if (previewModal) {
      previewModal.onclick = (e) => {
        if (e.target === previewModal) closePreviewModal();
      };
    }

    isVaultInitialized = true;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closePreviewModal();
        menu.classList.add("hidden");
      }
    });
  }

  btn.textContent = currentVaultFilter;
  renderVaultGrid();
}

export function renderVaultGrid() {
  if (!vault || !vault.items) return;

  const q = ($("vaultSearch")?.value || "").trim().toLowerCase();
  const grid = $("vaultGrid");
  if (!grid) return;

  const items = vault.items.filter((i) => {
    const matchType = currentVaultFilter === "All" || i.type === currentVaultFilter;
    const matchQ =
      !q ||
      i.title.toLowerCase().includes(q) ||
      i.summary.toLowerCase().includes(q) ||
      (i.tags || []).join(" ").toLowerCase().includes(q);
    return matchType && matchQ;
  });

  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-8 text-center text-sm text-zinc-500">
        No artifacts found matching "${q}".
      </div>
    `;
    return;
  }

  items.forEach((it) => {
    const card = document.createElement("div");
    card.className =
      "rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-zinc-800 hover:ring-zinc-700 transition hover:bg-zinc-900/40 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xs text-zinc-500">${it.type}</div>
            <div class="mt-1 text-sm font-semibold text-zinc-100">${it.title}</div>
            <p class="mt-2 text-sm text-zinc-400 leading-relaxed">${it.summary}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" data-preview-id="${it.id}"
              class="rounded-full bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-zinc-700 transition">
              preview
            </button>
            <a href="${it.href}" target="_blank" rel="noreferrer"
              class="rounded-full bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 ring-1 ring-zinc-800 transition">
              open ↗
            </a>
          </div>
        </div>
      </div>
      <div class="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
        ${(it.tags || [])
          .map(
            (t) =>
              `<span class="inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 ring-1 ring-zinc-800">${t}</span>`
          )
          .join(" ")}
      </div>
    `;

    const previewBtn = card.querySelector(`[data-preview-id="${it.id}"]`);
    if (previewBtn) {
      previewBtn.onclick = () => openPreviewModal(it);
    }

    grid.appendChild(card);
  });
}

export async function openPreviewModal(it) {
  const modal = $("vaultPreviewModal");
  const titleEl = $("vaultPreviewTitle");
  const typeEl = $("vaultPreviewType");
  const contentEl = $("vaultPreviewContent");
  const extLink = $("vaultPreviewExtLink");

  if (!modal || !contentEl) return;

  if (titleEl) titleEl.textContent = it.title;
  if (typeEl) typeEl.textContent = it.type;
  if (extLink) extLink.href = it.href;

  contentEl.innerHTML = `<div class="py-8 text-center text-zinc-500 text-sm animate-pulse">Loading artifact preview...</div>`;
  modal.classList.remove("hidden");

  try {
    const res = await fetch(it.href);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    if (it.href.endsWith(".csv")) {
      contentEl.innerHTML = renderCsvTable(text);
    } else if (it.href.endsWith(".html")) {
      contentEl.innerHTML = `
        <iframe src="${it.href}" class="w-full h-96 rounded-xl border border-zinc-800 bg-zinc-950"></iframe>
      `;
    } else {
      contentEl.innerHTML = `
        <pre class="max-h-96 overflow-auto rounded-xl bg-zinc-950/80 p-4 text-xs leading-5 text-zinc-200 ring-1 ring-zinc-800 whitespace-pre-wrap break-words">${escapeHtml(text)}</pre>
      `;
    }
  } catch (err) {
    contentEl.innerHTML = `
      <div class="p-4 rounded-xl bg-rose-500/10 text-rose-300 text-xs ring-1 ring-rose-500/30">
        Unable to load preview directly: ${err.message}. You can open it via the link above.
      </div>
    `;
  }
}

export function closePreviewModal() {
  const modal = $("vaultPreviewModal");
  if (modal) modal.classList.add("hidden");
}

function renderCsvTable(csvText) {
  const lines = csvText.trim().split("\n");
  if (!lines.length) return "<p class='text-xs text-zinc-400'>Empty CSV</p>";

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1, 8).map((line) => {
    return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  });

  return `
    <div class="overflow-x-auto rounded-xl ring-1 ring-zinc-800">
      <table class="w-full text-left text-xs text-zinc-300">
        <thead class="bg-zinc-900/80 text-zinc-200 border-b border-zinc-800">
          <tr>
            ${headers.map((h) => `<th class="px-3 py-2 font-semibold">${escapeHtml(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800/60 bg-zinc-950/40">
          ${rows
            .map(
              (r) => `
            <tr>
              ${r.map((c) => `<td class="px-3 py-2 whitespace-nowrap">${escapeHtml(c)}</td>`).join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
