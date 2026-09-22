import { $ } from "./constants.js";

export function renderProjects(projects) {
  if (!projects || !projects.items) return;

  const grid = $("projectsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  projects.items.forEach((p) => {
    if (p.featured) {
      const card = document.createElement("div");
      card.className =
        "col-span-full rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800 hover:ring-zinc-700 transition";

      card.innerHTML = `
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start sm:items-center gap-4">
            <div class="h-16 w-16 shrink-0 rounded-xl bg-zinc-950/80 p-2 ring-1 ring-zinc-800 flex items-center justify-center">
              <img src="${p.logo}"
                   alt="${p.client}"
                   loading="lazy"
                   class="max-h-12 max-w-full object-contain"
                   onerror="this.style.display='none'" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-base font-bold text-zinc-100">${p.client}</span>
                <span class="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700">
                  ${p.badge || "Featured Tool"}
                </span>
              </div>
              <div class="mt-1 text-xs font-medium text-zinc-300">${p.tagline || ""}</div>
              <p class="mt-1.5 text-xs text-zinc-400 max-w-2xl leading-5">${p.description || ""}</p>
              <div class="mt-2.5 flex flex-wrap gap-1.5">
                ${(p.tags || [])
                  .map(
                    (t) =>
                      `<span class="rounded-full bg-zinc-950/60 px-2.5 py-0.5 text-xs text-zinc-300 ring-1 ring-zinc-800">${t}</span>`
                  )
                  .join(" ")}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
            ${
              p.github
                ? `<a href="${p.github}" target="_blank" rel="noreferrer"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-white transition">
                     <span>View on GitHub</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                       <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                     </svg>
                   </a>`
                : ""
            }
          </div>
        </div>
      `;
      grid.appendChild(card);
    } else {
      const card = document.createElement("div");
      card.className =
        "group w-full flex flex-col items-center justify-center gap-3 rounded-2xl " +
        "bg-zinc-900/40 p-6 ring-1 ring-zinc-800 hover:ring-zinc-700 hover:bg-zinc-900/60 transition";

      card.innerHTML = `
        <div class="h-20 w-full flex items-center justify-center">
          <img src="${p.logo}"
               alt="${p.client}"
               loading="lazy"
               class="h-20 w-20 object-contain opacity-90 transition-transform duration-200 group-hover:scale-105"
               onerror="this.style.display='none'" />
        </div>

        <div class="text-sm font-medium text-zinc-300 text-center tracking-tight transition-colors group-hover:text-zinc-100">
          ${p.client}
        </div>
      `;
      grid.appendChild(card);
    }
  });
}

