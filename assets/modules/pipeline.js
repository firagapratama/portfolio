import { $, sleep, pct, pad, badgeClass, setRelease } from "./constants.js";

const state = {
  activeMode: "cicd", // "cicd" | "qatools"
  pipelines: {
    cicd: null,
    qatools: null,
  },
  defaultLogs: {
    cicd: {},
    qatools: {},
  },
  statuses: {},
  results: {
    smokePass: null,
    apiPass: null,
    uiPass: null,
    p95Ms: null,
    criticalOpen: 0,
  },
  activeStageId: null,
};

function getCurrentPipeline() {
  return state.pipelines[state.activeMode] || state.pipelines.cicd;
}

export function initPipeline(cicdData, qaToolsData) {
  state.pipelines.cicd = cicdData;
  state.pipelines.qatools = qaToolsData;

  // Snapshot default logs for both modes
  ["cicd", "qatools"].forEach((m) => {
    const p = state.pipelines[m];
    if (p && p.stages) {
      state.defaultLogs[m] = {};
      p.stages.forEach((st) => {
        state.defaultLogs[m][st.id] = Array.isArray(st.logs) ? [...st.logs] : [];
      });
    }
  });

  setPipelineMode("cicd");
}

export function setPipelineMode(mode) {
  state.activeMode = mode;
  const p = getCurrentPipeline();
  if (!p) return;

  state.statuses = {};
  p.stages.forEach((st) => {
    state.statuses[st.id] = "IDLE";
    st.logs = [...(state.defaultLogs[state.activeMode]?.[st.id] || [])];
  });

  state.activeStageId = p.stages[0]?.id || null;
  state.results = {
    smokePass: null,
    apiPass: null,
    uiPass: null,
    p95Ms: null,
    criticalOpen: 0,
  };

  updateProgressBar(0, false);
  setRelease("PENDING", "Run pipeline to evaluate.", "IDLE");

  // Update switcher tab UI
  const tabCicd = $("tabCicd");
  const tabQaTools = $("tabQaTools");
  if (tabCicd && tabQaTools) {
    if (mode === "cicd") {
      tabCicd.className = "rounded-md bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-700 shadow";
      tabQaTools.className = "rounded-md px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition";
    } else {
      tabQaTools.className = "rounded-md bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-700 shadow";
      tabCicd.className = "rounded-md px-3 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition";
    }
  }

  // Update scenario button text for active mode
  const btnHappy = $("presetHappy");
  const btnRealistic = $("presetRealistic");
  const btnBlock = $("presetBlock");
  if (btnHappy && btnRealistic && btnBlock) {
    if (mode === "cicd") {
      btnHappy.textContent = "All Pass";
      btnRealistic.textContent = "UI/API Fail";
      btnBlock.textContent = "Pre-checks Block";
    } else {
      btnHappy.textContent = "All Pass";
      btnRealistic.textContent = "Contract Fail";
      btnBlock.textContent = "Record Block";
    }
  }

  renderStages();
  if (p.stages[0]) renderStageDetail(p.stages[0]);
}

export function updateProgressBar(percent, isFailed = false) {
  const bar = $("pipelineProgressBar");
  if (!bar) return;
  bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  if (isFailed) {
    bar.className = "h-full bg-rose-500 transition-all duration-300";
  } else if (percent >= 100) {
    bar.className = "h-full bg-emerald-500 transition-all duration-300";
  } else {
    bar.className = "h-full bg-sky-500 transition-all duration-300";
  }
}

