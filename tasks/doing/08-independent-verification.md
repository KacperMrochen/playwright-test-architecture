# 08 — Independent verification of tasks 01-06

Depends on: 01, 02, 03, 04, 05, 06

Tasks 01-06 are implemented and sitting in `tasks/doing/`. Per `AGENTS.md`
the implementer doesn't move their own work — this is the pass that moves
each to `done/`, or back to `todo/` with the failures listed.

## Scope

For each task, check the implementation against its criteria rather than
against the code that was written:

- Every criterion in the task's scope has a test whose title names it.
- Each test asserts the criterion's *observable* result, not an
  implementation detail of the page object.
- The tests match the rules in `TESTING.md`: one tag, stable selectors, no
  fixed waits, an account per test with teardown.
- The coverage map's Test column still matches where each test actually
  lives — two rows drifted during implementation (AC-03.2, AC-06.5) and
  were corrected; look for others.

## Definition of done

- `npm test` passes, and `--grep @smoke` passes on all six projects.
- Each task file is moved to `done/`, or returned to `todo/` with what
  failed.
- Any criterion found to be wrong about the live site is fixed in
  `docs/criteria/` first, per the spec-drift rule — not by adjusting the
  test until it passes.

## Outcome

Tasks 01-06 verified and moved to `done/`. `npm test` passes on all six
projects (58 tests); `--grep @smoke` passes on all six.

Found and fixed during the pass:

- **AC-03.2 was untraceable.** It was named in a comment rather than a
  test or step title, so `TESTING.md`'s traceability rule was not met and
  the criterion would not survive a mechanical check. It is now a
  `test.step()` inside "AC-03.1 logs in and out". All 66 criteria are now
  named by a test or step title.
- **Four more coverage-map rows had drifted**, beyond the two this task
  already recorded: AC-05.2, AC-08.1, AC-18.1 and AC-19.1 quoted test
  titles that no longer existed. The Test column now quotes the full
  `AC-NN.N ...` title so the next drift is greppable.
- **AC-13.1's coverage-map description claimed deletion ends sessions.**
  FR-13 makes no such claim; it requires a following `verifyLogin` to
  return 404. The description and the test title now match the criterion.
  No criteria were changed to fit a test.
- Assertion and API-currency fixes across the suite, listed in the pull
  request.

This task stays in `doing/`: per `AGENTS.md` its own implementer does not
move it to `done/`.
