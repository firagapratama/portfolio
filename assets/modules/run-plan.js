import { $ } from "./constants.js";

let runPlan = {};
let onStartCallback = null;

export function initRunPlanModal(pipeline, onStartRun) {
  onStartCallback = onStartRun;

  const closeBtn = $("runPlanClose");
  const cancelBtn = $("runPlanCancel");
  const startBtn = $("runPlanStart");
  const modal = $("runPlanModal");

  if (closeBtn) closeBtn.onclick = closeRunPlanModal;
  if (cancelBtn) cancelBtn.onclick = closeRunPlanModal;

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeRunPlanModal();
    };
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeRunPlanModal();
  });

  if (startBtn) {
    startBtn.onclick = async () => {
      closeRunPlanModal();
      if (onStartCallback) {
        await onStartCallback(runPlan);
      }
    };
  }
}

export function openRunPlanModal(pipeline) {
  if (!pipeline || !pipeline.stages) return;

  const modal = $("runPlanModal");
  const rows = $("runPlanRows");
  if (!modal || !rows) return;

  rows.innerHTML = "";
  runPlan = {};

  pipeline.stages.forEach((st) => (runPlan[st.id] = "AUTO"));

  pipeline.stages.forEach((st, idx) => {
    const isLastTwo = idx >= pipeline.stages.length - 2;
    const placementClass = isLastTwo ? "bottom-full mb-1.5" : "top-full mt-1.5";
    const row = document.createElement("div");
    row.className = "grid grid-cols-3 items-center px-4 py-3 text-sm";

    row.innerHTML = `
      <div class="text-zinc-200">${st.name}</div>
      <div class="text-xs text-zinc-500">${st.type.toUpperCase()}</div>

      <div class="flex justify-start">
        <div class="relative w-36" data-dropdown-wrap="${st.id}">
          <button type="button"
            data-stage-btn="${st.id}"
            class="w-full rounded-xl bg-zinc-950/40 px-3 py-2 pr-10 text-sm text-zinc-200 ring-1 ring-zinc-800 hover:ring-zinc-700 focus:outline-none text-left">
            AUTO
          </button>

          <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div data-stage-menu="${st.id}"
            class="hidden absolute right-0 ${placementClass} w-36 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-700 shadow-2xl z-50">
            <button type="button" data-stage="${st.id}" data-value="AUTO"
              class="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition">
              AUTO
            </button>
            <button type="button" data-stage="${st.id}" data-value="PASSED"
              class="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition">
              PASS
            </button>
            <button type="button" data-stage="${st.id}" data-value="FAILED"
              class="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition">
              FAIL
            </button>
          </div>
        </div>
      </div>
    `;

    rows.appendChild(row);
  });

  pipeline.stages.forEach((st) => {
    const btn = document.querySelector(`[data-stage-btn="${st.id}"]`);
    const menu = document.querySelector(`[data-stage-menu="${st.id}"]`);
    const wrap = document.querySelector(`[data-dropdown-wrap="${st.id}"]`);

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      pipeline.stages.forEach((other) => {
        const m = document.querySelector(`[data-stage-menu="${other.id}"]`);
        const w = document.querySelector(`[data-dropdown-wrap="${other.id}"]`);
        if (m && m !== menu) {
          m.classList.add("hidden");
          if (w) w.classList.remove("z-30");
        }
      });

      const willOpen = menu.classList.contains("hidden");
      menu.classList.toggle("hidden");
      if (wrap) {
        if (willOpen) {
          wrap.classList.add("z-30");
        } else {
          wrap.classList.remove("z-30");
        }
      }
    });
  });

  rows.querySelectorAll("button[data-stage][data-value]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      const stageId = item.dataset.stage;
      const value = item.dataset.value;

      runPlan[stageId] = value;

      const btn = document.querySelector(`[data-stage-btn="${stageId}"]`);
      const menu = document.querySelector(`[data-stage-menu="${stageId}"]`);
      const wrap = document.querySelector(`[data-dropdown-wrap="${stageId}"]`);

      if (btn) {
        btn.textContent =
          value === "PASSED" ? "PASS" : value === "FAILED" ? "FAIL" : "AUTO";
      }

      if (menu) menu.classList.add("hidden");
      if (wrap) wrap.classList.remove("z-30");
    });
  });

  document.addEventListener("click", () => {
    pipeline.stages.forEach((st) => {
      const m = document.querySelector(`[data-stage-menu="${st.id}"]`);
      const w = document.querySelector(`[data-dropdown-wrap="${st.id}"]`);
      if (m) m.classList.add("hidden");
      if (w) w.classList.remove("z-30");
    });
  });

  modal.classList.remove("hidden");
}

export function closeRunPlanModal() {
  const modal = $("runPlanModal");
  if (modal) modal.classList.add("hidden");
}

