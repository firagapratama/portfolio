# Bug Report Samples - Severity vs Priority (Portfolio)

> These samples demonstrate clear triage thinking: **Severity** = impact to users/business,  
> **Priority** = urgency/order of fixing for the release.

---

## Bug 1 - High Severity, High Priority (UI / SauceDemo)

**ID:** BUG-UI-001  
**Title:** [Checkout] Finish button does not complete order (blocks purchase)  
**Product/Area:** SauceDemo - Checkout  
**Environment:** Web - Chromium (latest) - Windows 10/11  
**Build/Version:** Public demo (SauceDemo)  
**Severity:** **S1 (Critical)** - blocks critical business flow  
**Priority:** **P0 (Fix now)** - release blocking (Quality Gate)

### Preconditions
- User is logged in as `standard_user`
- At least 1 item exists in cart

### Steps to Reproduce
1. Go to Inventory page
2. Add any item to cart
3. Open Cart -> Click **Checkout**
4. Fill checkout form (First Name, Last Name, Zip)
5. Click **Continue**
6. On Overview page, click **Finish**

### Expected Result
- Order completes successfully
- User is redirected to confirmation page (e.g., “THANK YOU FOR YOUR ORDER”)

### Actual Result
- Clicking **Finish** does nothing / page stays on overview  
- User cannot reach confirmation page

### Evidence
- Screenshot: `artifacts/playwright/screenshots/BUG-UI-001_finish_click_noop.png`
- Trace: `artifacts/playwright/trace/BUG-UI-001_trace.zip`
- Console logs (if captured): "Uncaught TypeError ..."

### Impact / Why it matters
Checkout completion is the highest-value flow. If this happens in production, it results in lost revenue and user trust.

### Triage Notes
- Suspect: unstable locator for Finish button OR UI handler not triggered due to overlay state
- Quick isolation:
  - Verify if button is disabled / covered by another element
  - Confirm network call triggered (DevTools → Network)
- Proposed fix:
  - Use `data-testid` or role-based locator (`getByRole('button', { name: 'Finish' })`)
  - Ensure click target is visible and enabled (no forced waits)

### Quality Gate Impact
- Affects: **Smoke Tests / UI E2E**
- Impacted metric: UI pass rate
- Gate outcome:
  - UI pass rate < 95% → **Quality Gate = BLOCKED**
- Release decision:
  - ❌ Release must not proceed until fixed

**Release Gate Mapping:** RQ-005 (Checkout) -> SMK-003 / REG-005  
**Recommended Action:** Block release until resolved + add regression test to prevent recurrence.

---

## Bug 2 - Medium Severity, High Priority (API Contract / Reqres)

**ID:** BUG-API-001  
**Title:** [Contract] GET /api/users/2 schema mismatch breaks client parsing  
**Product/Area:** Reqres API — Users (Contract)  
**Environment:** Postman/Newman · Staging-like demo (Reqres)  
**Severity:** **S2 (Major)** — feature still works but client integration can break  
**Priority:** **P0–P1** (depends on release) — urgent if clients depend on contract

### Preconditions
- API tests executed via Postman/Newman with schema assertions enabled

### Steps to Reproduce
1. Send request: `GET https://reqres.in/api/users/2`
2. Validate response body against expected schema:
   - `data.id` is number
   - `data.email` exists and is string
   - `data.first_name` exists and is string
   - `data.last_name` exists and is string
3. Observe assertion results

### Expected Result
- Response matches contract assertions
- Tests pass consistently

### Actual Result
- Contract assertion fails:
  - Missing field OR unexpected field type
  - Example: `data.email` is null / renamed field / structure changed

### Evidence
- Postman report: `artifacts/postman/report.html`
- Collection: `artifacts/postman/collection.json`
- Failed assertion snippet:
  - `pm.expect(pm.response.json().data.email).to.be.a('string')` (fails)

### Impact / Why it matters
Even if endpoint returns 200, breaking contract can:
- break frontend rendering
- crash consumer service
- cause downstream incidents

### Triage Notes
- Confirm whether this is an intentional API change or test expectation outdated.
- If intentional:
  - update schema assertions + version contract
  - notify consumers (changelog)
- If unintentional:
  - revert API response structure or add backward-compatible fields

### Quality Gate Impact
- Affects: **API Tests**
- Impacted metric: API pass rate
- Gate outcome:
  - API pass rate < 98% → **Quality Gate = BLOCKED**
- Release decision:
  - ❌ Block release if client depends on this contract

**Release Gate Mapping:** API pass rate >= 98%  
**Recommended Action:** Treat as release-blocking if UI/client depends on the contract.

---

## Bug 3 - Low Severity, High Priority (Release / UX)

**ID:** BUG-UX-001  
**Title:** [Checkout] Confirmation message copy is unclear and reduces user confidence  
**Product/Area:** SauceDemo — Checkout Confirmation  
**Environment:** Web — Chromium (latest)  
**Build/Version:** Public demo (SauceDemo)  
**Severity:** **S4 (Low)** — does not break functionality  
**Priority:** **P0 (Fix before release)** — affects launch quality & user trust

### Preconditions
- User has completed checkout flow successfully

### Steps to Reproduce
1. Login as `standard_user`
2. Add any item to cart
3. Complete checkout process
4. Observe confirmation page text

### Expected Result
- Confirmation message clearly reassures user that:
  - Order is completed
  - No further action is required
  - Purchase was successful

### Actual Result
- Confirmation message is minimal / ambiguous
- Does not clearly state next steps or reassurance
- Example:
  - Lacks explicit confirmation such as “Your order has been successfully placed”

### Evidence
- Screenshot: `artifacts/playwright/screenshots/BUG-UX-001_confirmation_copy.png`

### Impact / Why it matters
Although functionality works, unclear confirmation messaging can:
- reduce user confidence
- cause repeated actions (refresh / re-check cart)
- increase support inquiries (“Was my order successful?”)

This is especially risky during **release or demo scenarios** where perception matters.

### Triage Notes
- Root cause:
  - UX copy not reviewed as part of release checklist
- Proposed fix:
  - Update confirmation copy to include:
    - clear success statement
    - brief reassurance message
- Example improvement:
  - “Thank you! Your order has been successfully placed.”

### Quality Gate Impact
- Affects: **Release UX / Acceptance**
- Gate behavior:
  - ❌ Not a functional blocker
  - ❌ Does not reduce test pass rates
  - ✅ Still considered **release-critical** due to launch risk

### Release Decision
- **Block release until fixed if this is a launch/demo build**
- Can be deferred only if release is internal / non-customer facing

---

## Severity vs Priority Quick Reference
- **Severity** answers: "How bad is the impact?"
- **Priority** answers: "How urgently should we fix it for this release?"

Examples:
- Low severity but high priority: cosmetic issue on marketing launch day
- High severity but lower priority: critical bug on feature not in the current release scope

## Notes

These bug samples demonstrate how defects are evaluated not only by
technical impact, but also by **release risk and quality gate implications**.

The goal is to ensure that release decisions are data-driven, auditable,
and aligned with business priorities.

