# 03 — Auth e2e

Depends on: 01

## Scope

`tests/e2e/auth.spec.ts` with `pages/LoginPage.ts`, `pages/SignupPage.ts`:

- "logs in and out" — AC-03.1 + AC-05.1 (`@smoke`)
- AC-02.1 duplicate email rejected in the signup form
- AC-03.2 an API-created account logs in through the UI
- AC-04.1 wrong password, AC-04.2 unknown email — identical message
- AC-05.2 logout leaves another session of the same account alone

## Definition of done

- Passes on `e2e-chromium`; the `@smoke` test also on `e2e-mobile-ios`.
- Each test seen to fail when its expectation is broken.
