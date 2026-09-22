# Pre-checks Checklist (CI Readiness)

Purpose:  
Prevent flaky runs and wasted CI time by validating **inputs, configuration, and tooling**
before any test execution begins.

This stage acts as a **hard gate** for the pipeline.

---

## Run Result (Latest)
- Status: **PASS**
- Target: `saucedemo.com` (UI) / `reqres.in` (API)
- Environment: `local`
- Executed by: QA
- Timestamp: 2025-12-20 17:05 (UTC+7)

---

## A. Inputs & Environment
- [ ] `BASE_URL` is set and points to the intended environment (dev/staging).
- [ ] Credentials / test users are available and valid (stored as secrets in CI).
- [ ] Network access is available (no proxy, VPN, or captive portal blocking).
- [ ] Timezone / locale assumptions documented if assertions depend on them.

## B. Test Configuration (Playwright)
- [ ] `playwright.config` defines clear projects (Chromium at minimum).
- [ ] Retries enabled for CI (`retries: 1–2`).
- [ ] Trace, screenshot, and video captured on failure or retry.
- [ ] Report output path is deterministic (e.g., `playwright-report/`).

## C. Tagging & Suite Hygiene
- [ ] Tests are consistently tagged (`@smoke`, `@regression`).
- [ ] Smoke suite covers critical path (login → core navigation → checkout).
- [ ] No `waitForTimeout()` used for synchronization (anti-pattern).
- [ ] Locators prioritize stable strategies (`getByRole`, `getByTestId`).

## D. Tooling & Dependencies
- [ ] Node.js version is pinned and documented.
- [ ] Dependencies installed via clean install (`npm ci`).
- [ ] Playwright browsers installed (`npx playwright install --with-deps` if required).

## E. Gate Rules (Pre-checks)
- [ ] All environment variables validated.
- [ ] Configuration validated (timeouts, retries, reporters).
- [ ] No critical config or tooling errors detected.

**Decision Rule:**
- If **any item above fails** → **Pipeline BLOCKED**
- If all pass → **Proceed to Smoke Tests**

---

## Notes
- Pre-checks failures are treated as **configuration defects**, not test failures.
- Fix pre-checks before re-running the pipeline to avoid false negatives downstream.

---

Owner: Firaga Pratama  
Last updated: 2025-12-20
