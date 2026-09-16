# 09 — Custom reporter: traceability and drift

Depends on: 02, 03, 04, 05, 06

The HTML reporter answers "which tests failed". This project's documents
promise something the default reporter can't show: that every criterion in
`docs/criteria/` is proven, and that a failure points at the site rather
than at us. A custom reporter is where those promises get checked
mechanically instead of by hand.

## Scope

A reporter in `reporters/traceability.ts`, added alongside the HTML
reporter rather than replacing it.

- **Trace results to criteria.** Parse `AC-NN.N` from each test title and
  report per requirement: which criteria passed, failed, or have no test
  at all, and any test naming an ID that doesn't exist in
  `docs/criteria/`. A criterion silently losing its test is the failure
  mode worth catching — `TESTING.md` states the traceability rule and
  nothing currently enforces it.
- **Name flaky tests as flaky.** A test that passed only on retry is
  reported separately from green, per the flake policy, since CI's single
  retry otherwise hides it.
- **Summarize drift for the nightly.** On failure, list the criteria whose
  tests failed and the `docs/criteria/` files to re-verify, in a form the
  nightly job can put straight into the `site-drift` issue body instead of
  a bare run link.
- **Write a Markdown summary** to `$GITHUB_STEP_SUMMARY` when running in
  CI, and a JSON artifact for anything downstream.

A prototype of the traceability check already exists as a throwaway script
used while writing the suite: it compares IDs in `docs/criteria/` against
IDs named in `tests/`, and it's what caught the "65 of 66" miscount. Start
there.

## Definition of done

- A deliberately unmapped criterion, and a test naming a made-up ID, both
  surface in the report.
- The pre-merge job fails when a criterion has no test — the coverage
  claim becomes enforced rather than documented.
- The nightly job's `site-drift` issue body names the affected criteria.
- The HTML report still works locally and in CI.