export function renderFlowchart() {
  const root = $("pipelineFlowchart");
  const pipeline = getCurrentPipeline();
  if (!root || !pipeline) return;

  root.innerHTML = "";

  pipeline.stages.forEach((st, idx) => {
    const stStatus = state.statuses[st.id] || "IDLE";
    const isActive = st.id === state.activeStageId;

    const node = document.createElement("button");
    node.type = "button";
    node.className = [
      "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium ring-1 transition shrink-0 hover:scale-[1.02]",
      isActive ? "bg-zinc-800 ring-zinc-600" : "bg-zinc-950/60 ring-zinc-800 hover:ring-zinc-700",
    ].join(" ");

    let dotColor = "bg-zinc-600";
    if (stStatus === "RUNNING") dotColor = "bg-sky-400 animate-pulse";
    else if (stStatus === "PASSED") dotColor = "bg-emerald-400";
    else if (stStatus === "FAILED") dotColor = "bg-rose-400";
    else if (stStatus === "SKIPPED") dotColor = "bg-zinc-500";
    else if (stStatus === "QUEUED") dotColor = "bg-amber-400 animate-pulse";

    node.innerHTML = `
      <span class="h-2 w-2 rounded-full ${dotColor}"></span>
      <span class="${isActive ? "text-zinc-100 font-semibold" : "text-zinc-300"}">${st.name}</span>
    `;

    node.onclick = () => {
      state.activeStageId = st.id;
      renderStages();
      renderStageDetail(st);
    };

    root.appendChild(node);

    if (idx < pipeline.stages.length - 1) {
      const arrow = document.createElement("span");
      arrow.className = "text-zinc-600 text-xs px-0.5 select-none";
      arrow.textContent = "→";
      root.appendChild(arrow);
    }
  });
}

