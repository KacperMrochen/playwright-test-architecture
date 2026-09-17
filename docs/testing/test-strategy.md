# Test strategy

Decisions about the test environment as a whole, not any one behavior's
coverage. Nothing here was inherited: there was no existing pipeline or
framework to migrate from, so every choice below is a fresh one with its
alternatives named.

## Testability

The target is a live, third-party production site, so testability here
means "how well does the site itself support stable automation," not "what
should our own developers change" — there's no team to hand a gap to.

- **Selectors are inconsistent across the site.** The login/signup page
  ships purpose-built `data-qa` attributes (`data-qa="login-email"`,
  `data-qa="login-password"`, `data-qa="login-button"`,
  `data-qa="signup-name"`, `data-qa="signup-email"`,
  `data-qa="signup-button"`) — confirmed directly in the page's raw HTML.
  The account-information and payment forms have them too; the checkout
  page has a single one on a wrapper, and the products and cart pages have
  none. Because coverage is uneven, the selector rules in
  [`TESTING.md`](../../TESTING.md#selectors) fall back to roles and labels
  rather than assuming `data-qa` exists everywhere.
- **A consent dialog can block every interaction.** From an EU connection
  the site shows a Google Funding Choices consent dialog
  (`.fc-consent-root`) that sits over the page and intercepts every click.
  Playwright reports this as a click timeout on an otherwise visible
  element, which looks like a selector bug. Blocking
  `fundingchoicesmessages.google.com` and `pagead2.googlesyndication.com`
  at the browser-context level removes both the dialog and the ad iframes,
  confirmed live. Whether a given CI runner's region gets the dialog isn't
  something the suite should depend on, so the block applies everywhere
  ([ADR 0001](../adr/0001-third-party-network-isolation.md), which blocks
  every non-site host except the font CDN).
- **Sessions come from the login form, not from the API.**
  `POST /api/verifyLogin` only confirms credentials
  ([AC-03.3](../criteria/requirements/FR-03-login.md)); there's no token
  anywhere on this site. The form itself can be posted directly over HTTP
  (CSRF token from `GET /login`, then `POST /login`), which returns the
  Django `sessionid` cookie — so fixtures can log in without a browser and
  hand the cookie to a context via `storageState`. Sessions last 14 days,
  several can be open for one account at once, and logging out ends only
  the session that did it.
- **No isolation seams.** No staging environment, no way to fake time or
  the backend, no bulk data reset. The only data lifecycle available is
  `POST /api/createAccount` and `DELETE /api/deleteAccount`. This is an
  accepted constraint of testing a site we don't own, not a gap to close —
  it shapes test-data strategy (below) instead.

## Framework and tooling

**Playwright + TypeScript**, decided over Cypress. Reasoning: the coverage
map spans two layers — API/integration (14 documented endpoints) and UI
e2e (the journeys) — and Playwright's `request` fixture covers both inside
one test runner and one config. Cypress would need a second tool (or a
significantly more awkward API-testing story) for the integration layer,
doubling the CI setup for no coverage gain. Playwright also has native
multi-tab and cross-origin support, which the checkout/payment flow may
exercise.

No separate unit-test runner (Jest/Vitest). There's no unit layer against
the target app (see the test plan's coverage map — we don't own the code
being tested), and any future unit tests for this project's own helper code
(data builders, API client wrappers) can use Playwright Test's own `test()`
rather than adding a second runner for a handful of utility tests.

## Project structure

```
tests/
├── api/                   # `api` project — request fixture, no browser
│   ├── account.spec.ts
│   ├── auth.spec.ts
│   ├── brands.spec.ts
│   ├── products.spec.ts
│   └── search.spec.ts
└── e2e/                    # `e2e` project — browser-driven journeys
    ├── account.spec.ts         # subscription
    ├── auth.spec.ts            # login, logout, rejected credentials
    ├── cart.spec.ts
    ├── catalog.spec.ts         # search, category, brand, detail page
    ├── checkout.spec.ts        # the order journey, addresses, invoice
    ├── contact.spec.ts
    └── product-review.spec.ts
pages/                      # Page Object Model, one file per page or shared component
├── CartPage.ts
├── CheckoutPage.ts
├── ContactUsPage.ts
├── Header.ts               # the navigation bar every page shares
├── HomePage.ts             # includes the footer subscription form
├── LoginPage.ts
├── ProductDetailPage.ts
├── ProductsPage.ts         # also the category and brand listings
└── SignupPage.ts
api/                        # typed HTTP client wrappers, one per resource
├── account.ts
├── auth.ts
├── brands.ts
├── products.ts
├── search.ts
└── types.ts                # response shapes the clients share
fixtures/                   # custom Playwright fixtures and shared test data
└── test-data.ts            # per-test accounts, HTTP login, third-party blocking
playwright.config.ts        # `api` and `e2e` projects via testDir; tags live on individual tests, not on the project
TESTING.md                  # rules every individual test follows
docs/
├── adr/                     # architecture decisions (network isolation, test accounts)
├── criteria/                # acceptance criteria this project owns — FR-NN/AC-NN.N,
│                             # NOT the same as docs/specs/: nothing here is a feature
│                             # we're building, it's the observed contract of a
│                             # third-party app, verified against the live site
└── testing/
    ├── test-plan.md          # coverage map (keys off docs/criteria/'s AC-NN.N IDs),
    │                         # untested areas, NFR approach, risks
    └── test-strategy.md     # this file
```

Two decisions here, both reversible but worth stating:

- **Top-level split is by Playwright project (`tests/api/` vs. `tests/e2e/`), not by feature.** The `api` and `e2e` projects need different `testDir`s in `playwright.config.ts` since they use fundamentally different fixtures (`request` vs. a browser context) — a shared directory would need `testMatch` globs to separate them for no benefit.
- **Within each project, spec files are grouped by feature/page area, not 1:1 per requirement or per site case.** The redundant-coverage folding already decided only works cleanly if the file boundary is the feature — and the site's own numbering could change without notice (see the test plan's Risks section), so naming files after it would be fragile. Tests trace to criteria through their titles, not through file names. `pages/` and `api/` sit outside `tests/` entirely because a page object or client wrapper is reused across multiple spec files (`LoginPage` is used by both `auth.spec.ts` and the checkout journey, which starts its signup on the login page) — nesting it under one test directory would misrepresent that reuse.

