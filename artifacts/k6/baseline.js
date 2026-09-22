import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],       // <1% transport-level errors
    http_req_duration: ["p(95)<800"],     // p95 < 800ms
    checks: ["rate>0.99"],                // >99% checks pass (functional confidence)
  },
};

const BASE_URL = (__ENV.BASE_URL || "https://reqres.in").replace(/\/+$/, "");
const PAGE = __ENV.PAGE || "2";
const THINK_TIME_MS = Number(__ENV.THINK_TIME_MS || 800);

const apiLatency = new Trend("api_latency_ms");
const apiCheckFailRate = new Rate("api_check_failed");

export default function () {
  const url = `${BASE_URL}/api/users?page=${PAGE}`;

  const res = http.get(url, {
    tags: { component: "api", endpoint: "GET_/api/users" },
  });

  apiLatency.add(res.timings.duration);

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "data is non-empty array": (r) => Array.isArray(r.json("data")) && r.json("data").length > 0,
    "each item has id + email": (r) => {
      const data = r.json("data");
      if (!Array.isArray(data) || data.length === 0) return false;
      return data.every((u) => typeof u.id === "number" && typeof u.email === "string");
    },
  });

  if (!ok) apiCheckFailRate.add(1);

  // realistic user pacing (configurable)
  sleep(THINK_TIME_MS / 1000);
}

export function handleSummary(data) {
  return {
    "artifacts/k6/summary.json": JSON.stringify(data, null, 2),
    "artifacts/k6/summary.txt": textSummary(data),
  };
}

function textSummary(data) {
  const m = data.metrics || {};
  const p95 = m.http_req_duration?.values?.["p(95)"];
  const failRate = m.http_req_failed?.values?.rate;
  const checksRate = m.checks?.values?.rate;

  return [
    "k6 Performance Summary (Baseline)",
    `Target: ${BASE_URL}/api/users?page=${PAGE}`,
    `VUs: ${options.vus ?? "—"} | Duration: ${options.duration ?? "—"}`,
    "",
    `p95: ${p95 != null ? Math.round(p95) + " ms" : "—"}`,
    `http_req_failed: ${failRate != null ? (failRate * 100).toFixed(2) + "%" : "—"}`,
    `checks pass rate: ${checksRate != null ? (checksRate * 100).toFixed(2) + "%" : "—"}`,
    "",
    "Notes: Baseline run for regression detection (not a stress test).",
    "",
  ].join("\n");
}
