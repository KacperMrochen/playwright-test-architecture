<!-- sdd:start -->
## Spec-driven development

- **Size decides the path:**
  - No behavior change (typo, config, refactor) → just do it.
  - Bug fix or one small behavior change → one task in `tasks/todo/`, then
    implement and verify.
  - A feature (several behaviors, or touches architecture) → spec first,
    then tasks.
- **Acceptance criteria** live in `docs/criteria/`: `README.md` (context,
  NFRs, exit criteria, assumptions, out of scope), one file per
  requirement in `requirements/FR-NN-<slug>.md`. There's no per-feature
  subfolder because there's only one target site. This is not
  `docs/specs/`: this project doesn't ship product features, it tests a
  third-party app (`automationexercise.com`) we don't own —
  `docs/criteria/` holds the observed, live-verified behavioral contract
  that behavior is checked against, not a spec for something being built.
  The coverage map in `docs/testing/test-plan.md` keys off these `AC-NN.N`
  IDs; it doesn't own its own numbering.
- **Test-writing rules** live in `TESTING.md`; strategy decisions and
  their reasoning (framework, pipeline, browser matrix, environments) live
  in `docs/testing/test-strategy.md`.
- **Tasks** live in `tasks/`. The folder is the status:
  `todo/` → `doing/` → `done/`.
- **Picking a task:** take the lowest-numbered task in `tasks/todo/` whose
  `Depends on` tasks are all in `tasks/done/`, and move it to
  `tasks/doing/` before starting work.
- **Finishing a task:** the implementer leaves it in `doing/`. Only an
  independent verification moves it to `done/`, or back to `todo/` with
  the failures listed.
- **Spec drift:** if the work shows the criteria are wrong or incomplete,
  stop and get `docs/criteria/` updated before continuing — re-verify
  against the live site rather than guessing. Never build around it.
- **IDs are stable:** requirement (`FR-NN`, `NFR-NN`) and criterion
  (`AC-NN.N`) IDs are never renumbered or reused.
<!-- sdd:end -->