Tags (`@smoke`, `@regression`, `@a11y`) are applied per `test()`, not per file or per project, so this structure doesn't constrain which tag a given test carries — a smoke test and a regression test can sit in the same spec file when they cover the same feature.

## Cross-browser and mobile support

Checked against the live site rather than assumed: the homepage's raw HTML
has no `navbar-toggler`/`navbar-collapse` markup (grepped directly), and the
nav bar is a plain `nav navbar-nav` list. There's no separate mobile
hamburger-menu interaction pattern to test — the site appears to be a
Bootstrap-grid responsive reflow, not a distinct mobile UI. That's worth
re-checking if the site's markup changes, but for now it means mobile
coverage is a viewport/engine concern, not a set of mobile-only journeys
that need their own test cases.

**Decision: full desktop/mobile/engine matrix only on `@smoke`, not on
`@regression`.** The alternative — running the entire regression suite
across every browser and device — would roughly multiply e2e CI time by
the number of projects for coverage that, past the core paths, mostly
re-proves "the browser renders a Bootstrap page," not new risk. The
`@smoke` tier is already the deliberately small, curated set, so
running it wide is cheap and catches genuine engine-level breakage on the
paths that matter most:

| Project | Engine / device | Tag scope |
|---|---|---|
| `e2e-chromium` | Chromium, desktop viewport | `@smoke` + `@regression` |
| `e2e-firefox` | Firefox, desktop viewport | `@smoke` only |
| `e2e-webkit` | WebKit, desktop viewport | `@smoke` only |
| `e2e-mobile-ios` | WebKit, `devices['iPhone 13']` | `@smoke` only |
| `e2e-mobile-android` | Chromium, `devices['Pixel 5']` | `@smoke` only |
| `api` | no browser | `@smoke` + `@regression` |

