# playwright-test-architecture

A Playwright suite against [automationexercise.com](https://automationexercise.com),
a public e-commerce site published for automation practice. The tests
matter less than the reasoning around them: what's worth testing, at which
layer, how often, and what each decision costs.

## Start here

| Document | What it answers |
|---|---|
| [`docs/criteria/`](docs/criteria/README.md) | How the site behaves — 24 requirements, 69 criteria, each verified against the live site |
| [`docs/testing/test-plan.md`](docs/testing/test-plan.md) | Which criterion is proven by which test, at which layer, in which pipeline stage |
| [`docs/testing/test-strategy.md`](docs/testing/test-strategy.md) | Framework, project layout, browser matrix, pipeline, environments |
| [`docs/testing/manual-checks.md`](docs/testing/manual-checks.md) | What isn't automated, why, and how it gets checked instead |
| [`TESTING.md`](TESTING.md) | The rules every individual test follows |
| [`docs/adr/`](docs/adr/) | Decisions worth the argument they'd otherwise cause twice |

## Testing an app you don't own

The usual assumption — the code changed, the tests caught it — is inverted
here. This site can change without notice, and nobody announces it, so most
new failures mean the *site* moved, not our code. Several decisions follow
from that:

- **The behavior is verified, not guessed.** Every criterion records what
  the live site actually did: real messages, real status codes, real
  response shapes. The site publishes its own list of test cases, and
  paraphrasing those titles into assertions would have produced a suite
  that tests someone else's documentation. Its numbering is kept only as
  [provenance](docs/testing/test-plan.md#source-case-index).
- **A nightly run exists to catch drift.** Our code is unchanged between
  runs, so a failure points at the site first. It opens an issue, since
  nobody is watching at 03:00.
- **A failing test is a documentation bug until proven otherwise.**
  Re-verify against the live site, update the criteria, and only then
  touch the test. Editing a test until it passes again is how a suite
  quietly stops describing the real application.

## What's interesting here

- **Redundant tests are cut before they're written.** The site publishes 26
  test cases; building one test per case would duplicate coverage. The
  [test plan](docs/testing/test-plan.md#redundant-coverage) records which
  ones were folded, demoted or dropped, and why.
- **Not everything is worth automating,** and the ones that aren't get a
  trigger, an owner and a run log rather than silence — including the
  risks this suite hides from itself, since blocking ads also blinds it to
  ad-caused layout shift. See
  [what we don't automate](docs/testing/test-strategy.md#what-we-dont-automate)
  and [manual checks](docs/testing/manual-checks.md).
- **Findings that changed the design**, all from driving the site by hand:
  a consent dialog that intercepts every click in some regions
  ([ADR 0001](docs/adr/0001-third-party-network-isolation.md)); a cart
  stored against the account rather than the browser, which rules out a
  shared test account
  ([ADR 0002](docs/adr/0002-test-account-strategy.md)); an API that returns
  HTTP 200 for its errors, so a test checking only the status passes on
  every failure.
- **Three CI groups, split by the question they answer** rather than by how
  long they take: does this change break the suite, is it ready to merge,
  and did the site change under us.
- **Costs are written down next to the decisions.** Narrower PR runs mean a
  Firefox-only break surfaces a day later; blocking third-party requests
  means ad-related bugs are invisible; an interrupted run leaks a test
  account that can never be found again.

## Running it

```bash
npm ci
npx playwright install --with-deps

npm test                  # everything, all six projects
npm run test:smoke:pr     # the PR gate: smoke on api + Chromium + mobile WebKit
npm run test:regression:pr  # pre-merge: regression on api + Chromium
npm run test:a11y         # accessibility scan
```

No configuration and no secrets: every test creates the account it needs
and deletes it afterwards.

## Status

The suite is in place: 50 tests prove 66 of the 69 criteria, across six
Playwright projects (one API, five browser), and CI runs them in the three
groups above. The other three are checked by hand, on purpose.
