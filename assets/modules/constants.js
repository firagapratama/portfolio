export const $ = (id) => document.getElementById(id);

export const STATUS_STYLE = {
  IDLE: "bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700",
  QUEUED: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  RUNNING: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
  PASSED: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  FAILED: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  SKIPPED: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30",
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function pct(n) {
  if (typeof n !== "number") return "-";
  return `${Math.round(n * 100)}%`;
}

export function pad(text, len) {
  return String(text).padEnd(len, " ");
}

export function badgeClass(status) {
  return `inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide leading-none ${STATUS_STYLE[status] || STATUS_STYLE.IDLE}`;
}

export function setRelease(decision, note, statusKey = "IDLE") {
  const badge = $("releaseBadge");
  const noteEl = $("releaseNote");
  if (badge) {
    badge.className = badgeClass(statusKey);
    badge.textContent = decision;
  }
  if (noteEl) {
    noteEl.textContent = note;
  }
}

