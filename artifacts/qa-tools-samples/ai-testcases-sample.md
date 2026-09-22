# AI-Generated Test Cases (Sample Output)

> **Source:** Synthesized by `qa-assistant-tools` — **Pipeline 2: Testcase AI Generator**  
> **Model:** OpenRouter AI Technical Analysis  
> **Target Module:** DODO WebAdmin — Authentication & Access Control  
> **Generation Timestamp:** 2026-09-22 14:15:00 UTC+7

---

## 1. Executive Summary

This suite was automatically synthesized by parsing user interaction traces, DOM attributes, and navigation logs captured during manual or exploratory sessions. The AI model identified primary user journeys, negative boundary conditions, and role-based permissions.

- **Total Test Cases Generated:** 6
- **Risk Distribution:** 3 Critical (P0), 2 Major (P1), 1 Medium (P2)
- **Coverage Types:** Positive Functional, Security/Negative, Form Validation

---

## 2. Test Case Specification Table

| TC ID         | Module | Title                                    | Priority | Type       | Precondition                  | Expected Result                                                     | Automation Tag          |
| :------------ | :----- | :--------------------------------------- | :------- | :--------- | :---------------------------- | :------------------------------------------------------------------ | :---------------------- |
| **TC-AI-001** | Auth   | Login with Valid Admin Credentials       | **P0**   | Functional | User has active admin account | Redirected to Dashboard; JWT token saved in sessionStorage          | `@smoke` `@auth`        |
| **TC-AI-002** | Auth   | Login Attempt with Locked Account        | **P0**   | Security   | Account status = `LOCKED`     | Error banner: "Akun Anda terkunci, hubungi administrator"           | `@security` `@negative` |
| **TC-AI-003** | Auth   | Blank Username and Password Submission   | **P1**   | Validation | On Login Page                 | Inline form errors on both fields; Submit button disabled/handled   | `@validation`           |
| **TC-AI-004** | Auth   | SQL Injection Pattern in Username Field  | **P1**   | Security   | On Login Page                 | Sanitized input; HTTP 400/401 response without backend stack trace  | `@security`             |
| **TC-AI-005** | Auth   | Password Visibility Toggle Functionality | **P2**   | UI/UX      | Password entered              | Input type toggles between `password` and `text` dynamically        | `@regression`           |
| **TC-AI-006** | Auth   | Session Timeout and Inactivity Redirect  | **P0**   | Session    | User logged in for >30m idle  | Page redirects to `/login` with flash message "Sesi telah berakhir" | `@session`              |

---

## 3. Step-by-Step Scenario Detail

### TC-AI-001: Login with Valid Admin Credentials

1. Navigate to `${BASE_URL}/login`.
2. Verify locator `input[name="username"]` is visible and enabled.
3. Fill `admin@dodo-admin.com` into username field.
4. Fill `${ADMIN_PASSWORD}` into password field.
5. Click button `button[type="submit"]`.
6. Assert URL matches `${BASE_URL}/dashboard`.
7. Assert user greeting badge displays "Selamat Datang, Admin".

### TC-AI-002: Login Attempt with Locked Account

1. Navigate to `${BASE_URL}/login`.
2. Input username `locked_user@dodo-admin.com`.
3. Input valid password `Password123!`.
4. Click Submit button.
5. Assert notification toast appears with role `alert`.
6. Assert text content equals "Akun Anda terkunci, hubungi administrator".
7. Verify user remains on `/login` and no authorization cookie is created.

---

## 4. Automation Export Compatibility

This document is compatible with direct conversion into Playwright TypeScript specifications (`*.spec.ts`) via **Pipeline 6: E2E Auto Gen** in `qa-assistant-tools`.
