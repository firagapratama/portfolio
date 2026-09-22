import { $ } from "./modules/constants.js";
import { initTheme } from "./modules/theme.js";
import {
  initPipeline,
  setPipelineMode,
  runPipelineWithPlan,
  resetPipeline,
  getPipeline,
  exportReleaseReport,
} from "./modules/pipeline.js";
import { initVault } from "./modules/vault.js";
import { renderProjects } from "./modules/projects.js";
import { initRunPlanModal, openRunPlanModal } from "./modules/run-plan.js";

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
  return res.json();
}

async function init() {
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initTheme();

  const [pipelineData, qaToolsData, vaultData, projectsData] = await Promise.all([
    loadJSON("./assets/data-pipeline.json"),
    loadJSON("./assets/data-qa-tools-pipeline.json"),
    loadJSON("./assets/data-vault.json"),
    loadJSON("./assets/data-projects.json"),
  ]);

  initPipeline(pipelineData, qaToolsData);
  initVault(vaultData);
  renderProjects(projectsData);
  initRunPlanModal(pipelineData, async (plan) => {
    await runPipelineWithPlan(plan);
  });

  $("btnRun")?.addEventListener("click", () => {
    openRunPlanModal(getPipeline());
  });

  $("btnReset")?.addEventListener("click", resetPipeline);
  $("btnExport")?.addEventListener("click", exportReleaseReport);

  $("tabCicd")?.addEventListener("click", () => {
    setPipelineMode("cicd");
  });

  $("tabQaTools")?.addEventListener("click", () => {
    setPipelineMode("qatools");
  });

  $("presetHappy")?.addEventListener("click", async () => {
    const p = getPipeline();
    const plan = {};
    p.stages.forEach((st) => (plan[st.id] = "PASSED"));
    if (plan["gate"]) plan["gate"] = "AUTO";
    await runPipelineWithPlan(plan);
  });

  $("presetRealistic")?.addEventListener("click", async () => {
    const p = getPipeline();
    if (p.mode === "qa-tools" || !p.stages.some((s) => s.id === "prechecks")) {
      const plan = {
        record: "PASSED",
        testcase: "PASSED",
        "api-gen": "PASSED",
        "api-run": "FAILED",
        buglist: "PASSED",
        guide: "PASSED",
      };
      await runPipelineWithPlan(plan);
    } else {
      const plan = {
        prechecks: "PASSED",
        smoke: "PASSED",
        api: "FAILED",
        ui: "FAILED",
        perf: "PASSED",
        gate: "AUTO",
      };
      await runPipelineWithPlan(plan);
    }
  });

  $("presetBlock")?.addEventListener("click", async () => {
    const p = getPipeline();
    if (p.mode === "qa-tools" || !p.stages.some((s) => s.id === "prechecks")) {
      const plan = { record: "FAILED" };
      await runPipelineWithPlan(plan);
    } else {
      const plan = { prechecks: "FAILED" };
      await runPipelineWithPlan(plan);
    }
  });
}

init().catch((e) => {
  console.error(e);
  alert("Failed to load data. Pastikan file assets/data-*.json ada dan path benar.");
});
