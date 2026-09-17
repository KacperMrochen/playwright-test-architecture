# 10 — First run of the manual checks

Depends on: —

The exit criteria count a criterion marked *manual* as covered only once
its check has a dated run. None has run yet, so AC-23.1, AC-23.2, AC-24.1
and NFR-02 are uncovered until this is done.

## Scope

Run each check in `docs/testing/manual-checks.md` once, by hand, in an
ordinary browser with nothing blocked:

- MC-01 — scroll-to-top control (AC-23.1, AC-23.2)
- MC-02 — Test Cases page (AC-24.1)
- MC-03 — a real visitor's pass (NFR-02)

MC-04 is exploratory and not required by the exit criteria; run it when a
real phone is to hand.

## Definition of done

- The run log has a dated row for MC-01, MC-02 and MC-03, with the result
  and anything worth following up.
- A check that fails is treated as possible site drift: re-verify the
  behavior and update `docs/criteria/` first, per `AGENTS.md`.
