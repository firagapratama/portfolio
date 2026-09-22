# Exit Criteria (Release Quality Gate)

This document defines the **release approval rules** enforced by the Quality Gate
in the CI Pipeline Simulator.

A release is considered **APPROVED** only when all criteria below are satisfied.
Otherwise, the release is **BLOCKED** until issues are addressed and the pipeline
is re-run.

---

## 1. Scope

These exit criteria apply to the following pipeline stages:

- Smoke Tests
- API Tests (Postman)
- UI End-to-End Tests (Playwright)
- Performance Baseline (k6)

The Quality Gate evaluates results generated during the pipeline execution
and produces a single release decision.

---

## 2. Exit Criteria

| Category        | Metric                    | Threshold / Requirement  |
|-----------------|---------------------------|--------------------------|
| Smoke Tests     | Pass Rate                 | **100%**                 |
| API Tests       | Pass Rate                 | **≥ 98%**                |
| UI E2E Tests    | Pass Rate                 | **≥ 95%**                |
| Performance     | p95 Response Time         | **< 800 ms**             |
| Defect Quality  | Critical Open Bugs        | **0**                    |

---

## 3. Rationale

- **Smoke Tests (100%)**  
  Smoke tests validate critical user flows. Any failure indicates a high-risk
  build and blocks the release immediately.

- **API Tests (≥ 98%)**  
  Allows minimal tolerance for non-critical negative cases while ensuring core
  API stability.

- **UI E2E Tests (≥ 95%)**  
  Accounts for low-risk UI flakiness while still enforcing high confidence
  in end-to-end user journeys.

- **Performance (p95 < 800 ms)**  
  Ensures the application meets baseline responsiveness under expected load.

- **Critical Bugs = 0**  
  Any unresolved critical defect represents unacceptable release risk.

---

## 4. Decision Rules

- If **any** criterion fails → **BLOCKED**
- If **all** criteria pass → **APPROVED**

The decision is deterministic and based solely on measured pipeline results.

---

## 5. Traceability

Each exit criterion is directly mapped to pipeline metrics:

- Smoke / API / UI pass rates are calculated from executed test suites
- Performance metrics are produced by k6 baseline scenarios
- Critical bug count is derived from the defect tracking summary

This ensures the release decision is **auditable, repeatable, and objective**.

---

## 6. Ownership

The Quality Gate is owned and maintained by **QA Engineering** to ensure
consistent release quality standards across environments.

