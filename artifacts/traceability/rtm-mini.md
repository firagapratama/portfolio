# Mini RTM — SauceDemo (Release-Oriented)

This RTM maps **requirements → tests → bugs → pipeline stages → release impact**.

| Req ID |         Requirement Description          |  Risk  |  Test Case ID(s)  |     Test Type     |         Automation         |      Pipeline Stage       | 
|--------|------------------------------------------|--------|-------------------|-------------------|----------------------------|---------------------------|
| RQ-001 | User can login with valid credentials    | High   | SMK-001, REG-001  | Smoke, Regression | Automated (Playwright)     | Pre-checks, Smoke, UI E2E |
| RQ-002 | Invalid login shows proper error message | Medium | REG-002           | Regression        | Automated (Playwright)     | UI E2E                    |
| RQ-003 | User can add product to cart             | High   | SMK-002, REG-003  | Smoke, Regression | Automated (Playwright)     | Smoke, UI E2E             |
| RQ-004 | User can remove product from cart        | Medium | REG-004           | Regression        | Automated (Playwright)     | UI E2E                    |
| RQ-005 | User can complete checkout successfully  | High   | SMK-003, REG-005  | Smoke, Regression | Automated (Playwright)     | Smoke, UI E2E             |
| RQ-006 | Product sorting works correctly          | Low    | REG-006           | Regression        | Manual                     | UI E2E                    |
| RQ-007 | API contract remains backward compatible | High   | API-001 – API-006 | API               | Automated (Postman/Newman) | API                       |
| RQ-008 | System meets performance baseline        | Medium | PERF-001          | Performance       | Automated (k6)             | Performance               |
| RQ-009 | Checkout confirmation is clear to user   | Low    | UX-001            | Acceptance        | Manual                     | UI E2E                    |
 
| Req ID |   Linked Bugs   |             Release Impact            |
|--------|-----------------|---------------------------------------|
| RQ-001 | —               | **Block** — entry point for all flows |
| RQ-002 | —               | Allow with risk                       |
| RQ-003 | —               | **Block** — revenue impact            |
| RQ-004 | —               | Allow with risk                       |
| RQ-005 | **BUG-UI-001**  | **Block** — critical business flow    |
| RQ-006 | —               | Defer if needed                       |
| RQ-007 | **BUG-API-001** | **Block** if client dependent         |
| RQ-008 | —               | Block if p95 exceeds threshold        |
| RQ-009 | **BUG-UX-001**  | Block for launch / demo               |