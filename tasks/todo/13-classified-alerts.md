# 13 — Say what failed: classified alerts

Depends on: 09

Both `site-drift` issues raised so far were something else: the first was
"No tests found", the second was one flaky test on `e2e-mobile-ios` while
57 tests passed. A setup failure raises nothing at all, and neither does a
failed weekly accessibility scan. The classes and their labels are decided
in
[`test-strategy.md`](../../docs/testing/test-strategy.md#detecting-site-drift).

## Scope

- **Detect an answer that isn't the site.** A shared helper in `api/`
  checks the body before parsing, so HTML where JSON was expected fails
  with "the site served HTML instead of JSON — the runner was probably
  challenged" rather than `Unexpected token '<'`. Every client goes
  through it.
- **Classify the run** in task 09's reporter: setup, no tests found,
  environment, behavior, flaky. The nightly reads that instead of guessing
  from the step outcome.
- **Route by class** in `nightly.yml`: one open issue per label (`ci`,
  `environment`, `site-drift`, `flaky`), commented on rather than
  duplicated, as today's `site-drift` issue already does. A `site-drift`
  body names the criteria to re-verify; a `flaky` body names the test and
  links its trace.
- **A `flaky` issue is filed from any run that needed a retry**, PR gates
  included — not only the scheduled ones. Re-running a job until it's
  green would otherwise erase the only evidence that a test is flaky.
- **Report a setup failure too** — today the issue step is skipped
  whenever the failure wasn't the test step, so nothing is raised at all.
- **The weekly accessibility scan** reports through the same routing.

## Definition of done

- Each class is provoked once and raises the right issue: a broken filter
  (no tests), a forced setup failure, a test failing an assertion, a test
  that passes only on retry.
- The environment case is shown with a mocked HTML response through the
  client helper, and its message names the cause.
- No run can fail without an issue or a comment naming its class.
- Issue #6 is closed or relabelled: it's a flaky test, not site drift.