export function renderStages() {
  renderFlowchart();
  const root = $("stages");
  const pipeline = getCurrentPipeline();
  if (!root || !pipeline) return;

  root.innerHTML = "";

  pipeline.stages.forEach((st) => {
    const stStatus = state.statuses[st.id] || "IDLE";
    const isActive = st.id === state.activeStageId;

    const btn = document.createElement("button");
    btn.className = [
      "w-full rounded-xl p-3.5 sm:p-4 text-left ring-1 transition hover:scale-[1.008]",
      isActive ? "bg-zinc-900 ring-zinc-700" : "bg-zinc-950/40 ring-zinc-800 hover:ring-zinc-700",
    ].join(" ");

    btn.onclick = () => {
      state.activeStageId = st.id;
      renderStages();
      renderStageDetail(st);
    };

    btn.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <div class="text-sm font-semibold">${st.name}</div>
            <span class="text-xs text-zinc-500">· ${st.type.toUpperCase()}</span>
          </div>
          <div class="text-xs text-zinc-400">${st.summary}</div>
        </div>
        <span class="${badgeClass(stStatus)}">${stStatus}</span>
      </div>
    `;
    root.appendChild(btn);
  });
}

export function renderStageDetail(st) {
  if (!st) return;
  $("detailTitle").textContent = st.name;
  const stStatus = state.statuses[st.id] || "IDLE";
  $("detailStatus").className = badgeClass(stStatus);
  $("detailStatus").textContent = stStatus;

  $("detailLogs").textContent = (st.logs || []).join("\n");

  if (st.triage) {
    $("detailTriageWrap").classList.remove("hidden");
    $("detailTriageTitle").textContent = st.triage.title;
    $("detailTriageText").textContent = st.triage.text;
  } else {
    $("detailTriageWrap").classList.add("hidden");
  }

  const art = $("detailArtifacts");
  if (!art) return;
  art.innerHTML = "";
  (st.artifacts || []).forEach((a) => {
    const link = document.createElement("a");
    link.href = a.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className =
      "flex items-center justify-between rounded-xl bg-zinc-950/40 px-3 py-2 text-sm ring-1 ring-zinc-800 hover:ring-zinc-700 transition";
    link.innerHTML = `<span class="text-zinc-200">${a.label}</span><span class="text-xs text-zinc-500">${a.kind}</span>`;
    art.appendChild(link);
  });
}

export function setStageLogs(stageId, lines) {
  const pipeline = getCurrentPipeline();
  const st = pipeline?.stages?.find((s) => s.id === stageId);
  if (!st) return;
  st.logs = lines;
  if (state.activeStageId === stageId) renderStageDetail(st);
}

export function applyStageOutcome(stageId, outcome) {
  if (stageId === "prechecks") {
    if (outcome === "PASSED") {
      setStageLogs("prechecks", [
        "[pre-checks] validating env vars (BASE_URL, creds)... PASS",
        "[pre-checks] verifying playwright config (retries, reporter)... PASS",
        "[pre-checks] checking test tagging (@smoke/@regression)... PASS",
        "[pre-checks] checking locator policy (no waitForTimeout)... PASS",
        "[pre-checks] pre-checks PASSED",
      ]);
    } else {
      setStageLogs("prechecks", [
        "[pre-checks] validating env vars (BASE_URL, creds)... FAIL",
        "[pre-checks] missing BASE_URL or credentials",
        "[pre-checks] pre-checks FAIL => pipeline blocked",
      ]);
    }
  }

  if (stageId === "smoke") {
    state.results.smokePass = outcome === "PASSED" ? 1.0 : 0.67;
    if (outcome === "PASSED") {
      setStageLogs("smoke", [
        "[smoke] target=saucedemo.com",
        "[smoke] SMK-001 login success ... PASS",
        "[smoke] SMK-002 add to cart ... PASS",
        "[smoke] SMK-003 checkout happy path ... PASS",
        "[smoke] smoke suite PASSED (3/3)",
      ]);
    } else {
      setStageLogs("smoke", [
        "[smoke] target=saucedemo.com",
        "[smoke] SMK-001 login success ... PASS",
        "[smoke] SMK-002 add to cart ... FAIL (cart badge not updated)",
        "[smoke] SMK-003 checkout happy path ... SKIPPED",
        "[smoke] smoke suite FAILED (2/3), investigate before release",
      ]);
    }
  }

  if (stageId === "api") {
    state.results.apiPass = outcome === "PASSED" ? 1.0 : 0.83;
    if (outcome === "PASSED") {
      setStageLogs("api", [
        "[api] newman run reqres-collection.json",
        "[api] target=reqres.in",
        "[api] 6 requests executed",
        "[api] 6 passed (including negative assertions)",
        "[api] API suite PASSED",
      ]);
    } else {
      setStageLogs("api", [
        "[api] newman run reqres-collection.json",
        "[api] target=reqres.in",
        "[api] 6 requests executed",
        "[api] 5 passed, 1 failed",
        "[api] FAIL: schema assertion mismatch on GET /users/2",
        "[api] action: update contract & re-run",
      ]);
    }
  }

  if (stageId === "ui") {
    state.results.uiPass = outcome === "PASSED" ? 1.0 : 0.83;
    if (outcome === "PASSED") {
      setStageLogs("ui", [
        "[ui] playwright test --project=chromium --workers=4",
        "[ui] target=saucedemo.com",
        "[ui] 6 tests executed",
        "[ui] 6 passed",
        "[ui] UI E2E suite PASSED",
      ]);
    } else {
      setStageLogs("ui", [
        "[ui] playwright test --project=chromium --workers=4",
        "[ui] target=saucedemo.com",
        "[ui] 6 tests executed",
        "[ui] 5 passed, 1 failed",
        "[ui] FAIL: sorting validation (unstable locator)",
        "[ui] root cause: locator too generic (text-based)",
        "[ui] recommendation: use getByRole or data-testid",
        "[ui] evidence: screenshot.png, trace.zip",
      ]);
    }
  }

  if (stageId === "perf") {
    state.results.p95Ms = outcome === "PASSED" ? 620 : 980;
    if (outcome === "PASSED") {
      setStageLogs("perf", [
        "[perf] k6 run baseline.js",
        "[perf] target=reqres.in (GET /api/users?page=2)",
        "[perf] vus=20 duration=30s",
        "[perf] p95=620ms, error_rate=0.3%",
        "[perf] thresholds: PASS",
      ]);
    } else {
      setStageLogs("perf", [
        "[perf] k6 run baseline.js",
        "[perf] target=reqres.in (GET /api/users?page=2)",
        "[perf] vus=20 duration=30s",
        "[perf] p95=980ms, error_rate=1.8%",
        "[perf] thresholds: FAIL",
        "[perf] root cause hypothesis: response latency spike under steady load",
        "[perf] action: review backend response time & infra scaling",
      ]);
    }
  }

  if (stageId === "record") {
    if (outcome === "PASSED") {
      setStageLogs("record", [
        "[record] initializing browser session (chromium)...",
        "[record] BasePage action context initialized",
        "[record] recorded 12 DOM interactions with screenshots",
        "[record] steps-meta.json saved to results/sessions/",
        "[record] session record PASSED",
      ]);
    } else {
      setStageLogs("record", [
        "[record] initializing browser session (chromium)...",
        "[record] ERROR: target URL unreachable (connection refused)",
        "[record] failed to capture DOM interactions",
        "[record] session record FAILED => pipeline blocked",
      ]);
    }
  }

  if (stageId === "testcase") {
    if (outcome === "PASSED") {
      setStageLogs("testcase", [
        "[testcase] reading steps-meta.json...",
        "[testcase] invoking AI Test Analyzer (gpt-5.6-luna)...",
        "[testcase] generated 6 test cases (P0: 3, P1: 2, P2: 1)",
        "[testcase] exported to TEST_CASES.csv & TEST_CASES.md",
        "[testcase] testcase synthesis PASSED",
      ]);
    } else {
      setStageLogs("testcase", [
        "[testcase] reading steps-meta.json...",
        "[testcase] ERROR: LLM gateway timeout (504)",
        "[testcase] testcase synthesis FAILED",
      ]);
    }
  }

  if (stageId === "api-gen") {
    setStageLogs("api-gen", [
      "[api-gen] inspecting network traffic from session trace...",
      "[api-gen] synthesizing endpoints: GET /users, POST /login",
      "[api-gen] injecting status code + JSON schema validation scripts",
      "[api-gen] collection.json generated ready for Newman",
    ]);
  }

  if (stageId === "api-run") {
    if (outcome === "PASSED") {
      setStageLogs("api-run", [
        "[api-run] newman run collection.json -e staging.json",
        "[api-run] 6 requests executed",
        "[api-run] 6 passed (100% contract compliance)",
        "[api-run] HTML execution report exported",
        "[api-run] contract validation PASSED",
      ]);
    } else {
      setStageLogs("api-run", [
        "[api-run] newman run collection.json -e staging.json",
        "[api-run] 6 requests executed",
        "[api-run] 5 passed, 1 failed (schema assertion mismatch)",
        "[api-run] FAIL: GET /api/users schema mismatch on field 'email'",
        "[api-run] error artifact exported to results/newman-error.json",
      ]);
    }
  }

  if (stageId === "buglist") {
    const isFailedRun = state.statuses["api-run"] === "FAILED";
    if (isFailedRun) {
      setStageLogs("buglist", [
        "[buglist] reading failed test artifacts (newman-error.json)...",
        "[buglist] invoking AI Defect Analyzer (gpt-5.6-luna)...",
        "[buglist] Root Cause Analysis: schema contract changed without version bump",
        "[buglist] Severity=S2, Priority=P1, Automated Triage=COMPLETE",
      ]);
    } else {
      setStageLogs("buglist", [
        "[buglist] inspecting execution logs across all stages...",
        "[buglist] 0 test failures or unhandled exceptions detected",
        "[buglist] Defect report: CLEAN (0 open bugs)",
      ]);
    }
  }

  if (stageId === "guide") {
    setStageLogs("guide", [
      "[guide] loading steps-meta.json & step screenshots...",
      "[guide] invoking AI Technical Writer (Bahasa Indonesia)...",
      "[guide] generated USER_GUIDE.md & USER_GUIDE.html",
      "[guide] PDF exported via Playwright headless Chromium",
      "[guide] documentation generation PASSED",
    ]);
  }
}

export function evaluateGate() {
  const pipeline = getCurrentPipeline();
  const c = pipeline.exitCriteria;

  const smokeOk = (state.results.smokePass ?? 0) >= c.smokePass;
  const apiOk = (state.results.apiPass ?? 0) >= c.apiPass;
  const uiOk = (state.results.uiPass ?? 0) >= c.uiPass;
  const perfOk = (state.results.p95Ms ?? Infinity) < c.p95Ms;
  const criticalOk = (state.results.criticalOpen ?? Infinity) <= c.criticalOpenBugs;

  const decisionOk = smokeOk && apiOk && uiOk && perfOk && criticalOk;

  const header = "-------------------------------------------------";

  const lines = [
    "[gate] Exit Criteria Evaluation",
    header,
    `${pad("Metric", 13)} | ${pad("Required", 9)} | ${pad("Actual", 9)} | Status`,
    header,
    `${pad("Smoke Pass", 13)} | ${pad(pct(c.smokePass), 9)} | ${pad(pct(state.results.smokePass), 9)} | ${smokeOk ? "PASS" : "FAIL"}`,
    `${pad("API Pass", 13)} | ${pad(pct(c.apiPass), 9)} | ${pad(pct(state.results.apiPass), 9)} | ${apiOk ? "PASS" : "FAIL"}`,
    `${pad("UI Pass", 13)} | ${pad(pct(c.uiPass), 9)} | ${pad(pct(state.results.uiPass), 9)} | ${uiOk ? "PASS" : "FAIL"}`,
    `${pad("Perf (p95)", 13)} | ${pad(`<${c.p95Ms}ms`, 9)} | ${pad(`${state.results.p95Ms ?? "-"}ms`, 9)} | ${perfOk ? "PASS" : "FAIL"}`,
    `${pad("Critical Bugs", 13)} | ${pad(`${c.criticalOpenBugs}`, 9)} | ${pad(`${state.results.criticalOpen ?? "-"}`, 9)} | ${criticalOk ? "PASS" : "FAIL"}`,
    header,
    `Decision: ${decisionOk ? "APPROVED" : "BLOCKED"}`,
  ];

  const failReasons = [];
  if (!smokeOk) failReasons.push("smoke below threshold");
  if (!apiOk) failReasons.push("api below threshold");
  if (!uiOk) failReasons.push("ui below threshold");
  if (!perfOk) failReasons.push("p95 too high");
  if (!criticalOk) failReasons.push("critical bugs open");

  lines.push(`Reason: ${decisionOk ? "all criteria met" : failReasons.join(", ")}`);

  return { decisionOk, lines };
}

export function resolveOutcomeForStage(stageId, planValue) {
  if (planValue === "PASSED" || planValue === "FAILED") return planValue;
  if (state.activeMode === "cicd") {
    if (stageId === "api" || stageId === "ui") return "FAILED";
    if (stageId === "gate") return "AUTO";
  }
  return "PASSED";
}

export async function runPipelineWithPlan(plan) {
  const pipeline = getCurrentPipeline();
  if (!pipeline || !pipeline.stages) return;

  pipeline.stages.forEach((st) => (state.statuses[st.id] = "QUEUED"));
  setRelease("PENDING", "Running pipeline…", "RUNNING");
  updateProgressBar(5, false);

  renderStages();
  renderStageDetail(pipeline.stages.find((s) => s.id === state.activeStageId));

  const totalStages = pipeline.stages.length;
  let hasFailed = false;

  for (let i = 0; i < totalStages; i++) {
    const st = pipeline.stages[i];
    state.activeStageId = st.id;
    state.statuses[st.id] = "RUNNING";

    const currentPercent = Math.round(((i + 0.5) / totalStages) * 100);
    updateProgressBar(currentPercent, hasFailed);

    renderStages();
    renderStageDetail(st);

    if (state.activeMode === "qatools") {
      // Simulation for QA Tools autonomous pipeline
      setStageLogs(st.id, [`[${st.id}] running automated step...`, `[${st.id}] executing ${st.name}`]);
      await sleep(350);
      setStageLogs(st.id, [...(state.defaultLogs["qatools"]?.[st.id] || [`[${st.id}] completed successfully`])]);
    } else {
      // Standard CI/CD logs
      if (st.id === "prechecks") {
        setStageLogs("prechecks", [
          "[pre-checks] starting…",
          "[pre-checks] env vars (BASE_URL, creds): RUNNING…",
          "[pre-checks] playwright config (retries, reporter): RUNNING…",
          "[pre-checks] test tagging policy (@smoke/@regression): RUNNING…",
          "[pre-checks] locator policy (no waitForTimeout): RUNNING…",
        ]);
      }
      if (st.id === "smoke") {
        setStageLogs("smoke", [
          "[smoke] starting smoke suite…",
          "[smoke] target=saucedemo.com",
          "[smoke] SMK-001 login success ... RUNNING",
          "[smoke] SMK-002 add to cart ... QUEUED",
          "[smoke] SMK-003 checkout happy path ... QUEUED",
        ]);
        await sleep(200);
        setStageLogs("smoke", [
          "[smoke] starting smoke suite…",
          "[smoke] target=saucedemo.com",
          "[smoke] SMK-001 login success ... PASS",
          "[smoke] SMK-002 add to cart ... PASS",
          "[smoke] SMK-003 checkout happy path ... RUNNING",
        ]);
      }
      if (st.id === "api") {
        setStageLogs("api", [
          "[api] starting API suite…",
          "[api] runner=newman",
          "[api] target=reqres.in",
          "[api] TC-API-001 POST /api/login ... PASS (200)",
          "[api] TC-API-002 GET /api/users/2 ... RUNNING",
        ]);
        await sleep(200);
      }
      if (st.id === "ui") {
        setStageLogs("ui", [
          "[ui] starting UI E2E suite…",
          "[ui] runner=playwright",
          "[ui] target=saucedemo.com",
          "[ui] TC-UI-001 Login valid user ... PASS",
          "[ui] TC-UI-002 Add item to cart ... RUNNING",
        ]);
        await sleep(200);
      }
      if (st.id === "gate") {
        setStageLogs("gate", [
          "[gate] Exit Criteria Evaluation",
          "[gate] collecting stage metrics…",
          "[gate] evaluating thresholds…",
        ]);
      }
    }

    await sleep(Math.max(350, st.durationSec * 40));

    if (st.id === "gate") {
      const g = evaluateGate();
      setStageLogs("gate", g.lines);
      state.statuses[st.id] = g.decisionOk ? "PASSED" : "FAILED";
      if (!g.decisionOk) hasFailed = true;

      updateProgressBar(100, hasFailed);
      renderStages();
      renderStageDetail(st);
      await sleep(150);
      continue;
    }

    const chosen = resolveOutcomeForStage(st.id, plan?.[st.id] ?? "AUTO");
    state.statuses[st.id] = chosen;
    if (chosen === "FAILED") hasFailed = true;

    applyStageOutcome(st.id, chosen);

    // Re-render immediately so the stage badge updates from RUNNING to PASSED/FAILED
    renderStages();
    renderStageDetail(st);

    if (st.id === "prechecks" && chosen === "FAILED") {
      pipeline.stages.forEach((next) => {
        if (next.id === "prechecks") return;
        if (state.statuses[next.id] === "QUEUED" || state.statuses[next.id] === "IDLE") {
          state.statuses[next.id] = "SKIPPED";
          setStageLogs(next.id, [`[${next.id}] SKIPPED (blocked by pre-checks failure)`]);
        }
      });

      if (pipeline.stages.some((s) => s.id === "gate")) {
        state.statuses["gate"] = "FAILED";
        setStageLogs("gate", [
          "[gate] Exit Criteria Evaluation",
          "-------------------------------------------------",
          "Decision: BLOCKED (pre-checks failed)",
        ]);
      }

      updateProgressBar(100, true);
      renderStages();
      renderStageDetail(st);

      setRelease("BLOCKED", "Pre-checks failed. Fix configuration and re-run.", "FAILED");
      return;
    }

    if (st.id === "record" && chosen === "FAILED") {
      pipeline.stages.forEach((next) => {
        if (next.id === "record") return;
        if (state.statuses[next.id] === "QUEUED" || state.statuses[next.id] === "IDLE") {
          state.statuses[next.id] = "SKIPPED";
          setStageLogs(next.id, [`[${next.id}] SKIPPED (blocked by session recording failure)`]);
        }
      });

      updateProgressBar(100, true);
      renderStages();
      renderStageDetail(st);

      setRelease("BLOCKED", "Session recording failed. Check browser environment.", "FAILED");
      return;
    }
  }

  const gateStatus = state.statuses["gate"] || (hasFailed ? "FAILED" : "PASSED");
  const isFailed = hasFailed || gateStatus === "FAILED";
  updateProgressBar(100, isFailed);
  renderStages();
  const lastSt = pipeline.stages.find((s) => s.id === state.activeStageId) || pipeline.stages[totalStages - 1];
  if (lastSt) renderStageDetail(lastSt);

  if (isFailed) {
    if (state.activeMode === "qatools") {
      setRelease("BLOCKED", "Toolkit pipeline blocked. Defect detected in automated execution.", "FAILED");
    } else {
      setRelease("BLOCKED", "Release blocked by Quality Gate. Review failed criteria.", "FAILED");
    }
  } else {
    setRelease("APPROVED", state.activeMode === "qatools" ? "Toolkit pipeline completed. All 6 stages passed." : "Release approved. All criteria satisfied.", "PASSED");
  }
}

export async function runPipeline() {
  const defaultPlan = {};
  const pipeline = getCurrentPipeline();
  if (pipeline?.stages) {
    pipeline.stages.forEach((st) => (defaultPlan[st.id] = "AUTO"));
  }
  await runPipelineWithPlan(defaultPlan);
}

export function resetPipeline() {
  setPipelineMode(state.activeMode);
}

export function getPipeline() {
  return getCurrentPipeline();
}

export function exportReleaseReport() {
  window.print();
}
