# Risk-Based Test Plan (Sample)
**System Under Test (SUT):** SauceDemo (UI) + Reqres (API)  
**Owner:** Firaga Pratama - QA Engineer (Playwright - Postman - k6)  
**Purpose:** Build release confidence via risk-based testing and audit-ready evidence.

---

## 1. Context & Goals
This portfolio simulates a release process where QA validates:
- **Critical user journeys on UI** (SauceDemo): login, add to cart, checkout.
- **Core API behaviors** (Reqres): authentication-like flows and CRUD-like endpoints (as a public demo API).
- **Performance baseline** using k6 thresholds.
- **Quality Gate** decision based on measurable exit criteria.

**Primary goals**
- Detect high-impact failures early (smoke & critical paths).
- Provide clear evidence for release decisions (reports, logs, artifacts).
- Demonstrate reliable automation practices (stable locators, trace on failure, contract assertions).

---

## 2. Scope

### In Scope (UI - SauceDemo)
**Critical flows**
- Login (valid/invalid)
- Product listing visibility (basic sanity)
- Add to cart / remove
- Cart badge accuracy
- Checkout happy path (shipping info -> overview -> complete)
- Logout (optional)

### In Scope (API - Reqres)
**High-signal endpoints**
- GET users list + single user
- POST create user
- PUT update user
- DELETE user (response behavior)
- Auth-like responses (login/register endpoints; even though this is a demo API, we validate contracts and status codes)

### Out of Scope
- Production-grade security testing (no intrusive scanning)
- Real payment integrations (not available in demo)
- Cross-browser matrix beyond a representative Chromium run (can be expanded later)
- Data persistence guarantees on Reqres (public demo API; data may be mocked)

---

## 3. Risk Model (Why Risk-Based)

We prioritize testing based on:
- **Impact:** user/business damage if broken
- **Likelihood:** probability of defect given typical changes
- **Detectability:** how quickly we can detect issues

**Risk score = Impact (1-5) x Likelihood (1-5)**

### Top Risks
|     Area     |              Risk             | Impact | Likelihood | Score |               Mitigation / Test Focus              |
|--------------|-------------------------------|--------|------------|-------|----------------------------------------------------|
| UI Login     | Users cant access app         |   5    |      3     |  15   | Smoke login (positive + negative), stable locators |
| Cart & Badge | Wrong cart state / lost items |   5    |      4     |  20   | Smoke add/remove + badge assertions                |
| Checkout     | Cannot complete purchase flow |   5    |      3     |  15   | Checkout happy path + key validations              |
| API Contract | Breaking schema/status code   |   4    |      4     |  16   | Contract-style assertions (status + schema fields) |
| Performance  | Latency spike breaks UX       |   4    |      3     |  12   | k6 baseline + thresholds + trend monitoring        |

---

## 4. Test Strategy

### 4.1 Test Levels
- **Pre-checks (Static):** config validation, tagging conventions, “no sleep / no waitForTimeout”, env readiness.
- **Smoke Tests (UI & API):** fastest high-impact verification.
- **API Tests (Postman/Newman style):** positive + negative + contract checks.
- **UI E2E (Playwright):** broader regression coverage, trace/screenshot evidence.
- **Performance (k6):** baseline throughput/latency with thresholds.
- **Quality Gate:** combine results -> release decision.

### 4.2 Prioritization
- P0: login, add-to-cart, checkout, basic API contract
- P1: negative validations, edge flows, additional filters/sorting
- P2: non-critical UI cosmetics

### 4.3 Automation Approach
- **Playwright:** role-based locators / data-testid, avoid flaky waits, trace on retry/failure
- **Postman:** schema-like assertions using tests scripts (required fields, status codes, response time)
- **k6:** thresholds for p95 + error rate; results summarized to markdown evidence

---

## 5. Environments & Configuration

### UI Target
- Base URL: `https://www.saucedemo.com`
- Test user: `standard_user`
- Password: `secret_sauce`

### API Target
- Base URL: `https://reqres.in`
- Note: public demo API, data may be mocked; treat as contract demo.

### Evidence & Reports
- Playwright report: `artifacts/playwright/report/`
- Trace/screenshot: `artifacts/playwright/`
- Postman collection + report: `artifacts/postman/`
- k6 script + summary: `artifacts/k6/`

---

## 6. Test Data
- SauceDemo built-in users (standard_user, locked_out_user, etc.)
- Reqres demo payloads for create/update (user name/job)

---

## 7. Entry / Exit Criteria

### Entry Criteria
- Test environment reachable (UI & API)
- Test accounts available (SauceDemo)
- Config present (BASE_URL, credentials if used)
- Smoke suite prepared (minimum P0 cases)

### Exit Criteria (Quality Gate)
Release is **APPROVED** only if all conditions meet:
- Smoke pass rate = **100%**
- API pass rate >= **98%**
- UI pass rate >= **95%**
- Performance p95 < **800 ms**
- Critical open bugs = **0**

(Thresholds are configurable in `data-pipeline.json`)

---

## 8. Reporting & Evidence
Evidence must be audit-ready:
- Clear logs per stage (what ran + where + results)
- Artifacts linkable in Evidence Vault
- Defect examples include repro + expected/actual + severity/priority + attachments

---

## 9. Roles & Responsibilities (Portfolio Simulation)
- **QA (Owner):** define risk model, implement automation, collect evidence, triage failures
- **Dev (Simulated):** respond to contract/schema changes and flaky locator issues
- **Release Owner (Simulated):** approve/block based on Quality Gate outcome

---

## 10. Assumptions & Constraints
- This is a demo portfolio; targets are public systems.
- Reqres behaviors may not reflect real production persistence.
- The goal is to demonstrate QA process quality and evidence quality, not to test a proprietary product.
