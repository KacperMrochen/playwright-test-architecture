# Testing standards

The rules every individual test in this repo follows. Suite-level
decisions and the reasoning behind them (framework, project layout,
pipeline stages, browser matrix, retries) live in `[docs/testing/test-strategy.md](docs/testing/test-strategy.md)`. 
Which behavior is tested at which layer, with which tag, lives in the [test plan](docs/testing/test-plan.md).

Each rule below names what enforces it in [What enforces these rules](#what-enforces-these-rules).
A rule nothing mechanical can check says so there, rather than reading like a gate.

## Every test traces to a criterion

A test exists because an acceptance criterion in `[docs/criteria/](docs/criteria/)` 
says the site behaves a certain way. The criterion ID leads the test title, 
so a requirement can be found from its test and a test from its requirement:

```ts
test('AC-03.1 logs in with a registered email and password', { tag: '@smoke' }, async ({ page }) => {
  // ...
});
```

- No criterion, no test. If a behavior worth testing has no `AC-NN.N`,
the criterion gets added (verified against the live site) first.
- One behavior per test. A journey that proves several criteria uses  
`test.step()` per criterion, with the ID in the step title, rather than  
a title listing five IDs.

## Tags

- Tags go in the `tag` option, never in the title text.
- Every test gets exactly the tag the test plan assigns: one of `@smoke`
or `@regression` and never both, so a tag filter always has one
unambiguous answer, plus `@a11y` only for accessibility scans. What each
tag means for the pipeline is in [test-strategy.md#pipeline](docs/testing/test-strategy.md#pipeline).
- A test without `@smoke` or `@regression` is a bug. It would skip the PR
gate and every non-Chromium project, and run only in full regression.

## Layers and where code lives


| Layer        | Location     | Uses                                              |
| ------------ | ------------ | ------------------------------------------------- |
| API contract | `tests/api/` | `request` fixture through clients in `api/`       |
| e2e journey  | `tests/e2e/` | page objects in `pages/`, fixtures in `fixtures/` |


- **Cheapest layer that proves the behavior.** A status code or response
field is an API test. A UI test exists only when the behavior is the UI
(a journey, a rendered message, a form wiring).
- **Set up through the API, prove through the UI.** When an account is a
precondition rather than the thing under test, create it with
`POST /api/createAccount`, not by clicking through signup. A logged-in
precondition is set up the same way: the fixture posts the login form
over HTTP and passes the session cookie to the browser context through
`storageState`. Only FR-03's own test types into the login form.
- **Every browser context blocks third-party requests**, through the
shared fixture, so no spec has to remember it. Only the site itself and
the font CDN load ([ADR 0001](docs/adr/0001-third-party-network-isolation.md)).
- **Spec files hold assertions, not mechanics.** Locators and page
interactions belong in page objects; HTTP payload shapes belong in
`api/` clients. Page objects expose actions and locators, and don't
assert — `expect` lives in the spec so the reader sees what's proven.

## Selectors

In order of preference:

1. `data-qa` attributes, where the page has them — `page.locator('[data-qa="login-email"]')`.
2. Accessible roles and labels — `getByRole`, `getByLabel`.
3. Visible text, only for text that *is* the behavior (an error message a criterion quotes).

No CSS-structure selectors (`div > ul li:nth-child(3)`) and no XPath.
`data-qa` coverage is uneven across pages, so check the page's markup
before assuming it's there.

## Waiting

Wait on conditions, never on time. Web-first assertions
(`await expect(locator).toBeVisible()`) and `page.waitForResponse()` for
network-driven state. `page.waitForTimeout()` is not allowed.

## Test data

- **One account per test, never shared.** Every account uses a generated
`pta-<timestamp>-<random>@example.com` email (`fixtures/test-data.ts`). 
The site rejects a reused email, and a logged-in account's cart is stored 
on the server ([FR-08](docs/criteria/requirements/FR-08-cart-belongs-to-account.md)), so two tests sharing an account, 
even one after the other on the same worker, would see each other's cart. 
The reasoning against a shared fixture account is in [ADR 0002](docs/adr/0002-test-account-strategy.md).
- **Independent.** No test relies on another test's data or execution
order. Any test runs alone, in any order, on any worker.
- **Every account is deleted, including the ones a test registered.**
`DELETE /api/deleteAccount` runs in fixture teardown, so it happens even
when the test fails. Treat `responseCode` 404 as success — the account
may already be gone — and never fail a test because cleanup didn't land;
warn instead.
- **Fake payment details only.** The payment form accepts any value, so
there's never a reason to use anything resembling a real card.

## Assertions

- Assert the observable result — the response body, the rendered
message, the resulting page — not just that nothing threw.
- API tests assert the body's `responseCode`, not only the HTTP status.
The site returns HTTP 200 for its errors too ([FR-14](docs/criteria/requirements/FR-14-api-request-errors.md)).
The JSON is served as `text/html`; `response.json()` parses it regardless.
- Assert exact text only where a criterion quotes it; otherwise assert
structure or state.

## A test must be able to fail

Before a new test is merged:

1. It passes locally on every project that will run it.
2. It passes five times in a row with parallel workers
  (`npx playwright test <file> --repeat-each=5`). Any failure is a flake to
   fix now, not a retry to absorb later.
3. It has been seen to fail for the right reason: break the expected
  value, the input, or the route (e.g. `page.route()` returning a
   different response), confirm the failure message points at the
   behavior, then revert.

## Flake policy

The retry budget and its reasoning are in
[test-strategy.md#pipeline](docs/testing/test-strategy.md#pipeline).
For an individual test:

- Passing only on retry counts as flaky, not green. `failOnFlakyTests`
turns the run red, and the reporter files the test under the `flaky`
label — from any run, PR gates included, so re-running a job until it's
green can't erase the record. That issue is the record; a task is
written when the fix is scheduled.
- A test is quarantined only with an owner and a date to revisit, both
named in its issue. Without them it stays in the suite, red.
- A failure because the site is down or slow is an environment failure.
It stays red rather than being retried until it passes.
