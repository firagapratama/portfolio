# k6 Performance Summary — Baseline (API)

This document summarizes the **baseline performance test** executed using **k6**  
as part of the **CI Pipeline – Performance stage**.

The goal is **regression detection**, not stress or load testing.

---

## Scope & Objective

- **Target API:** `GET /api/users?page=2`
- **Environment:** Public demo (`reqres.in`)
- **Purpose:**  
  - Detect performance regressions early  
  - Enforce latency & reliability thresholds before release  
  - Provide auditable evidence for the **Quality Gate**

---

## Test Configuration

| Parameter        | Value                 |
|------------------|-----------------------|
| Tool             | k6                    |
| Scenario         | Baseline (read-only)  |
| Virtual Users    | 20                    |
| Duration         | 30 seconds            |
| Think Time       | ~800 ms (configurable)|
| Execution Mode   | Local / CI-compatible |

Environment variables supported:
```bash
BASE_URL=https://reqres.in
VUS=20
DURATION=30s
THINK_TIME_MS=800
