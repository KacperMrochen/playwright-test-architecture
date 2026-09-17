# 14 — Flaky: AC-03.1 logout on mobile WebKit

Depends on: —

The nightly run of 2026-09-17 was red with 57 passed and 1 flaky:
`AC-03.1 logs in and out` on `e2e-mobile-ios` failed its first attempt in
`page.waitForURL: Test timeout of 60000ms exceeded`, from
`Header.clickLogout()` (`pages/Header.ts:22`), and passed on the retry.
Per [`TESTING.md`](../../TESTING.md#flake-policy) that's flaky, not green.

Run: https://github.com/KacperMrochen/playwright-test-architecture/actions/runs/35198896972
— the trace is in the `playwright-report-nightly` artifact, and issue #6
currently records this as site drift, which it isn't.

## Scope

- Diagnose from the trace before changing anything: did the logout link
  get clicked, did the navigation start, or did `waitForURL` wait for a
  load event that never came? An iPhone-viewport-only failure points at
  the click, not at the assertion.
- Fix the cause. If the wait is the problem, wait on the signed-out
  navigation the criterion actually describes (AC-05.1: "Signup / Login"
  visible) rather than on the URL.
- No test may be edited until it's green for the right reason; a fixed
  expected value that makes red go away isn't a fix.

## Definition of done

- `npx playwright test tests/e2e/auth.spec.ts --project=e2e-mobile-ios
  --repeat-each=5` passes, and the same on `e2e-webkit`.
- AC-03.1 and AC-05.1 still assert what their criteria say.
- Issue #6 is closed, and the flake is recorded as a flake.