`e2e-chromium` carries full regression because one representative engine
still needs deep coverage, and Chromium is the cheapest/fastest to run at
that volume. The two mobile projects deliberately use different underlying
engines (WebKit for iOS, Chromium for Android) rather than one device
preset standing in for "mobile" generically — the point being demonstrated
is that iOS Safari and Android Chrome are different rendering engines, not
just different screen sizes.

**What holds that Tag scope column true.** The `@smoke`-only projects
carry a project-level tag filter, so they run their subset whatever
command starts them. `e2e-chromium` and `api` carry none — they run
whatever the command allows — so their scope is set by each pipeline
group's npm script instead, which is also the only place an `@a11y`
exclusion can live.

**Honest limitation, stated rather than implied away**: these are
Playwright's device presets — viewport size, user-agent string, and
touch-event emulation inside desktop-installed browser engines — not a
real device farm. They prove responsive layout and touch-driven
interaction, not iOS/Android-OS-specific browser quirks (e.g., a bug
specific to real mobile Safari's rendering engine build). That's the same
kind of caveat the test plan states about the site's published test cases
being someone else's spec rather than a contract — worth naming directly
instead of letting "mobile support" imply more than it delivers.

**The matrix runs wide nightly, narrow on pull requests.** Running all six
projects per PR costs 10 e2e runs and, because TC14 registers an account,
one account per e2e project against a site we don't own. Pull requests run
`api`, `e2e-chromium` and `e2e-mobile-ios`: Chromium plus the one project
that is both a second engine (WebKit) and a mobile viewport. Firefox,
desktop WebKit and Android Chromium run in the nightly group.

The cost is stated plainly: a Firefox-only or Android-only break is caught
within a day rather than on the PR that caused it. No engine loses
coverage — see Pipeline below for the command per group.

## Pipeline

- **What runs when — by tag, not by layer.** Layer (API vs. UI) decides
  *how* a test runs (see Framework and tooling: `api` and `e2e` are
  separate Playwright projects, one with a browser and one without). It
  doesn't decide *when* a test runs — a fast API check and a fast e2e
  journey belong in the same pipeline stage. Stage membership is a tag on
  the individual test instead, which each group filters on
  ([`TESTING.md`](../../TESTING.md#tags) has the syntax). Which tag a test
  carries is
  assigned per criterion in the
  [coverage map](./test-plan.md#coverage-map):

  - **`@smoke`** — the minimal set proving the app's core paths work: the
    API contract checks a broken backend would fail first. A test
    loses the tag once a journey proves its core on every engine
    ([redundant coverage](./test-plan.md#redundant-coverage)).
  - **`@regression`** — every other automated behavior in the map.
  - **`@a11y`** — the accessibility scans from Non-functional testing, run
    by the weekly job alone and excluded by tag from the nightly and the
    merge gate: an exploratory scan shouldn't gate merges on the site's
    accessibility rather than on our change.

  Concretely, three groups — and they're split by the *question they
  answer*, not by how long they take:

  | Group | Question | Trigger | Command | Scope |
  |---|---|---|---|---|
  | Static checks | Does the code type-check and follow the test rules? | every PR push, drafts included; required to merge | `npm run check` | no browser, no traffic to the site |
  | Post-push | Does this change break the suite? | every PR push, drafts included | `npm run test:smoke:pr` | `@smoke` × `api`, `e2e-chromium`, `e2e-mobile-ios` |
  | Pre-merge | Same, wider | every PR push once out of draft; required to merge | `npm run test:regression:pr` | everything on `api` + `e2e-chromium`, `@smoke` on the gate projects |
  | Scheduled | Did the site change under us? | nightly (full matrix), Monday (a11y) | `npm test` / `npm run test:a11y` | the full project matrix |

  **Static checks are their own job, not steps inside a test job.** They
  need no browser and send no traffic to a site we don't own, so they
  answer in well under a minute and can run on drafts, where the
  regression doesn't. They are the second required check on `main`:
  `TESTING.md`'s rules are only rules once something goes red, and a type
  error or a `waitForTimeout` would otherwise reach `main` on a green
  suite. A docs-only PR skips them the same way it skips the suites —
  prose can't fail a type-check, and a skipped required check counts as
  passing.

  **Why the engines sit in the nightly group.** Which browser breaks is a
  property of the site, not of our diff, so running Firefox, desktop
  WebKit and Android Chromium on every PR buys drift detection at PR time
  and pays for it per PR. They run nightly instead, and the post-push
  group still covers two engines (Chromium and mobile WebKit) on the core
  paths.

  **Pre-merge checks the code that gets merged.** The regression runs on
  every push once a PR is out of draft, `main` requires its check —
  `Pre-merge regression`, alongside `Static checks` — to pass, and a
  PR has to be up to date with `main` before it merges — so the head that
  passed is the tree that lands. Two alternatives were rejected: GitHub's
  merge queue, which tests the merge result directly but needs a
  repository owned by an organization, and a post-merge run on `main`,
  which under the up-to-date rule only re-tests what the gate already
  tested. The cost is one more job on each push to a ready PR, about two
  and a half minutes; it runs alongside smoke, so the wait for a result
  grows by about a minute.

  **A PR that touches only prose skips both suites** — Markdown, `docs/`
  and `tasks/` can't break a test, and running one creates accounts on a
  site we don't own. A job inside the workflow decides this rather than
  `paths-ignore`: a workflow that never starts leaves a required check
  pending forever, while a skipped job counts as passing. Anything short of
  a confirmed docs-only diff runs the suites, including a failed lookup.

  This is also why `api` and `e2e` stay separate Playwright *projects*
  rather than separate pipeline jobs: the projects control execution
  mechanics (browser or not), the tags control which subset runs at which
  point in the pipeline, and the two axes compose freely instead of forcing
  a project-per-stage structure.
- **CI provider: GitHub Actions.** The repo already lives on GitHub and
  public repos get free Actions minutes, so this avoids provisioning any
  separate CI infrastructure for a portfolio-scale suite.
- **Parallelism: one worker in CI, measured rather than assumed.** The
  numbers the decision rests on: the pre-merge regression takes about
  2.5 minutes against a 60-minute job budget, the post-push smoke about
  1.5 against 30, and the full nightly matrix 3 to 7 minutes against 90.
  Nothing is anywhere near its budget, so extra workers would buy a few
  minutes and spend them on concurrency against a third-party site that
  can challenge a runner it dislikes — and serial runs keep account
  creation spread out rather than bursting. The question reopens when a
  group passes 10 minutes or the suite doubles in size; at one worker the
  nightly would then be roughly 14 minutes, still inside its budget.
  Locally, workers are unbounded, so parallel isolation is proven on a
  developer's machine — that's also where `--repeat-each=5`
  ([`TESTING.md`](../../TESTING.md#a-test-must-be-able-to-fail)) runs.
  What makes this safe
  is that every test creates its own account and deletes it afterwards
  ([ADR 0002](../adr/0002-test-account-strategy.md)) — no two tests share
  one, not even tests that run one after another on the same worker,
  because the cart is stored against the account
  ([FR-08](../criteria/requirements/FR-08-cart-belongs-to-account.md)).
  Sharing would produce false failures indistinguishable from real bugs.
- **Retries.** At most one retry, CI-only (not local), and any test that
  needed the retry is reported rather than silently passed: the run goes
  red through `failOnFlakyTests`, and the reporter files a `flaky` issue
  from any run — a re-run to green leaves the record behind. A blanket
  retry policy would hide real flake from third-party ad/tracker requests
  or site slowness instead of surfacing it. This is why
  [ADR 0001](../adr/0001-third-party-network-isolation.md)'s network
  isolation matters: it removes the flake retries would otherwise be
  masking.
- **Timeouts.** 60s per test, against Playwright's 30s default. The target
  is a third-party site on the public internet, not a build we control:
  the register → checkout → pay journey measures ~25s on a healthy
  Chromium run, and one slow spell on automationexercise.com pushed
  ordinary page loads past 30s on every engine at once — including one
  that timed out before a test body had even started. A single budget in
  `playwright.config.ts` absorbs that variance while still capping a test
  that is genuinely stuck. A per-test `test.slow()` was rejected: the
  constraint comes from the environment, not from one test, so raising it
  in one test body would leave every other test on a budget the site
  already exceeds — and it would put an operational number next to
  behavioral assertions, where it reads as a property of the behavior.

## What we don't automate

A behavior earns an automated test by risk, not by being automatable.
Every test costs writing, running on up to six projects, diagnosis when it
fails and maintenance when the site moves — so the default is not "automate
unless it's hard".

A behavior stays manual when any of these holds:

- **The risk is cosmetic.** If a visitor can complete their goal anyway, a
  broken detail is worth noticing, not gating merges on.
- **The assertion would be less stable than the behavior.** Scroll
  position, animation timing and layout shift differ per engine and device
  preset, so the test flakes in exactly the projects that would run it.
  A flaky test is worse than no test: it trains people to ignore red.
- **The check proves nothing about the product.** A page that renders is
  not a behavior anyone depends on, however cheap the assertion.
- **We deliberately hid it from ourselves.** Blocking third-party
  requests ([ADR 0001](../adr/0001-third-party-network-isolation.md))
  makes the suite stable and blind to ads, layout shift and the consent
  dialog at once. Synthetic accounts
  ([ADR 0002](../adr/0002-test-account-strategy.md)) do the same for
  anything a long-lived, real account would reveal.
- **The infrastructure doesn't exist.** Real devices, as opposed to
  device presets, need a farm this project doesn't have.

The last two are the ones worth stating out loud: they're gaps our own
decisions created, and a strategy that lists only what it automates
quietly implies they don't exist.

Each manual check names the criterion it examines, as a test does, and
[`manual-checks.md`](./manual-checks.md) gives its procedure and the
conditions that would promote it into the suite. Nothing schedules those
checks or records their runs: they document the gap rather than close it,
so a break in one of these behaviors goes unnoticed until someone looks. A
gap written down is a decision; a gap left out is an accident.

### Automating it isn't the same as running it everywhere

"Automate or not" is the first decision; "how widely does it run" is a
second one, and skipping it is how suites quietly get slow. A test that
exists doesn't earn all six projects, and running everything everywhere
would multiply both CI time and the accounts this suite creates against a
third-party site.

A test runs beyond Chromium only when the risk it covers is
engine-specific: rendering, layout, touch input, or a browser API. Cart
arithmetic, an error message and an HTTP contract behave identically in
Firefox and WebKit, so proving them five more times buys nothing:

| Scope | What runs there | Why |
|---|---|---|
| `api` only | Every API contract check | No browser is involved at all |
| Chromium only | The whole `@regression` set | One engine, deep coverage, cheapest to run at volume |
| The three gate projects | `@smoke`, on every PR update | Chromium plus one project that is both a second engine and a mobile viewport |
| All six | `@smoke`, nightly | Engine differences are the site's property, so they're drift detection, not change validation |

The lever for an individual test is its tag, and the test plan's
[redundant coverage](./test-plan.md#redundant-coverage) section records
the one case where a test kept its assertions but lost its breadth: the
cart test was **demoted** from `@smoke` to `@regression` once the order
journey proved its core on every engine. Its remaining checks — quantity
handling, removal, the empty cart — now run on Chromium alone. That's a
stated cost, not an oversight.

## Detecting site drift

Testing an app we don't own inverts the usual assumption about a failing
suite. In a normal repo, the code changed and the tests caught it. Here the
most likely cause of a new failure is that `automationexercise.com`
changed: a reworded error message, a renamed field, a removed element. No
changelog announces it, so the only way to find out is to keep running.

That's the nightly group's real job, and it's why it isn't just "the
regression suite on a timer":

- **The code is constant, the site isn't.** Our commit hasn't changed since
  the last green run, so a failure points at the site first. That's the
  opposite of a PR failure, where the diff is the first suspect.
- **A failure opens an issue that names what failed,** rather than relying
  on someone noticing a red run at 03:00. "The nightly went red" is not an
  alert: setup breaking, the site refusing the runner and the site changing
  its behavior demand different responses, and an alert that can't tell
  them apart costs a triage every time. One issue stays open per label,
  with each night's failure added as a comment:

  | What failed | Label | What it means |
  |---|---|---|
  | Setup — dependencies, browsers, the workflow | `ci` | Says nothing about the site; ours to fix |
  | No tests matched the filter | `ci` | A project name or tag filter is wrong, and a green run proved nothing |
  | The site answered something other than the site | `environment` | The runner was challenged or rate-limited. Nothing to fix; the next run tells |
  | A test's assertion failed | `site-drift` | The behavior moved. The issue names the criteria to re-verify |
  | Tests passed only on a retry | `flaky` | Named as flake, never as drift, and never as green |

  The weekly accessibility scan reports its failures the same way, so a
  job that blocks nothing still says something.
- **Drift is a criteria change before it's a test change.** The
  `AGENTS.md` spec-drift rule applies: re-verify the behavior against the
  live site, update `docs/criteria/`, and only then change the tests.
  Editing a test until it passes again is how a suite quietly stops
  describing the real application.
- **It's also the only honest flake signal.** The nightly group is the
  one place the same commit runs against the site repeatedly. A test that
  passes on PRs but fails two nights out of five is flaky, not broken, and
  gets a task ([`TESTING.md`](../../TESTING.md#flake-policy)).

The cost is deliberate traffic against a third-party site: one full matrix
run per night, creating and deleting around 30 accounts
([ADR 0002](../adr/0002-test-account-strategy.md)). That's the price of
knowing within a day that the contract in `docs/criteria/` no longer
matches reality.

## Local and CI parity

Every pipeline group is an npm script, so the command CI runs is the
command to run locally — `npm test` is the nightly, `npm run
test:smoke:pr` is the post-push group. Three things differ in CI on
purpose, all of them in `playwright.config.ts` and none of them changing
which tests run: one retry, a single worker, and `forbidOnly`.

Versions are pinned in one place each. Playwright is pinned exactly in
`package.json` (no caret range), since installed browser binaries are tied
to the exact npm package version, and the same `npx playwright install`
step runs in both places, CI narrowing it to the browsers a job's projects
use. The Node major is pinned in `.nvmrc`, which the CI setup action reads
through `node-version-file` and nvm or fnm reads locally. `lts/*` was
rejected: it moves to a new major on its own, so CI would change runtime
without a PR, on a schedule nobody chose, and no one could reproduce the
old runtime locally. Pinning the exact patch was rejected too — it buys
reproducibility nothing here has needed, at a PR per patch release.

No containerized dependency is needed — the
target is a public live site rather than a service we run ourselves, which
removes the usual local/CI parity problem of keeping a local database or
backend in sync with CI.

The suite needs no secrets at all, and that's a deliberate outcome rather
than luck: every account is created and deleted per test, so there are no
long-lived credentials to store
([ADR 0002](../adr/0002-test-account-strategy.md)). A forked pull request runs
the full gate without any repository secret. If a stable fixture account
were ever added, its credentials would go through CI secrets and a
gitignored local `.env`, never committed.

## Environments and data

One environment: production `automationexercise.com`, shared with every
other visitor to a public practice site. No staging, and no seed or reset
endpoint beyond account create and delete, so every test creates the
data it needs and removes what its setup created. The rules for how are in
[`TESTING.md`](../../TESTING.md#test-data).

**An answer that didn't come from the site under test is an environment
failure, not a test failure.** The site can serve a challenge page to a
runner it doesn't like, and every API call then fails while parsing HTML
as JSON — a cryptic `Unexpected token '<'` on assertions that were never
reached. The API clients check the body before parsing and say what
happened instead, and a run whose failures are all that marker is reported
as an environment failure rather than as the site's behavior changing.
The distinction matters because the two demand opposite responses: drift
means re-verifying the criteria, while a refused runner means waiting for
the next run.
